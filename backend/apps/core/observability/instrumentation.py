"""
OpenTelemetry auto-instrumentation setup.

Provides automatic instrumentation for Django, Celery, PostgreSQL, Redis, etc.
Only initializes when observability is enabled.
"""

import logging

logger = logging.getLogger(__name__)

_instrumentation_initialized = False


def initialize_instrumentation() -> bool:
    """
    Initialize OpenTelemetry auto-instrumentation.

    This function should be called during Django app startup (e.g., in AppConfig.ready()).
    It will only instrument when observability is enabled.

    Returns:
        bool: True if instrumentation was initialized, False otherwise
    """
    global _instrumentation_initialized

    if _instrumentation_initialized:
        logger.debug("Instrumentation already initialized")
        return True

    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_enabled():
            logger.info("Observability disabled, skipping instrumentation")
            return False

        logger.info("Initializing OpenTelemetry instrumentation...")

        # Initialize OpenTelemetry SDK
        from opentelemetry import trace
        from opentelemetry.sdk.resources import SERVICE_NAME, SERVICE_VERSION, Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.sampling import ParentBasedTraceIdRatio

        # Create resource with service information
        resource = Resource.create(
            {
                SERVICE_NAME: ObservabilityConfig.OTEL_SERVICE_NAME,
                SERVICE_VERSION: ObservabilityConfig.OTEL_SERVICE_VERSION,
            }
        )

        # Create tracer provider with sampling
        sampler = ParentBasedTraceIdRatio(ObservabilityConfig.TRACING_SAMPLE_RATE)
        tracer_provider = TracerProvider(resource=resource, sampler=sampler)
        trace.set_tracer_provider(tracer_provider)

        # Configure exporters
        if ObservabilityConfig.is_metrics_enabled():
            _setup_prometheus_exporter(tracer_provider)

        # Auto-instrument libraries
        if ObservabilityConfig.is_tracing_enabled():
            _instrument_libraries()

        _instrumentation_initialized = True
        logger.info("OpenTelemetry instrumentation initialized successfully")
        return True

    except ImportError as e:
        logger.warning(f"OpenTelemetry libraries not available: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to initialize instrumentation: {e}", exc_info=True)
        return False


def _setup_prometheus_exporter(tracer_provider) -> None:
    """Setup Prometheus exporter for metrics."""
    try:
        from opentelemetry.exporter.prometheus import PrometheusMetricReader
        from opentelemetry.sdk.metrics import MeterProvider

        # Create Prometheus metric reader
        prometheus_reader = PrometheusMetricReader()

        # Create and set meter provider
        meter_provider = MeterProvider(
            resource=tracer_provider.resource, metric_readers=[prometheus_reader]
        )

        from opentelemetry import metrics

        metrics.set_meter_provider(meter_provider)

        logger.info("Prometheus exporter configured")

    except ImportError as e:
        logger.warning(f"Prometheus exporter not available: {e}")
    except Exception as e:
        logger.error(f"Failed to setup Prometheus exporter: {e}", exc_info=True)


def _instrument_libraries() -> None:
    """
    Auto-instrument supported libraries.

    Instruments:
    - Django (HTTP requests, templates, database)
    - Celery (tasks)
    - psycopg2 (PostgreSQL queries)
    - Redis operations
    - HTTP requests library
    """
    instrumented = []
    failed = []

    # Django instrumentation
    try:
        from opentelemetry.instrumentation.django import DjangoInstrumentor

        DjangoInstrumentor().instrument()
        instrumented.append("Django")
    except Exception as e:
        failed.append(f"Django: {e}")

    # Celery instrumentation
    try:
        from opentelemetry.instrumentation.celery import CeleryInstrumentor

        CeleryInstrumentor().instrument()
        instrumented.append("Celery")
    except Exception as e:
        failed.append(f"Celery: {e}")

    # PostgreSQL (psycopg2) instrumentation
    try:
        from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor

        Psycopg2Instrumentor().instrument()
        instrumented.append("PostgreSQL/psycopg2")
    except Exception as e:
        failed.append(f"PostgreSQL: {e}")

    # Redis instrumentation
    try:
        from opentelemetry.instrumentation.redis import RedisInstrumentor

        RedisInstrumentor().instrument()
        instrumented.append("Redis")
    except Exception as e:
        failed.append(f"Redis: {e}")

    # Requests library instrumentation
    try:
        from opentelemetry.instrumentation.requests import RequestsInstrumentor

        RequestsInstrumentor().instrument()
        instrumented.append("Requests")
    except Exception as e:
        failed.append(f"Requests: {e}")

    # Log results
    if instrumented:
        logger.info(f"Instrumented libraries: {', '.join(instrumented)}")

    if failed:
        logger.warning(f"Failed to instrument: {', '.join(failed)}")


def get_tracer(name: str):
    """
    Get a tracer instance for custom tracing.

    Args:
        name: Name of the tracer (usually module name)

    Returns:
        Tracer instance or no-op tracer if observability is disabled

    Example:
        tracer = get_tracer(__name__)
        with tracer.start_as_current_span("my_operation"):
            # Your code here
            pass
    """
    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_tracing_enabled():
            # Return no-op tracer
            from opentelemetry.trace import get_tracer as get_noop_tracer

            return get_noop_tracer(name)

        from opentelemetry import trace

        return trace.get_tracer(name)

    except Exception as e:
        logger.debug(f"Error getting tracer: {e}")
        # Return no-op tracer as fallback
        from opentelemetry.trace import get_tracer as get_noop_tracer

        return get_noop_tracer(name)


def trace_span(name: str, attributes: dict | None = None):
    """
    Decorator for tracing function execution.

    Args:
        name: Span name
        attributes: Optional span attributes

    Example:
        @trace_span("user_registration")
        def register_user(email):
            # Function code
            pass
    """

    def decorator(func):
        from functools import wraps

        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                from apps.core.observability.config import ObservabilityConfig

                if not ObservabilityConfig.is_tracing_enabled():
                    return func(*args, **kwargs)

                tracer = get_tracer(func.__module__)
                with tracer.start_as_current_span(name) as span:
                    # Add attributes if provided
                    if attributes:
                        for key, value in attributes.items():
                            span.set_attribute(key, value)

                    # Add function info
                    span.set_attribute("function.name", func.__name__)
                    span.set_attribute("function.module", func.__module__)

                    return func(*args, **kwargs)

            except Exception as e:
                logger.debug(f"Error in trace span: {e}")
                # Execute function without tracing on error
                return func(*args, **kwargs)

        return wrapper

    return decorator
