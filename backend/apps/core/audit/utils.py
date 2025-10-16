"""
Utility functions for audit logging.
"""

import logging
from typing import Any

from django.http import HttpRequest

from .models import AuditLog

logger = logging.getLogger("security.audit")


def get_client_ip(request: HttpRequest) -> str:
    """
    Extract client IP address from request, handling proxies and load balancers.

    Checks X-Forwarded-For header first (for proxied requests), falls back to REMOTE_ADDR.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        # X-Forwarded-For can contain multiple IPs, take the first one
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "")
    return ip


def get_user_agent(request: HttpRequest) -> str:
    """Extract user agent from request."""
    return request.META.get("HTTP_USER_AGENT", "")[:500]  # Limit length


def log_audit_event(
    action: str,
    request: HttpRequest | None = None,
    user=None,
    organization=None,
    resource_type: str = "",
    resource_id=None,
    details: dict[str, Any] | None = None,
    success: bool = True,
    error_message: str = "",
) -> AuditLog:
    """
    Log an audit event.

    Args:
        action: Action type from AuditAction enum
        request: HTTP request object (provides IP, user agent, user, org context)
        user: User who performed the action (overrides request.user)
        organization: Organization context (overrides request.org)
        resource_type: Type of resource affected
        resource_id: ID of affected resource
        details: Additional structured data (must be JSON-serializable)
        success: Whether the action succeeded
        error_message: Error message if action failed

    Returns:
        Created AuditLog instance
    """
    # Extract context from request if provided
    ip_address = "0.0.0.0"
    user_agent = ""

    if request:
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)

        # Use request context if not explicitly provided
        if user is None and hasattr(request, "user") and request.user.is_authenticated:
            user = request.user
        if organization is None and hasattr(request, "org"):
            organization = request.org

    # Create audit log entry
    audit_log = AuditLog.objects.create(
        user=user,
        organization=organization,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details or {},
        success=success,
        error_message=error_message,
    )

    # Also log to file for real-time monitoring
    log_level = logging.INFO if success else logging.WARNING
    logger.log(
        log_level,
        f"AUDIT: {action} by {audit_log.user_email or 'anonymous'} from {ip_address}",
        extra={
            "audit_id": str(audit_log.id),
            "action": action,
            "user": audit_log.user_email,
            "organization": audit_log.organization_slug,
            "ip": ip_address,
            "success": success,
            "details": details or {},
        },
    )

    return audit_log


def log_authentication_event(
    request: HttpRequest,
    action: str,
    user=None,
    success: bool = True,
    details: dict[str, Any] | None = None,
    error_message: str = "",
):
    """
    Convenience function for logging authentication events.

    Args:
        request: HTTP request
        action: Authentication action (e.g., AuditAction.LOGIN_SUCCESS)
        user: User attempting authentication
        success: Whether authentication succeeded
        details: Additional details (e.g., {'method': 'email', 'provider': 'google'})
        error_message: Error message if failed
    """
    return log_audit_event(
        action=action,
        request=request,
        user=user,
        resource_type="authentication",
        success=success,
        details=details,
        error_message=error_message,
    )


def log_authorization_event(
    request: HttpRequest,
    action: str,
    resource_type: str,
    resource_id=None,
    success: bool = True,
    details: dict[str, Any] | None = None,
):
    """
    Convenience function for logging authorization events.

    Args:
        request: HTTP request
        action: Authorization action (e.g., AuditAction.ACCESS_DENIED)
        resource_type: Type of resource being accessed
        resource_id: ID of resource being accessed
        success: Whether authorization succeeded
        details: Additional details (e.g., {'required_permission': 'admin'})
    """
    return log_audit_event(
        action=action,
        request=request,
        resource_type=resource_type,
        resource_id=resource_id,
        success=success,
        details=details,
    )
