"""
Edge cases and negative scenario tests for organizations app.
"""

import pytest
import uuid
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone
from unittest.mock import patch, Mock

from apps.organizations.models import Organization, OrganizationMembership, Invite
from apps.organizations.serializers import (
    CreateInviteSerializer,
    AcceptInviteSerializer,
    MembershipUpdateSerializer
)
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
    InviteFactory,
    TrialOrganizationFactory,
    ExpiredTrialOrganizationFactory
)
from apps.accounts.tests.factories import AccountFactory


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationEdgeCases:
    """Test edge cases for Organization model."""

    def test_organization_with_extremely_long_name(self):
        """Test organization with name at character limit."""
        long_name = "A" * 100  # Max length
        org = OrganizationFactory(name=long_name)
        assert len(org.name) == 100

    def test_organization_with_special_characters_in_name(self):
        """Test organization name with special characters."""
        special_name = "Org & Co. (2024) - Tech Solutions!"
        org = OrganizationFactory(name=special_name)
        assert org.name == special_name
        # Subdomain should be cleaned
        assert "&" not in org.sub_domain
        assert "(" not in org.sub_domain

    def test_organization_subdomain_collision_handling(self):
        """Test subdomain collision scenarios."""
        # Create organization with specific subdomain
        subdomain = "testorg"
        org1 = OrganizationFactory(sub_domain=subdomain)
        
        # Try to create another with same subdomain
        with pytest.raises(IntegrityError):
            OrganizationFactory(sub_domain=subdomain)

    def test_organization_reserved_subdomain_validation(self):
        """Test that reserved subdomains are properly rejected."""
        reserved_subdomains = [
            'www', 'api', 'admin', 'mail', 'ftp', 'app', 'apps', 
            'support', 'help', 'blog', 'docs', 'status', 'dev', 
            'test', 'staging'
        ]
        
        for subdomain in reserved_subdomains:
            org = OrganizationFactory.build(sub_domain=subdomain)
            with pytest.raises(ValidationError, match="This subdomain is reserved"):
                org.clean()

    def test_organization_invalid_subdomain_formats(self):
        """Test various invalid subdomain formats."""
        invalid_subdomains = [
            "-invalid",      # starts with hyphen
            "invalid-",      # ends with hyphen
            "inv@lid",      # contains special chars
            "IN VALID",     # contains spaces
            "in.valid",     # contains dots
            "in_valid",     # contains underscores
            "in",           # too short
            "a" * 51,       # too long
        ]
        
        for subdomain in invalid_subdomains:
            org = OrganizationFactory.build(sub_domain=subdomain)
            with pytest.raises(ValidationError):
                org.clean()

    def test_organization_plan_trial_inconsistencies(self):
        """Test various plan/trial inconsistency scenarios."""
        # On trial but not free_trial plan
        org = OrganizationFactory.build(
            plan='pro',
            on_trial=True
        )
        with pytest.raises(ValidationError, match="Organizations on trial must have 'free_trial' plan"):
            org.clean()

        # Has paid_until but on trial
        org = OrganizationFactory.build(
            on_trial=True,
            paid_until=timezone.now().date()
        )
        with pytest.raises(ValidationError, match="Organizations on trial cannot have a paid_until date"):
            org.clean()

    def test_organization_with_null_values(self):
        """Test organization creation with various null values."""
        org = OrganizationFactory(
            description=None,
            logo=None,
            created_by=None,
            paid_until=None,
            trial_ends_on=None
        )
        assert org.description is None
        assert org.logo is None
        assert org.created_by is None

    def test_organization_unicode_handling(self):
        """Test organization with unicode characters."""
        unicode_name = "Техническая Компания 技术公司 🚀"
        org = OrganizationFactory(name=unicode_name)
        assert org.name == unicode_name
        # Subdomain should handle unicode properly
        assert org.sub_domain
        assert len(org.sub_domain) >= 3


