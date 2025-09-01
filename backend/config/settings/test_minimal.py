"""
Minimal test settings for running tests without external dependencies.
"""

from .base import *

# Use SQLite in memory for minimal testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable Redis-dependent features
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Minimal installed apps for testing
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'rest_framework',
    'apps.core',
    'apps.accounts',
    'apps.organizations',
]

# Disable rate limiting for minimal tests
RATE_LIMITING = {
    'ENABLED': False,
}

# Use dummy email backend
EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

SECRET_KEY = 'test-secret-key-for-minimal-testing'
DEBUG = False