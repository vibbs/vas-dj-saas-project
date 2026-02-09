"""
Django admin configuration for audit logs.
"""

from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for viewing audit logs."""

    list_display = [
        "timestamp",
        "action",
        "user_email",
        "organization_slug",
        "ip_address",
        "success",
    ]

    list_filter = [
        "action",
        "success",
        "timestamp",
        ("user", admin.RelatedOnlyFieldListFilter),
        ("organization", admin.RelatedOnlyFieldListFilter),
    ]

    search_fields = [
        "user_email",
        "organization_slug",
        "ip_address",
        "action",
        "error_message",
    ]

    readonly_fields = [
        "id",
        "user",
        "user_email",
        "organization",
        "organization_slug",
        "action",
        "resource_type",
        "resource_id",
        "timestamp",
        "ip_address",
        "user_agent",
        "details",
        "success",
        "error_message",
    ]

    date_hierarchy = "timestamp"
    ordering = ["-timestamp"]

    # Prevent modification of audit logs
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Only superusers can delete audit logs (for data retention compliance)
        return request.user.is_superuser

    fieldsets = (
        ("Who", {"fields": ("user", "user_email")}),
        ("Where (Tenant)", {"fields": ("organization", "organization_slug")}),
        ("What", {"fields": ("action", "resource_type", "resource_id", "timestamp")}),
        ("Where (Network)", {"fields": ("ip_address", "user_agent")}),
        ("Outcome", {"fields": ("success", "error_message", "details")}),
    )
