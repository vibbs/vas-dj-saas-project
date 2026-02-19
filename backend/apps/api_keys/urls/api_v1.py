from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import ApiKeyViewSet

router = DefaultRouter()
router.register(r"", ApiKeyViewSet, basename="api-keys")

urlpatterns = [
    path("", include(router.urls)),
]

app_name = "api_keys"
