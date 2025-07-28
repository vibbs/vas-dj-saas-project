import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import EmailTemplate, EmailLog
from .serializers import (
    EmailTemplateSerializer,
    EmailTemplateCreateSerializer,
    EmailLogSerializer,
    EmailLogDetailSerializer,
    SendEmailSerializer,
    EmailTemplatePreviewSerializer,
)
from .services import EmailService, TemplateNotFoundError, EmailServiceError
from .renderers import TemplateRenderer

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.email_service.views")
User = get_user_model()


@extend_schema_view(
    list=extend_schema(
        summary="List email templates",
        description="Retrieve a paginated list of email templates for the organization.",
        tags=["Email Service"],
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by template category",
                enum=["auth", "billing", "notifications", "marketing", "system"],
            ),
            OpenApiParameter(
                name="is_active",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Filter by active status",
            ),
        ],
    ),
    create=extend_schema(
        summary="Create email template",
        description="Create a new email template for the organization.",
        request=EmailTemplateCreateSerializer,
        responses={201: EmailTemplateSerializer},
        tags=["Email Service"],
    ),
    retrieve=extend_schema(
        summary="Get email template",
        description="Retrieve detailed information about a specific email template.",
        tags=["Email Service"],
    ),
    update=extend_schema(
        summary="Update email template",
        description="Update an email template.",
        tags=["Email Service"],
    ),
    partial_update=extend_schema(
        summary="Partially update email template",
        description="Partially update an email template.",
        tags=["Email Service"],
    ),
    destroy=extend_schema(
        summary="Delete email template",
        description="Delete an email template.",
        tags=["Email Service"],
    ),
)
class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "slug"

    def get_queryset(self):
        """Return templates for the current organization."""
        organization = self.request.user.organization
        log.debug(f"Getting email templates for organization {organization.id}")

        queryset = super().get_queryset().filter(organization=organization)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
            log.debug(f"Filtered templates by category: {category}")

        # Filter by active status
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            is_active_bool = is_active.lower() in ("true", "1", "yes")
            queryset = queryset.filter(is_active=is_active_bool)
            log.debug(f"Filtered templates by active status: {is_active_bool}")

        template_count = queryset.count()
        log.debug(f"Returning {template_count} email templates")
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return EmailTemplateCreateSerializer
        return EmailTemplateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.request.user.organization
        return context

    def perform_create(self, serializer):
        template_slug = serializer.validated_data.get("slug")
        log.info(
            f"Creating email template: slug='{template_slug}', user={self.request.user.id}"
        )

        template = serializer.save(
            organization=self.request.user.organization, created_by=self.request.user
        )

        log.info(
            f"Email template created successfully: id={template.id}, slug='{template.slug}'"
        )

    def perform_update(self, serializer):
        template = self.get_object()
        log.info(
            f"Updating email template: id={template.id}, slug='{template.slug}', user={self.request.user.id}"
        )

        updated_template = serializer.save(updated_by=self.request.user)
        log.info(f"Email template updated successfully: id={updated_template.id}")

    @extend_schema(
        summary="Preview email template",
        description="Preview how an email template will render with provided context.",
        request=EmailTemplatePreviewSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "subject": {"type": "string"},
                    "html_content": {"type": "string"},
                    "text_content": {"type": "string"},
                },
            }
        },
        tags=["Email Service"],
    )
    @action(detail=True, methods=["post"])
    def preview(self, request, slug=None):
        template = self.get_object()
        log.info(
            f"Previewing email template: id={template.id}, slug='{template.slug}', user={request.user.id}"
        )

        serializer = EmailTemplatePreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        context = serializer.validated_data.get("context", {})
        log.debug(f"Template preview context: {list(context.keys())}")

        try:
            renderer = TemplateRenderer(request.user.organization)
            rendered_content = renderer.render_email(
                template.slug, context, user=request.user
            )

            log.info(f"Template preview successful: slug='{template.slug}'")
            return Response(rendered_content)

        except Exception as e:
            log.error(
                f"Template preview failed: slug='{template.slug}', error={str(e)}",
                exc_info=True,
            )
            return Response(
                {"error": f"Template rendering failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @extend_schema(
        summary="Send test email",
        description="Send a test email using this template to the current user.",
        request=EmailTemplatePreviewSerializer,
        responses={
            200: {"type": "object", "properties": {"message": {"type": "string"}}}
        },
        tags=["Email Service"],
    )
    @action(detail=True, methods=["post"])
    def send_test(self, request, slug=None):
        template = self.get_object()
        serializer = EmailTemplatePreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        context = serializer.validated_data.get("context", {})
        context["test_mode"] = True

        try:
            email_service = EmailService.for_organization(request.user.organization)
            email_log = email_service.send_email(
                recipient=request.user,
                template_slug=template.slug,
                context=context,
                send_async=False,  # Send immediately for test
            )

            return Response(
                {
                    "message": f"Test email sent to {request.user.email}",
                    "email_log_id": str(email_log.id),
                }
            )

        except (TemplateNotFoundError, EmailServiceError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    list=extend_schema(
        summary="List email logs",
        description="Retrieve a paginated list of sent emails for the organization.",
        tags=["Email Service"],
        parameters=[
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by email status",
                enum=[
                    "pending",
                    "sent",
                    "delivered",
                    "failed",
                    "bounced",
                    "complained",
                ],
            ),
            OpenApiParameter(
                name="template_slug",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by template slug",
            ),
            OpenApiParameter(
                name="recipient_email",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by recipient email",
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Get email log",
        description="Retrieve detailed information about a specific email log.",
        responses={200: EmailLogDetailSerializer},
        tags=["Email Service"],
    ),
)
class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return email logs for the current organization."""
        queryset = (
            super().get_queryset().filter(organization=self.request.user.organization)
        )

        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by template slug
        template_slug = self.request.query_params.get("template_slug")
        if template_slug:
            queryset = queryset.filter(template_slug=template_slug)

        # Filter by recipient email
        recipient_email = self.request.query_params.get("recipient_email")
        if recipient_email:
            queryset = queryset.filter(recipient_email__icontains=recipient_email)

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EmailLogDetailSerializer
        return EmailLogSerializer

    @extend_schema(
        summary="Retry failed email",
        description="Retry sending a failed email if retry count hasn't been exceeded.",
        responses={
            200: {"type": "object", "properties": {"message": {"type": "string"}}}
        },
        tags=["Email Service"],
    )
    @action(detail=True, methods=["post"])
    def retry(self, request, pk=None):
        email_log = self.get_object()

        if not email_log.can_retry:
            return Response(
                {
                    "error": "Email cannot be retried (either not failed or max retries exceeded)"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            email_service = EmailService.for_organization(request.user.organization)
            success = email_service.retry_failed_email(email_log.id)

            if success:
                return Response({"message": "Email retry initiated"})
            else:
                return Response(
                    {"error": "Failed to initiate email retry"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return Response(
                {"error": f"Retry failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@extend_schema_view(
    create=extend_schema(
        summary="Send email",
        description="Send an email using a template to a specified recipient.",
        request=SendEmailSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "email_log_id": {"type": "string"},
                },
            }
        },
        tags=["Email Service"],
    ),
    list=extend_schema(exclude=True),  # Hide list endpoint
    retrieve=extend_schema(exclude=True),  # Hide retrieve endpoint
    update=extend_schema(exclude=True),  # Hide update endpoint
    partial_update=extend_schema(exclude=True),  # Hide partial_update endpoint
    destroy=extend_schema(exclude=True),  # Hide destroy endpoint
)
class SendEmailViewSet(viewsets.GenericViewSet):
    """ViewSet for sending emails via API"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SendEmailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.request.user.organization
        return context

    def create(self, request):
        """Send an email using template"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Resolve recipient
        recipient_email = serializer.validated_data.get("recipient_email")
        recipient_user_id = serializer.validated_data.get("recipient_user_id")

        if recipient_user_id:
            recipient = get_object_or_404(
                User, id=recipient_user_id, organization=request.user.organization
            )
        else:
            recipient = recipient_email

        # Send email
        try:
            email_service = EmailService.for_organization(request.user.organization)
            email_log = email_service.send_email(
                recipient=recipient,
                template_slug=serializer.validated_data["template_slug"],
                context=serializer.validated_data.get("context", {}),
                send_async=serializer.validated_data.get("send_async", True),
                delay=serializer.validated_data.get("delay", 0),
                priority=serializer.validated_data.get("priority", 5),
            )

            return Response(
                {
                    "message": (
                        "Email queued for sending"
                        if serializer.validated_data.get("send_async", True)
                        else "Email sent"
                    ),
                    "email_log_id": str(email_log.id),
                }
            )

        except (TemplateNotFoundError, EmailServiceError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Preview email content",
        description="Preview how an email will render without sending it.",
        request=EmailTemplatePreviewSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "subject": {"type": "string"},
                    "html_content": {"type": "string"},
                    "text_content": {"type": "string"},
                },
            }
        },
        tags=["Email Service"],
    )
    @action(detail=False, methods=["post"])
    def preview(self, request):
        serializer = EmailTemplatePreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template_slug = serializer.validated_data.get("template_slug")
        context = serializer.validated_data.get("context", {})

        try:
            if template_slug:
                # Preview existing template
                renderer = TemplateRenderer(request.user.organization)
                rendered_content = renderer.render_email(
                    template_slug, context, user=request.user
                )
            else:
                # Preview custom content
                from jinja2 import Template

                subject = serializer.validated_data.get("subject", "Test Subject")
                html_content = serializer.validated_data.get("html_content", "")
                text_content = serializer.validated_data.get("text_content", "")

                # Basic context for custom templates
                template_context = {
                    "user": request.user,
                    "organization": request.user.organization,
                    **context,
                }

                rendered_content = {
                    "subject": (
                        Template(subject).render(**template_context) if subject else ""
                    ),
                    "html_content": (
                        Template(html_content).render(**template_context)
                        if html_content
                        else ""
                    ),
                    "text_content": (
                        Template(text_content).render(**template_context)
                        if text_content
                        else ""
                    ),
                }

            return Response(rendered_content)

        except Exception as e:
            return Response(
                {"error": f"Preview failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
