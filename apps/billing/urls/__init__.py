from django.urls import include, path

urlpatterns = [
    # Default to v1 for backward compatibility
    path("", include("apps.billing.urls.api_v1")),
]
