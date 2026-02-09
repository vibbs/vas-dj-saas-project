"""
Tests for the platform capabilities system.

Tests both Global Mode and Multi-Tenant Mode configurations.
"""

import pytest
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.core.capabilities import (
    can_create_organization,
    can_delete_organization,
    can_invite_members,
    can_manage_organization,
    can_switch_organizations,
    get_platform_capabilities,
    is_global_mode_enabled,
)


class CapabilitiesTestCase(TestCase):
    """Test capabilities helper functions."""

    def setUp(self):
        self.client = APIClient()

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_multi_tenant_mode_detection(self):
        """Test that multi-tenant mode is correctly detected."""
        self.assertFalse(is_global_mode_enabled())

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_global_mode_detection(self):
        """Test that global mode is correctly detected."""
        self.assertTrue(is_global_mode_enabled())

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_multi_tenant_capabilities(self):
        """Test capabilities in multi-tenant mode."""
        self.assertTrue(can_create_organization())
        self.assertTrue(can_manage_organization())
        self.assertTrue(can_delete_organization())
        self.assertTrue(can_invite_members())
        self.assertTrue(can_switch_organizations())

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_global_mode_capabilities(self):
        """Test capabilities in global mode."""
        self.assertFalse(can_create_organization())
        self.assertFalse(can_manage_organization())
        self.assertFalse(can_delete_organization())
        self.assertFalse(can_invite_members())
        self.assertFalse(can_switch_organizations())

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_get_platform_capabilities_multi_tenant(self):
        """Test get_platform_capabilities() in multi-tenant mode."""
        caps = get_platform_capabilities()

        self.assertEqual(caps["mode"], "multi_tenant")
        self.assertTrue(caps["org_creation"])
        self.assertTrue(caps["org_switching"])
        self.assertTrue(caps["org_management"])
        self.assertTrue(caps["org_billing"])
        self.assertTrue(caps["subdomain_routing"])
        self.assertTrue(caps["member_invites"])
        self.assertTrue(caps["org_deletion"])
        self.assertTrue(caps["api_keys"])
        self.assertTrue(caps["personal_settings"])
        self.assertIsNone(caps["global_scope_slug"])

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_get_platform_capabilities_global_mode(self):
        """Test get_platform_capabilities() in global mode."""
        caps = get_platform_capabilities()

        self.assertEqual(caps["mode"], "global")
        self.assertFalse(caps["org_creation"])
        self.assertFalse(caps["org_switching"])
        self.assertFalse(caps["org_management"])
        self.assertFalse(caps["org_billing"])
        self.assertFalse(caps["subdomain_routing"])
        self.assertFalse(caps["member_invites"])
        self.assertFalse(caps["org_deletion"])
        self.assertTrue(caps["api_keys"])  # Still available
        self.assertTrue(caps["personal_settings"])  # Still available
        self.assertEqual(caps["global_scope_slug"], "platform")


class CapabilitiesAPITestCase(TestCase):
    """Test capabilities API endpoint."""

    def setUp(self):
        self.client = APIClient()

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_capabilities_endpoint_multi_tenant(self):
        """Test /api/v1/capabilities/ endpoint in multi-tenant mode."""
        response = self.client.get("/api/v1/capabilities/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 200)
        self.assertEqual(response.data["data"]["mode"], "multi_tenant")
        self.assertTrue(response.data["data"]["org_creation"])

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_capabilities_endpoint_global_mode(self):
        """Test /api/v1/capabilities/ endpoint in global mode."""
        response = self.client.get("/api/v1/capabilities/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 200)
        self.assertEqual(response.data["data"]["mode"], "global")
        self.assertFalse(response.data["data"]["org_creation"])
        self.assertEqual(response.data["data"]["global_scope_slug"], "platform")

    def test_capabilities_endpoint_no_auth_required(self):
        """Test that capabilities endpoint is publicly accessible."""
        response = self.client.get("/api/v1/capabilities/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.data)
        self.assertEqual(response.data["status"], 200)

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_capabilities_response_structure(self):
        """Test that capabilities response has correct structure."""
        response = self.client.get("/api/v1/capabilities/")

        self.assertEqual(response.status_code, 200)
        data = response.data["data"]

        # Check all required fields are present
        required_fields = [
            "mode",
            "org_creation",
            "org_switching",
            "org_management",
            "org_billing",
            "subdomain_routing",
            "member_invites",
            "org_deletion",
            "api_keys",
            "personal_settings",
            "global_scope_slug",
        ]

        for field in required_fields:
            self.assertIn(field, data, f"Missing field: {field}")

        # Check field types
        self.assertIn(data["mode"], ["global", "multi_tenant"])
        self.assertIsInstance(data["org_creation"], bool)
        self.assertIsInstance(data["org_switching"], bool)
        self.assertIsInstance(data["org_management"], bool)
