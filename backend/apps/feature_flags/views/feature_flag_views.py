"""
Feature Flag API Views.

DRF ViewSets and views for managing feature flags and evaluating
user-specific feature access.
"""

import logging

from django.db.models import Q
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardPagination
from apps.core.responses import created

from ..models import FeatureAccess, FeatureFlag
from ..serializers import (
    FeatureFlagBulkUpdateSerializer,
    FeatureFlagSerializer,
    FeatureFlagStatisticsSerializer,
    FeatureFlagSummarySerializer,
    FeatureFlagToggleSerializer,
    UserFeatureFlagsSerializer,
)
from ..services import FeatureFlagService

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        summary="List Feature Flags",
        description="Retrieve a list of feature flags accessible to the current user. "
        "Admins see all flags, organization admins see their org's flags plus global ones, "
        "regular users see only global flags.",
        tags=["Feature Flags"],
    ),
    create=extend_schema(
        summary="Create Feature Flag",
        description="Create a new feature flag. Only administrators can create feature flags.",
        tags=["Feature Flags"],
    ),
    retrieve=extend_schema(
        summary="Get Feature Flag Details",
        description="Retrieve detailed information about a specific feature flag including "
        "access rules, rollout settings, and current status.",
        tags=["Feature Flags"],
    ),
    update=extend_schema(
        summary="Update Feature Flag",
        description="Update a feature flag's settings including global state, rollout percentage, "
        "scheduling, and metadata. Only administrators can update feature flags.",
        tags=["Feature Flags"],
    ),
    partial_update=extend_schema(
        summary="Partially Update Feature Flag",
        description="Partially update specific fields of a feature flag. "
        "Only administrators can update feature flags.",
        tags=["Feature Flags"],
    ),
    destroy=extend_schema(
        summary="Delete Feature Flag",
        description="Delete a feature flag and all associated access rules. "
        "Only administrators can delete feature flags. "
        "Permanent flags cannot be deleted.",
        tags=["Feature Flags"],
    ),
)
class FeatureFlagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing feature flags.

    Provides CRUD operations for feature flags with proper permissions
    and tenant isolation. Supports global flags, percentage rollouts,
    time-based scheduling, and environment-specific activation.
    """

    queryset = FeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "key"
    pagination_class = StandardPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["key", "name", "description"]
    ordering_fields = ["created_at", "updated_at", "name", "key"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Filter queryset based on user permissions, organization context, and query parameters.

        Tenant isolation rules:
        - Superusers/staff: See all flags
        - Organization admins: See their org's flags + global flags
        - Regular users: See ONLY their org's flags (NO global flags for security)
        """
        queryset = super().get_queryset()
        user = self.request.user

        # Superusers/staff can see all flags
        if user.is_staff or user.is_superuser:
            pass  # No filtering for admins
        # Organization admins can see their org's flags plus global ones
        elif hasattr(user, "is_admin") and user.is_admin:
            user_org = user.get_primary_organization()
            if user_org:
                queryset = queryset.filter(
                    Q(organization=user_org) | Q(organization__isnull=True)
                )
            else:
                # No org = no flags
                queryset = queryset.none()
        else:
            # Regular users ONLY see flags for their organization (no global flags)
            # This prevents information disclosure across tenants
            user_org = user.get_primary_organization()
            if user_org:
                queryset = queryset.filter(organization=user_org)
            else:
                # No org = no flags
                queryset = queryset.none()

        # Apply query parameter filters
        is_enabled = self.request.query_params.get("is_enabled_globally")
        if is_enabled is not None:
            # Convert string to boolean
            is_enabled_bool = is_enabled.lower() in ("true", "1", "yes")
            queryset = queryset.filter(is_enabled_globally=is_enabled_bool)

        rollout_percentage = self.request.query_params.get("rollout_percentage")
        if rollout_percentage is not None:
            try:
                queryset = queryset.filter(rollout_percentage=int(rollout_percentage))
            except (ValueError, TypeError):
                pass  # Invalid value, ignore filter

        return queryset

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == "list":
            return FeatureFlagSummarySerializer
        return FeatureFlagSerializer

    def get_permissions(self):
        """
        Set permissions based on action.

        - Admin actions (create, update, delete, toggle, bulk_update): IsAdminUser
        - Read actions (list, retrieve, statistics): IsAuthenticated
        """
        # Actions that modify feature flags require admin permissions
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "toggle",
            "bulk_update",
        ]:
            permission_classes = [IsAdminUser]
        # Read-only actions require authentication
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """Override create to use standardized response format."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return created(data=serializer.data, i18n_key="feature_flags.created")

    @extend_schema(
        summary="Toggle Feature Flag Globally",
        description="Enable or disable a feature flag globally for all users. "
        "This action affects all users immediately and overrides other access rules. "
        "Only administrators can toggle feature flags globally.",
        request=FeatureFlagToggleSerializer,
        responses={
            200: FeatureFlagSerializer,
            403: OpenApiExample(
                "Permission Denied",
                value={"error": "Only administrators can toggle feature flags"},
            ),
            404: OpenApiExample(
                "Feature Flag Not Found", value={"error": "Feature flag not found"}
            ),
        },
        tags=["Feature Flags"],
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def toggle(self, request, key=None):
        """
        Toggle a feature flag's global enabled state.
        """
        try:
            flag = self.get_object()
            serializer = FeatureFlagToggleSerializer(data=request.data)

            if serializer.is_valid():
                flag.is_enabled_globally = serializer.validated_data["enabled"]
                flag.save()

                # Log the change
                reason = serializer.validated_data.get("reason", "No reason provided")
                logger.info(
                    f"Flag {flag.key} toggled to {flag.is_enabled_globally} by {request.user.email}. Reason: {reason}"
                )

                # Clear caches for this flag
                service = FeatureFlagService()
                service.invalidate_flag_cache(flag.key)

                return Response(
                    FeatureFlagSerializer(flag, context={"request": request}).data,
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error toggling flag {key}: {str(e)}")
            return Response(
                {"error": "Failed to toggle feature flag"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        summary="Get Feature Flag Statistics",
        description="Retrieve detailed statistics and usage information for a specific feature flag "
        "including total access rules, enabled rules, user/role breakdowns, and usage metrics.",
        responses={
            200: FeatureFlagStatisticsSerializer,
            404: OpenApiExample(
                "Feature Flag Not Found", value={"error": "Feature flag not found"}
            ),
        },
        tags=["Feature Flags"],
    )
    @action(detail=True, methods=["get"])
    def statistics(self, request, key=None):
        """
        Get statistics for a specific feature flag.
        """
        try:
            flag = self.get_object()
            service = FeatureFlagService()
            stats = service.get_flag_statistics(flag.key)

            return Response(
                FeatureFlagStatisticsSerializer(stats).data, status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error getting statistics for flag {key}: {str(e)}")
            return Response(
                {"error": "Failed to get flag statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        summary="Bulk Update Feature Flags",
        description="Perform bulk operations on multiple feature flags for users or roles. "
        "Allows enabling/disabling multiple flags for multiple targets in a single operation. "
        "Only administrators can perform bulk operations.",
        request=FeatureFlagBulkUpdateSerializer,
        responses={
            200: OpenApiExample(
                "Bulk Operation Success",
                value={
                    "message": "Bulk operation completed",
                    "results": [
                        {
                            "flag_key": "analytics",
                            "target_id": "user123",
                            "success": True,
                        }
                    ],
                    "total_operations": 1,
                    "successful_operations": 1,
                },
            ),
            400: OpenApiExample(
                "Invalid Request",
                value={"error": "Invalid flag keys or target IDs provided"},
            ),
        },
        tags=["Feature Flags"],
    )
    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def bulk_update(self, request):
        """
        Perform bulk operations on feature flags.
        """
        serializer = FeatureFlagBulkUpdateSerializer(data=request.data)

        if serializer.is_valid():
            try:
                data = serializer.validated_data
                service = FeatureFlagService()

                results = []
                for flag_key in data["flag_keys"]:
                    for target_id in data["target_ids"]:
                        if data["target_type"] == "user":
                            from django.contrib.auth import get_user_model

                            User = get_user_model()
                            user = User.objects.get(id=target_id)

                            if data["enabled"]:
                                success = service.enable_flag_for_user(
                                    flag_key, user, data.get("reason", "")
                                )
                            else:
                                success = service.disable_flag_for_user(
                                    flag_key, user, data.get("reason", "")
                                )

                            results.append(
                                {
                                    "flag_key": flag_key,
                                    "target_id": target_id,
                                    "success": success,
                                }
                            )

                        elif data["target_type"] == "role":
                            if data["enabled"]:
                                success = service.enable_flag_for_role(
                                    flag_key, target_id, data.get("reason", "")
                                )
                            else:
                                # Create disabled rule for role
                                success = (
                                    service.create_access_rule(
                                        flag_key,
                                        role=target_id,
                                        enabled=False,
                                        reason=data.get("reason", ""),
                                    )
                                    is not None
                                )

                            results.append(
                                {
                                    "flag_key": flag_key,
                                    "target_id": target_id,
                                    "success": success,
                                }
                            )

                return Response(
                    {
                        "message": "Bulk operation completed",
                        "results": results,
                        "total_operations": len(results),
                        "successful_operations": sum(
                            1 for r in results if r["success"]
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

            except Exception as e:
                logger.error(f"Error in bulk update: {str(e)}")
                return Response(
                    {"error": "Bulk operation failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        summary="Get User's Feature Flags",
        description="Retrieve all feature flags enabled for the authenticated user along with "
        "their onboarding progress information. This endpoint considers global flags, "
        "user-specific overrides, role-based access, organization context, and "
        "progressive onboarding unlocks.",
        tags=["Feature Flags"],
    )
)
class UserFeatureFlagsView(APIView):
    """
    View for getting user's current feature flags.

    Returns all enabled feature flags for the authenticated user
    along with onboarding progress information, considering all
    access rules and progressive onboarding state.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get user's feature flags",
        description="Get all feature flags enabled for the current user",
        parameters=[
            OpenApiParameter(
                name="refresh",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Force refresh from database (skip cache)",
            ),
            OpenApiParameter(
                name="flags",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Comma-separated list of specific flag keys to check",
            ),
        ],
        responses={200: UserFeatureFlagsSerializer},
        tags=["Feature Flags"],
    )
    def get(self, request):
        """
        Get feature flags for the authenticated user.
        """
        try:
            user = request.user
            service = FeatureFlagService()

            # Parse query parameters
            force_refresh = (
                request.query_params.get("refresh", "false").lower() == "true"
            )
            flag_keys_param = request.query_params.get("flags")
            flag_keys = flag_keys_param.split(",") if flag_keys_param else None

            # Get user's organization context
            organization = user.get_primary_organization()

            # Get feature flags
            all_flags = service.get_user_flags(
                user, organization, flag_keys, force_refresh
            )
            enabled_flags = [key for key, enabled in all_flags.items() if enabled]
            disabled_flags = [key for key, enabled in all_flags.items() if not enabled]

            # Get onboarding progress
            from ..models import UserOnboardingProgress

            progress = UserOnboardingProgress.objects.filter(user=user).first()

            # Prepare response data
            response_data = {
                "user_id": user.id,
                "user_email": user.email,
                "organization_id": organization.id if organization else None,
                "organization_name": organization.name if organization else None,
                "enabled_flags": enabled_flags,
                "disabled_flags": disabled_flags,
                "onboarding_stage": progress.current_stage if progress else None,
                "onboarding_progress": progress.progress_percentage if progress else 0,
                "onboarding_complete": (
                    progress.is_onboarding_complete() if progress else False
                ),
                "last_evaluated": timezone.now(),
                "cache_hit": not force_refresh,
            }

            # Include all_flags or flags based on whether specific keys were requested
            if flag_keys:
                # When specific flags requested, return as 'flags' with details
                response_data["flags"] = [
                    {"key": key, "enabled": enabled}
                    for key, enabled in all_flags.items()
                ]
            else:
                # When all flags requested, return as 'all_flags' dict
                response_data["all_flags"] = all_flags

            serializer = UserFeatureFlagsSerializer(response_data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error getting user flags for {request.user.id}: {str(e)}")
            return Response(
                {"error": "Failed to get user feature flags"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class FeatureFlagToggleView(APIView):
    """
    View for toggling individual feature flags for users.

    Allows admins to enable/disable specific flags for specific users.
    """

    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Toggle feature flag for user",
        description="Enable or disable a specific feature flag for a specific user",
        request=FeatureFlagToggleSerializer,
        responses={200: {"description": "Flag toggled successfully"}},
        tags=["Feature Flags"],
    )
    def post(self, request, flag_key, user_id):
        """
        Toggle a feature flag for a specific user.
        """
        try:
            from django.contrib.auth import get_user_model

            User = get_user_model()

            # Check if flag exists first
            try:
                flag = FeatureFlag.objects.get(key=flag_key)
            except FeatureFlag.DoesNotExist:
                return Response(
                    {"error": f'Feature flag "{flag_key}" not found'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user = User.objects.get(id=user_id)
            service = FeatureFlagService()

            serializer = FeatureFlagToggleSerializer(data=request.data)
            if serializer.is_valid():
                enabled = serializer.validated_data["enabled"]
                reason = serializer.validated_data.get("reason", "")

                if enabled:
                    success = service.enable_flag_for_user(flag_key, user, reason)
                else:
                    success = service.disable_flag_for_user(flag_key, user, reason)

                if success:
                    return Response(
                        {
                            "success": True,
                            "message": f'Flag {flag_key} {"enabled" if enabled else "disabled"} for user {user.email}',
                            "flag_key": flag_key,
                            "user_id": str(user.id),
                            "enabled": enabled,
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"error": "Failed to toggle flag"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error toggling flag {flag_key} for user {user_id}: {str(e)}")
            return Response(
                {"error": "Failed to toggle feature flag"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class FeatureFlagStatisticsView(APIView):
    """
    View for getting feature flag statistics and analytics.

    Provides system-wide statistics about feature flag usage.
    """

    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Get feature flag system statistics",
        description="Get overall statistics about feature flag usage in the system",
        responses={200: {"description": "System statistics"}},
        tags=["Feature Flags"],
    )
    def get(self, request):
        """
        Get system-wide or flag-specific statistics.
        """
        try:
            flag_key = request.query_params.get("flag_key")

            if flag_key:
                # Get statistics for a specific flag
                try:
                    flag = FeatureFlag.objects.get(key=flag_key)
                except FeatureFlag.DoesNotExist:
                    return Response(
                        {"error": f'Feature flag "{flag_key}" not found'},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                total_rules = FeatureAccess.objects.filter(feature=flag).count()
                enabled_rules = FeatureAccess.objects.filter(
                    feature=flag, enabled=True
                ).count()
                user_rules = FeatureAccess.objects.filter(
                    feature=flag, user__isnull=False
                ).count()
                role_rules = FeatureAccess.objects.filter(
                    feature=flag, role__isnull=False
                ).count()

                return Response(
                    {
                        "flag_key": flag.key,
                        "flag_name": flag.name,
                        "is_enabled_globally": flag.is_enabled_globally,
                        "rollout_percentage": flag.rollout_percentage,
                        "total_access_rules": total_rules,
                        "enabled_access_rules": enabled_rules,
                        "user_specific_rules": user_rules,
                        "role_based_rules": role_rules,
                        "organization_rules": total_rules - user_rules - role_rules,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # Get system-wide statistics (flat format for tests)
                total_flags = FeatureFlag.objects.count()
                enabled_flags = FeatureFlag.objects.filter(
                    is_enabled_globally=True
                ).count()
                active_flags = (
                    FeatureFlag.objects.filter(
                        Q(is_enabled_globally=True) | Q(access_rules__enabled=True)
                    )
                    .distinct()
                    .count()
                )

                # Get access rule statistics
                total_rules = FeatureAccess.objects.count()
                enabled_rules = FeatureAccess.objects.filter(enabled=True).count()
                user_rules = FeatureAccess.objects.filter(user__isnull=False).count()
                role_rules = FeatureAccess.objects.filter(role__isnull=False).count()

                # Get recent activity
                from datetime import timedelta

                recent_date = timezone.now() - timedelta(days=7)
                recent_flags = FeatureFlag.objects.filter(
                    created_at__gte=recent_date
                ).count()
                recent_rules = FeatureAccess.objects.filter(
                    created_at__gte=recent_date
                ).count()

                return Response(
                    {
                        "total_flags": total_flags,
                        "enabled_flags": enabled_flags,
                        "active_flags": active_flags,
                        "total_access_rules": total_rules,
                        "enabled_access_rules": enabled_rules,
                        "user_specific_rules": user_rules,
                        "role_based_rules": role_rules,
                        "organization_rules": total_rules - user_rules - role_rules,
                        "new_flags_last_7_days": recent_flags,
                        "new_rules_last_7_days": recent_rules,
                        "generated_at": timezone.now(),
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Error getting system statistics: {str(e)}")
            return Response(
                {"error": "Failed to get statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
