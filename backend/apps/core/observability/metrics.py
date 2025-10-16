"""
Custom business metrics utilities.

Provides helper functions for tracking domain-specific metrics
beyond standard HTTP request metrics.
"""

import logging
from functools import wraps

logger = logging.getLogger(__name__)

# Lazy imports
_prometheus_client = None
_custom_metrics = {}
_custom_metrics_initialized = False


def _initialize_custom_metrics():
    """Lazy initialization of custom business metrics."""
    global _prometheus_client, _custom_metrics, _custom_metrics_initialized

    if _custom_metrics_initialized:
        return

    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_metrics_enabled():
            return

        import prometheus_client
        from prometheus_client import Counter, Gauge, Histogram

        _prometheus_client = prometheus_client

        # User registration metrics
        _custom_metrics["user_registrations"] = Counter(
            "app_user_registrations_total",
            "Total user registrations",
            labelnames=["status"],  # success, failed, pending
        )

        # Organization metrics
        _custom_metrics["organization_operations"] = Counter(
            "app_organization_operations_total",
            "Organization CRUD operations",
            labelnames=["operation", "status"],  # create/update/delete, success/failed
        )

        # Authentication metrics
        _custom_metrics["login_attempts"] = Counter(
            "app_login_attempts_total",
            "Login attempts",
            labelnames=["status", "method"],  # success/failed, email/social
        )

        # API endpoint usage (business metrics)
        _custom_metrics["api_endpoint_usage"] = Counter(
            "app_api_endpoint_usage_total",
            "API endpoint usage by feature",
            labelnames=["feature", "organization_id"],
        )

        # Tenant isolation metrics
        _custom_metrics["tenant_data_access"] = Counter(
            "app_tenant_data_access_total",
            "Data access operations per tenant",
            labelnames=["tenant_id", "resource_type", "operation"],
        )

        # Background task metrics
        _custom_metrics["celery_task_duration"] = Histogram(
            "app_celery_task_duration_seconds",
            "Celery task execution duration",
            labelnames=["task_name", "status"],
            buckets=(0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0, 300.0),
        )

        _custom_metrics["celery_task_count"] = Counter(
            "app_celery_tasks_total",
            "Total Celery tasks executed",
            labelnames=["task_name", "status"],
        )

        # Database query performance
        _custom_metrics["db_query_duration"] = Histogram(
            "app_database_query_duration_seconds",
            "Database query execution time",
            labelnames=["query_type"],  # select/insert/update/delete
            buckets=(0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0),
        )

        # Cache metrics
        _custom_metrics["cache_operations"] = Counter(
            "app_cache_operations_total",
            "Cache operations",
            labelnames=["operation", "hit"],  # get/set/delete, true/false
        )

        # Feature flag usage
        _custom_metrics["feature_flag_evaluations"] = Counter(
            "app_feature_flag_evaluations_total",
            "Feature flag evaluations",
            labelnames=["flag_key", "result"],
        )

        # Rate limit hits
        _custom_metrics["rate_limit_hits"] = Counter(
            "app_rate_limit_hits_total",
            "Rate limit enforcement",
            labelnames=["endpoint", "user_type"],
        )

        _custom_metrics_initialized = True
        logger.info("Custom business metrics initialized")

    except ImportError as e:
        logger.warning(f"Failed to import observability dependencies: {e}")
    except Exception as e:
        logger.error(f"Failed to initialize custom metrics: {e}", exc_info=True)


def is_metrics_enabled() -> bool:
    """Check if metrics are enabled."""
    try:
        from apps.core.observability.config import ObservabilityConfig

        return ObservabilityConfig.is_metrics_enabled()
    except ImportError:
        return False


def record_user_registration(status: str = "success") -> None:
    """
    Record a user registration event.

    Args:
        status: Registration status (success, failed, pending)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("user_registrations"):
            _custom_metrics["user_registrations"].labels(status=status).inc()
    except Exception as e:
        logger.debug(f"Error recording user registration metric: {e}")


def record_organization_operation(operation: str, status: str = "success") -> None:
    """
    Record an organization operation.

    Args:
        operation: Operation type (create, update, delete)
        status: Operation status (success, failed)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("organization_operations"):
            _custom_metrics["organization_operations"].labels(
                operation=operation, status=status
            ).inc()
    except Exception as e:
        logger.debug(f"Error recording organization operation metric: {e}")


