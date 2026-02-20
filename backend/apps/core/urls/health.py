from django.urls import path

from apps.core.views.health import HealthCheckView

urlpatterns = [
    path("", HealthCheckView.as_view(), name="health-check"),
]
