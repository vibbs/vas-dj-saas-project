"""
Feature Flags API v1 URLs.

URL configuration for feature flag management API endpoints.
Follows the existing project URL structure and conventions.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import (
    BulkAccessRuleView,
    FeatureAccessViewSet,
    FeatureFlagStatisticsView,
    FeatureFlagToggleView,
    FeatureFlagViewSet,
    OnboardingActionView,
    OnboardingStageInfoView,
    UserFeatureFlagsView,
    UserOnboardingProgressViewSet,
)

# Create router for ViewSets
router = DefaultRouter()

# Feature flag management
router.register(r"flags", FeatureFlagViewSet, basename="featureflag")
router.register(r"access-rules", FeatureAccessViewSet, basename="featureaccess")
router.register(
    r"onboarding", UserOnboardingProgressViewSet, basename="onboardingprogress"
)

# URL patterns
urlpatterns = [
    # Custom endpoints (MUST come before router.urls to avoid conflicts)
    # User feature flags
    path("user/flags/", UserFeatureFlagsView.as_view(), name="user-feature-flags"),
    # Feature flag toggle for specific users
    path(
        "flags/<str:flag_key>/users/<uuid:user_id>/toggle/",
        FeatureFlagToggleView.as_view(),
        name="feature-flag-user-toggle",
    ),
    # System statistics
    path(
        "statistics/",
        FeatureFlagStatisticsView.as_view(),
        name="feature-flag-statistics",
    ),
    # Bulk operations (MUST come before access-rules/ ViewSet routes)
    path("access-rules/bulk/", BulkAccessRuleView.as_view(), name="bulk-access-rules"),
    # Onboarding actions (MUST come before onboarding/ ViewSet routes)
    path(
        "onboarding/action/", OnboardingActionView.as_view(), name="onboarding-action"
    ),
    path(
        "onboarding/stages/",
        OnboardingStageInfoView.as_view(),
        name="onboarding-stages",
    ),
    # ViewSet routes (MUST come last to avoid intercepting specific routes)
    path("", include(router.urls)),
]

# Add app_name for namespacing
app_name = "feature_flags"
