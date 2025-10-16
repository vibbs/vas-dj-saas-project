"""
Metrics middleware for collecting Prometheus/OpenTelemetry metrics.

This middleware is feature-flagged and can be completely disabled to avoid
infrastructure costs. When disabled, it has zero overhead.
"""

import logging
import time

from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin

# Lazy imports to avoid loading OpenTelemetry when disabled
_prometheus_client = None
_metrics_initialized = False
_metrics = {}

logger = logging.getLogger(__name__)


def _initialize_metrics():
    """
    Lazy initialization of Prometheus metrics.
    Only called when observability is enabled.
    """
    global _prometheus_client, _metrics_initialized, _metrics

    if _metrics_initialized:
        return

    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_metrics_enabled():
            logger.info("Metrics collection is disabled via configuration")
            return

        # Import prometheus_client only when needed
        import prometheus_client
        from prometheus_client import Counter, Gauge, Histogram

        _prometheus_client = prometheus_client

        # Request duration histogram
        _metrics["request_duration"] = Histogram(
            "django_http_request_duration_seconds",
            "HTTP request duration in seconds",
            labelnames=["method", "endpoint", "status_code"],
            buckets=(
                0.005,
                0.01,
                0.025,
                0.05,
                0.1,
                0.25,
                0.5,
                1.0,
                2.5,
                5.0,
                10.0,
            ),
        )

        # Request counter
        _metrics["request_count"] = Counter(
            "django_http_requests_total",
            "Total HTTP requests",
            labelnames=["method", "endpoint", "status_code"],
        )

        # Active requests gauge
        _metrics["active_requests"] = Gauge(
            "django_http_requests_active",
            "Currently active HTTP requests",
            labelnames=["method"],
        )

        # Exception counter
        _metrics["exception_count"] = Counter(
            "django_http_exceptions_total",
            "Total HTTP exceptions",
            labelnames=["method", "endpoint", "exception_type"],
        )

        # Response size histogram
        _metrics["response_size"] = Histogram(
            "django_http_response_size_bytes",
            "HTTP response size in bytes",
            labelnames=["method", "endpoint", "status_code"],
            buckets=(
                100,
                1000,
                10000,
                100000,
                1000000,
                10000000,
            ),
        )

        # Detailed metrics (high cardinality - only if enabled)
        if ObservabilityConfig.is_detailed_metrics_enabled():
            _metrics["request_by_user"] = Counter(
                "django_http_requests_by_user_total",
                "HTTP requests by authenticated user",
                labelnames=["user_id", "method", "status_code"],
            )

            _metrics["request_by_org"] = Counter(
                "django_http_requests_by_organization_total",
                "HTTP requests by organization (tenant)",
                labelnames=["org_id", "method", "status_code"],
            )

        _metrics_initialized = True
        logger.info("Prometheus metrics initialized successfully")

    except ImportError as e:
        logger.warning(f"Failed to import observability dependencies: {e}")
    except Exception as e:
        logger.error(f"Failed to initialize metrics: {e}", exc_info=True)


