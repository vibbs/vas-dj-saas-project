"""
Audit logger convenience helpers for common audit actions.
"""

from apps.core.audit.models import AuditAction, AuditLog


class AuditLogger:
    """
    Convenience class for logging audit events.

    Provides simple methods for common audit actions.
    """

    @classmethod
    def log_membership_updated(cls, request, organization, user, membership, action=None):
        """Log membership role/status update."""
        # Determine the audit action based on context
        if action == "suspended":
            audit_action = AuditAction.MEMBER_SUSPEND
        elif action == "reactivated":
            audit_action = AuditAction.MEMBER_REACTIVATE
        else:
            audit_action = AuditAction.MEMBER_ROLE_CHANGE

        AuditLog.log_event(
            action=audit_action,
            user=user,
            organization=organization,
            resource_type="membership",
            resource_id=membership.id,
            ip_address=cls._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            details={
                "membership_id": str(membership.id),
                "role": membership.role,
                "status": membership.status,
                "action_type": action or "updated",
            },
        )

    @classmethod
    def log_membership_removed(cls, request, organization, user, membership):
        """Log member removal from organization."""
        AuditLog.log_event(
            action=AuditAction.MEMBER_REMOVE,
            user=user,
            organization=organization,
            resource_type="membership",
            resource_id=membership.id,
            ip_address=cls._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            details={
                "removed_user_email": membership.user.email if membership.user else membership.invited_email,
                "role": membership.role,
            },
        )

    @classmethod
    def log_membership_deleted(cls, request, organization, user, membership):
        """Alias for log_membership_removed."""
        return cls.log_membership_removed(request, organization, user, membership)

    @classmethod
    def log_membership_suspended(cls, request, organization, user, membership):
        """Log member suspension."""
        AuditLog.log_event(
            action=AuditAction.MEMBER_SUSPEND,
            user=user,
            organization=organization,
            resource_type="membership",
            resource_id=membership.id,
            ip_address=cls._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            details={
                "suspended_user_email": membership.user.email if membership.user else None,
                "role": membership.role,
            },
        )

    @classmethod
    def log_membership_reactivated(cls, request, organization, user, membership):
        """Log member reactivation."""
        AuditLog.log_event(
            action=AuditAction.MEMBER_REACTIVATE,
            user=user,
            organization=organization,
            resource_type="membership",
            resource_id=membership.id,
            ip_address=cls._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            details={
                "reactivated_user_email": membership.user.email if membership.user else None,
                "role": membership.role,
            },
        )

    @classmethod
    def log_invite_created(cls, request, organization, user, invite):
        """Log invitation creation."""
        AuditLog.log_event(
            action=AuditAction.MEMBER_INVITE,
            user=user,
            organization=organization,
            resource_type="invite",
            resource_id=invite.id,
            ip_address=cls._get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            details={
                "invited_email": invite.email,
                "role": invite.role,
            },
        )

    @staticmethod
    def _get_client_ip(request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "0.0.0.0")
