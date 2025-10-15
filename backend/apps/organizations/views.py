from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.db.models import Count, Q, Prefetch
from .models import Organization, OrganizationMembership
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
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter organizations to only those where the user has active membership.
        Superusers can see all organizations.
        Optimized with annotations to prevent N+1 queries.
        """
        user = self.request.user

        # Base queryset with performance optimizations
        queryset = Organization.objects.annotate(
            # Count active members (used by serializer)
            active_member_count=Count(
                'memberships',
                filter=Q(memberships__status='active'),
                distinct=True
            )
        ).select_related(
            'created_by'  # Avoid extra query for creator
        ).prefetch_related(
            # Prefetch active memberships efficiently
            Prefetch(
                'memberships',
                queryset=OrganizationMembership.objects.filter(
                    status='active'
                ).select_related('user'),
                to_attr='active_memberships_list'
            )
        )

        # Superusers can see all organizations
        if user.is_superuser:
            return queryset

        # Get all organizations where the user has active membership
        user_org_ids = user.get_active_memberships().values_list(
            'organization_id', flat=True
        )

        return queryset.filter(
            id__in=user_org_ids,
            is_active=True
        ).distinct()

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
            'total_users': organization.memberships.filter(status='active').count(),
            'active_users': organization.memberships.filter(status='active').count(),
            'created_at': organization.created_at,
            'is_on_trial': organization.on_trial,
            'trial_ends_on': organization.trial_ends_on,
        }
        return Response(stats)