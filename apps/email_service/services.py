import logging
from typing import Dict, Any, Optional, Union
from datetime import datetime
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import get_user_model
from celery import shared_task
from .models import EmailTemplate, EmailLog, EmailStatus
from .renderers import TemplateRenderer

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.email_service.services")
User = get_user_model()


class EmailServiceError(Exception):
    """Base exception for email service errors"""

    pass


class TemplateNotFoundError(EmailServiceError):
    """Raised when template is not found"""

    pass


class EmailService:
    """
    Core email service providing send_email interface with Celery integration,
    template resolution, delivery tracking, and retry logic.
    """

    def __init__(self, organization):
        self.organization = organization
        self.renderer = TemplateRenderer(organization)

    @classmethod
    def for_organization(cls, organization):
        """Factory method to create service for specific organization"""
        return cls(organization)

    def send_email(
        self,
        recipient: Union[str, User],
        template_slug: str,
        context: Optional[Dict[str, Any]] = None,
        send_async: bool = True,
        **kwargs,
    ) -> EmailLog:
        """
        Send email using template with context.

        Args:
            recipient: Email address string or User object
            template_slug: Template identifier
            context: Template context variables
            send_async: Whether to send in background via Celery
            **kwargs: Additional options (priority, delay, etc.)

        Returns:
            EmailLog instance

        Raises:
            TemplateNotFoundError: If template doesn't exist
            EmailServiceError: For other email service errors
        """
        context = context or {}
        log.info(
            f"Starting email send process: template='{template_slug}', recipient='{recipient}', async={send_async}"
        )
        log.debug(f"Email context data: {context}")

        # Resolve recipient
        recipient_email, recipient_user = self._resolve_recipient(recipient)
        log.debug(
            f"Resolved recipient: email='{recipient_email}', user_id={getattr(recipient_user, 'id', None)}"
        )

        # Check if template exists (either in DB or as default)
        if not self._template_exists(template_slug):
            log.error(
                f"Template '{template_slug}' not found for organization {self.organization.id}"
            )
            raise TemplateNotFoundError(f"Template '{template_slug}' not found")

        # Render email content
        try:
            rendered_content = self.renderer.render_email(
                template_slug, context, user=recipient_user
            )
            log.debug(f"Email template '{template_slug}' rendered successfully")
        except Exception as e:
            log.error(f"Error rendering template '{template_slug}': {e}", exc_info=True)
            raise EmailServiceError(f"Template rendering failed: {e}")

        # Create email log entry
        email_log = self._create_email_log(
            template_slug=template_slug,
            recipient_email=recipient_email,
            recipient_user=recipient_user,
            rendered_content=rendered_content,
            context=context,
        )

        # Send email (async or sync)
        if send_async:
            # Send via Celery task
            delay = kwargs.get("delay", 0)
            priority = kwargs.get("priority", 5)  # Default priority

            log.info(
                f"Queuing email for async sending: log_id={email_log.id}, delay={delay}s, priority={priority}"
            )

            if delay > 0:
                send_email_task.apply_async(
                    args=[email_log.id], countdown=delay, priority=priority
                )
            else:
                send_email_task.apply_async(args=[email_log.id], priority=priority)
        else:
            # Send immediately
            log.info(f"Sending email synchronously: log_id={email_log.id}")
            self._send_email_sync(email_log)

        log.info(
            f"Email send process completed: log_id={email_log.id}, template='{template_slug}'"
        )
        return email_log

    def _resolve_recipient(self, recipient):
        """Resolve recipient to email address and user object"""
        log.debug(f"Resolving recipient: {type(recipient).__name__} - {recipient}")

        if isinstance(recipient, str):
            recipient_email = recipient
            try:
                recipient_user = User.objects.get(email=recipient_email)
                log.debug(
                    f"Found user for email '{recipient_email}': {recipient_user.id}"
                )
            except User.DoesNotExist:
                recipient_user = None
                log.debug(f"No user found for email '{recipient_email}'")
        else:
            recipient_user = recipient
            recipient_email = getattr(recipient, "email", str(recipient))
            log.debug(
                f"Using user object: {recipient_user.id} with email '{recipient_email}'"
            )

        if not recipient_email:
            log.error(f"No email address found for recipient: {recipient}")
            raise EmailServiceError("No email address found for recipient")

        return recipient_email, recipient_user

    def _template_exists(self, template_slug: str) -> bool:
        """Check if template exists in database or as default file"""
        log.debug(
            f"Checking template existence: '{template_slug}' for organization {self.organization.id}"
        )

        # Check database first
        db_template_exists = EmailTemplate.objects.filter(
            organization=self.organization, slug=template_slug, is_active=True
        ).exists()

        if db_template_exists:
            log.debug(f"Template '{template_slug}' found in database")
            return True

        # Check for default file template
        from django.template.loader import get_template
        from django.template.exceptions import TemplateDoesNotExist

        try:
            get_template(f"email_service/{template_slug}.html")
            log.debug(f"Default template '{template_slug}' found in file system")
            return True
        except TemplateDoesNotExist:
            log.debug(
                f"Template '{template_slug}' not found in database or file system"
            )
            return False

    def _create_email_log(
        self,
        template_slug: str,
        recipient_email: str,
        recipient_user: Optional[User],
        rendered_content: Dict[str, str],
        context: Dict[str, Any],
    ) -> EmailLog:
        """Create email log entry"""
        # Get template reference if it exists
        template = None
        try:
            template = EmailTemplate.objects.get(
                organization=self.organization, slug=template_slug, is_active=True
            )
        except EmailTemplate.DoesNotExist:
            pass

        return EmailLog.objects.create(
            organization=self.organization,
            template=template,
            template_slug=template_slug,
            recipient_email=recipient_email,
            recipient_user=recipient_user,
            subject=rendered_content["subject"],
            html_content=rendered_content["html_content"],
            text_content=rendered_content["text_content"],
            context_data=context,
            status=EmailStatus.PENDING,
        )

    def _send_email_sync(self, email_log: EmailLog) -> bool:
        """Send email synchronously and update log"""
        log.info(
            f"Sending email synchronously: log_id={email_log.id}, recipient={email_log.recipient_email}"
        )

        try:
            # Create Django email message
            email_message = EmailMultiAlternatives(
                subject=email_log.subject,
                body=email_log.text_content,
                from_email=getattr(
                    settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"
                ),
                to=[email_log.recipient_email],
            )

            log.debug(
                f"Email message created: subject='{email_log.subject[:50]}...', from={email_message.from_email}"
            )

            # Attach HTML content if available
            if email_log.html_content:
                email_message.attach_alternative(email_log.html_content, "text/html")
                log.debug("HTML content attached to email")

            # Send email
            result = email_message.send()
            log.debug(f"Email send result: {result}")

            if result:
                # Update log as sent
                email_log.status = EmailStatus.SENT
                email_log.sent_at = datetime.now()
                email_log.save(update_fields=["status", "sent_at", "updated_at"])

                log.info(
                    f"Email sent successfully: log_id={email_log.id}, recipient={email_log.recipient_email}"
                )
                return True
            else:
                # Update log as failed
                email_log.status = EmailStatus.FAILED
                email_log.error_message = "Email sending returned False"
                email_log.save(update_fields=["status", "error_message", "updated_at"])

                log.error(
                    f"Email sending failed: log_id={email_log.id}, recipient={email_log.recipient_email} - send() returned False"
                )
                return False

        except Exception as e:
            # Update log with error
            email_log.status = EmailStatus.FAILED
            email_log.error_message = str(e)
            email_log.save(update_fields=["status", "error_message", "updated_at"])

            log.error(
                f"Email sending exception: log_id={email_log.id}, recipient={email_log.recipient_email}, error={str(e)}",
                exc_info=True,
            )
            return False

    def retry_failed_email(self, email_log_id: int) -> bool:
        """Retry sending a failed email"""
        log.info(f"Attempting to retry failed email: log_id={email_log_id}")

        try:
            email_log = EmailLog.objects.get(
                id=email_log_id, organization=self.organization
            )

            log.debug(
                f"Found email log: status={email_log.status}, retry_count={email_log.retry_count}"
            )

            if not email_log.can_retry:
                log.warning(
                    f"Email log {email_log_id} cannot be retried: status={email_log.status}, retry_count={email_log.retry_count}"
                )
                return False

            # Increment retry count
            email_log.retry_count += 1
            email_log.status = EmailStatus.PENDING
            email_log.error_message = ""
            email_log.save(
                update_fields=["retry_count", "status", "error_message", "updated_at"]
            )

            log.info(
                f"Email log updated for retry: log_id={email_log_id}, retry_count={email_log.retry_count}"
            )

            # Send via Celery task
            send_email_task.apply_async(args=[email_log.id])
            log.info(f"Email retry queued successfully: log_id={email_log_id}")

            return True

        except EmailLog.DoesNotExist:
            log.error(
                f"Email log {email_log_id} not found for organization {self.organization.id}"
            )
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, email_log_id: int):
    """
    Celery task to send emails in background.

    Args:
        email_log_id: ID of EmailLog to send
    """
    log.info(
        f"Starting email send task: log_id={email_log_id}, retry={self.request.retries}"
    )

    try:
        email_log = EmailLog.objects.select_related("organization").get(id=email_log_id)
        log.debug(
            f"Found email log: recipient={email_log.recipient_email}, template={email_log.template_slug}"
        )

        # Create service instance
        service = EmailService.for_organization(email_log.organization)

        # Send email synchronously
        success = service._send_email_sync(email_log)

        if not success and email_log.can_retry:
            # Retry the task
            retry_delay = 60 * (self.request.retries + 1)
            log.info(f"Retrying email send for log {email_log_id} in {retry_delay}s")
            raise self.retry(countdown=retry_delay)

        log.info(f"Email send task completed: log_id={email_log_id}, success={success}")
        return success

    except EmailLog.DoesNotExist:
        log.error(f"EmailLog {email_log_id} not found in send_email_task")
        return False
    except Exception as e:
        log.error(
            f"Error in send_email_task for log {email_log_id}: {e}", exc_info=True
        )

        try:
            email_log = EmailLog.objects.get(id=email_log_id)
            email_log.status = EmailStatus.FAILED
            email_log.error_message = f"Task error: {str(e)}"
            email_log.save(update_fields=["status", "error_message", "updated_at"])
            log.debug(f"Updated email log {email_log_id} with task error")
        except EmailLog.DoesNotExist:
            log.error(f"Could not update email log {email_log_id} - not found")

        return False


@shared_task
def cleanup_old_email_logs():
    """Celery task to cleanup old email logs (run periodically)"""
    from datetime import timedelta
    from django.utils import timezone

    log.info("Starting email logs cleanup task")

    # Delete logs older than 90 days
    cutoff_date = timezone.now() - timedelta(days=90)
    log.debug(f"Deleting email logs older than {cutoff_date}")

    deleted_count = EmailLog.objects.filter(created_at__lt=cutoff_date).delete()[0]

    log.info(f"Email logs cleanup completed: deleted {deleted_count} old logs")
    return deleted_count


def send_email(organization, recipient, template_slug, context=None, **kwargs):
    """
    Convenience function for sending emails.

    Usage:
        from apps.email_service.services import send_email

        send_email(
            organization=request.user.organization,
            recipient=user,
            template_slug='welcome',
            context={'user_name': user.full_name}
        )
    """
    log.debug(
        f"Convenience send_email called: org={organization.id}, template='{template_slug}', recipient='{recipient}'"
    )
    service = EmailService.for_organization(organization)
    return service.send_email(recipient, template_slug, context, **kwargs)
