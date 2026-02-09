"""
Shared fixtures and test utilities for core app testing.

This module provides comprehensive fixtures for testing core infrastructure
components like rate limiting, exception handling, and code registry.
"""

from unittest.mock import MagicMock, Mock

import pytest
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from apps.accounts.tests.factories import AccountFactory
from apps.organizations.tests.factories import OrganizationFactory


@pytest.fixture
def api_request_factory():
    """DRF API request factory."""
    return APIRequestFactory()


@pytest.fixture
def mock_request():
    """Mock HTTP request for testing."""
    request = HttpRequest()
    request.method = "GET"
    request.path = "/api/test/"
    request.META = {"REMOTE_ADDR": "192.168.1.100", "HTTP_USER_AGENT": "TestAgent/1.0"}
    request.user = AnonymousUser()
    return request


@pytest.fixture
def authenticated_request(mock_request):
    """Mock authenticated HTTP request."""
    user = AccountFactory()
    mock_request.user = user
    return mock_request


@pytest.fixture
def organization_request(authenticated_request):
    """Mock request with organization context."""
    org = OrganizationFactory()
    authenticated_request.organization = org
    authenticated_request.user.organization = org
    return authenticated_request


@pytest.fixture
def drf_request(api_request_factory):
    """DRF request instance."""
    request = api_request_factory.get("/api/test/")
    return Request(request)


@pytest.fixture
def authenticated_drf_request(api_request_factory):
    """Authenticated DRF request."""
    user = AccountFactory()
    request = api_request_factory.get("/api/test/")
    request.user = user
    return Request(request)


@pytest.fixture
def mock_redis_client():
    """Mock Redis client for rate limiting tests."""
    client = MagicMock()
    client.ping.return_value = True
    client.pipeline.return_value = client  # Pipeline returns itself
    client.execute.return_value = [1, 0]  # [cleanup_result, current_count]
    client.zadd.return_value = 1
    client.expire.return_value = True
    client.zcard.return_value = 0
    client.zremrangebyscore.return_value = 0
    return client


@pytest.fixture
def mock_failed_redis():
    """Mock Redis client that fails connections."""
    client = MagicMock()
    client.ping.side_effect = ConnectionError("Redis connection failed")
    return client


@pytest.fixture
def sample_validation_error():
    """Sample DRF ValidationError for testing exception handling."""
    return ValidationError(
        {
            "email": ["This field is required."],
            "password": ["Password too short.", "Password too common."],
            "nested_field": {"sub_field": ["Invalid value."]},
        }
    )


@pytest.fixture
def sample_nested_validation_error():
    """Complex nested ValidationError for testing flattening."""
    return ValidationError(
        {
            "user": {
                "email": ["Invalid email format."],
                "profile": {
                    "age": ["Must be at least 18."],
                    "preferences": ["Invalid preference.", "Duplicate preference."],
                },
            },
            "organization": ["Organization is required."],
        }
    )


@pytest.fixture
def mock_view_context():
    """Mock view context for exception handler testing."""
    return {
        "view": Mock(),
        "request": Mock(path="/api/test/", method="POST"),
        "args": (),
        "kwargs": {},
    }


@pytest.fixture
def sample_paginated_data():
    """Sample data for pagination testing."""
    return [
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"},
        {"id": 3, "name": "Item 3"},
        {"id": 4, "name": "Item 4"},
        {"id": 5, "name": "Item 5"},
    ]


@pytest.fixture
def mock_paginator():
    """Mock Django paginator for pagination tests."""
    paginator = Mock()
    paginator.count = 100
    return paginator


@pytest.fixture
def mock_page():
    """Mock page object for pagination tests."""
    page = Mock()
    page.number = 2
    page.has_next.return_value = True
    page.has_previous.return_value = True
    page.next_page_number.return_value = 3
    page.previous_page_number.return_value = 1
    return page


class MockAppModule:
    """Mock app module for code registry testing."""

    def __init__(self, path):
        self.__file__ = str(path / "__init__.py")


