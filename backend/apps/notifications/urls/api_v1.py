from django.urls import include, path
from rest_framework.routers import DefaultRouter

from ..views import NotificationPreferenceView, NotificationViewSet

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("preferences/", NotificationPreferenceView.as_view(), name="notification-preferences"),
    path("", include(router.urls)),
]

app_name = "notifications"
