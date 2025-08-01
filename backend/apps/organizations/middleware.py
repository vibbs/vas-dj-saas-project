# In core/middleware.py
from django.http import Http404
from django.shortcuts import get_object_or_404
from apps.organizations.models import Organization


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract organization from subdomain
        host = request.get_host().split(":")[0]  # Remove port
        subdomain = host.split(".")[0] if "." in host else None

        if subdomain and subdomain != "www":
            organization = Organization.objects.get_object_or_404(
                slug=subdomain, is_active=True
            )

            if organization:
                request.organization = organization
            else:
                raise Http404("Organization not found")

        else:
            request.organization = None

        response = self.get_response(request)
        return response
