"""
Core application views including platform capabilities endpoint.
"""

from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.capabilities import get_platform_capabilities
from apps.core.responses import ok


@extend_schema(
    summary="Get platform capabilities",
    description="Returns capability map indicating which features are enabled based on deployment mode (Global vs Multi-Tenant)",
    tags=["Core"],
)
@api_view(["GET"])
@permission_classes([AllowAny])  # Public endpoint - no auth required
def capabilities_view(request):
    """
    Get platform capabilities.

    Returns a map of enabled/disabled features based on whether the platform
    is running in Global Mode or Multi-Tenant Mode.

    Frontend applications use this to conditionally show/hide features.
    """
    capabilities = get_platform_capabilities()
    return ok(data=capabilities)
