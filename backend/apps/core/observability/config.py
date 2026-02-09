"""
Observability configuration module.

Provides centralized configuration for all observability features with
environment-based controls to optimize costs in production.
"""

from decouple import config


class ObservabilityConfig:
    """
    Central configuration for observability features.

    All observability features are disabled by default to minimize costs.
    Enable only what you need in production.

    Environment Variables:
        OBSERVABILITY_ENABLED: Master switch for all observability (default: False)
        METRICS_ENABLED: Enable Prometheus metrics collection (default: False)
        TRACING_ENABLED: Enable distributed tracing (default: False)
        DETAILED_METRICS_ENABLED: Enable high-cardinality metrics (default: False)
        METRICS_SAMPLE_RATE: Percentage of requests to track (0.0-1.0, default: 1.0)
        TRACING_SAMPLE_RATE: Percentage of requests to trace (0.0-1.0, default: 0.01)
        METRICS_RETENTION_DAYS: Days to retain metrics (default: 7)

    Cost Optimization:
        - Set OBSERVABILITY_ENABLED=false to disable everything (zero overhead)
        - Use sampling rates < 1.0 to reduce data volume
        - Disable TRACING_ENABLED in production (most expensive feature)
        - Disable DETAILED_METRICS_ENABLED to reduce cardinality costs
    """

    # Master switch - disables everything if False
    ENABLED: bool = config("OBSERVABILITY_ENABLED", default=False, cast=bool)

    # Feature-specific toggles
    METRICS_ENABLED: bool = config("METRICS_ENABLED", default=False, cast=bool)
    TRACING_ENABLED: bool = config("TRACING_ENABLED", default=False, cast=bool)
    DETAILED_METRICS_ENABLED: bool = config(
        "DETAILED_METRICS_ENABLED", default=False, cast=bool
    )

    # Sampling rates for cost optimization
    METRICS_SAMPLE_RATE: float = config("METRICS_SAMPLE_RATE", default=1.0, cast=float)
    TRACING_SAMPLE_RATE: float = config(
        "TRACING_SAMPLE_RATE",
        default=0.01,
        cast=float,  # 1% default
    )

    # Data retention
    METRICS_RETENTION_DAYS: int = config("METRICS_RETENTION_DAYS", default=7, cast=int)

    # Prometheus configuration
    PROMETHEUS_PORT: int = config("PROMETHEUS_PORT", default=9090, cast=int)
    PROMETHEUS_SCRAPE_INTERVAL: str = config(
        "PROMETHEUS_SCRAPE_INTERVAL", default="15s"
    )

    # Metrics endpoint configuration
    METRICS_ENDPOINT: str = config("METRICS_ENDPOINT", default="/metrics")
    METRICS_ENDPOINT_ENABLED: bool = config(
        "METRICS_ENDPOINT_ENABLED", default=True, cast=bool
    )

    # Cardinality limits (prevent label explosion costs)
    MAX_METRIC_LABELS: int = config("MAX_METRIC_LABELS", default=10, cast=int)
    MAX_LABEL_VALUES: int = config("MAX_LABEL_VALUES", default=100, cast=int)

    # OpenTelemetry configuration
    OTEL_SERVICE_NAME: str = config("OTEL_SERVICE_NAME", default="vas-dj-saas")
    OTEL_SERVICE_VERSION: str = config("OTEL_SERVICE_VERSION", default="1.0.0")
    OTEL_EXPORTER_OTLP_ENDPOINT: str | None = config(
        "OTEL_EXPORTER_OTLP_ENDPOINT", default=None
    )

    @classmethod
    def is_enabled(cls) -> bool:
        """Check if observability is enabled globally."""
        return cls.ENABLED

    @classmethod
    def is_metrics_enabled(cls) -> bool:
        """Check if metrics collection is enabled."""
        return cls.ENABLED and cls.METRICS_ENABLED

    @classmethod
    def is_tracing_enabled(cls) -> bool:
        """Check if distributed tracing is enabled."""
        return cls.ENABLED and cls.TRACING_ENABLED

    @classmethod
    def is_detailed_metrics_enabled(cls) -> bool:
        """Check if detailed (high-cardinality) metrics are enabled."""
        return cls.is_metrics_enabled() and cls.DETAILED_METRICS_ENABLED

    @classmethod
    def should_sample_metrics(cls) -> bool:
        """
        Determine if current request should be sampled for metrics.
        Uses random sampling based on METRICS_SAMPLE_RATE.
        """
        import random

        return random.random() < cls.METRICS_SAMPLE_RATE

    @classmethod
    def should_sample_trace(cls) -> bool:
        """
        Determine if current request should be traced.
        Uses random sampling based on TRACING_SAMPLE_RATE.
        """
        import random

        return random.random() < cls.TRACING_SAMPLE_RATE

    @classmethod
    def get_config_summary(cls) -> dict:
        """Get a summary of current observability configuration."""
        return {
            "enabled": cls.ENABLED,
            "metrics_enabled": cls.is_metrics_enabled(),
            "tracing_enabled": cls.is_tracing_enabled(),
            "detailed_metrics_enabled": cls.is_detailed_metrics_enabled(),
            "metrics_sample_rate": cls.METRICS_SAMPLE_RATE,
            "tracing_sample_rate": cls.TRACING_SAMPLE_RATE,
            "retention_days": cls.METRICS_RETENTION_DAYS,
            "service_name": cls.OTEL_SERVICE_NAME,
            "service_version": cls.OTEL_SERVICE_VERSION,
        }

    @classmethod
    def validate_config(cls) -> list[str]:
        """
        Validate configuration and return list of warnings.

        Returns:
            List of warning messages. Empty list if configuration is valid.
        """
        warnings = []

        # Validate sample rates
        if not 0.0 <= cls.METRICS_SAMPLE_RATE <= 1.0:
            warnings.append(
                f"METRICS_SAMPLE_RATE must be between 0.0 and 1.0, got {cls.METRICS_SAMPLE_RATE}"
            )

        if not 0.0 <= cls.TRACING_SAMPLE_RATE <= 1.0:
            warnings.append(
                f"TRACING_SAMPLE_RATE must be between 0.0 and 1.0, got {cls.TRACING_SAMPLE_RATE}"
            )

        # Warn about expensive configurations
        if cls.is_tracing_enabled() and cls.TRACING_SAMPLE_RATE > 0.1:
            warnings.append(
                f"TRACING_SAMPLE_RATE is high ({cls.TRACING_SAMPLE_RATE}). "
                "This may significantly increase infrastructure costs. "
                "Consider reducing to < 0.1 (10%) for production."
            )

        if cls.is_detailed_metrics_enabled():
            warnings.append(
                "DETAILED_METRICS_ENABLED is on. This may increase cardinality "
                "costs. Ensure your infrastructure can handle high-cardinality metrics."
            )

        # Warn if tracing is enabled without metrics
        if cls.TRACING_ENABLED and not cls.METRICS_ENABLED:
            warnings.append(
                "TRACING_ENABLED is true but METRICS_ENABLED is false. "
                "Tracing without metrics may provide incomplete observability."
            )

        return warnings


# Validate configuration on import
_warnings = ObservabilityConfig.validate_config()
if _warnings:
    import logging

    logger = logging.getLogger(__name__)
    for warning in _warnings:
        logger.warning(f"Observability configuration warning: {warning}")
