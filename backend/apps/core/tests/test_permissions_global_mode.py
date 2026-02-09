"""
Tests for permission classes in Global Mode.

Ensures that permission classes work correctly in both Global Mode and Multi-Tenant Mode.
"""

import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase, override_settings

from apps.core.permissions import (
    CanCreateOrganization,
    CanDeleteOrganization,
    CanInviteMembers,
    CanManageOrganization,
)
from apps.organizations.models import Organization, OrganizationMembership

Account = get_user_model()


class CanCreateOrganizationTestCase(TestCase):
    """Test CanCreateOrganization permission."""

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = CanCreateOrganization()

        self.user = Account.objects.create_user(
            email="test@example.com",
            password="testpass123",
            is_email_verified=True,
        )

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_allows_creation_in_multi_tenant_mode(self):
        """Test that org creation is allowed in multi-tenant mode."""
        request = self.factory.post("/api/v1/organizations/")
        request.user = self.user

        self.assertTrue(self.permission.has_permission(request, None))

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_blocks_creation_in_global_mode(self):
        """Test that org creation is blocked in global mode."""
        request = self.factory.post("/api/v1/organizations/")
        request.user = self.user

        self.assertFalse(self.permission.has_permission(request, None))
        self.assertIn("single-tenant mode", self.permission.message)

    def test_allows_superuser_to_create(self):
        """Test that superusers can create orgs even in global mode."""
        superuser = Account.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
        )

        request = self.factory.post("/api/v1/organizations/")
        request.user = superuser

        with override_settings(GLOBAL_MODE_ENABLED=True):
            self.assertTrue(self.permission.has_permission(request, None))

    def test_blocks_anonymous_users(self):
        """Test that anonymous users cannot create orgs."""
        from django.contrib.auth.models import AnonymousUser

        request = self.factory.post("/api/v1/organizations/")
        request.user = AnonymousUser()

        self.assertFalse(self.permission.has_permission(request, None))


class CanDeleteOrganizationTestCase(TestCase):
    """Test CanDeleteOrganization permission."""

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = CanDeleteOrganization()

        self.user = Account.objects.create_user(
            email="test@example.com",
            password="testpass123",
            is_email_verified=True,
        )

        self.org = Organization.objects.create(
            name="Test Org",
            slug="testorg",
            sub_domain="testorg",
            creator_email=self.user.email,
            is_active=True,
        )

        self.owner_membership = OrganizationMembership.objects.create(
            organization=self.org,
            user=self.user,
            role="owner",
            status="active",
        )

        # Add is_owner_of method to user for testing
        def is_owner_of(org):
            return OrganizationMembership.objects.filter(
                user=self.user,
                organization=org,
                role="owner",
                status="active"
            ).exists()

        self.user.is_owner_of = is_owner_of

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_allows_owner_to_delete_in_multi_tenant_mode(self):
        """Test that owners can delete orgs in multi-tenant mode."""
        request = self.factory.delete(f"/api/v1/organizations/{self.org.id}/")
        request.user = self.user

        self.assertTrue(self.permission.has_object_permission(request, None, self.org))

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_blocks_deletion_in_global_mode(self):
        """Test that org deletion is blocked in global mode."""
        request = self.factory.delete(f"/api/v1/organizations/{self.org.id}/")
        request.user = self.user

        self.assertFalse(self.permission.has_object_permission(request, None, self.org))
        self.assertIn("not available", self.permission.message)

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_blocks_platform_org_deletion(self):
        """Test that platform org cannot be deleted."""
        platform_org = Organization.objects.create(
            name="Platform",
            slug="platform",
            sub_domain="platform",
            creator_email="system@platform.internal",
            is_active=True,
        )
        platform_org.extended_properties = {"is_global_scope": True}
        platform_org.save()

        request = self.factory.delete(f"/api/v1/organizations/{platform_org.id}/")
        request.user = self.user

        self.assertFalse(
            self.permission.has_object_permission(request, None, platform_org)
        )
        self.assertIn("protected", self.permission.message.lower())

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_even_superuser_cannot_delete_platform_org(self):
        """Test that even superusers cannot delete platform org."""
        superuser = Account.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
        )

        platform_org = Organization.objects.create(
            name="Platform",
            slug="platform",
            sub_domain="platform",
            creator_email="system@platform.internal",
            is_active=True,
        )

        request = self.factory.delete(f"/api/v1/organizations/{platform_org.id}/")
        request.user = superuser

        self.assertFalse(
            self.permission.has_object_permission(request, None, platform_org)
        )


