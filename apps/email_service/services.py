import logging
from typing import Dict, Any, Optional, Union
from datetime import datetime
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import get_user_model
from celery import shared_task
from .models import EmailTemplate, EmailLog, EmailStatus
from .renderers import TemplateRenderer

logger = logging.getLogger(__name__)
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
        **kwargs
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
        
        # Resolve recipient
        recipient_email, recipient_user = self._resolve_recipient(recipient)
        
        # Check if template exists (either in DB or as default)
        if not self._template_exists(template_slug):
            raise TemplateNotFoundError(f"Template '{template_slug}' not found")
        
        # Render email content
        try:
            rendered_content = self.renderer.render_email(
                template_slug, 
                context, 
                user=recipient_user
            )
        except Exception as e:
            logger.error(f"Error rendering template '{template_slug}': {e}")
            raise EmailServiceError(f"Template rendering failed: {e}")
        
        # Create email log entry
        email_log = self._create_email_log(
            template_slug=template_slug,
            recipient_email=recipient_email,
            recipient_user=recipient_user,
            rendered_content=rendered_content,
            context=context
        )
        
        # Send email (async or sync)
        if send_async:
            # Send via Celery task
            delay = kwargs.get('delay', 0)
            priority = kwargs.get('priority', 5)  # Default priority
            
            if delay > 0:
                send_email_task.apply_async(
                    args=[email_log.id],
                    countdown=delay,
                    priority=priority
                )
            else:
                send_email_task.apply_async(
                    args=[email_log.id],
                    priority=priority
                )
        else:
            # Send immediately
            self._send_email_sync(email_log)
        
        return email_log
    
    def _resolve_recipient(self, recipient):
        """Resolve recipient to email address and user object"""
        if isinstance(recipient, str):
            recipient_email = recipient
            try:
                recipient_user = User.objects.get(email=recipient_email)
            except User.DoesNotExist:
                recipient_user = None
        else:
            recipient_user = recipient
            recipient_email = getattr(recipient, 'email', str(recipient))
        
        if not recipient_email:
            raise EmailServiceError("No email address found for recipient")
        
        return recipient_email, recipient_user
    
    def _template_exists(self, template_slug: str) -> bool:
        """Check if template exists in database or as default file"""
        # Check database first
        if EmailTemplate.objects.filter(
            organization=self.organization,
            slug=template_slug,
            is_active=True
        ).exists():
            return True
        
        # Check for default file template
        from django.template.loader import get_template
        from django.template.exceptions import TemplateDoesNotExist
        
        try:
            get_template(f"email_service/{template_slug}.html")
            return True
        except TemplateDoesNotExist:
            return False
    
    def _create_email_log(
        self,
        template_slug: str,
        recipient_email: str,
        recipient_user: Optional[User],
        rendered_content: Dict[str, str],
        context: Dict[str, Any]
    ) -> EmailLog:
        """Create email log entry"""
        # Get template reference if it exists
        template = None
        try:
            template = EmailTemplate.objects.get(
                organization=self.organization,
                slug=template_slug,
                is_active=True
            )
        except EmailTemplate.DoesNotExist:
            pass
        
        return EmailLog.objects.create(
            organization=self.organization,
            template=template,
            template_slug=template_slug,
            recipient_email=recipient_email,
            recipient_user=recipient_user,
            subject=rendered_content['subject'],
            html_content=rendered_content['html_content'],
            text_content=rendered_content['text_content'],
            context_data=context,
            status=EmailStatus.PENDING
        )
    
    def _send_email_sync(self, email_log: EmailLog) -> bool:
        """Send email synchronously and update log"""
        try:
            # Create Django email message
            email_message = EmailMultiAlternatives(
                subject=email_log.subject,
                body=email_log.text_content,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                to=[email_log.recipient_email],
            )
            
            # Attach HTML content if available
            if email_log.html_content:
                email_message.attach_alternative(email_log.html_content, "text/html")
            
            # Send email
            result = email_message.send()
            
            if result:
                # Update log as sent
                email_log.status = EmailStatus.SENT
                email_log.sent_at = datetime.now()
                email_log.save(update_fields=['status', 'sent_at', 'updated_at'])
                
                logger.info(f"Email sent successfully to {email_log.recipient_email}")
                return True
            else:
                # Update log as failed
                email_log.status = EmailStatus.FAILED
                email_log.error_message = "Email sending returned False"
                email_log.save(update_fields=['status', 'error_message', 'updated_at'])
                
                logger.error(f"Email sending failed for {email_log.recipient_email}")
                return False
                
        except Exception as e:
            # Update log with error
            email_log.status = EmailStatus.FAILED
            email_log.error_message = str(e)
            email_log.save(update_fields=['status', 'error_message', 'updated_at'])
            
            logger.error(f"Email sending exception for {email_log.recipient_email}: {e}")
            return False
    
    def retry_failed_email(self, email_log_id: int) -> bool:
        """Retry sending a failed email"""
        try:
            email_log = EmailLog.objects.get(
                id=email_log_id,
                organization=self.organization
            )
            
            if not email_log.can_retry:
                logger.warning(f"Email log {email_log_id} cannot be retried")
                return False
            
            # Increment retry count
            email_log.retry_count += 1
            email_log.status = EmailStatus.PENDING
            email_log.error_message = ""
            email_log.save(update_fields=['retry_count', 'status', 'error_message', 'updated_at'])
            
            # Send via Celery task
            send_email_task.apply_async(args=[email_log.id])
            
            return True
            
        except EmailLog.DoesNotExist:
            logger.error(f"Email log {email_log_id} not found")
            return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, email_log_id: int):
    """
    Celery task to send emails in background.
    
    Args:
        email_log_id: ID of EmailLog to send
    """
    try:
        email_log = EmailLog.objects.select_related('organization').get(id=email_log_id)
        
        # Create service instance
        service = EmailService.for_organization(email_log.organization)
        
        # Send email synchronously
        success = service._send_email_sync(email_log)
        
        if not success and email_log.can_retry:
            # Retry the task
            logger.info(f"Retrying email send for log {email_log_id}")
            raise self.retry(countdown=60 * (self.request.retries + 1))
        
        return success
        
    except EmailLog.DoesNotExist:
        logger.error(f"EmailLog {email_log_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error in send_email_task for log {email_log_id}: {e}")
        
        try:
            email_log = EmailLog.objects.get(id=email_log_id)
            email_log.status = EmailStatus.FAILED
            email_log.error_message = f"Task error: {str(e)}"
            email_log.save(update_fields=['status', 'error_message', 'updated_at'])
        except EmailLog.DoesNotExist:
            pass
        
        return False


@shared_task
def cleanup_old_email_logs():
    """Celery task to cleanup old email logs (run periodically)"""
    from datetime import timedelta
    from django.utils import timezone
    
    # Delete logs older than 90 days
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted_count = EmailLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old email logs")
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
    service = EmailService.for_organization(organization)
    return service.send_email(recipient, template_slug, context, **kwargs)