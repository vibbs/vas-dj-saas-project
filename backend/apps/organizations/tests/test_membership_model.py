"""
Test cases for OrganizationMembership model.
"""

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.accounts.tests.factories import AccountFactory
from apps.organizations.models import OrganizationMembership
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
)


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationMembershipModel:
    """Test cases for OrganizationMembership model."""

    def test_create_membership(self):
        """Test creating a basic membership."""
        membership = OrganizationMembershipFactory()

        assert membership.organization
        assert membership.user
        assert membership.role == "member"
        assert membership.status == "active"
        assert membership.joined_at

    def test_owner_membership(self):
        """Test creating owner membership."""
        membership = OrganizationMembershipFactory(role="owner")

        assert membership.role == "owner"
        assert membership.is_owner()
        assert membership.is_admin()
        assert membership.can_manage_members()
        assert membership.can_manage_billing()

    def test_admin_membership(self):
        """Test creating admin membership."""
        membership = OrganizationMembershipFactory(role="admin")

        assert membership.role == "admin"
        assert not membership.is_owner()
        assert membership.is_admin()
        assert membership.can_manage_members()
        assert not membership.can_manage_billing()

    def test_member_membership(self):
        """Test creating member membership."""
        membership = OrganizationMembershipFactory(role="member")

        assert membership.role == "member"
        assert not membership.is_owner()
        assert not membership.is_admin()
        assert not membership.can_manage_members()
        assert not membership.can_manage_billing()

    def test_suspended_membership(self):
        """Test suspended membership."""
        membership = OrganizationMembershipFactory(status="suspended")

        assert membership.status == "suspended"
        assert not membership.is_active()
        assert not membership.is_owner()  # Suspended owners are not considered owners
        assert not membership.is_admin()  # Suspended admins are not considered admins

    def test_invited_membership(self):
        """Test invited membership."""
        membership = OrganizationMembershipFactory(status="invited")

        assert membership.status == "invited"
        assert not membership.is_active()

    def test_string_representation(self):
        """Test membership string representation."""
        user = AccountFactory(email="test@example.com")
        org = OrganizationFactory(name="Test Org")
        membership = OrganizationMembershipFactory(
            user=user, organization=org, role="admin"
        )

        str_repr = str(membership)
        assert "test@example.com" in str_repr
        assert "Test Org" in str_repr
        assert "admin" in str_repr

    def test_membership_uniqueness(self):
        """Test that user can have only one membership per organization."""
        org = OrganizationFactory()
        user = AccountFactory()

        OrganizationMembershipFactory(organization=org, user=user)

        with pytest.raises(IntegrityError):
            OrganizationMembershipFactory(organization=org, user=user)

    def test_activate_membership(self):
        """Test activating a membership."""
        membership = OrganizationMembershipFactory(status="invited")
        old_joined_at = membership.joined_at

        membership.activate()

        assert membership.status == "active"
        assert membership.joined_at > old_joined_at

    def test_suspend_member(self):
        """Test suspending a member."""
        membership = OrganizationMembershipFactory(role="member")

        membership.suspend()
        assert membership.status == "suspended"

    def test_suspend_admin(self):
        """Test suspending an admin."""
        membership = OrganizationMembershipFactory(role="admin")

        membership.suspend()
        assert membership.status == "suspended"

    def test_suspend_last_owner_fails(self):
        """Test that suspending the last owner fails."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role="owner")

        with pytest.raises(
            ValidationError, match="Cannot suspend the last active owner"
        ):
            owner.suspend()

    def test_suspend_owner_with_other_owner_succeeds(self):
        """Test that suspending owner with other owners succeeds."""
        org = OrganizationFactory()
        owner1 = OrganizationMembershipFactory(organization=org, role="owner")
        owner2 = OrganizationMembershipFactory(organization=org, role="owner")

        owner1.suspend()
        assert owner1.status == "suspended"

    def test_suspend_already_suspended_fails(self):
        """Test that suspending already suspended membership fails."""
        membership = OrganizationMembershipFactory(status="suspended")

        with pytest.raises(ValidationError, match="already suspended"):
            membership.suspend()

    def test_reactivate_suspended_membership(self):
        """Test reactivating a suspended membership."""
        membership = OrganizationMembershipFactory(status="suspended")
        old_joined_at = membership.joined_at

        membership.reactivate()

        assert membership.status == "active"
        assert membership.joined_at > old_joined_at

    def test_reactivate_non_suspended_fails(self):
        """Test that reactivating non-suspended membership fails."""
        membership = OrganizationMembershipFactory(status="active")

        with pytest.raises(ValidationError, match="Can only reactivate suspended"):
            membership.reactivate()

    def test_change_role_member_to_admin(self):
        """Test changing role from member to admin."""
        membership = OrganizationMembershipFactory(role="member")

        membership.change_role("admin")
        assert membership.role == "admin"

    def test_change_role_owner_to_admin_fails_if_last_owner(self):
        """Test changing last owner role fails."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role="owner")

        with pytest.raises(
            ValidationError, match="must have at least one active owner"
        ):
            owner.change_role("admin")

    def test_change_role_owner_to_admin_succeeds_with_other_owner(self):
        """Test changing owner role succeeds when other owners exist."""
        org = OrganizationFactory()
        owner1 = OrganizationMembershipFactory(organization=org, role="owner")
        owner2 = OrganizationMembershipFactory(organization=org, role="owner")

        owner1.change_role("admin")
        assert owner1.role == "admin"

    def test_change_role_invalid_role_fails(self):
        """Test changing to invalid role fails."""
        membership = OrganizationMembershipFactory(role="member")

        with pytest.raises(ValidationError, match="Invalid role"):
            membership.change_role("invalid_role")

    def test_change_role_same_role_no_op(self):
        """Test changing to same role is no-op."""
        membership = OrganizationMembershipFactory(role="member")

        membership.change_role("member")
        assert membership.role == "member"

    def test_get_permissions_member(self):
        """Test getting permissions for member."""
        membership = OrganizationMembershipFactory(role="member", status="active")
        permissions = membership.get_permissions()

        expected_permissions = ["view_organization", "view_members"]
        assert set(permissions) == set(expected_permissions)

    def test_get_permissions_admin(self):
        """Test getting permissions for admin."""
        membership = OrganizationMembershipFactory(role="admin", status="active")
        permissions = membership.get_permissions()

        expected_permissions = [
            "view_organization",
            "view_members",
            "manage_members",
            "invite_members",
        ]
        assert set(permissions) == set(expected_permissions)

    def test_get_permissions_owner(self):
        """Test getting permissions for owner."""
        membership = OrganizationMembershipFactory(role="owner", status="active")
        permissions = membership.get_permissions()

        expected_permissions = [
            "view_organization",
            "view_members",
            "manage_members",
            "invite_members",
            "manage_billing",
            "delete_organization",
            "manage_settings",
        ]
        assert set(permissions) == set(expected_permissions)

    def test_get_permissions_suspended_member(self):
        """Test getting permissions for suspended member."""
        membership = OrganizationMembershipFactory(role="member", status="suspended")
        permissions = membership.get_permissions()

        # Suspended members only get basic view permission
        expected_permissions = ["view_organization"]
        assert set(permissions) == set(expected_permissions)

    def test_clean_active_without_user_fails(self):
        """Test that active membership without user fails validation."""
        membership = OrganizationMembershipFactory.build(user=None, status="active")

        with pytest.raises(
            ValidationError, match="Active memberships must have a user"
        ):
            membership.clean()

    def test_clean_invited_without_user_succeeds(self):
        """Test that invited membership without user passes validation."""
        membership = OrganizationMembershipFactory.build(user=None, status="invited")

        # Should not raise
        membership.clean()

    def test_clean_status_transition_validation(self):
        """Test that invalid status transitions are prevented."""
        membership = OrganizationMembershipFactory(status="active")
        membership.status = "invited"

        with pytest.raises(
            ValidationError, match="Cannot change active membership back to invited"
        ):
            membership.clean()

    def test_clean_last_owner_role_change_fails(self):
        """Test that changing last owner role fails validation."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role="owner")
        owner.role = "admin"

        with pytest.raises(
            ValidationError, match="must have at least one active owner"
        ):
            owner.clean()

    def test_clean_last_owner_status_change_fails(self):
        """Test that changing last owner status fails validation."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role="owner")
        owner.status = "suspended"

        with pytest.raises(
            ValidationError, match="must have at least one active owner"
        ):
            owner.clean()


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationMembershipManager:
    """Test cases for OrganizationMembershipManager."""

    def test_active_filter(self):
        """Test active() manager method."""
        org = OrganizationFactory()

        active_membership = OrganizationMembershipFactory(
            organization=org, status="active"
        )
        suspended_membership = OrganizationMembershipFactory(
            organization=org, status="suspended"
        )
        invited_membership = OrganizationMembershipFactory(
            organization=org, status="invited"
        )

        active_memberships = OrganizationMembership.objects.active()

        assert active_membership in active_memberships
        assert suspended_membership not in active_memberships
        assert invited_membership not in active_memberships

    def test_for_user_filter(self):
        """Test for_user() manager method."""
        user1 = AccountFactory()
        user2 = AccountFactory()

        membership1 = OrganizationMembershipFactory(user=user1)
        membership2 = OrganizationMembershipFactory(user=user2)

        user1_memberships = OrganizationMembership.objects.for_user(user1)

        assert membership1 in user1_memberships
        assert membership2 not in user1_memberships

    def test_for_organization_filter(self):
        """Test for_organization() manager method."""
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()

        membership1 = OrganizationMembershipFactory(organization=org1)
        membership2 = OrganizationMembershipFactory(organization=org2)

        org1_memberships = OrganizationMembership.objects.for_organization(org1)

        assert membership1 in org1_memberships
        assert membership2 not in org1_memberships


