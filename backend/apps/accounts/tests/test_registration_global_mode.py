"""
Tests for user registration in Global Mode.

Ensures that registration works correctly in both Global Mode and Multi-Tenant Mode,
and that tests are backward compatible.
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.organizations.models import Organization, OrganizationMembership

Account = get_user_model()


class RegistrationGlobalModeTestCase(TestCase):
    """Test user registration in Global Mode."""

    def setUp(self):
        self.client = APIClient()

        # Create platform organization for global mode tests
        self.platform_org = Organization.objects.create(
            name="Platform",
            slug="platform",
            sub_domain="platform",
            creator_email="system@platform.internal",
            creator_name="System",
            is_active=True,
            plan="enterprise",
            on_trial=False,
        )
        self.platform_org.extended_properties = {
            "is_global_scope": True,
            "protected": True,
        }
        self.platform_org.save()

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_registration_creates_user_without_org_in_global_mode(self):
        """Test that registration creates user but not organization in global mode."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
            "organization_name": "Should Be Ignored",  # This should be ignored
            "preferred_subdomain": "should-ignore",    # This should be ignored
        }

        # Count orgs before registration
        org_count_before = Organization.objects.count()

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        # Check response
        self.assertEqual(response.status_code, 201)

        # Check user was created
        self.assertTrue(
            Account.objects.filter(email="newuser@example.com").exists()
        )

        # Check NO new organization was created (count should be same)
        org_count_after = Organization.objects.count()
        self.assertEqual(org_count_before, org_count_after)

        # Check NO membership was created during registration
        # (Middleware will create it on first authenticated request)
        user = Account.objects.get(email="newuser@example.com")
        self.assertFalse(
            OrganizationMembership.objects.filter(user=user).exists()
        )

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_registration_creates_org_in_multi_tenant_mode(self):
        """Test that registration creates organization in multi-tenant mode."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
            "organization_name": "New Corp",
            "preferred_subdomain": "newcorp",
        }

        # Count orgs before registration
        org_count_before = Organization.objects.count()

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        # Check response
        self.assertEqual(response.status_code, 201)

        # Check user was created
        user = Account.objects.get(email="newuser@example.com")
        self.assertIsNotNone(user)

        # Check new organization WAS created
        org_count_after = Organization.objects.count()
        self.assertEqual(org_count_after, org_count_before + 1)

        # Check organization details
        org = Organization.objects.get(slug="newcorp")
        self.assertEqual(org.name, "New Corp")
        self.assertEqual(org.sub_domain, "newcorp")

        # Check membership was created with owner role
        membership = OrganizationMembership.objects.get(
            user=user, organization=org
        )
        self.assertEqual(membership.role, "owner")
        self.assertEqual(membership.status, "active")

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_registration_response_structure_in_global_mode(self):
        """Test that registration response has correct structure in global mode."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 201)

        # Response should still have user data
        user_data = response.data.get("data", {}).get("user")
        self.assertIsNotNone(user_data)
        self.assertEqual(user_data["email"], "newuser@example.com")

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_registration_response_structure_in_multi_tenant_mode(self):
        """Test that registration response has correct structure in multi-tenant mode."""
        data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
            "organization_name": "New Corp",
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 201)

        # Response should have user data
        user_data = response.data.get("data", {}).get("user")
        self.assertIsNotNone(user_data)

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_registration_validation_still_works_in_global_mode(self):
        """Test that validation still works in global mode."""
        # Missing required fields
        data = {
            "email": "invalid-email",  # Invalid email
            "password": "short",       # Too short
            "password_confirm": "different",  # Doesn't match
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 400)

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_duplicate_email_rejected_in_global_mode(self):
        """Test that duplicate emails are rejected in global mode."""
        # Create first user
        data = {
            "email": "duplicate@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "First",
            "last_name": "User",
        }

        response1 = self.client.post("/api/v1/auth/register/", data, format="json")
        self.assertEqual(response1.status_code, 201)

        # Try to create second user with same email
        response2 = self.client.post("/api/v1/auth/register/", data, format="json")
        self.assertEqual(response2.status_code, 400)
        self.assertIn("email", str(response2.data).lower())


class RegistrationBackwardCompatibilityTestCase(TestCase):
    """Test that registration changes are backward compatible."""

    def setUp(self):
        self.client = APIClient()

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_org_name_default_behavior_unchanged(self):
        """Test that org name default behavior is unchanged in multi-tenant mode."""
        data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
            # No organization_name provided
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)

        # Check that org was created with default name
        user = Account.objects.get(email="test@example.com")
        org = Organization.objects.get(
            memberships__user=user,
            memberships__role="owner"
        )

        # Default org name should be based on user's name
        self.assertIn("John", org.name)
        self.assertIn("Doe", org.name)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_subdomain_generation_unchanged(self):
        """Test that subdomain generation is unchanged in multi-tenant mode."""
        data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
            # No preferred_subdomain provided
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)

        # Check that subdomain was auto-generated
        user = Account.objects.get(email="test@example.com")
        org = Organization.objects.get(
            memberships__user=user,
            memberships__role="owner"
        )

        # Subdomain should be generated from name
        self.assertTrue(len(org.sub_domain) >= 3)
        self.assertTrue(len(org.sub_domain) <= 50)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_trial_initialization_unchanged(self):
        """Test that trial initialization is unchanged in multi-tenant mode."""
        data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)

        # Check that org has trial settings
        user = Account.objects.get(email="test@example.com")
        org = Organization.objects.get(
            memberships__user=user,
            memberships__role="owner"
        )

        self.assertTrue(org.on_trial)
        self.assertEqual(org.plan, "free_trial")
        self.assertIsNotNone(org.trial_ends_on)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_owner_membership_created_unchanged(self):
        """Test that owner membership is created unchanged in multi-tenant mode."""
        data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = self.client.post("/api/v1/auth/register/", data, format="json")

        self.assertEqual(response.status_code, 201)

        # Check membership
        user = Account.objects.get(email="test@example.com")
        membership = OrganizationMembership.objects.get(user=user)

        self.assertEqual(membership.role, "owner")
        self.assertEqual(membership.status, "active")


class RegistrationModeTransitionTestCase(TestCase):
    """Test that registration works when switching between modes."""

    def setUp(self):
        self.client = APIClient()

        # Create platform org for global mode
        self.platform_org = Organization.objects.create(
            name="Platform",
            slug="platform",
            sub_domain="platform",
            creator_email="system@platform.internal",
            is_active=True,
        )

    def test_can_register_in_multi_tenant_then_switch_to_global(self):
        """Test that users registered in multi-tenant can switch to global mode."""
        # Register in multi-tenant mode
        with override_settings(GLOBAL_MODE_ENABLED=False):
            data = {
                "email": "user1@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "User",
                "last_name": "One",
            }
            response = self.client.post("/api/v1/auth/register/", data, format="json")
            self.assertEqual(response.status_code, 201)

        # Switch to global mode and register another user
        with override_settings(
            GLOBAL_MODE_ENABLED=True,
            GLOBAL_SCOPE_ORG_SLUG="platform",
        ):
            data = {
                "email": "user2@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "User",
                "last_name": "Two",
            }
            response = self.client.post("/api/v1/auth/register/", data, format="json")
            self.assertEqual(response.status_code, 201)

        # Both users should exist
        self.assertTrue(Account.objects.filter(email="user1@example.com").exists())
        self.assertTrue(Account.objects.filter(email="user2@example.com").exists())
