"""
Django settings for testing environment.

This module contains settings specific to running tests.
It inherits from base settings and overrides necessary configurations.
"""

from .base import *
import tempfile
from datetime import timedelta

# SECURITY WARNING: Use a different secret key for testing
SECRET_KEY = 'test-secret-key-for-testing-only-do-not-use-in-production'

# Debug should be False in tests to catch template errors
DEBUG = False

# Disable tenant middleware in tests - ViewSets handle organization filtering directly
# This prevents 404 errors when tests don't provide organization context in headers
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Custom middleware (TenantMiddleware disabled in tests)
    "apps.core.middleware.RequestTimingMiddleware",
    "apps.core.middleware.TransactionIDMiddleware",
    # Rate limiting disabled (see RATELIMIT_ENABLE below)
]

# Test database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='test_saas_db'),
        'USER': config('DB_USER', default='test_saas_user'),
        'PASSWORD': config('DB_PASSWORD', default='test_saas_password'),
        'HOST': config('DB_HOST', default='test_db'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
        'TEST': {
            'NAME': 'test_saas_db_test',
        }
    }
}

# Use in-memory cache for faster tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Email backend for testing
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Media files configuration for tests
MEDIA_ROOT = tempfile.mkdtemp()

# Static files (not needed in tests)
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Celery settings for testing - use eager execution
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Disable rate limiting for tests
RATELIMIT_ENABLE = False
RATE_LIMITING = {
    'ENABLED': False,
    'REDIS_URL': 'redis://redis:6379/1'
}

# Disable all django-ratelimit decorators
from unittest.mock import MagicMock
import apps.core.utils.rate_limiting
# Mock the rate limiter to always allow requests
apps.core.utils.rate_limiting.rate_limiter.enabled = False

# Disable logging during tests (can be overridden)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}

# Password validation (disabled for faster tests)
AUTH_PASSWORD_VALIDATORS = []

# Time zone for tests
USE_TZ = True
TIME_ZONE = 'UTC'

# Disable migrations in tests for speed (handled by pytest-django)
# This can be overridden by removing --nomigrations from pytest.ini if needed

# Django REST Framework settings for testing
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
    'TEST_REQUEST_RENDERER_CLASSES': [
        'rest_framework.renderers.MultiPartRenderer',
        'rest_framework.renderers.JSONRenderer'
    ]
}

# Disable throttling during tests
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

# Simplified JWT settings for testing
try:
    # Try to get SIMPLE_JWT from base settings
    from .base import SIMPLE_JWT as BASE_SIMPLE_JWT
    SIMPLE_JWT = BASE_SIMPLE_JWT.copy()
except (ImportError, AttributeError):
    # If not available, create basic config
    SIMPLE_JWT = {}

SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ALGORITHM': 'HS256',
})

# File upload settings for tests
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 50  # 50MB

# Test-specific allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']