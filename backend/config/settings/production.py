import sentry_sdk
from decouple import config
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

from .base import *

DEBUG = config("DEBUG", default=False, cast=bool)

# Production-specific settings
SECRET_KEY = config("SECRET_KEY")
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)

# HTTPS and Security Settings
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Cookie Security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional Security Headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"

# Database Connection Pooling
DATABASES["default"]["CONN_MAX_AGE"] = 600  # 10 minutes

# Redis Cache Configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("REDIS_CACHE_URL", default="redis://redis:6379/2"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "CONNECTION_POOL_KWARGS": {"max_connections": 50, "retry_on_timeout": True},
        },
        "KEY_PREFIX": "vasdj",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# Logging Configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": config("LOG_FILE", default="/var/log/django/app.log"),
            "maxBytes": 1024 * 1024 * 15,  # 15MB
            "backupCount": 10,
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": config("LOG_LEVEL", default="INFO"),
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": config("LOG_LEVEL", default="INFO"),
            "propagate": False,
        },
        "security.audit": {
            "handlers": ["file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# Sentry Error Tracking
SENTRY_DSN = config("SENTRY_DSN", default=None)
SENTRY_ENVIRONMENT = config("SENTRY_ENVIRONMENT", default="production")
SENTRY_TRACES_SAMPLE_RATE = config("SENTRY_TRACES_SAMPLE_RATE", default=0.1, cast=float)

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        # Set traces_sample_rate to capture performance data
        # 0.1 means 10% of transactions
        traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE,
        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=False,  # Do not send PII for privacy
        # Environment name
        environment=SENTRY_ENVIRONMENT,
        # Release tracking (useful with CI/CD)
        release=config("SENTRY_RELEASE", default=None),
        # Before send hook to filter sensitive data
        before_send=lambda event, hint: _filter_sensitive_data(event, hint),
    )


def _filter_sensitive_data(event, hint):
    """
    Filter sensitive data from Sentry events before sending.

    Removes passwords, tokens, and other sensitive information.
    """
    if "request" in event:
        if "data" in event["request"]:
            # Remove sensitive fields
            sensitive_fields = [
                "password",
                "token",
                "secret",
                "api_key",
                "authorization",
            ]
            for field in sensitive_fields:
                if field in event["request"]["data"]:
                    event["request"]["data"][field] = "[Filtered]"

        # Filter headers
        if "headers" in event["request"]:
            sensitive_headers = ["Authorization", "Cookie", "X-Api-Key"]
            for header in sensitive_headers:
                if header in event["request"]["headers"]:
                    event["request"]["headers"][header] = "[Filtered]"

    return event
