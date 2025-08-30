"""
Test cases for Invite model.
"""

import pytest
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from freezegun import freeze_time

from apps.organizations.models import Invite, OrganizationMembership
from apps.organizations.tests.factories import OrganizationFactory, InviteFactory
from apps.accounts.tests.factories import AccountFactory


@pytest.mark.django_db
@pytest.mark.unit
class TestInviteModel:
    """Test cases for Invite model."""

    def test_create_invite(self):
        """Test creating a basic invite."""
        invite = InviteFactory()
        
        assert invite.organization
        assert invite.email
        assert invite.role == 'member'
        assert invite.status == 'pending'
        assert invite.token
        assert invite.expires_at
        assert invite.invited_by

    def test_invite_token_generation(self):
        """Test that invite tokens are generated automatically."""
        invite = InviteFactory(token='')
        assert invite.token
        assert len(invite.token) > 20  # urlsafe tokens are typically longer

    def test_invite_token_uniqueness(self):
        """Test that invite tokens are unique."""
        invite1 = InviteFactory()
        invite2 = InviteFactory()
        assert invite1.token != invite2.token

    def test_invite_expires_at_default(self):
        """Test that expires_at is set to 7 days from now by default."""
        with freeze_time("2024-01-01 12:00:00"):
            invite = InviteFactory(expires_at=None)
            expected_expiry = timezone.now() + timedelta(days=7)
            assert invite.expires_at == expected_expiry

    def test_string_representation(self):
        """Test invite string representation."""
        invite = InviteFactory(
            email="test@example.com",
            status="pending"
        )
        assert "test@example.com" in str(invite)
        assert invite.organization.name in str(invite)
        assert "pending" in str(invite)

    def test_is_valid_pending_not_expired(self):
        """Test is_valid returns True for pending, non-expired invites."""
        future_time = timezone.now() + timedelta(days=1)
        invite = InviteFactory(
            status='pending',
            expires_at=future_time
        )
        assert invite.is_valid()

    def test_is_valid_accepted_invite(self):
        """Test is_valid returns False for accepted invites."""
        future_time = timezone.now() + timedelta(days=1)
        invite = InviteFactory(
            status='accepted',
            expires_at=future_time
        )
        assert not invite.is_valid()

    def test_is_valid_expired_invite(self):
        """Test is_valid returns False for expired invites."""
        past_time = timezone.now() - timedelta(days=1)
        invite = InviteFactory(
            status='pending',
            expires_at=past_time
        )
        assert not invite.is_valid()

    def test_is_expired(self):
        """Test is_expired method."""
        past_time = timezone.now() - timedelta(days=1)
        future_time = timezone.now() + timedelta(days=1)
        
        expired_invite = InviteFactory(expires_at=past_time)
        valid_invite = InviteFactory(expires_at=future_time)
        
        assert expired_invite.is_expired()
        assert not valid_invite.is_expired()

    def test_accept_valid_invite(self):
        """Test accepting a valid invite creates membership."""
        org = OrganizationFactory()
        user = AccountFactory()
        invite = InviteFactory(
            organization=org,
            email=user.email,
            role='admin',
            status='pending',
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        membership = invite.accept(user)
        
        assert membership.organization == org
        assert membership.user == user
        assert membership.role == 'admin'
        assert membership.status == 'active'
        assert membership.invited_by == invite.invited_by
        
        invite.refresh_from_db()
        assert invite.status == 'accepted'
        assert invite.accepted_by == user
        assert invite.accepted_at

    def test_accept_expired_invite(self):
        """Test accepting expired invite raises error."""
        user = AccountFactory()
        invite = InviteFactory(
            email=user.email,
            status='pending',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        with pytest.raises(ValidationError, match="This invite has expired"):
            invite.accept(user)

    def test_accept_non_pending_invite(self):
        """Test accepting non-pending invite raises error."""
        user = AccountFactory()
        invite = InviteFactory(
            email=user.email,
            status='revoked',
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        with pytest.raises(ValidationError, match="This invite is no longer valid"):
            invite.accept(user)

    def test_accept_wrong_email(self):
        """Test accepting invite with wrong email raises error."""
        user = AccountFactory(email="user@example.com")
        invite = InviteFactory(
            email="different@example.com",
            status='pending',
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        with pytest.raises(ValidationError, match="Invite email does not match"):
            invite.accept(user)

    def test_accept_existing_membership(self):
        """Test accepting invite when user already has membership."""
        org = OrganizationFactory()
        user = AccountFactory()
        
        # Create invite first (before membership exists)
        invite = InviteFactory(
            organization=org,
            email=user.email,
            status='pending',
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        # Then create existing membership
        OrganizationMembership.objects.create(
            organization=org,
            user=user,
            role='member',
            status='active'
        )
        
        with pytest.raises(ValidationError, match="already has a membership"):
            invite.accept(user)

    def test_revoke_pending_invite(self):
        """Test revoking a pending invite."""
        invite = InviteFactory(status='pending')
        invite.revoke()
        
        assert invite.status == 'revoked'

    def test_revoke_non_pending_invite(self):
        """Test revoking non-pending invite raises error."""
        invite = InviteFactory(status='accepted')
        
        with pytest.raises(ValidationError, match="Can only revoke pending invites"):
            invite.revoke()

    def test_resend_pending_invite(self):
        """Test resending a pending invite."""
        old_token = "old_token"
        
        with freeze_time("2024-01-01 12:00:00"):
            old_expires = timezone.now() + timedelta(days=1)
            
            invite = InviteFactory(
                status='pending',
                token=old_token,
                expires_at=old_expires
            )
            
            new_token = invite.resend()
        
        assert new_token != old_token
        assert invite.token == new_token
        assert invite.expires_at > old_expires

    def test_resend_non_pending_invite(self):
        """Test resending non-pending invite raises error."""
        invite = InviteFactory(status='accepted')
        
        with pytest.raises(ValidationError, match="Can only resend pending invites"):
            invite.resend()

    def test_resend_expired_invite(self):
        """Test resending expired invite marks it expired and raises error."""
        invite = InviteFactory(
            status='pending',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        with pytest.raises(ValidationError, match="Cannot resend expired invite"):
            invite.resend()
        
        invite.refresh_from_db()
        assert invite.status == 'expired'

    def test_mark_expired(self):
        """Test marking invite as expired."""
        invite = InviteFactory(
            status='pending',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        invite.mark_expired()
        assert invite.status == 'expired'

    def test_mark_expired_not_expired(self):
        """Test marking non-expired invite doesn't change status."""
        invite = InviteFactory(
            status='pending',
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        invite.mark_expired()
        assert invite.status == 'pending'

    def test_get_accept_url(self):
        """Test getting accept URL."""
        invite = InviteFactory(token="test_token")
        url = invite.get_accept_url()
        
        assert "test_token" in url
        assert "/invite/" in url

    def test_duplicate_pending_invites_not_allowed(self):
        """Test that duplicate pending invites for same org/email are not allowed."""
        org = OrganizationFactory()
        email = "test@example.com"
        
        InviteFactory(
            organization=org,
            email=email,
            status='pending'
        )
        
        with pytest.raises(ValidationError, match="already exists"):
            invite = InviteFactory.build(
                organization=org,
                email=email,
                status='pending'
            )
            invite.full_clean()

    def test_different_status_invites_allowed(self):
        """Test that invites with different status for same org/email are allowed."""
        org = OrganizationFactory()
        email = "test@example.com"
        
        # Create accepted invite
        InviteFactory(
            organization=org,
            email=email,
            status='accepted'
        )
        
        # Should be able to create new pending invite
        new_invite = InviteFactory(
            organization=org,
            email=email,
            status='pending'
        )
        assert new_invite.status == 'pending'

    def test_invalid_email_validation(self):
        """Test that invalid emails are rejected."""
        invite = InviteFactory.build(email="invalid-email")
        
        with pytest.raises(ValidationError):
            invite.clean()

    def test_past_expiry_date_allowed_for_testing(self):
        """Test that past expiry dates are allowed (for testing scenarios)."""
        past_time = timezone.now() - timedelta(days=1)
        invite = InviteFactory.build(expires_at=past_time)
        
        # Should not raise - we allow past expiry dates for testing
        invite.clean()
        assert invite.expires_at == past_time

    def test_invalid_role_validation(self):
        """Test that invalid roles are rejected."""
        invite = InviteFactory.build(role='invalid_role')
        
        with pytest.raises(ValidationError, match="Invalid role specified"):
            invite.clean()

    def test_user_already_member_validation(self):
        """Test validation when user already has membership."""
        org = OrganizationFactory()
        user = AccountFactory()
        
        # Create existing membership
        OrganizationMembership.objects.create(
            organization=org,
            user=user,
            role='member',
            status='active'
        )
        
        invite = InviteFactory.build(
            organization=org,
            email=user.email,
            status='pending'
        )
        
        with pytest.raises(ValidationError, match="already has a membership"):
            invite.clean()


@pytest.mark.django_db
@pytest.mark.unit
class TestInviteManager:
    """Test cases for InviteManager."""

    def test_pending_filter(self):
        """Test pending() manager method."""
        org = OrganizationFactory()
        
        pending_invite = InviteFactory(organization=org, status='pending')
        accepted_invite = InviteFactory(organization=org, status='accepted')
        revoked_invite = InviteFactory(organization=org, status='revoked')
        
        pending_invites = Invite.objects.pending()
        
        assert pending_invite in pending_invites
        assert accepted_invite not in pending_invites
        assert revoked_invite not in pending_invites

    def test_valid_filter(self):
        """Test valid() manager method."""
        org = OrganizationFactory()
        future_time = timezone.now() + timedelta(days=1)
        past_time = timezone.now() - timedelta(days=1)
        
        valid_invite = InviteFactory(
            organization=org,
            status='pending',
            expires_at=future_time
        )
        expired_invite = InviteFactory(
            organization=org,
            status='pending',
            expires_at=past_time
        )
        accepted_invite = InviteFactory(
            organization=org,
            status='accepted',
            expires_at=future_time
        )
        
        valid_invites = Invite.objects.valid()
        
        assert valid_invite in valid_invites
        assert expired_invite not in valid_invites
        assert accepted_invite not in valid_invites

    def test_for_email_filter(self):
        """Test for_email() manager method."""
        email = "test@example.com"
        other_email = "other@example.com"
        
        matching_invite = InviteFactory(email=email)
        non_matching_invite = InviteFactory(email=other_email)
        
        email_invites = Invite.objects.for_email(email)
        
        assert matching_invite in email_invites
        assert non_matching_invite not in email_invites

    def test_for_email_case_insensitive(self):
        """Test for_email() is case insensitive."""
        email = "Test@Example.com"
        
        invite = InviteFactory(email=email)
        
        # Should find invite regardless of case
        email_invites = Invite.objects.for_email("test@example.com")
        assert invite in email_invites
        
        email_invites = Invite.objects.for_email("TEST@EXAMPLE.COM")
        assert invite in email_invites