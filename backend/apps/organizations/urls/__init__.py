from django.urls import include, path

urlpatterns = [
    # Default to v1 for backward compatibility
    path("", include("apps.organizations.urls.api_v1")),
]