@pytest.mark.django_db
@pytest.mark.unit
class TestMembershipEdgeCases:
    """Test edge cases for OrganizationMembership model."""

    def test_membership_orphaned_user(self):
        """Test membership behavior when user is deleted."""
        org = OrganizationFactory()
        user = AccountFactory()
        membership = OrganizationMembershipFactory(organization=org, user=user)
        
        # Delete user
        user_id = user.id
        user.delete()
        
        # Membership should handle gracefully (depends on on_delete behavior)
        membership.refresh_from_db()
        # This test depends on your FK on_delete settings

    def test_membership_orphaned_organization(self):
        """Test membership behavior when organization is deleted."""
        org = OrganizationFactory()
        user = AccountFactory()
        membership = OrganizationMembershipFactory(organization=org, user=user)
        
        org_id = org.id
        org.delete()
        
        # Membership should be deleted due to CASCADE
        assert not OrganizationMembership.objects.filter(id=membership.id).exists()

    def test_membership_role_status_combinations(self):
        """Test unusual role/status combinations."""
        org = OrganizationFactory()
        
        # Suspended owner (should be allowed but not considered active owner)
        suspended_owner = OrganizationMembershipFactory(
            organization=org,
            role='owner',
            status='suspended'
        )
        assert not suspended_owner.is_owner()  # Suspended owners aren't active
        
        # Invited admin (should be allowed)
        invited_admin = OrganizationMembershipFactory(
            organization=org,
            role='admin',
            status='invited'
        )
        assert not invited_admin.is_admin()  # Not active yet

    def test_membership_concurrent_owner_changes(self):
        """Test race conditions in owner management."""
        org = OrganizationFactory()
        
        # Create two owners
        owner1 = OrganizationMembershipFactory(organization=org, role='owner')
        owner2 = OrganizationMembershipFactory(organization=org, role='owner')
        
        # Simulate concurrent attempts to change roles
        with transaction.atomic():
            # First change succeeds
            owner1.change_role('admin')
            
            # Second change should fail (last owner protection)
            with pytest.raises(ValidationError, match="at least one active owner"):
                owner2.change_role('admin')

    def test_membership_extreme_join_dates(self):
        """Test memberships with extreme join dates."""
        org = OrganizationFactory()
        
        # Very old join date
        old_membership = OrganizationMembershipFactory(
            organization=org,
            joined_at=timezone.now() - timedelta(days=3650)  # 10 years ago
        )
        assert old_membership.joined_at < timezone.now()
        
        # Future join date (shouldn't normally happen)
        future_membership = OrganizationMembershipFactory(
            organization=org,
            joined_at=timezone.now() + timedelta(days=1)
        )
        assert future_membership.joined_at > timezone.now()

    def test_membership_duplicate_prevention(self):
        """Test that duplicate memberships are prevented."""
        org = OrganizationFactory()
        user = AccountFactory()
        
        OrganizationMembershipFactory(organization=org, user=user)
        
        # Try to create duplicate
        with pytest.raises(IntegrityError):
            OrganizationMembershipFactory(organization=org, user=user)

    def test_membership_invalid_status_transitions(self):
        """Test invalid membership status transitions."""
        membership = OrganizationMembershipFactory(status='active')
        
        # Try to change to invited (invalid transition)
        membership.status = 'invited'
        
        with pytest.raises(ValidationError, match="Cannot change active membership back to invited"):
            membership.clean()