def record_login_attempt(status: str, method: str = "email") -> None:
    """
    Record a login attempt.

    Args:
        status: Login status (success, failed)
        method: Authentication method (email, social)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("login_attempts"):
            _custom_metrics["login_attempts"].labels(status=status, method=method).inc()
    except Exception as e:
        logger.debug(f"Error recording login attempt metric: {e}")


def record_api_endpoint_usage(feature: str, organization_id: str | None = None) -> None:
    """
    Record API endpoint usage for business analytics.

    Args:
        feature: Feature name or API endpoint category
        organization_id: Organization ID (optional, for tenant tracking)
    """
    if not is_metrics_enabled():
        return

    try:
        from apps.core.observability.config import ObservabilityConfig

        if not ObservabilityConfig.is_detailed_metrics_enabled():
            return

        _initialize_custom_metrics()
        if _custom_metrics.get("api_endpoint_usage"):
            org_id = organization_id or "unknown"
            _custom_metrics["api_endpoint_usage"].labels(
                feature=feature, organization_id=org_id
            ).inc()
    except Exception as e:
        logger.debug(f"Error recording API endpoint usage metric: {e}")


def record_cache_operation(operation: str, hit: bool) -> None:
    """
    Record a cache operation.

    Args:
        operation: Operation type (get, set, delete)
        hit: Whether the operation was a cache hit (for get operations)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("cache_operations"):
            _custom_metrics["cache_operations"].labels(
                operation=operation, hit=str(hit).lower()
            ).inc()
    except Exception as e:
        logger.debug(f"Error recording cache operation metric: {e}")


def record_feature_flag_evaluation(flag_key: str, result: bool) -> None:
    """
    Record a feature flag evaluation.

    Args:
        flag_key: Feature flag key
        result: Evaluation result (true/false)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("feature_flag_evaluations"):
            _custom_metrics["feature_flag_evaluations"].labels(
                flag_key=flag_key, result=str(result).lower()
            ).inc()
    except Exception as e:
        logger.debug(f"Error recording feature flag evaluation metric: {e}")


def record_rate_limit_hit(endpoint: str, user_type: str = "anonymous") -> None:
    """
    Record a rate limit hit.

    Args:
        endpoint: Endpoint that was rate limited
        user_type: Type of user (authenticated, anonymous)
    """
    if not is_metrics_enabled():
        return

    try:
        _initialize_custom_metrics()
        if _custom_metrics.get("rate_limit_hits"):
            _custom_metrics["rate_limit_hits"].labels(
                endpoint=endpoint, user_type=user_type
            ).inc()
    except Exception as e:
        logger.debug(f"Error recording rate limit hit metric: {e}")


def track_celery_task(func):
    """
    Decorator to track Celery task execution metrics.

    Usage:
        @track_celery_task
        @celery_app.task
        def my_task():
            pass
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if not is_metrics_enabled():
            return func(*args, **kwargs)

        _initialize_custom_metrics()
        task_name = func.__name__

        import time

        start_time = time.perf_counter()
        status = "success"

        try:
            result = func(*args, **kwargs)
            return result
        except Exception:
            status = "failed"
            raise
        finally:
            duration = time.perf_counter() - start_time

            try:
                if _custom_metrics.get("celery_task_duration"):
                    _custom_metrics["celery_task_duration"].labels(
                        task_name=task_name, status=status
                    ).observe(duration)

                if _custom_metrics.get("celery_task_count"):
                    _custom_metrics["celery_task_count"].labels(
                        task_name=task_name, status=status
                    ).inc()
            except Exception as metric_error:
                logger.debug(f"Error recording task metrics: {metric_error}")

    return wrapper


def track_database_query(query_type: str):
    """
    Decorator to track database query performance.

    Args:
        query_type: Type of query (select, insert, update, delete)

    Usage:
        @track_database_query('select')
        def get_users():
            return User.objects.all()
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not is_metrics_enabled():
                return func(*args, **kwargs)

            _initialize_custom_metrics()

            import time

            start_time = time.perf_counter()

            try:
                return func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start_time

                try:
                    if _custom_metrics.get("db_query_duration"):
                        _custom_metrics["db_query_duration"].labels(
                            query_type=query_type
                        ).observe(duration)
                except Exception as e:
                    logger.debug(f"Error recording query metrics: {e}")

        return wrapper

    return decorator
