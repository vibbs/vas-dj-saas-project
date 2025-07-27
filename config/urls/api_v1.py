from django.urls import path, include

urlpatterns = [
    # Authentication URLs
    path("auth/", include("rest_framework.urls", namespace="rest_framework_v1")),
    # Accounts API endpoints
    path("accounts/", include("apps.accounts.urls.api_v1")),
    # Organizations API endpoints
    path("organizations/", include("apps.organizations.urls.api_v1")),
    # Billing API endpoints
    path("billing/", include("apps.billing.urls.api_v1")),
]
