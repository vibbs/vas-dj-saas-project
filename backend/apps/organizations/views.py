from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Organization
from .serializers import OrganizationSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List organizations",
        description="Retrieve a list of all organizations the user has access to.",
        tags=["Organizations"]
    ),
    create=extend_schema(
        summary="Create organization",
        description="Create a new organization.",
        tags=["Organizations"]
    ),
    retrieve=extend_schema(
        summary="Get organization details",
        description="Retrieve detailed information about a specific organization.",
        tags=["Organizations"]
    ),
    update=extend_schema(
        summary="Update organization",
        description="Update organization information.",
        tags=["Organizations"]
    ),
    partial_update=extend_schema(
        summary="Partially update organization",
        description="Partially update organization information.",
        tags=["Organizations"]
    ),
    destroy=extend_schema(
        summary="Delete organization",
        description="Permanently delete an organization.",
        tags=["Organizations"]
    ),
)
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get organization stats",
        description="Retrieve statistics and metrics for the organization.",
        responses={200: dict},
        tags=["Organizations"]
    )
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        organization = self.get_object()
        # Example stats - you can customize based on your needs
        stats = {
            'total_users': organization.account_set.count(),
            'active_users': organization.account_set.filter(is_active=True).count(),
            'created_at': organization.created_at,
            'is_on_trial': organization.on_trial,
            'trial_ends_on': organization.trial_ends_on,
        }
        return Response(stats)