class MetricsMiddleware(MiddlewareMixin):
    """
    Django middleware for collecting HTTP request metrics.

    Features:
    - Request duration tracking
    - Request counting by endpoint, method, status
    - Active request monitoring
    - Exception tracking
    - Response size tracking
    - Optional per-user and per-organization metrics

    Configuration:
    - Set OBSERVABILITY_ENABLED=true to enable
    - Set METRICS_ENABLED=true to enable metrics collection
    - Set DETAILED_METRICS_ENABLED=true for high-cardinality metrics
    - Set METRICS_SAMPLE_RATE to sample percentage (0.0-1.0)

    When disabled, this middleware has zero overhead (no-op).
    """

    def __init__(self, get_response=None):
        super().__init__(get_response)

        # Check if observability is enabled
        try:
            from apps.core.observability.config import ObservabilityConfig

            self.config = ObservabilityConfig
            self.enabled = ObservabilityConfig.is_metrics_enabled()

            if self.enabled:
                _initialize_metrics()
                logger.info("MetricsMiddleware enabled")
            else:
                logger.info("MetricsMiddleware disabled via configuration")

        except ImportError:
            self.enabled = False
            logger.warning("ObservabilityConfig not available, metrics disabled")

    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        """Record request start time and increment active requests."""
        if not self.enabled:
            return None

        # Check sampling
        if not self.config.should_sample_metrics():
            request._metrics_sampled = False
            return None

        request._metrics_sampled = True
        request._metrics_start_time = time.perf_counter()

        # Increment active requests gauge
        if _metrics.get("active_requests"):
            try:
                _metrics["active_requests"].labels(method=request.method).inc()
            except Exception as e:
                logger.debug(f"Error incrementing active requests: {e}")

        return None

    def process_response(
        self, request: HttpRequest, response: HttpResponse
    ) -> HttpResponse:
        """Record request metrics on successful response."""
        if not self.enabled or not getattr(request, "_metrics_sampled", False):
            return response

        try:
            # Calculate request duration
            if hasattr(request, "_metrics_start_time"):
                duration = time.perf_counter() - request._metrics_start_time

                # Get endpoint pattern (remove IDs for cardinality control)
                endpoint = self._get_endpoint_pattern(request)
                method = request.method
                status_code = str(response.status_code)

                # Record metrics
                if _metrics.get("request_duration"):
                    _metrics["request_duration"].labels(
                        method=method,
                        endpoint=endpoint,
                        status_code=status_code,
                    ).observe(duration)

                if _metrics.get("request_count"):
                    _metrics["request_count"].labels(
                        method=method,
                        endpoint=endpoint,
                        status_code=status_code,
                    ).inc()

                # Record response size
                if _metrics.get("response_size") and hasattr(response, "content"):
                    response_size = len(response.content)
                    _metrics["response_size"].labels(
                        method=method,
                        endpoint=endpoint,
                        status_code=status_code,
                    ).observe(response_size)

                # Detailed metrics (if enabled)
                if self.config.is_detailed_metrics_enabled():
                    self._record_detailed_metrics(request, method, status_code)

            # Decrement active requests gauge
            if _metrics.get("active_requests"):
                _metrics["active_requests"].labels(method=request.method).dec()

        except Exception as e:
            logger.error(f"Error recording response metrics: {e}", exc_info=True)

        return response

    def process_exception(
        self, request: HttpRequest, exception: Exception
    ) -> HttpResponse | None:
        """Record exception metrics."""
        if not self.enabled or not getattr(request, "_metrics_sampled", False):
            return None

        try:
            endpoint = self._get_endpoint_pattern(request)
            exception_type = type(exception).__name__

            if _metrics.get("exception_count"):
                _metrics["exception_count"].labels(
                    method=request.method,
                    endpoint=endpoint,
                    exception_type=exception_type,
                ).inc()

            # Decrement active requests gauge
            if _metrics.get("active_requests"):
                _metrics["active_requests"].labels(method=request.method).dec()

        except Exception as e:
            logger.error(f"Error recording exception metrics: {e}", exc_info=True)

        return None

    def _get_endpoint_pattern(self, request: HttpRequest) -> str:
        """
        Extract endpoint pattern from request for cardinality control.

        Removes dynamic segments (IDs, UUIDs) to prevent label explosion.
        Examples:
            /api/v1/users/123 -> /api/v1/users/{id}
            /api/v1/orgs/uuid-here/settings -> /api/v1/orgs/{id}/settings
        """
        try:
            # Try to get URL pattern from resolver
            from django.urls import resolve

            match = resolve(request.path_info)
            if match.route:
                # Django 4.0+ has the route attribute
                return f"/{match.route}"

            # Fallback: use view name
            if match.view_name:
                return match.view_name

        except Exception:
            pass

        # Fallback: return raw path (may have high cardinality)
        return request.path_info

    def _record_detailed_metrics(
        self, request: HttpRequest, method: str, status_code: str
    ) -> None:
        """
        Record detailed (high-cardinality) metrics.

        Only called when DETAILED_METRICS_ENABLED=true.
        WARNING: This can significantly increase costs due to cardinality.
        """
        try:
            # Per-user metrics
            if request.user.is_authenticated and _metrics.get("request_by_user"):
                user_id = str(request.user.id)
                _metrics["request_by_user"].labels(
                    user_id=user_id,
                    method=method,
                    status_code=status_code,
                ).inc()

            # Per-organization metrics (multi-tenant)
            if hasattr(request, "organization") and _metrics.get("request_by_org"):
                org_id = str(request.organization.id)
                _metrics["request_by_org"].labels(
                    org_id=org_id,
                    method=method,
                    status_code=status_code,
                ).inc()

        except Exception as e:
            logger.debug(f"Error recording detailed metrics: {e}")


class MetricsEndpointMiddleware(MiddlewareMixin):
    """
    Optional middleware to expose /metrics endpoint for Prometheus scraping.

    This middleware should be placed early in the middleware stack to avoid
    authentication requirements on the metrics endpoint.

    Configuration:
        METRICS_ENDPOINT: Path for metrics endpoint (default: /metrics)
        METRICS_ENDPOINT_ENABLED: Enable/disable endpoint (default: true)
    """

    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        """Serve Prometheus metrics on configured endpoint."""
        try:
            from apps.core.observability.config import ObservabilityConfig

            if not ObservabilityConfig.is_metrics_enabled():
                return None

            if not ObservabilityConfig.METRICS_ENDPOINT_ENABLED:
                return None

            # Check if this is the metrics endpoint
            if request.path == ObservabilityConfig.METRICS_ENDPOINT:
                # Ensure metrics are initialized
                _initialize_metrics()

                if _prometheus_client:
                    from django.http import HttpResponse

                    metrics_output = _prometheus_client.generate_latest()
                    return HttpResponse(
                        metrics_output,
                        content_type=_prometheus_client.CONTENT_TYPE_LATEST,
                    )

        except Exception as e:
            logger.error(f"Error serving metrics endpoint: {e}", exc_info=True)

        return None
