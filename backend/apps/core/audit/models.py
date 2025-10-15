"""
Audit log models for tracking security-sensitive operations.
"""

import uuid
from django.db import models
from django.conf import settings


class AuditAction:
    """
    Enumeration of audit actions for consistent logging.
    """
    # Authentication actions
    LOGIN_SUCCESS = 'auth.login.success'
    LOGIN_FAILED = 'auth.login.failed'
    LOGOUT = 'auth.logout'
    TOKEN_REFRESH = 'auth.token.refresh'
    PASSWORD_CHANGE = 'auth.password.change'
    PASSWORD_RESET_REQUEST = 'auth.password.reset_request'
    PASSWORD_RESET_COMPLETE = 'auth.password.reset_complete'
    EMAIL_VERIFICATION = 'auth.email.verification'

    # Authorization actions
    ACCESS_DENIED = 'authz.access_denied'
    PERMISSION_CHANGED = 'authz.permission.changed'
    ROLE_CHANGED = 'authz.role.changed'

    # Organization actions
    ORG_CREATE = 'org.create'
    ORG_UPDATE = 'org.update'
    ORG_DELETE = 'org.delete'
    ORG_ACCESS = 'org.access'
    ORG_ACCESS_DENIED = 'org.access_denied'

    # Membership actions
    MEMBER_INVITE = 'member.invite'
    MEMBER_JOIN = 'member.join'
    MEMBER_REMOVE = 'member.remove'
    MEMBER_ROLE_CHANGE = 'member.role_change'
    MEMBER_SUSPEND = 'member.suspend'
    MEMBER_REACTIVATE = 'member.reactivate'

    # User actions
    USER_CREATE = 'user.create'
    USER_UPDATE = 'user.update'
    USER_DELETE = 'user.delete'
    USER_VIEW = 'user.view'

    # Billing actions
    BILLING_UPDATE = 'billing.update'
    SUBSCRIPTION_CHANGE = 'billing.subscription.change'
    PAYMENT_SUCCESS = 'billing.payment.success'
    PAYMENT_FAILED = 'billing.payment.failed'

    # Administrative actions
    ADMIN_ACTION = 'admin.action'
    SUPERUSER_ACCESS = 'admin.superuser.access'

    # Data actions
    DATA_EXPORT = 'data.export'
    DATA_IMPORT = 'data.import'
    DATA_DELETE = 'data.delete'


class AuditLogManager(models.Manager):
    """Custom manager for AuditLog with helpful query methods."""

    def for_user(self, user):
        """Get all audit logs for a specific user."""
        return self.filter(user=user)

    def for_organization(self, organization):
        """Get all audit logs for a specific organization."""
        return self.filter(organization=organization)

    def for_action(self, action):
        """Get all audit logs for a specific action type."""
        return self.filter(action=action)

    def security_events(self):
        """Get only security-related events."""
        security_actions = [
            AuditAction.LOGIN_FAILED,
            AuditAction.ACCESS_DENIED,
            AuditAction.ORG_ACCESS_DENIED,
            AuditAction.PERMISSION_CHANGED,
            AuditAction.SUPERUSER_ACCESS,
        ]
        return self.filter(action__in=security_actions)

    def failed_logins(self, hours=24):
        """Get failed login attempts in the last N hours."""
        from django.utils import timezone
        from datetime import timedelta

        since = timezone.now() - timedelta(hours=hours)
        return self.filter(
            action=AuditAction.LOGIN_FAILED,
            timestamp__gte=since
        )


class AuditLog(models.Model):
    """
    Comprehensive audit log for tracking all security-sensitive operations.

    Stores who did what, when, where, and the outcome. Essential for:
    - Security incident investigation
    - Compliance requirements (SOC 2, GDPR, HIPAA)
    - Debugging production issues
    - User activity tracking
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Who
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="User who performed the action"
    )
    user_email = models.EmailField(
        blank=True,
        help_text="Email captured at time of action (preserved if user deleted)"
    )

    # Where (tenant context)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="Organization context for the action"
    )
    organization_slug = models.CharField(
        max_length=100,
        blank=True,
        help_text="Organization slug captured at time of action"
    )

    # What
    action = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Action type (e.g., 'auth.login.success')"
    )
    resource_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Type of resource affected (e.g., 'user', 'organization')"
    )
    resource_id = models.UUIDField(
        null=True,
        blank=True,
        help_text="ID of the affected resource"
    )

    # When
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    # Where (network)
    ip_address = models.GenericIPAddressField(
        help_text="IP address of the client"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="Browser/client user agent string"
    )

    # Additional context
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional structured data about the action"
    )

    # Outcome
    success = models.BooleanField(
        default=True,
        help_text="Whether the action succeeded"
    )
    error_message = models.TextField(
        blank=True,
        help_text="Error message if action failed"
    )

    objects = AuditLogManager()

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['user', 'timestamp'], name='audit_user_time_idx'),
            models.Index(fields=['organization', 'timestamp'], name='audit_org_time_idx'),
            models.Index(fields=['action', 'timestamp'], name='audit_action_time_idx'),
            models.Index(fields=['ip_address', 'timestamp'], name='audit_ip_time_idx'),
            models.Index(fields=['success', 'timestamp'], name='audit_success_time_idx'),
            models.Index(fields=['resource_type', 'resource_id'], name='audit_resource_idx'),
        ]

    def __str__(self):
        user_info = self.user_email or 'anonymous'
        return f"{self.timestamp} - {user_info} - {self.action}"

    def save(self, *args, **kwargs):
        # Capture user email and org slug at time of action
        if self.user and not self.user_email:
            self.user_email = self.user.email
        if self.organization and not self.organization_slug:
            self.organization_slug = self.organization.slug
        super().save(*args, **kwargs)
