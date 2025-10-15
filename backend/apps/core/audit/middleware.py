"""
Audit logging middleware for automatic event tracking.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from .models import AuditAction
from .utils import log_audit_event

logger = logging.getLogger('security.audit')


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to automatically log certain request events.

    Currently logs:
    - Superuser access to any endpoint
    - Failed organization access attempts (handled by TenantMiddleware)
    """

    def process_request(self, request):
        """Log superuser access to any endpoint."""
        # Skip logging for static files, admin media, health checks
        if self._should_skip_logging(request):
            return None

        # Log superuser access for audit trail
        if hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.is_superuser:
                org_context = getattr(request, 'org', None)
                log_audit_event(
                    action=AuditAction.SUPERUSER_ACCESS,
                    request=request,
                    resource_type='endpoint',
                    details={
                        'path': request.path,
                        'method': request.method,
                        'organization': org_context.slug if org_context else None
                    }
                )

        return None

    def _should_skip_logging(self, request):
        """Check if we should skip logging for this request."""
        path = request.path_info

        # Skip static files, admin media, health checks
        skip_prefixes = [
            '/static/',
            '/media/',
            '/health/',
            '/ready/',
            '/__debug__/',
            '/favicon.ico'
        ]

        for prefix in skip_prefixes:
            if path.startswith(prefix):
                return True

        return False
