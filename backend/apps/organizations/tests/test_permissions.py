"""
Test cases for organization permissions.
"""

from unittest.mock import Mock

import pytest

from apps.accounts.tests.factories import AccountFactory
from apps.organizations.permissions import (
    CanManageBilling,
    CanManageMembers,
    IsAdminOrReadOnly,
    IsOrgAdmin,
    IsOrgMember,
    IsOrgOwner,
    IsOwnerOrReadOnly,
    OrganizationAccessPermission,
)
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
)


def create_mock_request(user=None, method="GET", org=None, membership=None):
    """Helper to create mock request objects."""
    request = Mock()
    request.user = user
    request.method = method
    request.org = org
    request.membership = membership
    return request


def create_mock_view():
    """Helper to create mock view objects."""
    return Mock()


@pytest.mark.django_db
@pytest.mark.unit
class TestIsOrgMember:
    """Test cases for IsOrgMember permission."""

    def test_unauthenticated_user_denied(self):
        """Test that unauthenticated users are denied."""
        permission = IsOrgMember()
        request = create_mock_request(user=None)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_anonymous_user_denied(self):
        """Test that anonymous users are denied."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = False
        request = create_mock_request(user=user)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_superuser_bypasses_check(self):
        """Test that superusers bypass organization checks."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = True
        request = create_mock_request(user=user)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_no_org_context_denied(self):
        """Test that requests without org context are denied."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        request = create_mock_request(user=user, org=None)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_no_membership_denied(self):
        """Test that users without membership are denied."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        request = create_mock_request(user=user, org=org, membership=None)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_inactive_membership_denied(self):
        """Test that inactive memberships are denied."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = False
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_active_membership_allowed(self):
        """Test that active memberships are allowed."""
        permission = IsOrgMember()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestIsOrgAdmin:
    """Test cases for IsOrgAdmin permission."""

    def test_unauthenticated_user_denied(self):
        """Test that unauthenticated users are denied."""
        permission = IsOrgAdmin()
        request = create_mock_request(user=None)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_superuser_bypasses_check(self):
        """Test that superusers bypass organization checks."""
        permission = IsOrgAdmin()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = True
        request = create_mock_request(user=user)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_member_denied(self):
        """Test that regular members are denied admin access."""
        permission = IsOrgAdmin()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_admin.return_value = False
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_admin_allowed(self):
        """Test that admin members are allowed."""
        permission = IsOrgAdmin()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_admin.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_owner_allowed(self):
        """Test that owner members are allowed (owners are admins)."""
        permission = IsOrgAdmin()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_admin.return_value = (
            True  # Owners should return True for is_admin
        )
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestIsOrgOwner:
    """Test cases for IsOrgOwner permission."""

    def test_unauthenticated_user_denied(self):
        """Test that unauthenticated users are denied."""
        permission = IsOrgOwner()
        request = create_mock_request(user=None)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_superuser_bypasses_check(self):
        """Test that superusers bypass organization checks."""
        permission = IsOrgOwner()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = True
        request = create_mock_request(user=user)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_member_denied(self):
        """Test that regular members are denied owner access."""
        permission = IsOrgOwner()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_owner.return_value = False
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_admin_denied(self):
        """Test that admin members are denied owner-only access."""
        permission = IsOrgOwner()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_owner.return_value = False  # Admin is not owner
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_owner_allowed(self):
        """Test that owner members are allowed."""
        permission = IsOrgOwner()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_owner.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestCanManageMembers:
    """Test cases for CanManageMembers permission."""

    def test_member_denied(self):
        """Test that regular members cannot manage members."""
        permission = CanManageMembers()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_members.return_value = False
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_admin_allowed(self):
        """Test that admin members can manage members."""
        permission = CanManageMembers()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_members.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_owner_allowed(self):
        """Test that owner members can manage members."""
        permission = CanManageMembers()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_members.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestCanManageBilling:
    """Test cases for CanManageBilling permission."""

    def test_member_denied(self):
        """Test that regular members cannot manage billing."""
        permission = CanManageBilling()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_billing.return_value = False
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_admin_denied(self):
        """Test that admin members cannot manage billing."""
        permission = CanManageBilling()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_billing.return_value = (
            False  # Only owners can manage billing
        )
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert not permission.has_permission(request, view)

    def test_owner_allowed(self):
        """Test that owner members can manage billing."""
        permission = CanManageBilling()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.can_manage_billing.return_value = True
        request = create_mock_request(user=user, org=org, membership=membership)
        view = create_mock_view()

        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestIsOwnerOrReadOnly:
    """Test cases for IsOwnerOrReadOnly permission."""

    def test_read_access_for_members(self):
        """Test that members can read but not write."""
        permission = IsOwnerOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_owner.return_value = False

        # Test read access
        request = create_mock_request(
            user=user, org=org, membership=membership, method="GET"
        )
        view = create_mock_view()
        assert permission.has_permission(request, view)

        request = create_mock_request(
            user=user, org=org, membership=membership, method="HEAD"
        )
        assert permission.has_permission(request, view)

        request = create_mock_request(
            user=user, org=org, membership=membership, method="OPTIONS"
        )
        assert permission.has_permission(request, view)

    def test_write_access_denied_for_members(self):
        """Test that members cannot write."""
        permission = IsOwnerOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_owner.return_value = False

        # Test write access denied
        request = create_mock_request(
            user=user, org=org, membership=membership, method="POST"
        )
        view = create_mock_view()
        assert not permission.has_permission(request, view)

        request = create_mock_request(
            user=user, org=org, membership=membership, method="PUT"
        )
        assert not permission.has_permission(request, view)

        request = create_mock_request(
            user=user, org=org, membership=membership, method="PATCH"
        )
        assert not permission.has_permission(request, view)

        request = create_mock_request(
            user=user, org=org, membership=membership, method="DELETE"
        )
        assert not permission.has_permission(request, view)

    def test_full_access_for_owners(self):
        """Test that owners have full access."""
        permission = IsOwnerOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_owner.return_value = True

        # Test all methods allowed
        methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
        view = create_mock_view()

        for method in methods:
            request = create_mock_request(
                user=user, org=org, membership=membership, method=method
            )
            assert permission.has_permission(
                request, view
            ), f"Owner should have {method} access"

    def test_inactive_membership_denied(self):
        """Test that inactive memberships are denied all access."""
        permission = IsOwnerOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = False

        request = create_mock_request(
            user=user, org=org, membership=membership, method="GET"
        )
        view = create_mock_view()
        assert not permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestIsAdminOrReadOnly:
    """Test cases for IsAdminOrReadOnly permission."""

    def test_read_access_for_members(self):
        """Test that members can read but not write."""
        permission = IsAdminOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_admin.return_value = False

        # Test read access
        request = create_mock_request(
            user=user, org=org, membership=membership, method="GET"
        )
        view = create_mock_view()
        assert permission.has_permission(request, view)

    def test_write_access_denied_for_members(self):
        """Test that members cannot write."""
        permission = IsAdminOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_admin.return_value = False

        # Test write access denied
        request = create_mock_request(
            user=user, org=org, membership=membership, method="POST"
        )
        view = create_mock_view()
        assert not permission.has_permission(request, view)

    def test_full_access_for_admins(self):
        """Test that admins have full access."""
        permission = IsAdminOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_admin.return_value = True

        # Test all methods allowed
        methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
        view = create_mock_view()

        for method in methods:
            request = create_mock_request(
                user=user, org=org, membership=membership, method=method
            )
            assert permission.has_permission(
                request, view
            ), f"Admin should have {method} access"

    def test_full_access_for_owners(self):
        """Test that owners have full access (owners are admins)."""
        permission = IsAdminOrReadOnly()
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        org = Mock()
        membership = Mock()
        membership.is_active.return_value = True
        membership.is_admin.return_value = (
            True  # Owners should return True for is_admin
        )

        request = create_mock_request(
            user=user, org=org, membership=membership, method="POST"
        )
        view = create_mock_view()
        assert permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationAccessPermission:
    """Test cases for deprecated OrganizationAccessPermission."""

    def test_deprecated_permission_works(self):
        """Test that deprecated permission still works for backward compatibility."""
        permission = OrganizationAccessPermission()
        user = Mock()
        user.is_authenticated = True
        org = Mock()

        # Test legacy direct organization relationship
        user.organization = org
        request = create_mock_request(user=user, org=org)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_deprecated_permission_new_membership_relationship(self):
        """Test deprecated permission with new membership relationship."""
        permission = OrganizationAccessPermission()
        user = Mock()
        user.is_authenticated = True
        user.organization = None  # No direct relationship
        user.has_active_membership_in.return_value = True
        org = Mock()

        request = create_mock_request(user=user, org=org)
        view = create_mock_view()

        assert permission.has_permission(request, view)

    def test_deprecated_permission_no_access(self):
        """Test deprecated permission denies access without relationship."""
        permission = OrganizationAccessPermission()
        user = Mock()
        user.is_authenticated = True
        user.organization = None
        user.has_active_membership_in.return_value = False
        org = Mock()

        request = create_mock_request(user=user, org=org)
        view = create_mock_view()

        assert not permission.has_permission(request, view)


@pytest.mark.django_db
@pytest.mark.integration
class TestPermissionIntegration:
    """Integration tests for permissions with actual model instances."""

    def test_real_membership_permissions(self):
        """Test permissions with real membership instances."""
        org = OrganizationFactory()
        owner_user = AccountFactory()
        admin_user = AccountFactory()
        member_user = AccountFactory()

        # Create real memberships
        owner_membership = OrganizationMembershipFactory(
            organization=org, user=owner_user, role="owner", status="active"
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org, user=admin_user, role="admin", status="active"
        )
        member_membership = OrganizationMembershipFactory(
            organization=org, user=member_user, role="member", status="active"
        )

        # Test IsOrgMember permission
        permission = IsOrgMember()
        view = create_mock_view()

        # Owner should have access
        request = create_mock_request(
            user=owner_user, org=org, membership=owner_membership
        )
        assert permission.has_permission(request, view)

        # Admin should have access
        request = create_mock_request(
            user=admin_user, org=org, membership=admin_membership
        )
        assert permission.has_permission(request, view)

        # Member should have access
        request = create_mock_request(
            user=member_user, org=org, membership=member_membership
        )
        assert permission.has_permission(request, view)

    def test_real_admin_permissions(self):
        """Test admin permissions with real membership instances."""
        org = OrganizationFactory()
        owner_user = AccountFactory()
        admin_user = AccountFactory()
        member_user = AccountFactory()

        owner_membership = OrganizationMembershipFactory(
            organization=org, user=owner_user, role="owner", status="active"
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org, user=admin_user, role="admin", status="active"
        )
        member_membership = OrganizationMembershipFactory(
            organization=org, user=member_user, role="member", status="active"
        )

        permission = IsOrgAdmin()
        view = create_mock_view()

        # Owner should have admin access
        request = create_mock_request(
            user=owner_user, org=org, membership=owner_membership
        )
        assert permission.has_permission(request, view)

        # Admin should have admin access
        request = create_mock_request(
            user=admin_user, org=org, membership=admin_membership
        )
        assert permission.has_permission(request, view)

        # Member should not have admin access
        request = create_mock_request(
            user=member_user, org=org, membership=member_membership
        )
        assert not permission.has_permission(request, view)

    def test_real_owner_permissions(self):
        """Test owner permissions with real membership instances."""
        org = OrganizationFactory()
        owner_user = AccountFactory()
        admin_user = AccountFactory()
        member_user = AccountFactory()

        owner_membership = OrganizationMembershipFactory(
            organization=org, user=owner_user, role="owner", status="active"
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org, user=admin_user, role="admin", status="active"
        )
        member_membership = OrganizationMembershipFactory(
            organization=org, user=member_user, role="member", status="active"
        )

        permission = IsOrgOwner()
        view = create_mock_view()

        # Owner should have owner access
        request = create_mock_request(
            user=owner_user, org=org, membership=owner_membership
        )
        assert permission.has_permission(request, view)

        # Admin should not have owner access
        request = create_mock_request(
            user=admin_user, org=org, membership=admin_membership
        )
        assert not permission.has_permission(request, view)

        # Member should not have owner access
        request = create_mock_request(
            user=member_user, org=org, membership=member_membership
        )
        assert not permission.has_permission(request, view)

    def test_suspended_membership_permissions(self):
        """Test permissions with suspended membership."""
        org = OrganizationFactory()
        user = AccountFactory()

        suspended_membership = OrganizationMembershipFactory(
            organization=org, user=user, role="admin", status="suspended"
        )

        permission = IsOrgMember()
        view = create_mock_view()

        # Suspended member should not have access
        request = create_mock_request(
            user=user, org=org, membership=suspended_membership
        )
        assert not permission.has_permission(request, view)
