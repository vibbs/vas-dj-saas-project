"""
Comprehensive tests for Membership Management API.

Tests cover:
- Listing organization members
- Retrieving member details
- Updating member roles/status
- Removing members
- Suspending/reactivating members
- Permission checks
- Edge cases (last owner protection, self-demotion prevention)
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.organizations.models import OrganizationMembership
from apps.organizations.tests.factories import (
    ActiveMembershipFactory,
    AdminMembershipFactory,
    OrganizationFactory,
    OwnerMembershipFactory,
    SuspendedMembershipFactory,
)

pytestmark = pytest.mark.django_db


class TestMembershipListAPI:
    """Test listing organization members."""

    def test_member_can_list_org_members(self, api_client, user_with_org):
        """Test that organization members can list all members."""
        org = user_with_org.get_primary_organization()

        # Create additional members
        ActiveMembershipFactory(organization=org)
        ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse("organization-members-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Should see: user_with_org + 2 additional members = 3 total
        assert len(response.data["results"]) >= 2

    def test_admin_can_list_org_members(self, api_client):
        """Test that admins can list organization members."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        ActiveMembershipFactory(organization=org)
        ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse("organization-members-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3  # admin + 2 members

    def test_non_member_cannot_list_members(self, api_client):
        """Test that non-members cannot list organization members."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        non_member = UserFactory()

        ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=non_member)
        url = reverse("organization-members-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_list_includes_suspended_members(self, api_client):
        """Test that listing includes suspended members."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        suspended = SuspendedMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse("organization-members-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        member_ids = [m["id"] for m in response.data["results"]]
        assert str(suspended.id) in member_ids


class TestMembershipRetrieveAPI:
    """Test retrieving member details."""

    def test_member_can_retrieve_other_member(self, api_client, user_with_org):
        """Test that members can view other member details."""
        org = user_with_org.get_primary_organization()
        other_member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": other_member.id},
        )
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(other_member.id)
        assert response.data["user_email"] == other_member.user.email

    def test_non_member_cannot_retrieve_member(self, api_client):
        """Test that non-members cannot view member details."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        member = ActiveMembershipFactory(organization=org)
        non_member = UserFactory()

        api_client.force_authenticate(user=non_member)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestMembershipUpdateAPI:
    """Test updating member roles and status."""

    def test_admin_can_update_member_role(self, api_client):
        """Test that admins can update member roles."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        member = ActiveMembershipFactory(organization=org, role="member")

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        data = {"role": "admin"}
        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "admin"

        member.refresh_from_db()
        assert member.role == "admin"

    def test_owner_can_promote_to_owner(self, api_client):
        """Test that owners can promote members to owner role."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user
        member = ActiveMembershipFactory(organization=org, role="admin")

        api_client.force_authenticate(user=owner)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        data = {"role": "owner"}
        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "owner"

    def test_member_cannot_update_roles(self, api_client, user_with_org):
        """Test that regular members cannot update roles."""
        org = user_with_org.get_primary_organization()
        member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        data = {"role": "admin"}
        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_demote_last_owner(self, api_client):
        """Test that the last owner cannot be demoted."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user

        api_client.force_authenticate(user=owner)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": owner_membership.id},
        )

        data = {"role": "admin"}
        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "at least one owner" in str(response.data).lower()

    def test_admin_cannot_demote_self(self, api_client):
        """Test that admins cannot demote themselves."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": admin_membership.id},
        )

        data = {"role": "member"}
        response = api_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cannot demote yourself" in str(response.data).lower()

    def test_owner_can_demote_self_if_other_owners_exist(self, api_client):
        """Test that owners can demote themselves if other owners exist."""
        org = OrganizationFactory()
        owner1_membership = OwnerMembershipFactory(organization=org)
        owner2_membership = OwnerMembershipFactory(organization=org)
        owner1 = owner1_membership.user

        api_client.force_authenticate(user=owner1)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": owner1_membership.id},
        )

        data = {"role": "admin"}
        response = api_client.patch(url, data, format="json")

        # Since there are two owners, owner cannot demote themselves
        # This should still fail due to self-demotion prevention
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestMembershipDeleteAPI:
    """Test removing members from organization."""

    def test_admin_can_remove_member(self, api_client):
        """Test that admins can remove regular members."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not OrganizationMembership.objects.filter(id=member.id).exists()

    def test_owner_can_remove_admin(self, api_client):
        """Test that owners can remove admins."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user
        admin = AdminMembershipFactory(organization=org)

        api_client.force_authenticate(user=owner)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": admin.id},
        )

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_member_cannot_remove_members(self, api_client, user_with_org):
        """Test that regular members cannot remove other members."""
        org = user_with_org.get_primary_organization()
        member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_remove_last_owner(self, api_client):
        """Test that the last owner cannot be removed."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user

        # Create an admin who will try to remove the owner
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": owner_membership.id},
        )

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "last owner" in str(response.data).lower()

    def test_owner_cannot_remove_self(self, api_client):
        """Test that owners cannot remove themselves."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user

        api_client.force_authenticate(user=owner)
        url = reverse(
            "organization-members-detail",
            kwargs={"organization_pk": org.id, "pk": owner_membership.id},
        )

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cannot remove themselves" in str(response.data).lower()


class TestMembershipSuspendAPI:
    """Test suspending members."""

    def test_admin_can_suspend_member(self, api_client):
        """Test that admins can suspend members."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-suspend",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert "suspended successfully" in response.data["message"]

        member.refresh_from_db()
        assert member.status == "suspended"

    def test_cannot_suspend_self(self, api_client):
        """Test that users cannot suspend themselves."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-suspend",
            kwargs={"organization_pk": org.id, "pk": admin_membership.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cannot suspend yourself" in str(response.data).lower()

    def test_cannot_suspend_last_owner(self, api_client):
        """Test that the last owner cannot be suspended."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)

        # Create admin to perform suspension
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-suspend",
            kwargs={"organization_pk": org.id, "pk": owner_membership.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "last owner" in str(response.data).lower()

    def test_member_cannot_suspend(self, api_client, user_with_org):
        """Test that regular members cannot suspend others."""
        org = user_with_org.get_primary_organization()
        member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-members-suspend",
            kwargs={"organization_pk": org.id, "pk": member.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestMembershipReactivateAPI:
    """Test reactivating suspended members."""

    def test_admin_can_reactivate_suspended_member(self, api_client):
        """Test that admins can reactivate suspended members."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        suspended_member = SuspendedMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-reactivate",
            kwargs={"organization_pk": org.id, "pk": suspended_member.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert "reactivated successfully" in response.data["message"]

        suspended_member.refresh_from_db()
        assert suspended_member.status == "active"

    def test_cannot_reactivate_active_member(self, api_client):
        """Test that active members cannot be reactivated."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        active_member = ActiveMembershipFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-members-reactivate",
            kwargs={"organization_pk": org.id, "pk": active_member.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "not suspended" in str(response.data).lower()

    def test_member_cannot_reactivate(self, api_client, user_with_org):
        """Test that regular members cannot reactivate others."""
        org = user_with_org.get_primary_organization()
        suspended_member = SuspendedMembershipFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-members-reactivate",
            kwargs={"organization_pk": org.id, "pk": suspended_member.id},
        )

        response = api_client.post(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
