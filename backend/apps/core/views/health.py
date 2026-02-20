"""
Health check endpoint for monitoring and load balancers.
Checks connectivity to all critical services.
"""

from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Health check endpoint.
    Returns 200 if all services are healthy, 503 if any are degraded.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        health = {"status": "healthy", "services": {}}

        # Check database
        try:
            connection.ensure_connection()
            health["services"]["database"] = "up"
        except Exception:
            health["services"]["database"] = "down"
            health["status"] = "degraded"

        # Check Redis
        try:
            from django.core.cache import cache

            cache.set("health_check", "ok", timeout=10)
            if cache.get("health_check") == "ok":
                health["services"]["cache"] = "up"
            else:
                health["services"]["cache"] = "degraded"
        except Exception:
            health["services"]["cache"] = "down"

        # Check Celery (just check broker connectivity)
        try:
            from config.celery import app

            inspector = app.control.inspect(timeout=2)
            if inspector.ping():
                health["services"]["celery"] = "up"
            else:
                health["services"]["celery"] = "unavailable"
        except Exception:
            health["services"]["celery"] = "unavailable"

        status_code = 200 if health["status"] == "healthy" else 503
        return Response(health, status=status_code)
