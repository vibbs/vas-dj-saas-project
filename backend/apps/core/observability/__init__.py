"""
Observability module for metrics, tracing, and monitoring.

This module provides configurable observability features including:
- Prometheus metrics collection
- OpenTelemetry distributed tracing
- Custom business metrics
- Feature-flagged enablement for cost optimization
"""

from .config import ObservabilityConfig

__all__ = ["ObservabilityConfig"]
