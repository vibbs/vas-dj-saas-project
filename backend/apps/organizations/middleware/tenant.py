import logging
from django.http import Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from apps.organizations.models import Organization

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Enhanced middleware for organization resolution and membership validation.
    
    Resolution strategies (in order of preference):
    1. Subdomain: {slug}.app.com
    2. Header: X-Org-Slug 
    3. Query param: ?org=slug (dev/tools fallback)
    
    For authenticated users (non-superuser), validates active membership.
    """
    
    def process_request(self, request):
        """
        Resolve organization and validate membership for authenticated users.
        """
        request.org = None
        request.membership = None
        
        # Resolve organization using multiple strategies
        org_slug = self._resolve_organization_slug(request)
        
        if org_slug:
            try:
                organization = Organization.objects.get(
                    slug=org_slug, 
                    is_active=True
                )
                request.org = organization
                
                # For authenticated non-superuser, validate membership
                if (request.user.is_authenticated and 
                    not request.user.is_superuser):
                    
                    membership = request.user.get_membership_in(organization)
                    if not membership or not membership.is_active():
                        logger.warning(
                            f"User {request.user.email} attempted to access "
                            f"organization {org_slug} without valid membership"
                        )
                        return HttpResponseForbidden(
                            "You don't have access to this organization"
                        )
                    
                    request.membership = membership
                    
            except Organization.DoesNotExist:
                logger.warning(f"Organization not found: {org_slug}")
                raise Http404("Organization not found")
        
        # Check if this is a tenant-scoped endpoint that requires organization
        if self._is_tenant_endpoint(request) and not request.org:
            logger.warning(f"Tenant endpoint accessed without organization: {request.path}")
            raise Http404("Organization context required")
        
        return None
    
    def _resolve_organization_slug(self, request):
        """
        Resolve organization slug using multiple strategies.
        """
        # Strategy 1: Subdomain
        host = request.get_host().split(':')[0]  # Remove port
        if '.' in host:
            subdomain = host.split('.')[0]
            if subdomain and subdomain not in ['www', 'api', 'admin']:
                return subdomain
        
        # Strategy 2: Header (for API clients)
        org_slug = request.headers.get('X-Org-Slug')
        if org_slug:
            return org_slug
        
        # Strategy 3: Query parameter (fallback for dev/tools)
        org_slug = request.GET.get('org')
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
            '/admin/',
            '/api/v1/auth/',
            '/api/v1/accounts/users/me/',  # User profile doesn't need org
            '/api/docs/',
            '/api/redoc/',
            '/api/schema/',
            '/health/',
            '/ready/',
        ]
        
        # Check for exempt paths
        for exempt_path in exempt_paths:
            if path.startswith(exempt_path):
                return False
        
        # API endpoints generally require organization context
        if path.startswith('/api/'):
            return True
        
        return False