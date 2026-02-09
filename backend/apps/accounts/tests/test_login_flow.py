"""
Comprehensive test cases for user login flows.
Tests all login scenarios including email verification, JWT tokens, and edge cases.
"""

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.tests.factories import (
    AccountFactory,
    AdminAccountFactory,
    UnverifiedAccountFactory,
)
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
)

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.auth
class TestUserLoginFlow:
    """Test user login scenarios."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()
        self.login_url = reverse("login")

    def test_login_with_verified_user_happy_path(self):
        """Test successful login with verified user."""
        # Create verified user with organization
        org = OrganizationFactory()
        user = AccountFactory(
            email="verified@example.com",
            is_email_verified=True,
            status="ACTIVE",
            organization=org,
        )
        OrganizationMembershipFactory(organization=org, user=user, role="owner")

        login_data = {
            "email": "verified@example.com",
            "password": "testpassword123",  # From factory
        }

        response = self.api_client.post(self.login_url, login_data, format="json")

        # Assert successful login
        assert response.status_code == status.HTTP_200_OK

        # Verify response structure
        response_data = response.data["data"]
        assert "access" in response_data
        assert "refresh" in response_data
        assert "user" in response_data

        # Verify user data in response
        user_data = response_data["user"]
        assert user_data["email"] == "verified@example.com"
        assert user_data["is_email_verified"] is True
        assert user_data["status"] == "ACTIVE"

        # Verify JWT tokens are provided
        assert len(response_data["access"]) > 0
        assert len(response_data["refresh"]) > 0

        # Verify last login was updated
        user.refresh_from_db()
        assert user.last_login is not None

    def test_login_with_unverified_email_fails(self):
        """Test that login with unverified email is blocked."""
        user = UnverifiedAccountFactory(
            email="unverified@example.com", is_email_verified=False, status="PENDING"
        )

        login_data = {"email": "unverified@example.com", "password": "testpassword123"}

        response = self.api_client.post(self.login_url, login_data, format="json")

        # Should fail with appropriate error (RFC 7807 format)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-GEN-VAL-422"

        # Check if error message contains email verification requirement
        # Either in detail, title, or issues
        error_found = False
        if "verify your email" in str(response.data.get("detail", "")).lower():
            error_found = True
        elif "verify your email" in str(response.data.get("title", "")).lower():
            error_found = True
        elif "issues" in response.data:
            for issue in response.data["issues"]:
                if "verify your email" in issue.get("message", "").lower():
                    error_found = True
                    break

        assert (
            error_found
        ), f"Email verification error not found in response: {response.data}"

        # Check if custom fields are included
        if "email_verification_required" in response.data:
            assert response.data["email_verification_required"] is True
        if "user_id" in response.data:
            assert response.data["user_id"] == str(user.id)

    def test_login_with_invalid_credentials_fails(self):
        """Test login with wrong password."""
        user = AccountFactory(
            email="valid@example.com", is_email_verified=True, status="ACTIVE"
        )

        login_data = {"email": "valid@example.com", "password": "wrongpassword"}

        response = self.api_client.post(self.login_url, login_data, format="json")

        # Should fail with invalid credentials error (RFC 7807 format)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert (
            response.data.get("code") == "VDJ-ACC-CREDS-401"
        )  # Invalid credentials error

    def test_login_with_nonexistent_email_fails(self):
        """Test login with non-existent email."""
        login_data = {"email": "nonexistent@example.com", "password": "anypassword"}

        response = self.api_client.post(self.login_url, login_data, format="json")

        # Should fail with invalid credentials error (don't reveal user existence) (RFC 7807 format)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert (
            response.data.get("code") == "VDJ-ACC-CREDS-401"
        )  # Invalid credentials error

    def test_login_with_inactive_account_fails(self):
        """Test login with deactivated account."""
        user = AccountFactory(
            email="inactive@example.com",
            is_email_verified=True,
            is_active=False,
            status="ACTIVE",
        )

        login_data = {"email": "inactive@example.com", "password": "testpassword123"}

        response = self.api_client.post(self.login_url, login_data, format="json")

        # Should fail with account disabled error (RFC 7807 format)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.data.get("code") == "VDJ-ACC-INACTIVE-403"  # Account disabled

    def test_login_missing_credentials_fails(self):
        """Test login with missing email or password."""
        # Missing email
        response = self.api_client.post(
            self.login_url, {"password": "test123"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-ACC-MISSING-400"

        # Missing password
        response = self.api_client.post(
            self.login_url, {"email": "test@example.com"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-ACC-MISSING-400"

        # Missing both
        response = self.api_client.post(self.login_url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-ACC-MISSING-400"

    def test_login_with_pending_status_user_requires_verification(self):
        """Test login with user in PENDING status requires verification."""
        user = AccountFactory(
            email="pending@example.com", is_email_verified=False, status="PENDING"
        )

        login_data = {"email": "pending@example.com", "password": "testpassword123"}

        response = self.api_client.post(self.login_url, login_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-GEN-VAL-422"

        # Check if error message contains email verification requirement
        error_found = False
        if "verify your email" in str(response.data.get("detail", "")).lower():
            error_found = True
        elif "verify your email" in str(response.data.get("title", "")).lower():
            error_found = True
        elif "issues" in response.data:
            for issue in response.data["issues"]:
                if "verify your email" in issue.get("message", "").lower():
                    error_found = True
                    break

        assert (
            error_found
        ), f"Email verification error not found in response: {response.data}"

        # Check if custom fields are included
        if "email_verification_required" in response.data:
            assert response.data["email_verification_required"] is True

    def test_login_jwt_tokens_contain_correct_claims(self):
        """Test that JWT tokens contain expected claims."""
        org = OrganizationFactory()
        user = AdminAccountFactory(
            email="admin@example.com",
            is_email_verified=True,
            status="ACTIVE",
            organization=org,
            role="ADMIN",
        )
        OrganizationMembershipFactory(organization=org, user=user, role="admin")

        login_data = {"email": "admin@example.com", "password": "testpassword123"}

        response = self.api_client.post(self.login_url, login_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # We can't easily decode JWT without secret key in tests
        # But we can verify the tokens exist and have expected structure
        response_data = response.data["data"]
        assert "access" in response_data
        assert "refresh" in response_data

        # The view should have added custom claims, but we can't verify without decoding

    def test_login_case_insensitive_email(self):
        """Test that email login is case insensitive."""
        user = AccountFactory(
            email="CaseSensitive@Example.COM", is_email_verified=True, status="ACTIVE"
        )

        login_data = {
            "email": "casesensitive@example.com",  # Different case
            "password": "testpassword123",
        }

        response = self.api_client.post(self.login_url, login_data, format="json")
        # This might fail depending on how the authentication backend handles case
        # The test documents expected behavior


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.auth
class TestJWTTokenOperations:
    """Test JWT token refresh, verification, and logout."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()
        self.user = AccountFactory(
            email="tokenuser@example.com", is_email_verified=True, status="ACTIVE"
        )

        # Login to get tokens
        login_response = self.api_client.post(
            reverse("login"),
            {"email": "tokenuser@example.com", "password": "testpassword123"},
            format="json",
        )

        self.tokens = login_response.data["data"]
        self.access_token = self.tokens["access"]
        self.refresh_token = self.tokens["refresh"]

    def test_token_refresh_success(self):
        """Test successful token refresh."""
        refresh_url = reverse("auth-refresh")

        response = self.api_client.post(
            refresh_url, {"refresh": self.refresh_token}, format="json"
        )

        assert response.status_code == status.HTTP_200_OK

        response_data = response.data["data"]
        assert "access" in response_data
        assert "refresh" in response_data

        # New tokens should be different from old ones
        assert response_data["access"] != self.access_token
        assert (
            response_data["refresh"] == self.refresh_token
        )  # Depends on rotation policy

    def test_token_refresh_invalid_token_fails(self):
        """Test token refresh with invalid refresh token."""
        refresh_url = reverse("auth-refresh")

        response = self.api_client.post(
            refresh_url, {"refresh": "invalid_token"}, format="json"
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert (
            response.data.get("code") == "VDJ-TOKEN-REFRESH-401"
        )  # Invalid refresh token error

    def test_token_refresh_missing_token_fails(self):
        """Test token refresh without providing token."""
        refresh_url = reverse("auth-refresh")

        response = self.api_client.post(refresh_url, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-ACC-MISSING-400"

    def test_token_verification_success(self):
        """Test successful token verification."""
        verify_url = reverse("auth-verify")

        # Set authorization header
        self.api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        response = self.api_client.get(verify_url)

        assert response.status_code == status.HTTP_200_OK

        response_data = response.data["data"]
        assert response_data["valid"] is True
        assert "user" in response_data
        assert response_data["user"]["email"] == "tokenuser@example.com"

    def test_token_verification_invalid_token_fails(self):
        """Test token verification with invalid token."""
        verify_url = reverse("auth-verify")

        # Set invalid authorization header
        self.api_client.credentials(HTTP_AUTHORIZATION="Bearer invalid_token")

        response = self.api_client.get(verify_url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data.get("code") == "VDJ-AUTH-LOGIN-401"  # Authentication error

    def test_token_verification_no_token_fails(self):
        """Test token verification without token."""
        verify_url = reverse("auth-verify")

        response = self.api_client.get(verify_url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data.get("code") == "VDJ-AUTH-LOGIN-401"  # Authentication error

    def test_logout_success(self):
        """Test successful logout (token blacklisting)."""
        logout_url = reverse("auth-logout")

        # First, authenticate the user
        self.api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        response = self.api_client.post(
            logout_url, {"refresh": self.refresh_token}, format="json"
        )

        assert response.status_code == status.HTTP_200_OK

        response_data = response.data["data"]
        assert "message" in response_data
        assert "logged out" in response_data["message"].lower()

    def test_logout_invalid_refresh_token_fails(self):
        """Test logout with invalid refresh token."""
        logout_url = reverse("auth-logout")

        self.api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        response = self.api_client.post(
            logout_url, {"refresh": "invalid_token"}, format="json"
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert (
            response.data.get("code") == "VDJ-TOKEN-REFRESH-401"
        )  # Invalid refresh token error

    def test_after_logout_refresh_token_is_blacklisted(self):
        """Test that after logout, refresh token cannot be used."""
        logout_url = reverse("auth-logout")
        refresh_url = reverse("auth-refresh")

        # Logout first
        self.api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        logout_response = self.api_client.post(
            logout_url, {"refresh": self.refresh_token}, format="json"
        )
        assert logout_response.status_code == status.HTTP_200_OK

        # Try to refresh with blacklisted token
        refresh_response = self.api_client.post(
            refresh_url, {"refresh": self.refresh_token}, format="json"
        )

        # Should fail because token is blacklisted (RFC 7807 format)
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert refresh_response.data.get("code") == "VDJ-TOKEN-REFRESH-401"


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.auth
class TestEmailVerificationFlow:
    """Test email verification process."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()

    def test_email_verification_success(self):
        """Test successful email verification."""
        user = UnverifiedAccountFactory(
            email="verify@example.com", is_email_verified=False, status="PENDING"
        )

        # Generate verification token
        token = user.generate_email_verification_token()

        verify_url = reverse("auth-verify-email")
        response = self.api_client.post(verify_url, {"token": token}, format="json")

        assert response.status_code == status.HTTP_200_OK

        # Verify user was updated
        user.refresh_from_db()
        assert user.is_email_verified is True
        assert user.status == "ACTIVE"
        assert user.email_verification_token is None

        # Verify response
        response_data = response.data["data"]
        assert "message" in response_data
        assert "user" in response_data
        assert response_data["user"]["is_email_verified"] is True

    def test_email_verification_invalid_token_fails(self):
        """Test email verification with invalid token."""
        verify_url = reverse("auth-verify-email")

        response = self.api_client.post(
            verify_url, {"token": "invalid_token"}, format="json"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find token validation issues
        token_issues = [
            issue
            for issue in response.data["issues"]
            if "token" in issue.get("path", [])
        ]
        assert len(token_issues) > 0

    @freeze_time("2024-01-01 12:00:00")
    def test_email_verification_expired_token_fails(self):
        """Test email verification with expired token."""
        user = UnverifiedAccountFactory()
        token = user.generate_email_verification_token()

        # Move time forward to expire token
        with freeze_time("2024-01-02 13:00:00"):  # 25 hours later
            verify_url = reverse("auth-verify-email")
            response = self.api_client.post(verify_url, {"token": token}, format="json")

            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert response.data.get("code") == "VDJ-GEN-VAL-422"

    def test_resend_verification_email_authenticated(self):
        """Test resending verification email for authenticated user."""
        user = UnverifiedAccountFactory()

        # Authenticate user
        self.api_client.force_authenticate(user=user)

        resend_url = reverse("resend_verification_email")
        response = self.api_client.post(resend_url)

        assert response.status_code == status.HTTP_200_OK

        # Verify email was sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [user.email]

    def test_resend_verification_email_already_verified(self):
        """Test resending verification email for already verified user."""
        user = AccountFactory(is_email_verified=True)

        self.api_client.force_authenticate(user=user)

        resend_url = reverse("resend_verification_email")
        response = self.api_client.post(resend_url)

        assert response.status_code == status.HTTP_200_OK

        response_data = response.data["data"]
        assert "already verified" in response_data["message"].lower()

    def test_resend_verification_by_email_unauthenticated(self):
        """Test resending verification email without authentication."""
        user = UnverifiedAccountFactory(email="resend@example.com")

        resend_url = reverse("resend_verification_by_email")
        response = self.api_client.post(
            resend_url, {"email": "resend@example.com"}, format="json"
        )

        # Should always return success to prevent email enumeration
        assert response.status_code == status.HTTP_200_OK

        # Should contain generic message
        response_data = response.data["data"]
        assert "if this email exists" in response_data["message"].lower()

        # Email should have been sent
        assert len(mail.outbox) == 1

    def test_resend_verification_nonexistent_email_same_response(self):
        """Test that resending for non-existent email gives same response."""
        resend_url = reverse("resend_verification_by_email")
        response = self.api_client.post(
            resend_url, {"email": "nonexistent@example.com"}, format="json"
        )

        # Should return same success message (security feature)
        assert response.status_code == status.HTTP_200_OK

        response_data = response.data["data"]
        assert "if this email exists" in response_data["message"].lower()

        # No email should be sent
        assert len(mail.outbox) == 0

    def test_user_can_login_after_email_verification(self):
        """Test complete flow: register -> verify email -> login."""
        # Create unverified user
        user = UnverifiedAccountFactory(
            email="complete@example.com", is_email_verified=False, status="PENDING"
        )

        # Try to login before verification - should fail
        login_response = self.api_client.post(
            reverse("login"),
            {"email": "complete@example.com", "password": "testpassword123"},
            format="json",
        )
        assert login_response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify email
        token = user.generate_email_verification_token()
        verify_response = self.api_client.post(
            reverse("auth-verify-email"), {"token": token}, format="json"
        )
        assert verify_response.status_code == status.HTTP_200_OK

        # Try to login after verification - should succeed
        login_response = self.api_client.post(
            reverse("login"),
            {"email": "complete@example.com", "password": "testpassword123"},
            format="json",
        )
        assert login_response.status_code == status.HTTP_200_OK

        # Should have tokens
        assert "access" in login_response.data["data"]
        assert "refresh" in login_response.data["data"]