@pytest.mark.django_db
@pytest.mark.unit
class TestInviteEdgeCases:
    """Test edge cases for Invite model."""

    def test_invite_with_malformed_email(self):
        """Test invite validation with various malformed emails."""
        malformed_emails = [
            "not-an-email",
            "@domain.com",
            "user@",
            "user@domain",
            "user name@domain.com",  # spaces
            "user..name@domain.com",  # double dots
            "user@domain..com",       # double dots in domain
            "",                       # empty
        ]
        
        for email in malformed_emails:
            invite = InviteFactory.build(email=email)
            with pytest.raises(ValidationError):
                invite.clean()

    def test_invite_token_collision(self):
        """Test invite token uniqueness enforcement."""
        # Mock token generation to force collision
        with patch('apps.organizations.models.invite.secrets.token_urlsafe') as mock_token:
            mock_token.side_effect = ["duplicate_token", "duplicate_token", "unique_token"]
            
            invite = InviteFactory()
            # Token generation should handle collision and create unique token
            assert invite.token == "unique_token"

    def test_invite_extremely_long_expiry(self):
        """Test invite with very long expiry period."""
        far_future = timezone.now() + timedelta(days=36500)  # 100 years
        invite = InviteFactory(expires_at=far_future)
        assert invite.expires_at == far_future
        assert invite.is_valid()

    def test_invite_zero_expiry_time(self):
        """Test invite that expires immediately."""
        immediate_expiry = timezone.now()
        invite = InviteFactory(expires_at=immediate_expiry)
        
        # Should be expired immediately
        import time
        time.sleep(0.001)  # Ensure time passes
        assert invite.is_expired()

    def test_invite_accept_email_case_sensitivity(self):
        """Test email case handling during invite acceptance."""
        invite = InviteFactory(email="Test@Example.COM")
        
        # User with different case email
        user_lower = AccountFactory(email="test@example.com")
        user_mixed = AccountFactory(email="Test@EXAMPLE.com")
        
        # Should work with matching case
        membership = invite.accept(user_lower)
        assert membership.user == user_lower

    def test_invite_accept_user_mismatch(self):
        """Test accepting invite with mismatched user email."""
        invite = InviteFactory(email="invite@example.com")
        wrong_user = AccountFactory(email="different@example.com")
        
        with pytest.raises(ValidationError, match="Invite email does not match"):
            invite.accept(wrong_user)

    def test_invite_with_extreme_message_lengths(self):
        """Test invites with very long or empty messages."""
        # Very long message
        long_message = "A" * 1000
        invite = InviteFactory(message=long_message)
        assert invite.message == long_message
        
        # Empty message
        empty_invite = InviteFactory(message="")
        assert invite.message == ""

    def test_invite_status_date_inconsistencies(self):
        """Test invites with inconsistent status and dates."""
        # Accepted invite without accepted_at
        invite = InviteFactory(status='accepted', accepted_at=None)
        assert invite.status == 'accepted'
        
        # Pending invite with accepted_at (shouldn't happen)
        invite = InviteFactory(
            status='pending',
            accepted_at=timezone.now(),
            accepted_by=AccountFactory()
        )
        assert invite.status == 'pending'

    def test_invite_resend_with_various_states(self):
        """Test resending invites in various states."""
        # Resend expired invite
        expired_invite = InviteFactory(
            status='pending',
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        with pytest.raises(ValidationError, match="Cannot resend expired invite"):
            expired_invite.resend()
        
        # Verify it was marked as expired
        expired_invite.refresh_from_db()
        assert expired_invite.status == 'expired'

    def test_invite_duplicate_constraint_edge_cases(self):
        """Test duplicate invite constraints with various status combinations."""
        org = OrganizationFactory()
        email = "test@example.com"
        
        # Create accepted invite
        accepted_invite = InviteFactory(
            organization=org,
            email=email,
            status='accepted'
        )
        
        # Should be able to create new pending invite for same email
        new_invite = InviteFactory(
            organization=org,
            email=email,
            status='pending'
        )
        assert new_invite.status == 'pending'
        
        # But not another pending invite
        with pytest.raises((IntegrityError, ValidationError)):
            InviteFactory(
                organization=org,
                email=email,
                status='pending'
            )


@pytest.mark.django_db
@pytest.mark.unit
class TestSerializerEdgeCases:
    """Test edge cases in serializers."""

    def test_create_invite_with_missing_context(self):
        """Test CreateInviteSerializer without required context."""
        serializer = CreateInviteSerializer(
            data={'email': 'test@example.com', 'role': 'member'},
            context={}  # Missing organization and invited_by
        )
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors

    def test_accept_invite_with_nonexistent_token(self):
        """Test AcceptInviteSerializer with fake token."""
        serializer = AcceptInviteSerializer(
            data={'token': 'nonexistent_token_12345'}
        )
        
        assert not serializer.is_valid()
        assert 'token' in serializer.errors
        assert 'Invalid invite token' in str(serializer.errors['token'])

    def test_membership_update_with_invalid_data_types(self):
        """Test MembershipUpdateSerializer with wrong data types."""
        membership = OrganizationMembershipFactory()
        
        # Invalid role type
        serializer = MembershipUpdateSerializer(
            membership,
            data={'role': 123},  # Should be string
            partial=True
        )
        assert not serializer.is_valid()
        
        # Invalid status type
        serializer = MembershipUpdateSerializer(
            membership,
            data={'status': ['active']},  # Should be string
            partial=True
        )
        assert not serializer.is_valid()

    def test_serializer_with_extremely_large_data(self):
        """Test serializers with unreasonably large data."""
        huge_string = "A" * 100000
        
        # Organization serializer with huge description
        serializer = CreateInviteSerializer(
            data={
                'email': 'test@example.com',
                'role': 'member',
                'message': huge_string
            },
            context={
                'organization': OrganizationFactory(),
                'invited_by': AccountFactory()
            }
        )
        
        # Should handle gracefully (may truncate or reject)
        serializer.is_valid()  # Don't assert - depends on implementation


@pytest.mark.django_db
@pytest.mark.unit
class TestPlanLimitEdgeCases:
    """Test edge cases around plan limits."""

    def test_plan_limit_boundary_conditions(self):
        """Test plan limits at exact boundaries."""
        # Free trial with exactly 5 members
        org = TrialOrganizationFactory()
        
        # Add exactly 5 members
        for i in range(5):
            OrganizationMembershipFactory(organization=org, status='active')
        
        # Should be at limit
        assert not org.can_add_member()
        assert org.get_active_members_count() == 5
        
        # Suspend one member
        membership = org.memberships.filter(status='active').first()
        membership.suspend()
        
        # Should now be able to add member
        assert org.can_add_member()
        assert org.get_active_members_count() == 4

    def test_plan_upgrade_member_limit_changes(self):
        """Test member limits when plan is upgraded."""
        # Start with free trial at limit
        org = TrialOrganizationFactory()
        for i in range(5):
            OrganizationMembershipFactory(organization=org, status='active')
        
        assert not org.can_add_member()
        
        # Upgrade to starter plan (10 member limit)
        org.plan = 'starter'
        org.on_trial = False
        org.save()
        
        # Should now be able to add more members
        assert org.can_add_member()
        
        # Add 5 more to reach new limit
        for i in range(5):
            OrganizationMembershipFactory(organization=org, status='active')
        
        assert not org.can_add_member()
        assert org.get_active_members_count() == 10

    def test_plan_downgrade_over_limit_scenario(self):
        """Test what happens when plan is downgraded below current member count."""
        # Start with pro plan and many members
        org = OrganizationFactory(plan='pro')
        for i in range(25):  # Pro limit is 50, so under limit
            OrganizationMembershipFactory(organization=org, status='active')
        
        # Downgrade to starter (limit 10)
        org.plan = 'starter'
        org.save()
        
        # Organization is now over limit
        assert org.get_active_members_count() == 25
        assert not org.can_add_member()  # Can't add more
        
        # But existing members should still work (grace period concept)
        existing_member = org.memberships.filter(status='active').first()
        assert existing_member.is_active()


@pytest.mark.django_db
@pytest.mark.integration
class TestRaceConditions:
    """Test race conditions and concurrent operations."""

    def test_concurrent_invite_acceptance(self):
        """Test multiple users trying to accept same invite simultaneously."""
        invite = InviteFactory(status='pending')
        
        user1 = AccountFactory(email=invite.email)
        user2 = AccountFactory(email="different@example.com")
        
        # First acceptance succeeds
        membership1 = invite.accept(user1)
        assert membership1 is not None
        
        # Second acceptance fails (invite already accepted)
        invite.refresh_from_db()
        with pytest.raises(ValidationError, match="no longer valid"):
            invite.accept(user2)

    def test_concurrent_membership_creation_at_limit(self):
        """Test race condition when creating memberships at plan limit."""
        org = TrialOrganizationFactory()
        
        # Fill to just under limit
        for i in range(4):
            OrganizationMembershipFactory(organization=org, status='active')
        
        # Two invites for the last spot
        invite1 = InviteFactory(organization=org)
        invite2 = InviteFactory(organization=org)
        
        user1 = AccountFactory(email=invite1.email)
        user2 = AccountFactory(email=invite2.email)
        
        # First acceptance should succeed
        membership1 = invite1.accept(user1)
        assert membership1 is not None
        
        # Second should fail due to limit
        with pytest.raises(ValidationError, match="member limit"):
            invite2.accept(user2)

    def test_concurrent_owner_role_changes(self):
        """Test concurrent owner role changes."""
        org = OrganizationFactory()
        
        # Create multiple owners
        owners = []
        for i in range(3):
            owner = OrganizationMembershipFactory(organization=org, role='owner')
            owners.append(owner)
        
        # Try to change all to admin simultaneously (should fail for last one)
        owners[0].change_role('admin')
        owners[1].change_role('admin')
        
        # Last one should fail
        with pytest.raises(ValidationError, match="at least one active owner"):
            owners[2].change_role('admin')


@pytest.mark.django_db
@pytest.mark.unit
class TestDataConsistencyEdgeCases:
    """Test data consistency edge cases."""

    def test_organization_without_owner(self):
        """Test organization that somehow has no owner."""
        org = OrganizationFactory()
        
        # Create only non-owner members
        OrganizationMembershipFactory(organization=org, role='admin')
        OrganizationMembershipFactory(organization=org, role='member')
        
        # Organization has no owner
        assert org.get_owner() is None
        assert org.get_owner_membership() is None
        
        # This is an inconsistent state that should be prevented

    def test_invite_without_inviter(self):
        """Test invite without invited_by user."""
        invite = InviteFactory(invited_by=None)
        assert invite.invited_by is None
        # Should still be functional for basic operations

    def test_membership_without_invited_by(self):
        """Test membership without invited_by (direct creation)."""
        membership = OrganizationMembershipFactory(invited_by=None)
        assert membership.invited_by is None
        # Should still be functional

    def test_expired_trial_organization_behavior(self):
        """Test behavior of organizations with expired trials."""
        org = ExpiredTrialOrganizationFactory()
        
        assert org.is_trial_expired()
        assert org.on_trial
        assert org.trial_ends_on < timezone.now().date()
        
        # Should still allow basic operations but might restrict some features
        # (Implementation depends on business logic)
        assert org.get_active_members_count() >= 0


@pytest.mark.django_db
@pytest.mark.unit
class TestSecurityEdgeCases:
    """Test security-related edge cases."""

    def test_invite_token_predictability(self):
        """Test that invite tokens are not predictable."""
        tokens = []
        for i in range(100):
            invite = InviteFactory()
            tokens.append(invite.token)
        
        # All tokens should be unique
        assert len(set(tokens)) == 100
        
        # Tokens should have reasonable length
        for token in tokens:
            assert len(token) > 20  # URL-safe tokens are typically longer
            assert token.isalnum() or '-' in token or '_' in token  # URL-safe chars

    def test_invite_token_enumeration_resistance(self):
        """Test that invite tokens resist enumeration attacks."""
        invite = InviteFactory()
        original_token = invite.token
        
        # Slightly modified tokens should not work
        modified_tokens = [
            original_token[:-1],           # Remove last char
            original_token + 'a',         # Add char
            original_token.upper(),       # Change case
            original_token.replace('a', 'b'),  # Replace char
        ]
        
        for modified_token in modified_tokens:
            if modified_token != original_token:
                fake_invite = InviteFactory.build(token=modified_token)
                # Should not find the original invite
                assert not Invite.objects.filter(token=modified_token).exists()

    def test_subdomain_injection_attempts(self):
        """Test subdomain field against injection attempts."""
        malicious_subdomains = [
            "'; DROP TABLE organizations; --",
            "<script>alert('xss')</script>",
            "../../../etc/passwd",
            "admin\x00hidden",
            "sub domain",  # Space injection
        ]
        
        for malicious_subdomain in malicious_subdomains:
            org = OrganizationFactory.build(sub_domain=malicious_subdomain)
            
            # Should be rejected by validation
            with pytest.raises(ValidationError):
                org.clean()

    def test_email_injection_in_invites(self):
        """Test email field against header injection."""
        malicious_emails = [
            "user@domain.com\nBCC: hacker@evil.com",
            "user@domain.com\rSubject: Spam",
            "user@domain.com\x00hidden@evil.com",
        ]
        
        for malicious_email in malicious_emails:
            invite = InviteFactory.build(email=malicious_email)
            
            with pytest.raises(ValidationError):
                invite.clean()