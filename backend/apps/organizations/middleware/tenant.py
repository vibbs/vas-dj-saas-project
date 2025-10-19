import logging

from django.conf import settings
from django.http import Http404, HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin

from apps.organizations.models import Organization

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Enhanced middleware for organization resolution and membership validation.

    Supports two modes:
    1. Multi-Tenant Mode (default): Organizations resolved via subdomain/header/query
    2. Global Mode: All users automatically assigned to platform organization

    Resolution strategies (Multi-Tenant Mode):
    1. Subdomain: {slug}.app.com
    2. Header: X-Org-Slug
    3. Query param: ?org=slug (dev/tools fallback)

    Global Mode behavior:
    - Auto-assigns the platform organization to all requests
    - Auto-creates membership for authenticated users
    - Skips membership validation
    """

    def process_request(self, request):
        """
        Resolve organization and validate membership for authenticated users.
        """
        request.org = None
        request.membership = None

        # Check if Global Mode is enabled
        is_global_mode = getattr(settings, "GLOBAL_MODE_ENABLED", False)

        if is_global_mode:
            return self._process_global_mode(request)

        # Multi-Tenant Mode: Resolve organization using multiple strategies
        org_slug = self._resolve_organization_slug(request)

        if org_slug:
            try:
                # Try subdomain first, then slug
                try:
                    organization = Organization.objects.get(sub_domain=org_slug, is_active=True)
                except Organization.DoesNotExist:
                    organization = Organization.objects.get(slug=org_slug, is_active=True)
                request.org = organization

                # For authenticated non-superuser, validate membership
                if request.user.is_authenticated and not request.user.is_superuser:
                    membership = request.user.get_membership_in(organization)
                    if not membership or not membership.is_active():
                        logger.warning(
                            f"User {request.user.email} attempted to access "
                            f"organization {org_slug} without valid membership"
                        )

                        # Log audit event for failed access attempt
                        try:
                            from apps.core.audit.models import AuditAction
                            from apps.core.audit.utils import log_audit_event

                            log_audit_event(
                                action=AuditAction.ORG_ACCESS_DENIED,
                                request=request,
                                organization=organization,
                                resource_type="organization",
                                resource_id=organization.id,
                                success=False,
                                details={
                                    "org_slug": org_slug,
                                    "path": request.path,
                                    "has_membership": membership is not None,
                                    "membership_active": (
                                        membership.is_active() if membership else False
                                    ),
                                },
                            )
                        except Exception as e:
                            logger.error(f"Failed to log audit event: {e}")

                        return HttpResponseForbidden(
                            "You don't have access to this organization"
                        )

                    request.membership = membership

            except Organization.DoesNotExist:
                logger.warning(f"Organization not found: {org_slug}")
                raise Http404("Organization not found")

        # Check if this is a tenant-scoped endpoint that requires organization
        if self._is_tenant_endpoint(request) and not request.org:
            logger.warning(
                f"Tenant endpoint accessed without organization: {request.path}"
            )
            raise Http404("Organization context required")

        return None

    def _resolve_organization_slug(self, request):
        """
        Resolve organization slug using multiple strategies.
        """
        # Strategy 1: Subdomain
        host = request.get_host().split(":")[0]  # Remove port
        if "." in host:
            subdomain = host.split(".")[0]
            if subdomain and subdomain not in ["www", "api", "admin"]:
                return subdomain

        # Strategy 2: Header (for API clients)
        org_slug = request.headers.get("X-Org-Slug")
        if org_slug:
            return org_slug

        # Strategy 3: Query parameter (fallback for dev/tools)
        org_slug = request.GET.get("org")
        if org_slug:
            return org_slug

        return None

    def _is_tenant_endpoint(self, request):
        """
        Check if this is a tenant-scoped endpoint that requires organization.
        """
        path = request.path_info

        # Paths that DON'T require organization context
        exempt_paths = [
            "/admin/",
            "/api/v1/auth/",
            "/api/v1/accounts/users/me/",  # User profile doesn't need org
            "/api/v1/capabilities/",  # Capabilities endpoint is public
            "/api/docs/",
            "/api/redoc/",
            "/api/schema/",
            "/health/",
            "/ready/",
        ]

        # Check for exempt paths
        for exempt_path in exempt_paths:
            if path.startswith(exempt_path):
                return False

        # API endpoints generally require organization context
        if path.startswith("/api/"):
            return True

        return False

    def _process_global_mode(self, request):
        """
        Process request in Global Mode.

        In Global Mode:
        - All users operate under a single platform organization
        - No organization resolution needed
        - Auto-create membership for authenticated users
        - No membership validation
        """
        from apps.organizations.models import OrganizationMembership

        global_org_slug = getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform")

        try:
            # Get the global platform organization
            organization = Organization.objects.get(slug=global_org_slug, is_active=True)
            request.org = organization

            # For authenticated users, ensure they have a membership
            if request.user.is_authenticated:
                # Check if user already has membership
                membership = OrganizationMembership.objects.filter(
                    organization=organization,
                    user=request.user
                ).first()

                if not membership:
                    # Auto-create active membership for user in global mode
                    membership = OrganizationMembership.objects.create(
                        organization=organization,
                        user=request.user,
                        role="member",
                        status="active",
                    )
                    logger.info(
                        f"Auto-created global membership for user {request.user.email} "
                        f"in organization {global_org_slug}"
                    )

                request.membership = membership

        except Organization.DoesNotExist:
            logger.error(
                f"Global organization '{global_org_slug}' not found. "
                f"Run 'python manage.py bootstrap_global_mode' to create it."
            )
            raise Http404(
                f"Global platform organization not configured. "
                f"Contact system administrator."
            )

        return None
