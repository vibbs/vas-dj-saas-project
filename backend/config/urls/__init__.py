from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def metrics_view(request):
    """
    Prometheus metrics endpoint.

    This endpoint is only active when OBSERVABILITY_ENABLED=true and METRICS_ENABLED=true.
    Otherwise, it returns a 404 or disabled message.
    """
    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_metrics_enabled():
            return HttpResponse(
                "Metrics endpoint is disabled. Set OBSERVABILITY_ENABLED=true and METRICS_ENABLED=true to enable.",
                status=503,
                content_type="text/plain",
            )

        # Import prometheus_client only when needed
        from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

        metrics_output = generate_latest()
        return HttpResponse(metrics_output, content_type=CONTENT_TYPE_LATEST)
    except ImportError as e:
        return HttpResponse(
            f"Observability dependencies not installed: {e}",
            status=503,
            content_type="text/plain",
        )
    except Exception as e:
        return HttpResponse(
            f"Error generating metrics: {e}", status=500, content_type="text/plain"
        )


urlpatterns = [
    path("admin/", admin.site.urls),
    # API Documentation URLs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API URLs - Versioned
    path("api/v1/", include("config.urls.api_v1")),
    # path('api/v2/', include('config.urls.api_v2')),  # Future version
    # Observability endpoints
    path("metrics", metrics_view, name="metrics"),  # Prometheus metrics endpoint
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
