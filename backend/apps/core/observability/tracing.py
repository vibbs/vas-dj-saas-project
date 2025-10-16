"""
Distributed tracing utilities for OpenTelemetry.

Provides helper functions for adding custom spans and tracing context.
"""

import logging
from collections.abc import Callable
from functools import wraps
from typing import Any

logger = logging.getLogger(__name__)


def get_current_span():
    """
    Get the current active span.

    Returns:
        Current span or None if tracing is disabled
    """
    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_tracing_enabled():
            return None

        from opentelemetry import trace

        return trace.get_current_span()

    except Exception as e:
        logger.debug(f"Error getting current span: {e}")
        return None


def add_span_attribute(key: str, value: Any) -> None:
    """
    Add an attribute to the current span.

    Args:
        key: Attribute key
        value: Attribute value (string, int, float, or bool)
    """
    try:
        span = get_current_span()
        if span:
            span.set_attribute(key, value)
    except Exception as e:
        logger.debug(f"Error adding span attribute: {e}")


def add_span_event(name: str, attributes: dict[str, Any] | None = None) -> None:
    """
    Add an event to the current span.

    Args:
        name: Event name
        attributes: Optional event attributes
    """
    try:
        span = get_current_span()
        if span:
            span.add_event(name, attributes=attributes or {})
    except Exception as e:
        logger.debug(f"Error adding span event: {e}")


def record_exception(
    exception: Exception, attributes: dict[str, Any] | None = None
) -> None:
    """
    Record an exception in the current span.

    Args:
        exception: Exception instance
        attributes: Optional additional attributes
    """
    try:
        span = get_current_span()
        if span:
            span.record_exception(exception, attributes=attributes or {})
            span.set_status(trace.Status(trace.StatusCode.ERROR))
    except Exception as e:
        logger.debug(f"Error recording exception in span: {e}")


def trace_function(
    span_name: str | None = None, attributes: dict[str, Any] | None = None
):
    """
    Decorator to trace a function execution.

    Args:
        span_name: Optional span name (defaults to function name)
        attributes: Optional span attributes

    Example:
        @trace_function(span_name="process_payment", attributes={"payment.method": "stripe"})
        def process_payment(amount):
            # Function code
            pass
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                from apps.core.observability.config import ObservabilityConfig

                if not ObservabilityConfig.is_tracing_enabled():
                    return func(*args, **kwargs)

                from opentelemetry import trace

                tracer = trace.get_tracer(__name__)
                name = span_name or func.__name__

                with tracer.start_as_current_span(name) as span:
                    # Add default attributes
                    span.set_attribute("function.name", func.__name__)
                    span.set_attribute("function.module", func.__module__)

                    # Add custom attributes
                    if attributes:
                        for key, value in attributes.items():
                            span.set_attribute(key, value)

                    try:
                        result = func(*args, **kwargs)
                        span.set_status(trace.Status(trace.StatusCode.OK))
                        return result
                    except Exception as e:
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise

            except Exception as e:
                logger.debug(f"Error in trace function decorator: {e}")
                # Execute function without tracing on error
                return func(*args, **kwargs)

        return wrapper

    return decorator


def trace_database_operation(operation: str, table: str | None = None):
    """
    Decorator to trace database operations.

    Args:
        operation: Database operation (select, insert, update, delete)
        table: Optional table name

    Example:
        @trace_database_operation("select", table="users")
        def get_active_users():
            return User.objects.filter(is_active=True)
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                from apps.core.observability.config import ObservabilityConfig

                if not ObservabilityConfig.is_tracing_enabled():
                    return func(*args, **kwargs)

                from opentelemetry import trace

                tracer = trace.get_tracer(__name__)
                span_name = f"db.{operation}"

                with tracer.start_as_current_span(span_name) as span:
                    span.set_attribute("db.operation", operation)
                    if table:
                        span.set_attribute("db.table", table)
                    span.set_attribute("db.system", "postgresql")

                    try:
                        result = func(*args, **kwargs)
                        span.set_status(trace.Status(trace.StatusCode.OK))
                        return result
                    except Exception as e:
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise

            except Exception as e:
                logger.debug(f"Error in trace database operation: {e}")
                return func(*args, **kwargs)

        return wrapper

    return decorator


