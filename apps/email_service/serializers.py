import logging
from rest_framework import serializers
from django.conf import settings
from .models import EmailTemplate, EmailLog, EmailTemplateCategory, EmailStatus

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.email_service.serializers")


class EmailTemplateSerializer(serializers.ModelSerializer):
    """Serializer for EmailTemplate model with computed fields."""

    has_html_content = serializers.BooleanField(read_only=True)
    has_text_content = serializers.BooleanField(read_only=True)

    class Meta:
        model = EmailTemplate
        fields = [
            "id",
            "slug",
            "name",
            "subject",
            "html_content",
            "text_content",
            "category",
            "is_active",
            "metadata",
            "has_html_content",
            "has_text_content",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        extra_kwargs = {
            "slug": {
                "help_text": "Unique identifier for the template within organization"
            },
            "name": {"help_text": "Human-readable template name"},
            "subject": {"help_text": "Email subject line with template variables"},
            "html_content": {"help_text": "HTML email body with template variables"},
            "text_content": {
                "help_text": "Plain text email body with template variables"
            },
            "category": {"help_text": "Template category for organization"},
            "is_active": {
                "help_text": "Whether this template is active and can be used"
            },
            "metadata": {"help_text": "Additional template configuration and settings"},
        }

    def validate_slug(self, value):
        """Validate that slug is unique within organization."""
        # Get organization from context (set by ViewSet)
        organization = self.context.get("organization")
        if not organization:
            raise serializers.ValidationError("Organization context required")

        # Check for existing template with same slug (excluding current instance)
        queryset = EmailTemplate.objects.filter(organization=organization, slug=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                f"Template with slug '{value}' already exists in this organization"
            )

        return value

    def validate(self, attrs):
        """Validate that at least one content type is provided."""
        html_content = attrs.get("html_content", "")
        text_content = attrs.get("text_content", "")

        if not html_content.strip() and not text_content.strip():
            raise serializers.ValidationError(
                "At least one of html_content or text_content must be provided"
            )

        return attrs


class EmailTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new email templates."""

    class Meta:
        model = EmailTemplate
        fields = [
            "slug",
            "name",
            "subject",
            "html_content",
            "text_content",
            "category",
            "is_active",
            "metadata",
        ]
        extra_kwargs = {
            "slug": {"required": True},
            "name": {"required": True},
            "subject": {"required": True},
            "html_content": {"required": False},
            "text_content": {"required": False},
            "category": {"required": False},
            "is_active": {"required": False},
            "metadata": {"required": False},
        }

    def validate_slug(self, value):
        """Validate that slug is unique within organization."""
        organization = self.context.get("organization")
        if not organization:
            raise serializers.ValidationError("Organization context required")

        if EmailTemplate.objects.filter(organization=organization, slug=value).exists():
            raise serializers.ValidationError(
                f"Template with slug '{value}' already exists in this organization"
            )

        return value

    def validate(self, attrs):
        """Validate that at least one content type is provided."""
        html_content = attrs.get("html_content", "")
        text_content = attrs.get("text_content", "")

        if not html_content.strip() and not text_content.strip():
            raise serializers.ValidationError(
                "At least one of html_content or text_content must be provided"
            )

        return attrs

    def create(self, validated_data):
        """Create a new email template."""
        organization = self.context.get("organization")
        user = self.context.get("request").user if self.context.get("request") else None

        return EmailTemplate.objects.create(
            organization=organization, created_by=user, **validated_data
        )


class EmailLogSerializer(serializers.ModelSerializer):
    """Serializer for EmailLog model with read-only access."""

    template_name = serializers.CharField(source="template.name", read_only=True)
    recipient_name = serializers.CharField(
        source="recipient_user.full_name", read_only=True
    )
    is_pending = serializers.BooleanField(read_only=True)
    is_sent = serializers.BooleanField(read_only=True)
    is_failed = serializers.BooleanField(read_only=True)
    can_retry = serializers.BooleanField(read_only=True)

    class Meta:
        model = EmailLog
        fields = [
            "id",
            "template",
            "template_name",
            "template_slug",
            "recipient_email",
            "recipient_user",
            "recipient_name",
            "subject",
            "status",
            "sent_at",
            "delivered_at",
            "error_message",
            "retry_count",
            "provider_message_id",
            "is_pending",
            "is_sent",
            "is_failed",
            "can_retry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "template",
            "template_name",
            "template_slug",
            "recipient_email",
            "recipient_user",
            "recipient_name",
            "subject",
            "status",
            "sent_at",
            "delivered_at",
            "error_message",
            "retry_count",
            "provider_message_id",
            "is_pending",
            "is_sent",
            "is_failed",
            "can_retry",
            "created_at",
            "updated_at",
        ]


class EmailLogDetailSerializer(EmailLogSerializer):
    """Detailed serializer for EmailLog including content and context."""

    class Meta(EmailLogSerializer.Meta):
        fields = EmailLogSerializer.Meta.fields + [
            "html_content",
            "text_content",
            "context_data",
            "metadata",
        ]


class SendEmailSerializer(serializers.Serializer):
    """Serializer for sending emails via API."""

    recipient_email = serializers.EmailField(
        required=False, help_text="Email address of recipient"
    )
    recipient_user_id = serializers.UUIDField(
        required=False, help_text="UUID of user to send email to"
    )
    template_slug = serializers.CharField(
        required=True, max_length=100, help_text="Template identifier"
    )
    context = serializers.DictField(
        required=False, default=dict, help_text="Template context variables"
    )
    send_async = serializers.BooleanField(
        required=False, default=True, help_text="Whether to send email in background"
    )
    delay = serializers.IntegerField(
        required=False,
        default=0,
        min_value=0,
        help_text="Delay in seconds before sending",
    )
    priority = serializers.IntegerField(
        required=False,
        default=5,
        min_value=1,
        max_value=10,
        help_text="Task priority (1-10, lower is higher priority)",
    )

    def validate(self, attrs):
        """Validate that either recipient_email or recipient_user_id is provided."""
        recipient_email = attrs.get("recipient_email")
        recipient_user_id = attrs.get("recipient_user_id")

        if not recipient_email and not recipient_user_id:
            raise serializers.ValidationError(
                "Either recipient_email or recipient_user_id must be provided"
            )

        if recipient_email and recipient_user_id:
            raise serializers.ValidationError(
                "Provide either recipient_email or recipient_user_id, not both"
            )

        return attrs

    def validate_recipient_user_id(self, value):
        """Validate that user exists."""
        from django.contrib.auth import get_user_model

        User = get_user_model()

        organization = self.context.get("organization")
        if not organization:
            return value

        try:
            User.objects.get(id=value, organization=organization)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found in organization")

        return value

    def validate_template_slug(self, value):
        """Validate that template exists."""
        organization = self.context.get("organization")
        if not organization:
            return value

        # Check if template exists in database
        if EmailTemplate.objects.filter(
            organization=organization, slug=value, is_active=True
        ).exists():
            return value

        # Check if default template file exists
        from django.template.loader import get_template
        from django.template.exceptions import TemplateDoesNotExist

        try:
            get_template(f"email_service/{value}.html")
            return value
        except TemplateDoesNotExist:
            raise serializers.ValidationError(f"Template '{value}' not found")


class EmailTemplatePreviewSerializer(serializers.Serializer):
    """Serializer for previewing email templates."""

    template_slug = serializers.CharField(
        required=False,
        max_length=100,
        help_text="Template slug to preview (for existing templates)",
    )
    subject = serializers.CharField(
        required=False,
        max_length=255,
        help_text="Subject template to preview (for custom content)",
    )
    html_content = serializers.CharField(
        required=False,
        help_text="HTML content template to preview (for custom content)",
    )
    text_content = serializers.CharField(
        required=False,
        help_text="Text content template to preview (for custom content)",
    )
    context = serializers.DictField(
        required=False, default=dict, help_text="Template context variables for preview"
    )

    def validate(self, attrs):
        """Validate that either template_slug or content is provided."""
        template_slug = attrs.get("template_slug")
        subject = attrs.get("subject")
        html_content = attrs.get("html_content")
        text_content = attrs.get("text_content")

        if not template_slug and not (subject or html_content or text_content):
            raise serializers.ValidationError(
                "Either template_slug or template content must be provided"
            )

        return attrs
