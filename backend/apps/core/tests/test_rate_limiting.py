"""
Comprehensive tests for the rate limiting system.

Tests the Redis-backed rate limiting infrastructure, including decorators,
middleware, fallback mechanisms, and various rate limiting strategies.
"""

import json
from unittest.mock import Mock, patch

import pytest
from django.http import JsonResponse
from django.test import override_settings
from rest_framework.response import Response

from apps.core.exceptions.client_errors import RateLimitException
from apps.core.middleware.rate_limiting import RateLimitMiddleware
from apps.core.utils.rate_limiting import (
    EmailRateLimit,
    IPRateLimit,
    RateLimiter,
    RateLimitExceeded,
    UserRateLimit,
    rate_limit,
)


@pytest.mark.django_db
@pytest.mark.rate_limiting
class TestRateLimiter:
    """Test the core RateLimiter class functionality."""

    def test_rate_limiter_initialization_with_redis(self, mock_redis_client):
        """Test RateLimiter initialization with working Redis."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.return_value = mock_redis_client
                limiter = RateLimiter()

                assert limiter.redis_client == mock_redis_client
                assert limiter.enabled is True
                mock_redis_client.ping.assert_called_once()

    def test_rate_limiter_initialization_redis_failure(self, mock_failed_redis):
        """Test RateLimiter initialization when Redis fails."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.return_value = mock_failed_redis
                limiter = RateLimiter()

                assert limiter.redis_client is None
                assert limiter.enabled is True

    def test_parse_rate_limit_valid_formats(self):
        """Test parsing various valid rate limit formats."""
        limiter = RateLimiter()

        test_cases = [
            ("10/second", (10, 1)),
            ("60/minute", (60, 60)),
            ("100/hour", (100, 3600)),
            ("1000/day", (1000, 86400)),
        ]

        for limit_str, expected in test_cases:
            assert limiter._parse_rate_limit(limit_str) == expected

    def test_parse_rate_limit_invalid_formats(self):
        """Test parsing invalid rate limit formats."""
        limiter = RateLimiter()

        # Formats that return (0, 0)
        truly_invalid = ["invalid", "10", "/hour", ""]
        for invalid_limit in truly_invalid:
            count, period = limiter._parse_rate_limit(invalid_limit)
            assert count == 0
            assert period == 0

        # Format with invalid period uses default period
        count, period = limiter._parse_rate_limit("10/invalid")
        assert count == 10
        assert period == 3600  # Default to hour

    def test_get_rate_limit_key_generation(self):
        """Test rate limiting key generation."""
        limiter = RateLimiter()

        # Test normal key
        key = limiter._get_rate_limit_key("ip", "192.168.1.1", "test_endpoint")
        assert key == "rate_limit:ip:192.168.1.1:test_endpoint"

        # Test without endpoint
        key = limiter._get_rate_limit_key("user", "123")
        assert key == "rate_limit:user:123"

        # Test long identifier (should be hashed)
        long_id = "x" * 100
        key = limiter._get_rate_limit_key("email", long_id)
        assert "rate_limit:email:" in key
        assert len(key) < 100  # Should be shorter due to hashing

    def test_check_rate_limit_redis_success(self, mock_redis_client):
        """Test successful rate limit check with Redis."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.return_value = mock_redis_client
                limiter = RateLimiter()

                # Configure mock for allowed request
                mock_redis_client.execute.return_value = [1, 5]  # 5 current requests

                allowed, reset_time = limiter.check_rate_limit(
                    "ip", "192.168.1.1", "10/hour"
                )

                assert allowed is True
                assert reset_time == 0
                mock_redis_client.pipeline.assert_called_once()

    def test_check_rate_limit_redis_exceeded(self, mock_redis_client):
        """Test rate limit exceeded with Redis."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.return_value = mock_redis_client
                limiter = RateLimiter()

                # Configure mock for exceeded limit
                mock_redis_client.execute.return_value = [1, 10]  # 10 requests = limit

                with patch("time.time", return_value=1609459200):  # Fixed timestamp
                    allowed, reset_time = limiter.check_rate_limit(
                        "ip", "192.168.1.1", "10/hour"
                    )

                assert allowed is False
                assert reset_time == 1609459200 + 3600  # Current time + 1 hour

    def test_check_rate_limit_cache_fallback(self):
        """Test fallback to Django cache when Redis fails."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.side_effect = Exception("Redis unavailable")

                with patch("apps.core.utils.rate_limiting.cache") as mock_cache:
                    mock_cache.get.return_value = 5  # 5 current requests
                    limiter = RateLimiter()

                    allowed, reset_time = limiter.check_rate_limit(
                        "ip", "192.168.1.1", "10/hour"
                    )

                    assert allowed is True
                    assert reset_time == 0
                    mock_cache.set.assert_called_once()

    def test_check_rate_limit_cache_exceeded(self):
        """Test cache fallback with exceeded limit."""
        with patch("apps.core.utils.rate_limiting.redis.from_url") as mock_redis:
            with patch("django.conf.settings.RATE_LIMITING", {"ENABLED": True}):
                mock_redis.side_effect = Exception("Redis unavailable")

                with patch("apps.core.utils.rate_limiting.cache") as mock_cache:
                    mock_cache.get.return_value = 10  # At limit

                    with patch("time.time", return_value=1609459200):
                        limiter = RateLimiter()
                        allowed, reset_time = limiter.check_rate_limit(
                            "ip", "192.168.1.1", "10/hour"
                        )

                    assert allowed is False
                    assert reset_time == 1609459200 + 3600

    def test_get_client_ip_direct(self):
        """Test getting client IP from REMOTE_ADDR."""
        limiter = RateLimiter()
        request = Mock()
        request.META = {"REMOTE_ADDR": "192.168.1.100"}

        ip = limiter.get_client_ip(request)
        assert ip == "192.168.1.100"

    def test_get_client_ip_forwarded(self):
        """Test getting client IP from X-Forwarded-For header."""
        limiter = RateLimiter()
        request = Mock()
        request.META = {
            "HTTP_X_FORWARDED_FOR": "10.0.0.1, 192.168.1.1, 172.16.0.1",
            "REMOTE_ADDR": "127.0.0.1",
        }

        ip = limiter.get_client_ip(request)
        assert ip == "10.0.0.1"  # First IP in chain

    def test_get_user_identifier_authenticated(self, authenticated_request):
        """Test getting user identifier for authenticated users."""
        limiter = RateLimiter()
        user_id = limiter.get_user_identifier(authenticated_request)

        assert user_id == str(authenticated_request.user.id)

    def test_get_user_identifier_anonymous(self, mock_request):
        """Test getting user identifier for anonymous users."""
        limiter = RateLimiter()
        user_id = limiter.get_user_identifier(mock_request)

        assert user_id is None

    @override_settings(RATE_LIMITING={"ENABLED": False})
    def test_rate_limiter_disabled(self):
        """Test rate limiter when disabled in settings."""
        limiter = RateLimiter()

        allowed, reset_time = limiter.check_rate_limit("ip", "192.168.1.1", "1/hour")

        assert allowed is True
        assert reset_time == 0


@pytest.mark.django_db
@pytest.mark.rate_limiting
class TestRateLimitDecorator:
    """Test the rate_limit decorator functionality."""

    def test_rate_limit_decorator_ip_success(self, mock_request, mock_redis_client):
        """Test rate limit decorator with IP limiting - success case."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = True
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.get_user_identifier.return_value = None
            mock_limiter.check_rate_limit.return_value = (True, 0)

            @rate_limit(per_ip="10/hour")
            def test_view(request):
                return Response({"message": "success"})

            response = test_view(mock_request)

            assert response.data["message"] == "success"
            mock_limiter.check_rate_limit.assert_called_once_with(
                "ip", "192.168.1.1", "10/hour", "test_view"
            )

    def test_rate_limit_decorator_ip_exceeded(self, mock_request):
        """Test rate limit decorator with IP limiting - exceeded case."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = True
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.get_user_identifier.return_value = None
            mock_limiter.check_rate_limit.return_value = (False, 1609459200)

            @rate_limit(per_ip="10/hour")
            def test_view(request):
                return Response({"message": "success"})

            with pytest.raises(RateLimitException) as exc_info:
                test_view(mock_request)

            exception = exc_info.value
            assert "Rate limit exceeded" in str(exception.detail)
            assert exception.reset_time == 1609459200

    def test_rate_limit_decorator_user_success(self, authenticated_request):
        """Test rate limit decorator with user limiting - success case."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = True
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.get_user_identifier.return_value = str(
                authenticated_request.user.id
            )
            mock_limiter.check_rate_limit.return_value = (True, 0)

            @rate_limit(per_user="50/hour")
            def test_view(request):
                return Response({"message": "success"})

            response = test_view(authenticated_request)

            assert response.data["message"] == "success"
            mock_limiter.check_rate_limit.assert_called_once_with(
                "user", str(authenticated_request.user.id), "50/hour", "test_view"
            )

    def test_rate_limit_decorator_email_success(self, mock_request):
        """Test rate limit decorator with email limiting - success case."""
        mock_request.data = {"email": "test@example.com"}

        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = True
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.get_user_identifier.return_value = None
            mock_limiter.check_rate_limit.return_value = (True, 0)

            @rate_limit(per_email="5/hour")
            def test_view(request):
                return Response({"message": "success"})

            response = test_view(mock_request)

            assert response.data["message"] == "success"
            mock_limiter.check_rate_limit.assert_called_once_with(
                "email", "test@example.com", "5/hour", "test_view"
            )

    def test_rate_limit_decorator_disabled(self, mock_request):
        """Test rate limit decorator when rate limiting is disabled."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = False

            @rate_limit(per_ip="10/hour")
            def test_view(request):
                return Response({"message": "success"})

            response = test_view(mock_request)

            assert response.data["message"] == "success"
            mock_limiter.check_rate_limit.assert_not_called()

    def test_rate_limit_decorator_multiple_limits(self, authenticated_request):
        """Test rate limit decorator with multiple limit types."""
        authenticated_request.data = {"email": "test@example.com"}

        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.enabled = True
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.get_user_identifier.return_value = str(
                authenticated_request.user.id
            )
            mock_limiter.check_rate_limit.return_value = (True, 0)

            @rate_limit(per_ip="100/hour", per_user="50/hour", per_email="5/hour")
            def test_view(request):
                return Response({"message": "success"})

            response = test_view(authenticated_request)

            assert response.data["message"] == "success"
            # Should check all three rate limits
            assert mock_limiter.check_rate_limit.call_count == 3


@pytest.mark.django_db
@pytest.mark.rate_limiting
class TestRateLimitUtilities:
    """Test utility classes for rate limiting."""

    def test_ip_rate_limit_utility(self, mock_request):
        """Test IPRateLimit utility class."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.get_client_ip.return_value = "192.168.1.1"
            mock_limiter.check_rate_limit.return_value = (True, 0)

            ip_limiter = IPRateLimit("10/hour")
            allowed, reset_time = ip_limiter.check(mock_request, "test_endpoint")

            assert allowed is True
            assert reset_time == 0
            mock_limiter.check_rate_limit.assert_called_once_with(
                "ip", "192.168.1.1", "10/hour", "test_endpoint"
            )

    def test_user_rate_limit_utility_authenticated(self, authenticated_request):
        """Test UserRateLimit utility with authenticated user."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.get_user_identifier.return_value = str(
                authenticated_request.user.id
            )
            mock_limiter.check_rate_limit.return_value = (True, 0)

            user_limiter = UserRateLimit("50/hour")
            allowed, reset_time = user_limiter.check(
                authenticated_request, "test_endpoint"
            )

            assert allowed is True
            assert reset_time == 0

    def test_user_rate_limit_utility_anonymous(self, mock_request):
        """Test UserRateLimit utility with anonymous user."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.get_user_identifier.return_value = None

            user_limiter = UserRateLimit("50/hour")
            allowed, reset_time = user_limiter.check(mock_request, "test_endpoint")

            # Should allow anonymous users (no limit)
            assert allowed is True
            assert reset_time == 0
            mock_limiter.check_rate_limit.assert_not_called()

    def test_email_rate_limit_utility(self):
        """Test EmailRateLimit utility class."""
        with patch("apps.core.utils.rate_limiting.rate_limiter") as mock_limiter:
            mock_limiter.check_rate_limit.return_value = (True, 0)

            email_limiter = EmailRateLimit("5/hour")
            allowed, reset_time = email_limiter.check(
                "test@example.com", "test_endpoint"
            )

            assert allowed is True
            assert reset_time == 0
            mock_limiter.check_rate_limit.assert_called_once_with(
                "email", "test@example.com", "5/hour", "test_endpoint"
            )


