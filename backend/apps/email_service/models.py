import logging
from django.db import models
from django.conf import settings
from apps.core.models import BaseFields

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.email_service.models")


class EmailTemplateCategory(models.TextChoices):
    AUTHENTICATION = "auth", "Authentication"
    BILLING = "billing", "Billing"
    NOTIFICATIONS = "notifications", "Notifications"
    MARKETING = "marketing", "Marketing"
    SYSTEM = "system", "System"


class EmailStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SENT = "sent", "Sent"
    DELIVERED = "delivered", "Delivered"
    FAILED = "failed", "Failed"
    BOUNCED = "bounced", "Bounced"
    COMPLAINED = "complained", "Complained"


class EmailTemplate(BaseFields):
    slug = models.SlugField(
        max_length=100,
        help_text="Unique identifier for the template within organization",
    )
    name = models.CharField(max_length=200, help_text="Human-readable template name")
    subject = models.CharField(
        max_length=255, help_text="Email subject line with template variables"
    )
    html_content = models.TextField(help_text="HTML email body with template variables")
    text_content = models.TextField(
        blank=True, help_text="Plain text email body with template variables"
    )
    category = models.CharField(
        max_length=20,
        choices=EmailTemplateCategory.choices,
        default=EmailTemplateCategory.NOTIFICATIONS,
        help_text="Template category for organization",
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether this template is active and can be used"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional template configuration and settings",
    )

    class Meta:
        ordering = ["category", "name"]
        unique_together = [["organization", "slug"]]

    def __str__(self):
        return f"{self.name} ({self.slug})"

    @property
    def has_html_content(self):
        return bool(self.html_content.strip())

    @property
    def has_text_content(self):
        return bool(self.text_content.strip())


class EmailLog(BaseFields):
    template = models.ForeignKey(
        EmailTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="email_logs",
        help_text="Template used for this email",
    )
    template_slug = models.CharField(
        max_length=100,
        help_text="Template slug at time of sending (preserved even if template deleted)",
    )
    recipient_email = models.EmailField(help_text="Email address of the recipient")
    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_emails",
        help_text="User account of recipient (if applicable)",
    )
    subject = models.CharField(max_length=255, help_text="Rendered email subject")
    html_content = models.TextField(blank=True, help_text="Rendered HTML content")
    text_content = models.TextField(blank=True, help_text="Rendered text content")
    status = models.CharField(
        max_length=20,
        choices=EmailStatus.choices,
        default=EmailStatus.PENDING,
        help_text="Current status of the email",
    )
    sent_at = models.DateTimeField(
        null=True, blank=True, help_text="When the email was successfully sent"
    )
    delivered_at = models.DateTimeField(
        null=True, blank=True, help_text="When the email was delivered"
    )
    error_message = models.TextField(
        blank=True, help_text="Error details if sending failed"
    )
    retry_count = models.PositiveIntegerField(
        default=0, help_text="Number of retry attempts"
    )
    provider_message_id = models.CharField(
        max_length=255, blank=True, help_text="Message ID from email provider"
    )
    context_data = models.JSONField(
        default=dict, blank=True, help_text="Template context data used for rendering"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional email metadata and tracking information",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient_email", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["template_slug", "-created_at"]),
        ]

    def __str__(self):
        return f"Email to {self.recipient_email} - {self.template_slug} ({self.status})"

    @property
    def is_pending(self):
        return self.status == EmailStatus.PENDING

    @property
    def is_sent(self):
        return self.status in [EmailStatus.SENT, EmailStatus.DELIVERED]

    @property
    def is_failed(self):
        return self.status in [
            EmailStatus.FAILED,
            EmailStatus.BOUNCED,
            EmailStatus.COMPLAINED,
        ]

    @property
    def can_retry(self):
        return self.is_failed and self.retry_count < 3