def trace_cache_operation(operation: str, key: str | None = None):
    """
    Decorator to trace cache operations.

    Args:
        operation: Cache operation (get, set, delete)
        key: Optional cache key

    Example:
        @trace_cache_operation("get", key="user:123")
        def get_user_from_cache(user_id):
            return cache.get(f"user:{user_id}")
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                from apps.core.observability.config import ObservabilityConfig

                if not ObservabilityConfig.is_tracing_enabled():
                    return func(*args, **kwargs)

                from opentelemetry import trace

                tracer = trace.get_tracer(__name__)
                span_name = f"cache.{operation}"

                with tracer.start_as_current_span(span_name) as span:
                    span.set_attribute("cache.operation", operation)
                    if key:
                        span.set_attribute("cache.key", key)
                    span.set_attribute("cache.system", "redis")

                    try:
                        result = func(*args, **kwargs)
                        span.set_status(trace.Status(trace.StatusCode.OK))

                        # For get operations, record hit/miss
                        if operation == "get":
                            span.set_attribute("cache.hit", result is not None)

                        return result
                    except Exception as e:
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise

            except Exception as e:
                logger.debug(f"Error in trace cache operation: {e}")
                return func(*args, **kwargs)

        return wrapper

    return decorator


def trace_external_api_call(service: str, endpoint: str | None = None):
    """
    Decorator to trace external API calls.

    Args:
        service: External service name
        endpoint: Optional API endpoint

    Example:
        @trace_external_api_call("stripe", endpoint="/v1/charges")
        def create_stripe_charge(amount):
            return stripe.Charge.create(amount=amount)
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                from apps.core.observability.config import ObservabilityConfig

                if not ObservabilityConfig.is_tracing_enabled():
                    return func(*args, **kwargs)

                from opentelemetry import trace

                tracer = trace.get_tracer(__name__)
                span_name = f"external_api.{service}"

                with tracer.start_as_current_span(span_name) as span:
                    span.set_attribute("external_api.service", service)
                    if endpoint:
                        span.set_attribute("external_api.endpoint", endpoint)
                    span.set_attribute("span.kind", "client")

                    try:
                        result = func(*args, **kwargs)
                        span.set_status(trace.Status(trace.StatusCode.OK))
                        return result
                    except Exception as e:
                        span.record_exception(e)
                        span.set_status(trace.Status(trace.StatusCode.ERROR))
                        raise

            except Exception as e:
                logger.debug(f"Error in trace external API call: {e}")
                return func(*args, **kwargs)

        return wrapper

    return decorator


class TraceContext:
    """
    Context manager for creating custom trace spans.

    Example:
        with TraceContext("user_registration") as span:
            span.set_attribute("user.email", email)
            # Registration code
            pass
    """

    def __init__(self, name: str, attributes: dict[str, Any] | None = None, kind=None):
        self.name = name
        self.attributes = attributes or {}
        self.kind = kind
        self.span = None
        self.tracer = None

    def __enter__(self):
        try:
            from apps.core.observability.config import ObservabilityConfig

            if not ObservabilityConfig.is_tracing_enabled():
                return self

            from opentelemetry import trace

            self.tracer = trace.get_tracer(__name__)
            self.span = self.tracer.start_span(self.name)

            # Add attributes
            for key, value in self.attributes.items():
                self.span.set_attribute(key, value)

            # Set span kind if provided
            if self.kind:
                self.span.set_attribute("span.kind", self.kind)

        except Exception as e:
            logger.debug(f"Error creating trace context: {e}")

        return self.span if self.span else self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.span:
            try:
                if exc_type:
                    self.span.record_exception(exc_val)
                    from opentelemetry import trace

                    self.span.set_status(trace.Status(trace.StatusCode.ERROR))
                else:
                    from opentelemetry import trace

                    self.span.set_status(trace.Status(trace.StatusCode.OK))

                self.span.end()
            except Exception as e:
                logger.debug(f"Error ending trace context: {e}")

    def set_attribute(self, key: str, value: Any) -> None:
        """Add attribute to span (no-op if span doesn't exist)."""
        pass

    def add_event(self, name: str, attributes: dict[str, Any] | None = None) -> None:
        """Add event to span (no-op if span doesn't exist)."""
        pass