@pytest.mark.django_db
@pytest.mark.rate_limiting
class TestRateLimitMiddleware:
    """Test the RateLimitMiddleware functionality."""

    def test_middleware_initialization(self, rate_limit_settings):
        """Test middleware initialization with settings."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            middleware = RateLimitMiddleware(Mock())

            assert middleware.enabled is True
            assert middleware.global_limits == rate_limit_settings["DEFAULT_LIMITS"]
            assert middleware.endpoint_limits == rate_limit_settings["ENDPOINT_LIMITS"]

    def test_middleware_skip_excluded_paths(self, rate_limit_settings):
        """Test middleware skips excluded paths."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            request = Mock()
            request.path = "/admin/users/"

            middleware = RateLimitMiddleware(Mock())
            result = middleware.process_request(request)

            assert result is None  # Should skip processing

    def test_middleware_skip_static_files(self, rate_limit_settings):
        """Test middleware skips static files."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            request = Mock()
            request.path = "/static/css/style.css"

            middleware = RateLimitMiddleware(Mock())
            result = middleware.process_request(request)

            assert result is None  # Should skip processing

    def test_middleware_global_ip_limit_success(
        self, mock_request, rate_limit_settings
    ):
        """Test middleware global IP rate limiting - success case."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            with patch(
                "apps.core.middleware.rate_limiting.rate_limiter"
            ) as mock_limiter:
                mock_limiter.get_client_ip.return_value = "192.168.1.1"
                mock_limiter.get_user_identifier.return_value = None
                mock_limiter.check_rate_limit.return_value = (True, 0)

                middleware = RateLimitMiddleware(Mock())
                result = middleware.process_request(mock_request)

                assert result is None  # Allowed to proceed
                mock_limiter.check_rate_limit.assert_called()

    def test_middleware_global_ip_limit_exceeded(
        self, mock_request, rate_limit_settings
    ):
        """Test middleware global IP rate limiting - exceeded case."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            with patch(
                "apps.core.middleware.rate_limiting.rate_limiter"
            ) as mock_limiter:
                mock_limiter.get_client_ip.return_value = "192.168.1.1"
                mock_limiter.get_user_identifier.return_value = None
                mock_limiter.check_rate_limit.return_value = (False, 1609459200)

                middleware = RateLimitMiddleware(Mock())
                response = middleware.process_request(mock_request)

                assert isinstance(response, JsonResponse)
                assert response.status_code == 429
                data = json.loads(response.content)
                assert data["title"] == "Rate limit exceeded"
                assert "Retry-After" in response

    def test_middleware_endpoint_specific_limits(
        self, mock_request, rate_limit_settings
    ):
        """Test middleware endpoint-specific rate limiting."""
        mock_request.path = "/api/test/"

        with override_settings(RATE_LIMITING=rate_limit_settings):
            with patch(
                "apps.core.middleware.rate_limiting.rate_limiter"
            ) as mock_limiter:
                mock_limiter.get_client_ip.return_value = "192.168.1.1"
                mock_limiter.get_user_identifier.return_value = None
                mock_limiter.check_rate_limit.return_value = (True, 0)

                with patch("django.urls.resolve") as mock_resolve:
                    mock_resolve.return_value.url_name = "test_endpoint"

                    middleware = RateLimitMiddleware(Mock())
                    result = middleware.process_request(mock_request)

                    assert result is None
                    # Should check both global and endpoint-specific limits
                    assert mock_limiter.check_rate_limit.call_count >= 1

    def test_middleware_disabled(self, mock_request):
        """Test middleware when rate limiting is disabled."""
        with override_settings(RATE_LIMITING={"ENABLED": False}):
            middleware = RateLimitMiddleware(Mock())
            result = middleware.process_request(mock_request)

            assert result is None  # Should skip all processing

    def test_middleware_error_handling(self, mock_request, rate_limit_settings):
        """Test middleware handles errors gracefully."""
        with override_settings(RATE_LIMITING=rate_limit_settings):
            with patch(
                "apps.core.middleware.rate_limiting.rate_limiter"
            ) as mock_limiter:
                mock_limiter.check_rate_limit.side_effect = Exception(
                    "Unexpected error"
                )

                middleware = RateLimitMiddleware(Mock())
                result = middleware.process_request(mock_request)

                # Should not fail the request due to rate limiting errors
                assert result is None


@pytest.mark.rate_limiting
class TestRateLimitExceptions:
    """Test rate limiting exception classes."""

    def test_rate_limit_exceeded_exception(self):
        """Test RateLimitExceeded exception."""
        exc = RateLimitExceeded("10/hour", 1609459200)

        assert exc.limit == "10/hour"
        assert exc.reset_time == 1609459200
        assert str(exc) == "Rate limit exceeded: 10/hour"

    def test_rate_limit_exception_creation(self):
        """Test RateLimitException creation."""
        exc = RateLimitException(
            detail="Rate limit exceeded: 10/hour",
            reset_time=1609459200,
            limit="10/hour",
        )

        assert exc.status_code == 429
        assert exc.reset_time == 1609459200
        assert exc.limit == "10/hour"
