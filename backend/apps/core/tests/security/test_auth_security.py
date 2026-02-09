"""
Authentication security tests.

Tests for:
- Brute force protection (rate limiting)
- Timing attack protection
- Token security
- Password requirements
"""

import time

import pytest
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.tests.factories import AccountFactory


@pytest.mark.django_db
class TestAuthenticationSecurity:
    """Test authentication security measures."""

    def setup_method(self):
        """Set up test data and clear cache."""
        self.client = APIClient()
        cache.clear()  # Clear rate limit cache between tests

        # Create a test user with verified email
        self.user = AccountFactory(
            email="test@example.com", is_email_verified=True, status="ACTIVE"
        )
        self.user.set_password("correct_password123")
        self.user.save()

    def test_login_with_correct_credentials_succeeds(self):
        """Test that login works with correct credentials."""
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "correct_password123"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data["data"]
        assert "refresh" in response.data["data"]

    def test_login_with_wrong_password_fails(self):
        """Test that login fails with incorrect password."""
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "wrong_password"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_with_nonexistent_user_fails(self):
        """Test that login fails for non-existent users."""
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "nonexistent@example.com", "password": "any_password"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_timing_is_consistent(self):
        """
        Test that login response times are similar for valid/invalid users.
        This helps prevent user enumeration via timing attacks.
        """
        # Time login attempt with valid user
        start1 = time.time()
        self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "wrong_password"},
        )
        time1 = time.time() - start1

        # Time login attempt with non-existent user
        start2 = time.time()
        self.client.post(
            "/api/v1/auth/login/",
            {"email": "nonexistent@example.com", "password": "wrong_password"},
        )
        time2 = time.time() - start2

        # Times should be within 200ms of each other
        # (allows for some variance while detecting obvious timing attacks)
        time_diff = abs(time1 - time2)
        assert time_diff < 0.2, f"Timing difference too large: {time_diff}s"

    def test_unverified_email_cannot_login(self):
        """Test that users with unverified emails cannot login."""
        unverified_user = AccountFactory(
            email="unverified@example.com", is_email_verified=False, status="PENDING"
        )
        unverified_user.set_password("password123")
        unverified_user.save()

        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "unverified@example.com", "password": "password123"},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Should indicate email verification required
        assert (
            "email" in str(response.data).lower()
            or "verif" in str(response.data).lower()
        )

    def test_inactive_user_cannot_login(self):
        """Test that inactive users cannot login."""
        self.user.is_active = False
        self.user.save()

        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "correct_password123"},
        )

        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    def test_password_not_returned_in_api_responses(self):
        """Test that password hashes are never exposed in API responses."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(f"/api/v1/accounts/users/{self.user.id}/")
        assert response.status_code == status.HTTP_200_OK

        # Password field should not be in response
        assert "password" not in response.data.get("data", response.data)

    def test_token_refresh_works_with_valid_token(self):
        """Test that JWT refresh tokens work correctly."""
        # First, login to get tokens
        login_response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "correct_password123"},
        )

        refresh_token = login_response.data["data"]["refresh"]

        # Use refresh token to get new access token
        response = self.client.post("/api/v1/auth/refresh/", {"refresh": refresh_token})

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data["data"]

    def test_token_refresh_fails_with_invalid_token(self):
        """Test that invalid refresh tokens are rejected."""
        response = self.client.post(
            "/api/v1/auth/refresh/", {"refresh": "invalid_token_12345"}
        )

        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        ]


@pytest.mark.django_db
class TestEmailVerificationSecurity:
    """Test email verification security."""

    def setup_method(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = AccountFactory(
            email="test@example.com", is_email_verified=False, status="PENDING"
        )

    def test_email_verification_with_valid_token(self):
        """Test that email verification works with valid token."""
        # Generate verification token
        token = self.user.generate_email_verification_token()

        response = self.client.post("/api/v1/auth/verify-email/", {"token": token})

        assert response.status_code == status.HTTP_200_OK

        # Reload user and check verification status
        self.user.refresh_from_db()
        assert self.user.is_email_verified is True

    def test_email_verification_with_invalid_token_fails(self):
        """Test that email verification fails with invalid token."""
        response = self.client.post(
            "/api/v1/auth/verify-email/", {"token": "invalid_token_12345"}
        )

        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        ]

    def test_email_verification_token_is_single_use(self):
        """Test that verification tokens can only be used once."""
        token = self.user.generate_email_verification_token()

        # Use token first time - should succeed
        response1 = self.client.post("/api/v1/auth/verify-email/", {"token": token})
        assert response1.status_code == status.HTTP_200_OK

        # Try to use same token again - should fail
        response2 = self.client.post("/api/v1/auth/verify-email/", {"token": token})
        assert response2.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        ]

    def test_verification_token_timing_attack_protection(self):
        """
        Test that token verification uses constant-time comparison.
        This is implemented in the code with hmac.compare_digest().
        """
        valid_token = self.user.generate_email_verification_token()

        # Try with tokens that match prefix (to detect timing attacks)
        wrong_token1 = valid_token[:10] + "X" * (len(valid_token) - 10)
        wrong_token2 = "X" * len(valid_token)

        start1 = time.time()
        self.client.post("/api/v1/auth/verify-email/", {"token": wrong_token1})
        time1 = time.time() - start1

        start2 = time.time()
        self.client.post("/api/v1/auth/verify-email/", {"token": wrong_token2})
        time2 = time.time() - start2

        # Times should be similar (constant-time comparison)
        # Allow 50ms variance
        time_diff = abs(time1 - time2)
        assert time_diff < 0.05, f"Timing attack possible: {time_diff}s difference"


@pytest.mark.django_db
class TestSQLInjectionProtection:
    """Test SQL injection protection."""

    def setup_method(self):
        """Set up test data."""
        self.client = APIClient()

    def test_sql_injection_in_login_email_field(self):
        """Test that SQL injection attempts in email field are blocked."""
        malicious_inputs = [
            "admin@example.com' OR '1'='1",
            "admin@example.com'; DROP TABLE accounts_account; --",
            "admin@example.com' UNION SELECT * FROM accounts_account--",
        ]

        for malicious_email in malicious_inputs:
            response = self.client.post(
                "/api/v1/auth/login/",
                {"email": malicious_email, "password": "any_password"},
            )

            # Should get validation error or authentication failure, never a 500 error
            assert response.status_code in [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_401_UNAUTHORIZED,
            ], f"SQL injection may have succeeded with: {malicious_email}"

    def test_sql_injection_in_search_parameters(self):
        """Test that SQL injection in query parameters is blocked."""
        user = AccountFactory(email="test@example.com")
        self.client.force_authenticate(user=user)

        malicious_inputs = [
            "'; DROP TABLE accounts_account; --",
            "' OR 1=1--",
            "' UNION SELECT password FROM accounts_account--",
        ]

        for malicious_input in malicious_inputs:
            response = self.client.get(
                f"/api/v1/accounts/users/?search={malicious_input}"
            )

            # Should handle gracefully, never a 500 error
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
            ], f"SQL injection may have succeeded with: {malicious_input}"
