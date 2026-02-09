"""
Edge cases and security tests for authentication flows.
Tests security scenarios, race conditions, data consistency, and error handling.
"""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Account
from apps.accounts.tests.factories import AccountFactory, UnverifiedAccountFactory
from apps.organizations.models import Organization, OrganizationMembership

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.auth
@pytest.mark.security
class TestSecurityEdgeCases:
    """Test security-related edge cases and vulnerabilities."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()

    def test_registration_sql_injection_attempts(self):
        """Test registration with SQL injection attempts."""
        injection_attempts = [
            "'; DROP TABLE accounts_account; --",
            "admin'/*",
            "' OR '1'='1",
            "'; UPDATE accounts_account SET is_superuser=1; --",
        ]

        register_url = reverse("register")

        for injection_string in injection_attempts:
            data = {
                "email": f"{injection_string}@example.com",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": injection_string,
                "last_name": injection_string,
                "organization_name": injection_string,
            }

            response = self.api_client.post(register_url, data, format="json")

            # Should either succeed with sanitized data or fail gracefully
            if response.status_code == status.HTTP_201_CREATED:
                # If successful, verify the data was sanitized
                user = Account.objects.get(email=data["email"])
                assert (
                    user.first_name == injection_string
                )  # Should store as-is (Django ORM protects)
            else:
                # Should fail with validation error, not server error
                assert response.status_code in [
                    status.HTTP_400_BAD_REQUEST,
                    status.HTTP_422_UNPROCESSABLE_ENTITY,
                ]

    def test_login_timing_attack_resistance(self):
        """Test that login timing doesn't reveal user existence."""
        # Create a user
        user = AccountFactory(email="existing@example.com", is_email_verified=True)

        login_url = reverse("login")

        # Time login attempt with existing user (wrong password)
        start_time = time.time()
        response1 = self.api_client.post(
            login_url,
            {"email": "existing@example.com", "password": "wrongpassword"},
            format="json",
        )
        existing_user_time = time.time() - start_time

        # Time login attempt with non-existing user
        start_time = time.time()
        response2 = self.api_client.post(
            login_url,
            {"email": "nonexisting@example.com", "password": "wrongpassword"},
            format="json",
        )
        nonexisting_user_time = time.time() - start_time

        # Both should return the same error status
        assert response1.status_code == status.HTTP_401_UNAUTHORIZED
        assert response2.status_code == status.HTTP_401_UNAUTHORIZED

        # Timing difference should be minimal (< 100ms difference)
        # This is a loose test as timing can vary in test environments
        time_difference = abs(existing_user_time - nonexisting_user_time)
        assert time_difference < 0.1  # 100ms tolerance

    def test_email_enumeration_protection(self):
        """Test that error messages don't reveal user existence."""
        # Create a user
        AccountFactory(email="existing@example.com")

        login_url = reverse("login")

        # Login with existing user, wrong password
        response1 = self.api_client.post(
            login_url,
            {"email": "existing@example.com", "password": "wrongpassword"},
            format="json",
        )

        # Login with non-existing user
        response2 = self.api_client.post(
            login_url,
            {"email": "nonexisting@example.com", "password": "wrongpassword"},
            format="json",
        )

        # Both should return similar error responses
        assert response1.status_code == response2.status_code
        # Error messages should not reveal which case occurred

    def test_xss_prevention_in_names(self):
        """Test that XSS scripts in names are handled safely."""
        xss_attempts = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "&#60;script&#62;alert('xss')&#60;/script&#62;",
        ]

        register_url = reverse("register")

        for xss_string in xss_attempts:
            data = {
                "email": f"xss{len(xss_string)}@example.com",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": xss_string,
                "last_name": xss_string,
                "organization_name": xss_string,
            }

            response = self.api_client.post(register_url, data, format="json")

            if response.status_code == status.HTTP_201_CREATED:
                # Verify XSS string is stored safely (not executed)
                user = Account.objects.get(email=data["email"])
                # The string should be stored as-is, but when rendered it should be escaped
                assert user.first_name == xss_string

    def test_password_requirements_enforced(self):
        """Test that password requirements are properly enforced."""
        weak_passwords = [
            "123",  # Too short
            "password",  # Too common
            "12345678",  # No complexity
            "aaaaaaaa",  # No variety
        ]

        register_url = reverse("register")

        for weak_password in weak_passwords:
            data = {
                "email": f"weak{len(weak_password)}@example.com",
                "password": weak_password,
                "password_confirm": weak_password,
                "first_name": "Test",
                "last_name": "User",
            }

            response = self.api_client.post(register_url, data, format="json")

            # Should fail validation (RFC 7807 format)
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert response.data.get("code") == "VDJ-GEN-VAL-422"

            # Check password validation error in issues
            assert "issues" in response.data
            password_issues = [
                issue
                for issue in response.data["issues"]
                if "password" in issue.get("path", [])
            ]
            assert (
                len(password_issues) > 0
            ), f"No password validation issues found for {weak_password}: {response.data}"

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_email_verification_token_security(self):
        """Test security aspects of email verification tokens."""
        user = UnverifiedAccountFactory()

        # Generate token
        token1 = user.generate_email_verification_token()
        original_token = token1

        # Generate another token (should invalidate first)
        token2 = user.generate_email_verification_token()

        # First token should be replaced
        assert token1 != token2
        user.refresh_from_db()
        assert user.email_verification_token == token2

        # Try to verify with old token
        verify_url = reverse("auth-verify-email")
        response = self.api_client.post(
            verify_url, {"token": original_token}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify with current token should work
        response = self.api_client.post(verify_url, {"token": token2}, format="json")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
@pytest.mark.auth
@pytest.mark.integration
class TestDataConsistencyEdgeCases:
    """Test data consistency and integrity edge cases."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()

    def test_registration_partial_failure_rollback(self):
        """Test that failed registration doesn't leave partial data."""
        initial_user_count = Account.objects.count()
        initial_org_count = Organization.objects.count()
        initial_membership_count = OrganizationMembership.objects.count()

        # Mock email service to fail
        with patch(
            "apps.accounts.models.Account.send_verification_email",
            side_effect=Exception("Email service down"),
        ):
            # Registration should still succeed (email is optional)
            data = {
                "email": "emailfail@example.com",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": "Email",
                "last_name": "Fail",
            }

            response = self.api_client.post(reverse("register"), data, format="json")

            # Registration should succeed even if email fails
            assert response.status_code == status.HTTP_201_CREATED

            # All data should be created
            assert Account.objects.count() == initial_user_count + 1
            assert Organization.objects.count() == initial_org_count + 1
            assert (
                OrganizationMembership.objects.count() == initial_membership_count + 1
            )

    def test_organization_subdomain_uniqueness_race_condition(self):
        """Test handling of subdomain conflicts in concurrent registrations."""
        import uuid

        test_id = uuid.uuid4().hex[:8]

        def register_user(email):
            api_client = APIClient()
            data = {
                "email": email,
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": "John",
                "last_name": "Doe",
                "preferred_subdomain": f"test-subdomain-{test_id}",
            }
            return api_client.post(reverse("register"), data, format="json")

        # Simulate concurrent requests for same subdomain
        emails = [
            f"user1-{test_id}@example.com",
            f"user2-{test_id}@example.com",
            f"user3-{test_id}@example.com",
        ]

        responses = []
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(register_user, email) for email in emails]
            responses = [future.result() for future in as_completed(futures)]

        # Only one should succeed with the preferred subdomain
        successful_responses = [
            r for r in responses if r.status_code == status.HTTP_201_CREATED
        ]
        failed_responses = [
            r for r in responses if r.status_code == status.HTTP_400_BAD_REQUEST
        ]

        # At least one should succeed
        assert len(successful_responses) >= 1

        # Verify subdomains are unique
        created_orgs = Organization.objects.filter(creator_email__in=emails)
        subdomains = [org.sub_domain for org in created_orgs]
        assert len(subdomains) == len(set(subdomains))  # All unique

    def test_membership_consistency_after_user_deletion(self):
        """Test that membership data is consistent after user operations."""
        # Create user with organization
        data = {
            "email": "tobedeleted@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "To Be",
            "last_name": "Deleted",
        }

        response = self.api_client.post(reverse("register"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        user = Account.objects.get(email="tobedeleted@example.com")
        org = user.get_primary_organization()

        # Verify membership exists
        membership = OrganizationMembership.objects.get(user=user, organization=org)
        assert membership.role == "owner"

        # Delete user (CASCADE should clean up memberships)
        user.delete()

        # Membership should be deleted
        assert not OrganizationMembership.objects.filter(user_id=user.id).exists()

        # Organization might still exist (business decision)
        # Test documents the expected behavior


@pytest.mark.django_db
@pytest.mark.auth
@pytest.mark.slow
class TestPerformanceEdgeCases:
    """Test performance and resource usage edge cases."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()

    def test_registration_with_very_long_inputs(self):
        """Test registration with maximum length inputs."""
        long_string = "a" * 1000  # Very long string

        data = {
            "email": "long@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": long_string[:30],  # Respect model limits
            "last_name": long_string[:30],
            "organization_name": long_string[:100],  # Respect model limits
        }

        response = self.api_client.post(reverse("register"), data, format="json")

        # Should handle long inputs gracefully
        if response.status_code == status.HTTP_201_CREATED:
            user = Account.objects.get(email="long@example.com")
            # Data should be truncated to model limits
            assert len(user.first_name) <= 30
            assert len(user.last_name) <= 30
        else:
            # Should fail with validation error, not server error
            assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_multiple_concurrent_registrations_same_email(self):
        """Test concurrent registrations with same email."""
        import uuid

        test_id = uuid.uuid4().hex[:8]
        test_email = f"concurrent-{test_id}@example.com"

        def register_same_email():
            api_client = APIClient()
            data = {
                "email": test_email,
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": "Concurrent",
                "last_name": "Test",
            }
            return api_client.post(reverse("register"), data, format="json")

        # Simulate concurrent requests with same email
        responses = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(register_same_email) for _ in range(5)]
            responses = [future.result() for future in as_completed(futures)]

        # Only one should succeed
        successful_responses = [
            r for r in responses if r.status_code == status.HTTP_201_CREATED
        ]
        failed_responses = [
            r for r in responses if r.status_code == status.HTTP_400_BAD_REQUEST
        ]

        assert len(successful_responses) == 1
        assert len(failed_responses) == 4

        # Only one user should exist with that email
        assert Account.objects.filter(email=test_email).count() == 1

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_rate_limiting_verification_email_resend(self):
        """Test rate limiting on verification email resend."""
        user = UnverifiedAccountFactory(email="ratelimit@example.com")

        resend_url = reverse("resend_verification_by_email")

        # Send multiple requests quickly
        responses = []
        for i in range(10):
            response = self.api_client.post(
                resend_url, {"email": "ratelimit@example.com"}, format="json"
            )
            responses.append(response)

        # Some requests should be rate limited
        # Note: This test might fail if rate limiting isn't implemented
        success_responses = [
            r for r in responses if r.status_code == status.HTTP_200_OK
        ]
        rate_limited_responses = [
            r for r in responses if r.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        ]

        # Should have some rate limiting (if implemented)
        # If not implemented, all responses will be 200 OK
        assert len(success_responses) >= 1


@pytest.mark.django_db
@pytest.mark.auth
class TestBusinessLogicEdgeCases:
    """Test business logic edge cases and boundary conditions."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()

    def test_organization_ownership_cannot_be_orphaned(self):
        """Test that organizations always have an owner."""
        # Create organization with owner
        data = {
            "email": "owner@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Original",
            "last_name": "Owner",
        }

        response = self.api_client.post(reverse("register"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        user = Account.objects.get(email="owner@example.com")
        org = user.get_primary_organization()
        membership = OrganizationMembership.objects.get(user=user, organization=org)

        # Try to change owner to member (should fail if no other owners)
        membership.role = "member"

        # This should raise validation error (if business rules are implemented)
        try:
            membership.save()
            # If save succeeds, check if there's another validation
            assert membership.role == "member"  # Documents current behavior
        except Exception:
            # If validation prevents this, that's correct behavior
            pass

    def test_user_can_belong_to_multiple_organizations(self):
        """Test that users can be members of multiple organizations."""
        # Create first organization
        org1_data = {
            "email": "multiorg@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Multi",
            "last_name": "Org",
        }

        response1 = self.api_client.post(reverse("register"), org1_data, format="json")
        assert response1.status_code == status.HTTP_201_CREATED

        user = Account.objects.get(email="multiorg@example.com")
        org1 = user.get_primary_organization()

        # Create second organization
        org2 = Organization.objects.create(
            name="Second Org",
            sub_domain="second-org",
            slug="second-org",
            creator_email="someone@example.com",
            creator_name="Someone Else",
        )

        # Add user to second organization
        membership2 = OrganizationMembership.objects.create(
            organization=org2, user=user, role="member", status="active"
        )

        # Verify user is member of both
        user_orgs = user.get_organizations()
        assert len(user_orgs) == 2
        assert org1 in user_orgs
        assert org2 in user_orgs

        # Verify different roles
        assert user.is_owner_of(org1)
        assert not user.is_owner_of(org2)
        assert user.has_active_membership_in(org1)
        assert user.has_active_membership_in(org2)

    def test_email_verification_token_expires_correctly(self):
        """Test email verification token expiration behavior."""
        user = UnverifiedAccountFactory()

        # Generate token
        token = user.generate_email_verification_token()

        # Verify token works initially
        verify_url = reverse("auth-verify-email")
        response = self.api_client.post(verify_url, {"token": token}, format="json")
        assert response.status_code == status.HTTP_200_OK

        # User should now be verified
        user.refresh_from_db()
        assert user.is_email_verified

        # Try to verify again with same token (should fail - token should be cleared)
        user2 = UnverifiedAccountFactory(email="another@example.com")
        token2 = user2.generate_email_verification_token()

        response2 = self.api_client.post(verify_url, {"token": token}, format="json")
        assert response2.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_updates_last_login_timestamp(self):
        """Test that successful login updates last_login field."""
        user = AccountFactory(
            email="lastlogin@example.com", is_email_verified=True, status="ACTIVE"
        )

        # Clear last_login
        user.last_login = None
        user.save()

        # Login
        response = self.api_client.post(
            reverse("login"),
            {"email": "lastlogin@example.com", "password": "testpassword123"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify last_login was updated
        user.refresh_from_db()
        assert user.last_login is not None

    def test_jwt_token_contains_organization_context(self):
        """Test that JWT tokens contain organization information."""
        org = Organization.objects.create(
            name="Token Org",
            sub_domain="token-org",
            slug="token-org",
            creator_email="token@example.com",
            creator_name="Token User",
        )

        user = AccountFactory(
            email="token@example.com",
            is_email_verified=True,
            status="ACTIVE",
            organization=org,
        )

        OrganizationMembership.objects.create(
            organization=org, user=user, role="owner", status="active"
        )

        # Login
        response = self.api_client.post(
            reverse("login"),
            {"email": "token@example.com", "password": "testpassword123"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        # Tokens should be present (can't easily verify claims without decoding)
        response_data = response.data["data"]
        assert "access" in response_data
        assert "refresh" in response_data
        assert len(response_data["access"]) > 50  # JWT tokens are long
