"""
Integration tests for multi-app interactions.
"""

import pytest

from apps.accounts.tests.factories import AccountFactory
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
)


@pytest.mark.django_db
@pytest.mark.integration
class TestUserOrganizationIntegration:
    """Test integration between users and organizations."""

    def test_user_organization_creation_flow(self):
        """Test complete user and organization creation flow."""
        # Create user
        user = AccountFactory()

        # Create organization
        org = OrganizationFactory(created_by=user)

        # Create membership
        membership = OrganizationMembershipFactory(
            organization=org, user=user, role="owner", status="active"
        )

        # Verify relationships
        assert user.get_primary_organization() == org
        assert user.is_owner_of(org)
        assert org.get_owner() == user
        assert membership.is_owner()

    def test_multi_tenant_data_isolation(self):
        """Test that data is properly isolated between organizations."""
        # Create two organizations with users
        org1 = OrganizationFactory(name="Organization 1")
        org2 = OrganizationFactory(name="Organization 2")

        user1 = AccountFactory(organization=org1)
        user2 = AccountFactory(organization=org2)

        # Create memberships
        OrganizationMembershipFactory(organization=org1, user=user1, role="owner")
        OrganizationMembershipFactory(organization=org2, user=user2, role="owner")

        # Verify isolation
        assert user1.get_primary_organization() == org1
        assert user2.get_primary_organization() == org2
        assert not user1.has_active_membership_in(org2)
        assert not user2.has_active_membership_in(org1)

    def test_user_multiple_organizations(self):
        """Test user belonging to multiple organizations."""
        user = AccountFactory()
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()

        # Create memberships in both organizations
        membership1 = OrganizationMembershipFactory(
            organization=org1, user=user, role="admin", status="active"
        )
        membership2 = OrganizationMembershipFactory(
            organization=org2, user=user, role="member", status="active"
        )

        # Verify user is member of both
        assert user.has_active_membership_in(org1)
        assert user.has_active_membership_in(org2)
        assert user.is_admin_of(org1)
        assert not user.is_admin_of(org2)

        organizations = user.get_organizations()
        assert len(organizations) == 2
        assert org1 in organizations
        assert org2 in organizations

    def test_organization_member_hierarchy(self):
        """Test organization member hierarchy and permissions."""
        org = OrganizationFactory()

        owner = AccountFactory()
        admin = AccountFactory()
        member = AccountFactory()

        # Create hierarchical memberships
        owner_membership = OrganizationMembershipFactory(
            organization=org, user=owner, role="owner", status="active"
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org, user=admin, role="admin", status="active"
        )
        member_membership = OrganizationMembershipFactory(
            organization=org, user=member, role="member", status="active"
        )

        # Test hierarchy
        assert owner.is_owner_of(org)
        assert owner.is_admin_of(org)
        assert owner.can_manage_members_in(org)
        assert owner.can_manage_billing_in(org)

        assert not admin.is_owner_of(org)
        assert admin.is_admin_of(org)
        assert admin.can_manage_members_in(org)
        assert admin.can_manage_billing_in(org)

        assert not member.is_owner_of(org)
        assert not member.is_admin_of(org)
        assert not member.can_manage_members_in(org)
        assert not member.can_manage_billing_in(org)

    def test_organization_ownership_transfer(self):
        """Test transferring organization ownership."""
        org = OrganizationFactory()

        current_owner = AccountFactory()
        new_owner = AccountFactory()

        # Create initial owner
        owner_membership = OrganizationMembershipFactory(
            organization=org, user=current_owner, role="owner", status="active"
        )

        # Create new owner as member first
        new_owner_membership = OrganizationMembershipFactory(
            organization=org, user=new_owner, role="member", status="active"
        )

        # Transfer ownership
        owner_membership.role = "admin"
        owner_membership.save()

        new_owner_membership.role = "owner"
        new_owner_membership.save()

        # Verify transfer
        assert not current_owner.is_owner_of(org)
        assert current_owner.is_admin_of(org)
        assert new_owner.is_owner_of(org)
        assert org.get_owner() == new_owner


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.slow
class TestTenantAwareQueries:
    """Test tenant-aware database queries."""

    def test_tenant_scoped_queries(self):
        """Test that queries are properly scoped to organizations."""
        # Create multiple organizations with data
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()

        # Create users in each organization
        user1 = AccountFactory(organization=org1)
        user2 = AccountFactory(organization=org2)

        OrganizationMembershipFactory(organization=org1, user=user1)
        OrganizationMembershipFactory(organization=org2, user=user2)

        # Test organization-specific queries
        org1_members = org1.memberships.all()
        org2_members = org2.memberships.all()

        assert org1_members.count() == 1
        assert org2_members.count() == 1
        assert org1_members.first().user == user1
        assert org2_members.first().user == user2

    def test_bulk_operations_tenant_isolation(self):
        """Test that bulk operations respect tenant boundaries."""
        org1 = OrganizationFactory()
        org2 = OrganizationFactory()

        # Create multiple users in each org
        users_org1 = [AccountFactory(organization=org1) for _ in range(3)]
        users_org2 = [AccountFactory(organization=org2) for _ in range(3)]

        # Create memberships
        for user in users_org1:
            OrganizationMembershipFactory(organization=org1, user=user)

        for user in users_org2:
            OrganizationMembershipFactory(organization=org2, user=user)

        # Test bulk updates are scoped
        org1.memberships.update(role="admin")

        # Verify only org1 memberships were updated
        assert all(m.role == "admin" for m in org1.memberships.all())
        assert all(m.role == "member" for m in org2.memberships.all())
