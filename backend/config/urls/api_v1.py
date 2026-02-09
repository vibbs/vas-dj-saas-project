from django.urls import include, path

from apps.core.views import capabilities_view

urlpatterns = [
    # Core/Platform endpoints
    path("capabilities/", capabilities_view, name="capabilities"),
    # JWT Authentication URLs
    path("auth/", include("apps.accounts.urls.auth")),
    # DRF Authentication URLs (for browsable API)
    path("auth/", include("rest_framework.urls", namespace="rest_framework_v1")),
    # Accounts API endpoints
    path("accounts/", include("apps.accounts.urls.api_v1")),
    # Organizations API endpoints
    path("organizations/", include("apps.organizations.urls.api_v1")),
    # Billing API endpoints
    path("billing/", include("apps.billing.urls.api_v1")),
    # Email Service API endpoints
    path("email_service/", include("apps.email_service.urls.api_v1")),
    # Feature Flags API endpoints
    path("feature-flags/", include("apps.feature_flags.urls.api_v1")),
]