@pytest.mark.django_db
@pytest.mark.integration
class TestMembershipBusinessLogic:
    """Integration tests for membership business logic."""

    def test_organization_with_multiple_members(self):
        """Test organization with multiple members of different roles."""
        org = OrganizationFactory()

        owner = OrganizationMembershipFactory(organization=org, role="owner")
        admin = OrganizationMembershipFactory(organization=org, role="admin")
        member1 = OrganizationMembershipFactory(organization=org, role="member")
        member2 = OrganizationMembershipFactory(organization=org, role="member")

        assert org.memberships.count() == 4
        assert org.memberships.filter(role="owner").count() == 1
        assert org.memberships.filter(role="admin").count() == 1
        assert org.memberships.filter(role="member").count() == 2

        # Test organization methods
        assert org.get_owner_membership() == owner
        assert org.get_owner() == owner.user

    def test_owner_transfer_scenario(self):
        """Test transferring ownership between users."""
        org = OrganizationFactory()

        old_owner = OrganizationMembershipFactory(organization=org, role="owner")
        new_owner = OrganizationMembershipFactory(organization=org, role="admin")

        # Transfer ownership
        old_owner.change_role("admin")
        new_owner.change_role("owner")

        assert old_owner.role == "admin"
        assert new_owner.role == "owner"
        assert org.get_owner() == new_owner.user

    def test_bulk_member_management(self):
        """Test managing multiple members at once."""
        org = OrganizationFactory()

        # Create owner and multiple members
        owner = OrganizationMembershipFactory(organization=org, role="owner")
        members = [
            OrganizationMembershipFactory(organization=org, role="member")
            for _ in range(5)
        ]

        # Suspend half the members
        for membership in members[:3]:
            membership.suspend()

        assert org.memberships.filter(status="active").count() == 3  # owner + 2 members
        assert org.memberships.filter(status="suspended").count() == 3

        # Reactivate suspended members
        for membership in members[:3]:
            membership.reactivate()

        assert (
            org.memberships.filter(status="active").count() == 6
        )  # all members + owner
        assert org.memberships.filter(status="suspended").count() == 0
