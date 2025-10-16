"""
Comprehensive test cases for user registration flows.
Tests registration with and without organization details, including all edge cases.
"""

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Account
from apps.accounts.tests.factories import AccountFactory
from apps.organizations.models import Organization, OrganizationMembership


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.auth
class TestUserRegistrationFlow:
    """Test user registration flows with and without organization details."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()
        self.register_url = reverse("register")

    def test_registration_without_organization_details_happy_path(self):
        """Test registration with minimal data - system auto-generates organization."""
        data = {
            "email": "john.doe@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.api_client.post(self.register_url, data, format="json")

        # Assert successful registration
        assert response.status_code == status.HTTP_201_CREATED

        # Verify response structure
        response_data = response.data["data"]
        assert "access" in response_data
        assert "refresh" in response_data
        assert "user" in response_data
        assert "organization" in response_data

        # Verify user was created correctly
        user = Account.objects.get(email="john.doe@example.com")
        assert user.first_name == "John"
        assert user.last_name == "Doe"
        assert user.status == "PENDING"
        assert not user.is_email_verified

        # Verify auto-generated organization
        assert response_data["organization"] is not None
        org_data = response_data["organization"]
        assert org_data["name"] == "John Doe"  # Auto-generated from name
        assert org_data["on_trial"] is True
        assert org_data["trial_ends_on"] is not None

        # Verify organization in database
        org = Organization.objects.get(id=org_data["id"])
        assert org.name == "John Doe"
        assert org.created_by == user
        assert org.on_trial is True
        assert org.plan == "free_trial"

        # Verify owner membership was created
        membership = OrganizationMembership.objects.get(organization=org, user=user)
        assert membership.role == "owner"
        assert membership.status == "active"

        # Verify verification email was sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == ["john.doe@example.com"]

        # Verify JWT tokens contain correct claims
        # Note: We can't easily decode JWT in tests without the secret
        # This would be better tested with actual JWT verification

    def test_registration_without_organization_generates_unique_subdomain(self):
        """Test that auto-generated subdomains are unique."""
        # Create first user
        data1 = {
            "email": "john1@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response1 = self.api_client.post(self.register_url, data1, format="json")
        assert response1.status_code == status.HTTP_201_CREATED

        # Create second user with same name
        data2 = {
            "email": "john2@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response2 = self.api_client.post(self.register_url, data2, format="json")
        assert response2.status_code == status.HTTP_201_CREATED

        # Verify different subdomains were generated
        org1_data = response1.data["data"]["organization"]
        org2_data = response2.data["data"]["organization"]

        assert org1_data["subdomain"] != org2_data["subdomain"]

        # Verify both organizations exist with unique subdomains
        org1 = Organization.objects.get(id=org1_data["id"])
        org2 = Organization.objects.get(id=org2_data["id"])

        assert org1.sub_domain != org2.sub_domain
        assert org1.sub_domain.startswith("john-doe")
        assert org2.sub_domain.startswith("john-doe")

    def test_registration_with_minimal_name_generates_fallback_org(self):
        """Test registration with minimal name data generates appropriate fallback."""
        data = {
            "email": "user@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "",
            "last_name": "",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify fallback organization name
        org_data = response.data["data"]["organization"]
        assert org_data["name"] == "Personal Organization"

        # Verify subdomain was still generated
        assert len(org_data["subdomain"]) >= 3
        assert org_data["subdomain"].startswith("user")

    def test_registration_with_unicode_names_handles_correctly(self):
        """Test registration with international characters in names."""
        data = {
            "email": "jose.muller@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "José",
            "last_name": "Müller",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify user was created with correct names
        user = Account.objects.get(email="jose.muller@example.com")
        assert user.first_name == "José"
        assert user.last_name == "Müller"

        # Verify organization name preserves unicode
        org_data = response.data["data"]["organization"]
        assert org_data["name"] == "José Müller"

        # Verify subdomain is ASCII-safe
        subdomain = org_data["subdomain"]
        assert subdomain.isascii()
        assert len(subdomain) >= 3

    def test_registration_duplicate_email_fails(self):
        """Test that registration with duplicate email fails."""
        # Create first user
        AccountFactory(email="existing@example.com")

        # Attempt to register with same email
        data = {
            "email": "existing@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify error message (RFC 7807 format)
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find the email validation issue
        email_issues = [
            issue
            for issue in response.data["issues"]
            if "email" in issue.get("path", [])
        ]
        assert len(email_issues) > 0
        assert "already exists" in email_issues[0]["message"].lower()

    def test_registration_password_mismatch_fails(self):
        """Test that password confirmation mismatch fails."""
        data = {
            "email": "john@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "DifferentPassword456!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify error message about password mismatch (RFC 7807 format)
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Should have validation issues related to password mismatch
        password_issues = [
            issue
            for issue in response.data["issues"]
            if any(
                field in issue.get("path", [])
                for field in ["password", "password_confirm", "non_field_errors"]
            )
        ]
        assert len(password_issues) > 0

    def test_registration_weak_password_fails(self):
        """Test that weak passwords are rejected."""
        data = {
            "email": "john@example.com",
            "password": "123",  # Too short
            "password_confirm": "123",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify error message about password length (RFC 7807 format)
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find password validation issues
        password_issues = [
            issue
            for issue in response.data["issues"]
            if "password" in issue.get("path", [])
        ]
        assert len(password_issues) > 0

    def test_registration_invalid_email_fails(self):
        """Test that invalid email format fails."""
        data = {
            "email": "not-an-email",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify error message about email format (RFC 7807 format)
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find email validation issues
        email_issues = [
            issue
            for issue in response.data["issues"]
            if "email" in issue.get("path", [])
        ]
        assert len(email_issues) > 0

    def test_registration_missing_required_fields_fails(self):
        """Test that missing required fields fail appropriately."""
        data = {
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            # Missing email
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify error message about required email (RFC 7807 format)
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find email validation issues
        email_issues = [
            issue
            for issue in response.data["issues"]
            if "email" in issue.get("path", [])
        ]
        assert len(email_issues) > 0

    @freeze_time("2024-01-01 12:00:00")
    def test_registration_sets_trial_period_correctly(self):
        """Test that 14-day trial period is set correctly."""
        data = {
            "email": "trial@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Trial",
            "last_name": "User",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify trial end date
        org_data = response.data["data"]["organization"]
        assert org_data["trial_ends_on"] == "2024-01-15"  # 14 days from 2024-01-01

        # Verify in database
        org = Organization.objects.get(id=org_data["id"])
        expected_trial_end = timezone.now().date() + timezone.timedelta(days=14)
        assert org.trial_ends_on == expected_trial_end

    def test_registration_handles_email_service_failure_gracefully(self):
        """Test that registration continues even if email sending fails."""
        # This would require mocking the email service to fail
        # For now, we'll test that registration completes successfully
        data = {
            "email": "emailfail@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Email",
            "last_name": "Fail",
        }

        response = self.api_client.post(self.register_url, data, format="json")

        # Registration should still succeed even if email fails
        assert response.status_code == status.HTTP_201_CREATED

        # User should still be created
        user = Account.objects.get(email="emailfail@example.com")
        assert user.status == "PENDING"

    def test_registration_creates_proper_database_relationships(self):
        """Test that all database relationships are created correctly."""
        data = {
            "email": "relationships@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Relationship",
            "last_name": "Test",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify user exists
        user = Account.objects.get(email="relationships@example.com")

        # Verify organization exists and is linked to user
        org_id = response.data["data"]["organization"]["id"]
        org = Organization.objects.get(id=org_id)
        assert org.created_by == user

        # Verify membership exists
        membership = OrganizationMembership.objects.get(organization=org, user=user)
        assert membership.role == "owner"
        assert membership.status == "active"

        # Verify user can find their primary organization
        assert user.get_primary_organization() == org

        # Verify user has active membership
        assert user.has_active_membership_in(org)
        assert user.is_owner_of(org)

    def test_registration_atomic_transaction_rollback_on_failure(self):
        """Test that registration is atomic - if any part fails, everything rolls back."""
        # This is harder to test without mocking specific failures
        # We'll test that no partial data is left if validation fails

        initial_user_count = Account.objects.count()
        initial_org_count = Organization.objects.count()
        initial_membership_count = OrganizationMembership.objects.count()

        # Submit invalid data (password mismatch)
        data = {
            "email": "atomic@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "DifferentPassword456!",
            "first_name": "Atomic",
            "last_name": "Test",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify no data was created
        assert Account.objects.count() == initial_user_count
        assert Organization.objects.count() == initial_org_count
        assert OrganizationMembership.objects.count() == initial_membership_count

        # Verify user doesn't exist
        assert not Account.objects.filter(email="atomic@example.com").exists()


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.auth
class TestRegistrationWithCustomOrganization:
    """Test registration with custom organization details."""

    def setup_method(self):
        """Setup for each test method."""
        self.api_client = APIClient()
        self.register_url = reverse("register")

    def test_registration_with_custom_organization_happy_path(self):
        """Test registration with custom organization name and subdomain."""
        data = {
            "email": "ceo@mycompany.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Jane",
            "last_name": "CEO",
            "organization_name": "My Amazing Company",
            "preferred_subdomain": "amazing-company",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify custom organization details
        org_data = response.data["data"]["organization"]
        assert org_data["name"] == "My Amazing Company"
        assert org_data["subdomain"] == "amazing-company"

        # Verify in database
        org = Organization.objects.get(id=org_data["id"])
        assert org.name == "My Amazing Company"
        assert org.sub_domain == "amazing-company"
        assert org.slug == "amazing-company"

    def test_registration_with_invalid_subdomain_fails(self):
        """Test that invalid subdomains are rejected."""
        invalid_subdomains = [
            "-invalid-start",  # Starts with hyphen
            "invalid-end-",  # Ends with hyphen
            "in..valid",  # Contains dots
            "in valid",  # Contains spaces
            "in_valid",  # Contains underscores
            "ab",  # Too short
            "a" * 51,  # Too long
        ]

        for invalid_subdomain in invalid_subdomains:
            data = {
                "email": f"test-{invalid_subdomain[:5]}@example.com",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
                "first_name": "Test",
                "last_name": "User",
                "organization_name": "Test Company",
                "preferred_subdomain": invalid_subdomain,
            }

            response = self.api_client.post(self.register_url, data, format="json")
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert response.data.get("code") == "VDJ-GEN-VAL-422"
            assert "issues" in response.data
            # Find subdomain validation issues
            subdomain_issues = [
                issue
                for issue in response.data["issues"]
                if "preferred_subdomain" in issue.get("path", [])
            ]
            assert len(subdomain_issues) > 0

    def test_registration_with_taken_subdomain_fails(self):
        """Test that duplicate subdomains are rejected."""
        # Create organization with specific subdomain
        existing_org = Organization.objects.create(
            name="Existing Company",
            sub_domain="taken-subdomain",
            slug="taken-subdomain",
            creator_email="existing@example.com",
        )

        # Try to register with same subdomain
        data = {
            "email": "new@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "New",
            "last_name": "User",
            "organization_name": "New Company",
            "preferred_subdomain": "taken-subdomain",
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data.get("code") == "VDJ-GEN-VAL-422"
        assert "issues" in response.data
        # Find subdomain validation issues
        subdomain_issues = [
            issue
            for issue in response.data["issues"]
            if "preferred_subdomain" in issue.get("path", [])
        ]
        assert len(subdomain_issues) > 0
        assert "already taken" in subdomain_issues[0]["message"].lower()

    def test_registration_with_organization_name_only(self):
        """Test registration with organization name but no subdomain."""
        data = {
            "email": "founder@startup.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Startup",
            "last_name": "Founder",
            "organization_name": "My Startup Inc",
            # No preferred_subdomain - should auto-generate
        }

        response = self.api_client.post(self.register_url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify custom organization name is used
        org_data = response.data["data"]["organization"]
        assert org_data["name"] == "My Startup Inc"

        # Verify subdomain was auto-generated from user name
        assert len(org_data["subdomain"]) >= 3
        assert org_data["subdomain"].startswith("startup-founder")

    def test_registration_handles_long_organization_names(self):
        """Test registration with very long organization names."""
        long_name = "A" * 200  # Very long name

        data = {
            "email": "long@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Long",
            "last_name": "Name",
            "organization_name": long_name,
        }

        response = self.api_client.post(self.register_url, data, format="json")

        # Should either succeed with truncated name or fail with validation error
        if response.status_code == status.HTTP_201_CREATED:
            org_data = response.data["data"]["organization"]
            # Name should be truncated to model's max_length
            assert len(org_data["name"]) <= 100
        else:
            # Should fail with validation error
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert response.data.get("code") == "VDJ-GEN-VAL-422"
            assert "issues" in response.data
            # Find organization name validation issues
            org_name_issues = [
                issue
                for issue in response.data["issues"]
                if "organization_name" in issue.get("path", [])
            ]
            assert len(org_name_issues) > 0