class CanManageOrganizationTestCase(TestCase):
    """Test CanManageOrganization permission."""

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = CanManageOrganization()

        self.admin_user = Account.objects.create_user(
            email="admin@example.com",
            password="testpass123",
            is_email_verified=True,
        )

        self.regular_user = Account.objects.create_user(
            email="user@example.com",
            password="testpass123",
            is_email_verified=True,
        )

        self.org = Organization.objects.create(
            name="Test Org",
            slug="testorg",
            sub_domain="testorg",
            creator_email=self.admin_user.email,
            is_active=True,
        )

        OrganizationMembership.objects.create(
            organization=self.org,
            user=self.admin_user,
            role="admin",
            status="active",
        )

        OrganizationMembership.objects.create(
            organization=self.org,
            user=self.regular_user,
            role="member",
            status="active",
        )

        # Add helper methods to users
        def is_admin_of(org):
            return OrganizationMembership.objects.filter(
                user=self.admin_user,
                organization=org,
                role__in=["admin", "owner"],
                status="active"
            ).exists()

        def is_owner_of(org):
            return OrganizationMembership.objects.filter(
                user=self.admin_user,
                organization=org,
                role="owner",
                status="active"
            ).exists()

        self.admin_user.is_admin_of = is_admin_of
        self.admin_user.is_owner_of = is_owner_of

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_allows_admin_to_manage_in_multi_tenant_mode(self):
        """Test that admins can manage orgs in multi-tenant mode."""
        request = self.factory.patch(f"/api/v1/organizations/{self.org.id}/")
        request.user = self.admin_user

        self.assertTrue(
            self.permission.has_object_permission(request, None, self.org)
        )

    @override_settings(
        GLOBAL_MODE_ENABLED=True,
        GLOBAL_SCOPE_ORG_SLUG="platform",
    )
    def test_blocks_platform_org_management(self):
        """Test that regular users cannot manage platform org in global mode."""
        platform_org = Organization.objects.create(
            name="Platform",
            slug="platform",
            sub_domain="platform",
            creator_email="system@platform.internal",
            is_active=True,
        )

        request = self.factory.patch(f"/api/v1/organizations/{platform_org.id}/")
        request.user = self.admin_user

        self.assertFalse(
            self.permission.has_object_permission(request, None, platform_org)
        )
        self.assertIn("Platform organization settings", self.permission.message)


class CanInviteMembersTestCase(TestCase):
    """Test CanInviteMembers permission."""

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = CanInviteMembers()

        self.user = Account.objects.create_user(
            email="test@example.com",
            password="testpass123",
            is_email_verified=True,
        )

    @override_settings(GLOBAL_MODE_ENABLED=False)
    def test_allows_invites_in_multi_tenant_mode(self):
        """Test that member invites are allowed in multi-tenant mode."""
        request = self.factory.post("/api/v1/organizations/1/invites/")
        request.user = self.user

        self.assertTrue(self.permission.has_permission(request, None))

    @override_settings(GLOBAL_MODE_ENABLED=True)
    def test_blocks_invites_in_global_mode(self):
        """Test that member invites are blocked in global mode."""
        request = self.factory.post("/api/v1/organizations/1/invites/")
        request.user = self.user

        self.assertFalse(self.permission.has_permission(request, None))
        self.assertIn("not available", self.permission.message)
        self.assertIn("register directly", self.permission.message)

    def test_allows_superuser_to_invite(self):
        """Test that superusers can invite even in global mode."""
        superuser = Account.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
        )

        request = self.factory.post("/api/v1/organizations/1/invites/")
        request.user = superuser

        with override_settings(GLOBAL_MODE_ENABLED=True):
            self.assertTrue(self.permission.has_permission(request, None))
