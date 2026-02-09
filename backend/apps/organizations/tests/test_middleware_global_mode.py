"""
Tests for TenantMiddleware in Global Mode.

Ensures that the middleware correctly handles both Global Mode and Multi-Tenant Mode,
and that all tests are backward compatible.
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase, override_settings
from django.http import HttpResponse

from apps.organizations.middleware.tenant import TenantMiddleware
from apps.organizations.models import Organization, OrganizationMembership

Account = get_user_model()


class TenantMiddlewareGlobalModeTestCase(TestCase):
    """Test TenantMiddleware behavior in Global Mode."""

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = TenantMiddleware(get_response=lambda r: HttpResponse())

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
            "system_managed": True,
        }
        self.platform_org.save()

        # Create test user
        self.user = Account.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            is_email_verified=True,
        )

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_global_mode_auto_assigns_platform_org(self):
        """Test that middleware auto-assigns platform org in global mode."""
        request = self.factory.get("/api/v1/test/")
        request.user = self.user

        # Process request
        self.middleware.process_request(request)

        # Check that platform org is assigned
        self.assertIsNotNone(request.org)
        self.assertEqual(request.org.slug, "platform")
        self.assertEqual(request.org, self.platform_org)

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_global_mode_auto_creates_membership(self):
        """Test that middleware auto-creates membership in global mode."""
        request = self.factory.get("/api/v1/test/")
        request.user = self.user

        # Ensure no membership exists
        self.assertFalse(
            OrganizationMembership.objects.filter(
                user=self.user, organization=self.platform_org
            ).exists()
        )

        # Process request
        self.middleware.process_request(request)

        # Check that membership was created
        self.assertTrue(
            OrganizationMembership.objects.filter(
                user=self.user,
                organization=self.platform_org,
                status="active",
            ).exists()
        )

        # Check that membership is assigned to request
        self.assertIsNotNone(request.membership)
        self.assertEqual(request.membership.organization, self.platform_org)
        self.assertEqual(request.membership.user, self.user)
        self.assertEqual(request.membership.role, "member")

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_global_mode_reuses_existing_membership(self):
        """Test that middleware reuses existing membership instead of creating duplicate."""
        # Pre-create membership
        existing_membership = OrganizationMembership.objects.create(
            organization=self.platform_org,
            user=self.user,
            role="admin",
            status="active",
        )

        request = self.factory.get("/api/v1/test/")
        request.user = self.user

        # Process request
        self.middleware.process_request(request)

        # Check that membership is reused (not created again)
        membership_count = OrganizationMembership.objects.filter(
            user=self.user, organization=self.platform_org
        ).count()
        self.assertEqual(membership_count, 1)

        # Check that the existing membership is used
        self.assertEqual(request.membership, existing_membership)
        self.assertEqual(request.membership.role, "admin")

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_global_mode_handles_anonymous_users(self):
        """Test that middleware handles anonymous users gracefully in global mode."""
        from django.contrib.auth.models import AnonymousUser

        request = self.factory.get("/api/v1/test/")
        request.user = AnonymousUser()

        # Process request
        self.middleware.process_request(request)

        # Platform org should still be assigned
        self.assertIsNotNone(request.org)
        self.assertEqual(request.org.slug, "platform")

        # But no membership for anonymous user
        self.assertIsNone(request.membership)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_multi_tenant_mode_still_works(self):
        """Test that multi-tenant mode is not affected by global mode changes."""
        # Create a different organization
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            sub_domain="testorg",
            creator_email=self.user.email,
            creator_name=self.user.full_name,
            is_active=True,
        )

        # Create membership
        OrganizationMembership.objects.create(
            organization=org,
            user=self.user,
            role="owner",
            status="active",
        )

        # Request with subdomain
        request = self.factory.get("/api/v1/test/", HTTP_HOST="testorg.example.com")
        request.user = self.user

        # Process request
        self.middleware.process_request(request)

        # Check that correct org is assigned
        self.assertIsNotNone(request.org)
        self.assertEqual(request.org.slug, "test-org")
        self.assertIsNotNone(request.membership)

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_global_mode_exempt_paths(self):
        """Test that exempt paths work in global mode."""
        request = self.factory.get("/api/v1/capabilities/")
        request.user = self.user

        # Process request - should not require org
        result = self.middleware.process_request(request)

        # Should process successfully
        self.assertIsNone(result)
        self.assertIsNotNone(request.org)  # Platform org assigned anyway

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="nonexistent",
    )
    def test_global_mode_missing_platform_org_raises_404(self):
        """Test that missing platform org raises 404 in global mode."""
        from django.http import Http404

        request = self.factory.get("/api/v1/test/")
        request.user = self.user

        # Process request - should raise 404
        with self.assertRaises(Http404) as context:
            self.middleware.process_request(request)

        self.assertIn("Global platform organization not configured", str(context.exception))


class TenantMiddlewareBackwardCompatibilityTestCase(TestCase):
    """Test that TenantMiddleware maintains backward compatibility."""

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = TenantMiddleware(get_response=lambda r: HttpResponse())

        self.user = Account.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            is_email_verified=True,
        )

        self.org = Organization.objects.create(
            name="Test Organization",
            slug="testorg",
            sub_domain="testorg",
            creator_email=self.user.email,
            creator_name=self.user.full_name,
            is_active=True,
        )

        self.membership = OrganizationMembership.objects.create(
            organization=self.org,
            user=self.user,
            role="owner",
            status="active",
        )

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_subdomain_resolution_still_works(self):
        """Test that subdomain resolution works in multi-tenant mode."""
        request = self.factory.get("/api/v1/test/", HTTP_HOST="testorg.example.com")
        request.user = self.user

        self.middleware.process_request(request)

        self.assertEqual(request.org, self.org)
        self.assertEqual(request.membership, self.membership)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_header_resolution_still_works(self):
        """Test that header-based resolution works in multi-tenant mode."""
        request = self.factory.get(
            "/api/v1/test/",
            HTTP_X_ORG_SLUG="testorg"
        )
        request.user = self.user

        self.middleware.process_request(request)

        self.assertEqual(request.org, self.org)
        self.assertEqual(request.membership, self.membership)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_query_param_resolution_still_works(self):
        """Test that query param resolution works in multi-tenant mode."""
        request = self.factory.get("/api/v1/test/?org=testorg")
        request.user = self.user

        self.middleware.process_request(request)

        self.assertEqual(request.org, self.org)
        self.assertEqual(request.membership, self.membership)

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_membership_validation_still_enforced(self):
        """Test that membership validation is still enforced in multi-tenant mode."""
        from django.http import HttpResponseForbidden

        # Create another org where user has no membership
        other_org = Organization.objects.create(
            name="Other Org",
            slug="otherorg",
            sub_domain="otherorg",
            creator_email="other@example.com",
            is_active=True,
        )

        request = self.factory.get("/api/v1/test/", HTTP_HOST="otherorg.example.com")
        request.user = self.user

        result = self.middleware.process_request(request)

        # Should return forbidden response
        self.assertIsInstance(result, HttpResponseForbidden)
