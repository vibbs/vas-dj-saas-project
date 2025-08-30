"""
Test utilities for organizations app.
"""

from unittest.mock import patch
from django.test import override_settings


class TenantTestMixin:
    """Mixin to handle tenant middleware in tests."""
    
    def setup_tenant_context(self, organization):
        """Setup tenant context for API tests."""
        # Mock the tenant middleware to set organization context
        patcher = patch('apps.organizations.middleware.tenant.get_current_organization')
        mock_get_org = patcher.start()
        mock_get_org.return_value = organization
        self.addCleanup(patcher.stop)
        
        return mock_get_org


def with_tenant_context(organization=None):
    """Decorator to setup tenant context for test methods."""
    def decorator(test_func):
        def wrapper(self, *args, **kwargs):
            if organization:
                self.setup_tenant_context(organization)
            return test_func(self, *args, **kwargs)
        return wrapper
    return decorator


# Disable tenant middleware for tests
TENANT_MIDDLEWARE_DISABLED = override_settings(
    MIDDLEWARE=[
        middleware for middleware in [
            'django.middleware.security.SecurityMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
            'django.middleware.clickjacking.XFrameOptionsMiddleware',
            # Skip tenant middleware
        ]
    ]
)