@pytest.fixture
def mock_codes_module():
    """Mock codes module with various code types."""
    from apps.core.codes import BaseAPICodeMixin

    module = Mock()

    # Create mock enum members first
    member1 = Mock()
    member1.value = "VDJ-TEST-SUCCESS-200"
    member1.name = "SUCCESS_200"

    member2 = Mock()
    member2.value = "VDJ-TEST-ERROR-400"
    member2.name = "ERROR_400"

    # Create a metaclass that makes the class iterable
    class EnumMeta(type):
        def __iter__(cls):
            return iter([cls.SUCCESS_200, cls.ERROR_400])

    # Create a real class that properly inherits from BaseAPICodeMixin
    class TestCodes(BaseAPICodeMixin, metaclass=EnumMeta):
        __name__ = "TestCodes"
        SUCCESS_200 = member1
        ERROR_400 = member2

        @classmethod
        def __members__(cls):
            return {"SUCCESS_200": cls.SUCCESS_200, "ERROR_400": cls.ERROR_400}

    # Set up the class-level __members__ attribute for the hasattr check
    TestCodes.__members__ = {"SUCCESS_200": member1, "ERROR_400": member2}

    # Add to module
    module.TestCodes = TestCodes
    module.SIMPLE_CODE = "VDJ-TEST-SIMPLE-200"
    module.__name__ = "test_app.codes"

    return module


@pytest.fixture
def sample_error_catalog():
    """Sample error catalog YAML content."""
    return [
        {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
            "i18n_key": "errors.test_error",
            "description": "Test error for unit testing",
            "codes": ["VDJ-TEST-ERROR-400"],
        },
        {
            "slug": "test-success",
            "type": "https://docs.yourapp.com/problems/test-success",
            "title": "Test Success",
            "default_status": 200,
            "i18n_key": "success.test_success",
            "description": "Test success for unit testing",
            "codes": ["VDJ-TEST-SUCCESS-200"],
        },
    ]


@pytest.fixture
def invalid_error_catalog():
    """Invalid error catalog for testing error handling."""
    return [
        {
            # Missing required fields
            "slug": "incomplete-error",
            "title": "Incomplete Error",
            # Missing: type, default_status
        },
        {
            "slug": "invalid-type",
            "type": "invalid-url",  # Not HTTPS
            "title": "Invalid Type",
            "default_status": 400,
        },
    ]


@pytest.fixture
def rate_limit_settings():
    """Rate limiting settings for testing."""
    return {
        "ENABLED": True,
        "REDIS_URL": "redis://localhost:6379/1",
        "DEFAULT_LIMITS": {"PER_IP": "100/hour", "PER_USER": "200/hour"},
        "ENDPOINT_LIMITS": {
            "test_endpoint": {"PER_IP": "10/hour", "PER_EMAIL": "3/hour"}
        },
        "EXCLUDED_PATHS": ["/admin/", "/health/"],
    }


@pytest.fixture
def mock_render_context():
    """Mock renderer context for testing."""
    return {
        "view": Mock(),
        "request": Mock(path="/api/test/"),
        "response": Mock(status_code=200),
        "args": (),
        "kwargs": {},
    }


# Test utilities
def create_test_exception(exc_type, message="Test exception"):
    """Create test exceptions for handler testing."""
    return exc_type(message)


def create_test_response_data(data_type="simple"):
    """Create various types of response data for renderer testing."""
    if data_type == "simple":
        return {"message": "Hello World"}
    elif data_type == "list":
        return [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]
    elif data_type == "paginated":
        return {
            "pagination": {"count": 100, "totalPages": 5, "currentPage": 1},
            "data": [{"id": 1, "name": "Item 1"}],
        }
    elif data_type == "error":
        return {"detail": "Error message", "status_code": 400}
    else:
        return None


# Test utilities for core app components


@pytest.fixture
def organization_factory():
    """Factory for creating Organization instances."""
    return OrganizationFactory


@pytest.fixture
def user_with_org():
    """Create a user associated with an organization."""
    org = OrganizationFactory()
    user = AccountFactory(organization=org)
    return user
