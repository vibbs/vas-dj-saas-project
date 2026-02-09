"""
Comprehensive tests for Invite Management API.

Tests cover:
- CRUD operations for invites
- Permission checks (admin-only operations)
- Invite acceptance flow
- Invite resending
- Email notifications
- Edge cases and error handling
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.organizations.models import Invite, OrganizationMembership
from apps.organizations.tests.factories import (
    AcceptedInviteFactory,
    AdminMembershipFactory,
    ExpiredInviteFactory,
    InviteFactory,
    OrganizationFactory,
    OwnerMembershipFactory,
    PendingInviteFactory,
)

pytestmark = pytest.mark.django_db


class TestInviteListAPI:
    """Test listing invites for an organization."""

    def test_admin_can_list_org_invites(self, api_client):
        """Test that admins can list all invites for their organization."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        # Create invites for the organization
        invite1 = PendingInviteFactory(organization=org)
        invite2 = PendingInviteFactory(organization=org)

        # Create invite for another org (should not appear)
        other_org = OrganizationFactory()
        InviteFactory(organization=other_org)

        api_client.force_authenticate(user=admin)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 2
        invite_ids = [invite["id"] for invite in response.data["data"]]
        assert str(invite1.id) in invite_ids
        assert str(invite2.id) in invite_ids

    def test_member_cannot_list_org_invites(self, api_client, user_with_org):
        """Test that regular members cannot list organization invites."""
        org = user_with_org.get_primary_organization()

        PendingInviteFactory(organization=org)
        PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        # Regular users can only see invites sent to their email
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 0

    def test_user_can_list_own_invites(self, api_client, user_with_org):
        """Test that users can list invites sent to their email."""
        org = user_with_org.get_primary_organization()

        # Create invite to user's email
        invite = PendingInviteFactory(organization=org, email=user_with_org.email)

        # Create invite to different email
        PendingInviteFactory(organization=org, email="other@example.com")

        api_client.force_authenticate(user=user_with_org)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 1
        assert response.data["data"][0]["id"] == str(invite.id)

    def test_non_member_cannot_list_invites(self, api_client):
        """Test that non-members cannot list organization invites."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        non_member = UserFactory()

        PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=non_member)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 0


class TestInviteCreateAPI:
    """Test creating invites."""

    def test_admin_can_create_invite(self, api_client):
        """Test that admins can create invites."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        api_client.force_authenticate(user=admin)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})

        data = {
            "email": "newuser@example.com",
            "role": "member",
            "message": "Welcome to our team!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newuser@example.com"
        assert response.data["role"] == "member"
        assert response.data["status"] == "pending"

        # Verify invite was created in database
        assert Invite.objects.filter(
            organization=org, email="newuser@example.com"
        ).exists()

    def test_owner_can_create_invite(self, api_client):
        """Test that owners can create invites."""
        org = OrganizationFactory()
        owner_membership = OwnerMembershipFactory(organization=org)
        owner = owner_membership.user

        api_client.force_authenticate(user=owner)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})

        data = {
            "email": "newuser@example.com",
            "role": "admin",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role"] == "admin"

    def test_member_cannot_create_invite(self, api_client, user_with_org):
        """Test that regular members cannot create invites."""
        org = user_with_org.get_primary_organization()

        api_client.force_authenticate(user=user_with_org)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})

        data = {
            "email": "newuser@example.com",
            "role": "member",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Only organization admins" in response.data["detail"]

    def test_cannot_invite_existing_member(self, api_client):
        """Test that you cannot invite someone who is already a member."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        # Create existing member
        from apps.accounts.tests.factories import UserFactory

        existing_member = UserFactory()
        OrganizationMembership.objects.create(
            organization=org, user=existing_member, role="member", status="active"
        )

        api_client.force_authenticate(user=admin)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})

        data = {
            "email": existing_member.email,
            "role": "member",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already has a membership" in str(response.data)

    def test_cannot_create_duplicate_pending_invite(self, api_client):
        """Test that you cannot create duplicate pending invites."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user

        # Create existing pending invite
        PendingInviteFactory(organization=org, email="test@example.com")

        api_client.force_authenticate(user=admin)
        url = reverse("organization-invites-list", kwargs={"organization_pk": org.id})

        data = {
            "email": "test@example.com",
            "role": "member",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "pending invite already exists" in str(response.data)


class TestInviteRetrieveAPI:
    """Test retrieving a specific invite."""

    def test_admin_can_retrieve_invite(self, api_client):
        """Test that admins can retrieve invite details."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        invite = PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-invites-detail",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(invite.id)
        assert response.data["email"] == invite.email

    def test_invited_user_can_retrieve_own_invite(self, api_client):
        """Test that invited users can retrieve their invite."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        user = UserFactory(email="invited@example.com")
        invite = PendingInviteFactory(organization=org, email=user.email)

        api_client.force_authenticate(user=user)
        url = reverse(
            "organization-invites-detail",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == user.email


class TestInviteRevokeAPI:
    """Test revoking invites."""

    def test_admin_can_revoke_invite(self, api_client):
        """Test that admins can revoke pending invites."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        invite = PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-invites-detail",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify invite was revoked (not deleted)
        invite.refresh_from_db()
        assert invite.status == "revoked"

    def test_member_cannot_revoke_invite(self, api_client, user_with_org):
        """Test that regular members cannot revoke invites."""
        org = user_with_org.get_primary_organization()
        invite = PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-invites-detail",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestInviteResendAPI:
    """Test resending invites."""

    def test_admin_can_resend_pending_invite(self, api_client):
        """Test that admins can resend pending invites."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        invite = PendingInviteFactory(organization=org)
        original_token = invite.token
        original_expires = invite.expires_at

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-invites-resend",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert "resent successfully" in response.data["message"]

        # Verify token was refreshed
        invite.refresh_from_db()
        assert invite.token != original_token
        assert invite.expires_at > original_expires

    def test_cannot_resend_accepted_invite(self, api_client):
        """Test that accepted invites cannot be resent."""
        org = OrganizationFactory()
        admin_membership = AdminMembershipFactory(organization=org)
        admin = admin_membership.user
        invite = AcceptedInviteFactory(organization=org)

        api_client.force_authenticate(user=admin)
        url = reverse(
            "organization-invites-resend",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_member_cannot_resend_invite(self, api_client, user_with_org):
        """Test that regular members cannot resend invites."""
        org = user_with_org.get_primary_organization()
        invite = PendingInviteFactory(organization=org)

        api_client.force_authenticate(user=user_with_org)
        url = reverse(
            "organization-invites-resend",
            kwargs={"organization_pk": org.id, "pk": invite.id},
        )
        response = api_client.post(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestInviteAcceptAPI:
    """Test accepting invites."""

    def test_user_can_accept_valid_invite(self, api_client):
        """Test that users can accept valid invites matching their email."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        user = UserFactory(email="invited@example.com")
        invite = PendingInviteFactory(organization=org, email=user.email, role="admin")

        api_client.force_authenticate(user=user)
        url = reverse("invite-accept")

        data = {"token": invite.token}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "accepted successfully" in response.data["message"]

        # Verify membership was created
        assert OrganizationMembership.objects.filter(
            organization=org, user=user, role="admin", status="active"
        ).exists()

        # Verify invite was marked as accepted
        invite.refresh_from_db()
        assert invite.status == "accepted"
        assert invite.accepted_by == user

    def test_cannot_accept_expired_invite(self, api_client):
        """Test that expired invites cannot be accepted."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        user = UserFactory(email="invited@example.com")
        invite = ExpiredInviteFactory(organization=org, email=user.email)

        api_client.force_authenticate(user=user)
        url = reverse("invite-accept")

        data = {"token": invite.token}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "expired" in str(response.data).lower()

    def test_cannot_accept_invite_with_wrong_email(self, api_client):
        """Test that users cannot accept invites sent to different email."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        user = UserFactory(email="user@example.com")
        invite = PendingInviteFactory(organization=org, email="different@example.com")

        api_client.force_authenticate(user=user)
        url = reverse("invite-accept")

        data = {"token": invite.token}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "does not match" in str(response.data).lower()

    def test_cannot_accept_invalid_token(self, api_client):
        """Test that invalid tokens are rejected."""
        from apps.accounts.tests.factories import UserFactory

        user = UserFactory()

        api_client.force_authenticate(user=user)
        url = reverse("invite-accept")

        data = {"token": "invalid-token-12345"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_accept_already_accepted_invite(self, api_client):
        """Test that already accepted invites cannot be accepted again."""
        from apps.accounts.tests.factories import UserFactory

        org = OrganizationFactory()
        user = UserFactory(email="invited@example.com")
        invite = AcceptedInviteFactory(organization=org, email=user.email)

        api_client.force_authenticate(user=user)
        url = reverse("invite-accept")

        data = {"token": invite.token}
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
