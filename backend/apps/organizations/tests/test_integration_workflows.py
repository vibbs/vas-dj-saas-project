"""
Integration tests for complete invite and membership workflows.
"""

import pytest
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone
from freezegun import freeze_time

from apps.organizations.models import Organization, OrganizationMembership, Invite
from apps.organizations.serializers import (
    CreateInviteSerializer,
    AcceptInviteSerializer,
    MembershipUpdateSerializer
)
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
    InviteFactory
)
from apps.accounts.tests.factories import AccountFactory


@pytest.mark.django_db
@pytest.mark.integration
class TestCompleteInviteWorkflow:
    """Test complete invite workflow from creation to acceptance."""

    def test_full_invite_workflow_success(self):
        """Test complete successful invite workflow."""
        # 1. Setup: Create organization with owner
        org = OrganizationFactory()
        owner = AccountFactory()
        owner_membership = OrganizationMembershipFactory(
            organization=org,
            user=owner,
            role='owner',
            status='active'
        )
        
        # 2. Create invite
        invitee_email = "newuser@example.com"
        invite_data = {
            'email': invitee_email,
            'role': 'admin',
            'message': 'Welcome to our organization!'
        }
        
        create_serializer = CreateInviteSerializer(
            data=invite_data,
            context={'organization': org, 'invited_by': owner}
        )
        assert create_serializer.is_valid()
        invite = create_serializer.save()
        
        # Verify invite was created correctly
        assert invite.organization == org
        assert invite.invited_by == owner
        assert invite.email == invitee_email
        assert invite.role == 'admin'
        assert invite.status == 'pending'
        assert invite.token
        assert invite.expires_at > timezone.now()
        
        # 3. Create invitee user account
        invitee = AccountFactory(email=invitee_email)
        
        # 4. Accept invite
        accept_data = {'token': invite.token}
        accept_serializer = AcceptInviteSerializer(data=accept_data)
        assert accept_serializer.is_valid()
        membership = accept_serializer.save(invitee)
        
        # Verify membership was created correctly
        assert membership.organization == org
        assert membership.user == invitee
        assert membership.role == 'admin'
        assert membership.status == 'active'
        assert membership.invited_by == owner
        
        # Verify invite was marked as accepted
        invite.refresh_from_db()
        assert invite.status == 'accepted'
        assert invite.accepted_by == invitee
        assert invite.accepted_at is not None
        
        # 5. Verify organization state
        assert org.memberships.count() == 2  # Owner + new member
        assert org.memberships.filter(status='active').count() == 2
        assert org.get_active_members_count() == 2

    def test_invite_workflow_with_existing_user(self):
        """Test invite workflow when invitee already has an account."""
        # Setup
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Existing user
        existing_user = AccountFactory(email="existing@example.com")
        
        # Create invite for existing user
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            email=existing_user.email,
            role='member'
        )
        
        # Accept invite
        membership = invite.accept(existing_user)
        
        # Verify
        assert membership.user == existing_user
        assert membership.organization == org
        assert membership.role == 'member'

    def test_invite_workflow_with_plan_limits(self):
        """Test invite workflow respecting organization plan limits."""
        # Create free trial organization (limit: 5 members)
        org = OrganizationFactory(plan='free_trial')
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Add 4 more members (reaching limit of 5)
        for i in range(4):
            user = AccountFactory()
            OrganizationMembershipFactory(organization=org, user=user, role='member')
        
        # Try to invite 6th member
        new_user = AccountFactory()
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            email=new_user.email,
            role='member'
        )
        
        # Should fail due to plan limits
        with pytest.raises(ValidationError, match="reached its member limit"):
            invite.accept(new_user)

    def test_invite_expiry_workflow(self):
        """Test workflow with expired invites."""
        # Create invite
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Create invite that will expire
        past_time = timezone.now() - timedelta(days=1)
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            expires_at=past_time,
            status='pending'
        )
        
        # Try to accept expired invite
        invitee = AccountFactory(email=invite.email)
        
        with pytest.raises(ValidationError, match="invite has expired"):
            invite.accept(invitee)
        
        # Mark as expired
        invite.mark_expired()
        assert invite.status == 'expired'

    def test_invite_resend_workflow(self):
        """Test resending an invite."""
        # Create invite
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            status='pending'
        )
        
        old_token = invite.token
        old_expires_at = invite.expires_at
        
        # Resend invite
        with freeze_time("2024-02-01"):
            new_token = invite.resend()
        
        # Verify changes
        assert new_token != old_token
        assert invite.token == new_token
        assert invite.expires_at > old_expires_at
        assert invite.status == 'pending'

    def test_invite_revocation_workflow(self):
        """Test revoking an invite."""
        # Create invite
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            status='pending'
        )
        
        # Revoke invite
        invite.revoke()
        assert invite.status == 'revoked'
        
        # Try to accept revoked invite
        invitee = AccountFactory(email=invite.email)
        
        with pytest.raises(ValidationError, match="no longer valid"):
            invite.accept(invitee)


@pytest.mark.django_db
@pytest.mark.integration
class TestMembershipManagementWorkflow:
    """Test complete membership management workflows."""

    def test_ownership_transfer_workflow(self):
        """Test transferring ownership between users."""
        # Setup organization with owner and admin
        org = OrganizationFactory()
        current_owner = AccountFactory()
        future_owner = AccountFactory()
        
        owner_membership = OrganizationMembershipFactory(
            organization=org,
            user=current_owner,
            role='owner',
            status='active'
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org,
            user=future_owner,
            role='admin',
            status='active'
        )
        
        # Step 1: Promote admin to owner
        admin_membership.change_role('owner')
        
        # Verify new owner
        assert admin_membership.role == 'owner'
        assert admin_membership.is_owner()
        assert admin_membership.can_manage_billing()
        
        # Step 2: Demote old owner to admin
        owner_membership.change_role('admin')
        
        # Verify old owner is now admin
        assert owner_membership.role == 'admin'
        assert not owner_membership.is_owner()
        assert owner_membership.is_admin()
        assert not owner_membership.can_manage_billing()
        
        # Verify organization still has exactly one owner
        owners = org.memberships.filter(role='owner', status='active')
        assert owners.count() == 1
        assert owners.first() == admin_membership

    def test_bulk_member_management_workflow(self):
        """Test managing multiple members at once."""
        # Setup organization with multiple members
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Create 10 members
        members = []
        for i in range(10):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org,
                user=user,
                role='member',
                status='active'
            )
            members.append(membership)
        
        # Suspend half the members
        suspended_members = members[:5]
        for membership in suspended_members:
            membership.suspend()
        
        # Verify suspensions
        assert org.memberships.filter(status='active').count() == 6  # 5 active members + owner
        assert org.memberships.filter(status='suspended').count() == 5
        
        # Promote some active members to admin
        active_members = members[5:]
        for membership in active_members[:2]:
            membership.change_role('admin')
        
        # Verify promotions
        assert org.memberships.filter(role='admin', status='active').count() == 2
        assert org.memberships.filter(role='member', status='active').count() == 3
        
        # Reactivate suspended members
        for membership in suspended_members:
            membership.reactivate()
        
        # Verify all are active again
        assert org.memberships.filter(status='active').count() == 11  # 10 members + owner
        assert org.memberships.filter(status='suspended').count() == 0

    def test_membership_cleanup_workflow(self):
        """Test cleaning up and removing memberships."""
        # Setup
        org = OrganizationFactory()
        owner = AccountFactory()
        admin = AccountFactory()
        member = AccountFactory()
        
        owner_membership = OrganizationMembershipFactory(
            organization=org, user=owner, role='owner'
        )
        admin_membership = OrganizationMembershipFactory(
            organization=org, user=admin, role='admin'
        )
        member_membership = OrganizationMembershipFactory(
            organization=org, user=member, role='member'
        )
        
        # Suspend and remove member
        member_membership.suspend()
        member_membership.delete()
        
        # Verify member is gone
        assert org.memberships.count() == 2
        assert not org.memberships.filter(user=member).exists()
        
        # Try to remove admin (should work)
        admin_membership.delete()
        assert org.memberships.count() == 1
        
        # Try to remove last owner (should be prevented at model level if implemented)
        # This depends on your business rules implementation
        remaining_members = org.memberships.filter(status='active')
        assert remaining_members.count() == 1
        assert remaining_members.first().role == 'owner'


@pytest.mark.django_db
@pytest.mark.integration
class TestConcurrentMembershipWorkflow:
    """Test concurrent membership operations."""

    def test_concurrent_invite_acceptance(self):
        """Test multiple users trying to accept the same invite."""
        # Setup
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        invite = InviteFactory(
            organization=org,
            invited_by=owner,
            email="shared@example.com"
        )
        
        # Create two users with same email (shouldn't happen in real scenario)
        user1 = AccountFactory(email="shared@example.com")
        user2 = AccountFactory(email="other@example.com")
        
        # First user accepts successfully
        membership1 = invite.accept(user1)
        assert membership1.user == user1
        
        # Second user tries to accept same invite (should fail)
        with pytest.raises(ValidationError, match="no longer valid"):
            invite.accept(user2)

    def test_concurrent_ownership_changes(self):
        """Test concurrent attempts to change ownership."""
        # Setup organization with two owners
        org = OrganizationFactory()
        owner1 = AccountFactory()
        owner2 = AccountFactory()
        
        membership1 = OrganizationMembershipFactory(
            organization=org, user=owner1, role='owner'
        )
        membership2 = OrganizationMembershipFactory(
            organization=org, user=owner2, role='owner'
        )
        
        # Both try to demote themselves simultaneously
        # First one succeeds
        membership1.change_role('admin')
        assert membership1.role == 'admin'
        
        # Second one should fail (would leave organization without owner)
        with pytest.raises(ValidationError, match="at least one active owner"):
            membership2.change_role('admin')

    def test_plan_limit_race_condition(self):
        """Test race conditions with plan limits."""
        # Setup organization at member limit
        org = OrganizationFactory(plan='free_trial')  # 5 member limit
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Add 4 members (at limit)
        for i in range(4):
            user = AccountFactory()
            OrganizationMembershipFactory(organization=org, user=user, role='member')
        
        # Create two invites for the "last" spot
        invite1 = InviteFactory(organization=org, invited_by=owner)
        invite2 = InviteFactory(organization=org, invited_by=owner)
        
        user1 = AccountFactory(email=invite1.email)
        user2 = AccountFactory(email=invite2.email)
        
        # First acceptance should succeed
        membership1 = invite1.accept(user1)
        assert membership1 is not None
        
        # Second acceptance should fail due to limit
        with pytest.raises(ValidationError, match="reached its member limit"):
            invite2.accept(user2)


@pytest.mark.django_db
@pytest.mark.integration
class TestComplexOrganizationScenarios:
    """Test complex real-world organization scenarios."""

    def test_organization_merger_scenario(self):
        """Test merging two organizations (members moving to one org)."""
        # Create two organizations
        org1 = OrganizationFactory(name="Company A")
        org2 = OrganizationFactory(name="Company B")
        
        # Each with their own members
        owner1 = AccountFactory()
        owner2 = AccountFactory()
        
        OrganizationMembershipFactory(organization=org1, user=owner1, role='owner')
        OrganizationMembershipFactory(organization=org2, user=owner2, role='owner')
        
        # Add members to both orgs
        org1_members = []
        org2_members = []
        
        for i in range(3):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org1, user=user, role='member'
            )
            org1_members.append(membership)
        
        for i in range(2):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org2, user=user, role='member'
            )
            org2_members.append(membership)
        
        # Merge: Move org2 members to org1
        # First, make owner2 an admin in org1
        new_membership = OrganizationMembershipFactory(
            organization=org1,
            user=owner2,
            role='admin'
        )
        
        # Move other members
        for membership in org2_members:
            # Create new membership in org1
            OrganizationMembershipFactory(
                organization=org1,
                user=membership.user,
                role=membership.role
            )
            # Remove old membership
            membership.delete()
        
        # Verify merger results
        assert org1.memberships.count() == 7  # original 4 + 3 from org2
        assert org2.memberships.count() == 1  # only original owner left
        assert org1.get_active_members_count() == 7

    def test_seasonal_team_management(self):
        """Test managing seasonal/temporary team members."""
        # Setup organization
        org = OrganizationFactory()
        owner = AccountFactory()
        OrganizationMembershipFactory(organization=org, user=owner, role='owner')
        
        # Add permanent staff
        permanent_staff = []
        for i in range(3):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org, user=user, role='member'
            )
            permanent_staff.append(membership)
        
        # Add seasonal workers via invites
        seasonal_invites = []
        seasonal_members = []
        
        for i in range(5):
            user = AccountFactory()
            invite = InviteFactory(
                organization=org,
                invited_by=owner,
                email=user.email,
                role='member',
                message=f"Welcome to our seasonal team!"
            )
            seasonal_invites.append(invite)
            
            # Accept invites
            membership = invite.accept(user)
            seasonal_members.append(membership)
        
        # Verify full team
        assert org.get_active_members_count() == 9  # owner + 3 permanent + 5 seasonal
        
        # End of season: suspend seasonal workers
        for membership in seasonal_members:
            membership.suspend()
        
        # Verify reduced team
        assert org.get_active_members_count() == 4  # owner + 3 permanent
        assert org.memberships.filter(status='suspended').count() == 5
        
        # Next season: reactivate some seasonal workers
        for membership in seasonal_members[:3]:
            membership.reactivate()
        
        # Verify partial reactivation
        assert org.get_active_members_count() == 7  # owner + 3 permanent + 3 seasonal
        assert org.memberships.filter(status='suspended').count() == 2

    def test_organization_restructuring(self):
        """Test major organizational restructuring."""
        # Setup large organization
        org = OrganizationFactory(plan='enterprise')  # No member limits
        
        # Create hierarchical structure
        ceo = AccountFactory()
        ceo_membership = OrganizationMembershipFactory(
            organization=org, user=ceo, role='owner'
        )
        
        # Department heads (admins)
        dept_heads = []
        for i in range(4):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org, user=user, role='admin'
            )
            dept_heads.append(membership)
        
        # Regular employees
        employees = []
        for i in range(20):
            user = AccountFactory()
            membership = OrganizationMembershipFactory(
                organization=org, user=user, role='member'
            )
            employees.append(membership)
        
        # Initial state verification
        assert org.get_active_members_count() == 25
        assert org.memberships.filter(role='owner').count() == 1
        assert org.memberships.filter(role='admin').count() == 4
        assert org.memberships.filter(role='member').count() == 20
        
        # Restructuring: Promote some employees to admin
        for membership in employees[:3]:
            membership.change_role('admin')
        
        # Demote some admins to members
        for membership in dept_heads[:2]:
            membership.change_role('member')
        
        # Remove some employees
        for membership in employees[15:20]:
            membership.delete()
        
        # Verify restructuring results
        assert org.get_active_members_count() == 20  # 25 - 5 removed
        assert org.memberships.filter(role='owner').count() == 1  # unchanged
        assert org.memberships.filter(role='admin').count() == 5  # 4 - 2 + 3
        assert org.memberships.filter(role='member').count() == 14  # 20 - 3 + 2 - 5

    def test_organization_lifecycle_complete(self):
        """Test complete organization lifecycle from creation to deletion."""
        # 1. Organization creation
        org = OrganizationFactory(
            name="Startup Inc",
            plan='free_trial',
            on_trial=True
        )
        founder = AccountFactory()
        founder_membership = OrganizationMembershipFactory(
            organization=org, user=founder, role='owner'
        )
        
        # 2. Early growth - invite co-founder
        cofounder = AccountFactory()
        cofounder_invite = InviteFactory(
            organization=org,
            invited_by=founder,
            email=cofounder.email,
            role='owner'
        )
        cofounder_membership = cofounder_invite.accept(cofounder)
        
        # 3. Team expansion
        team_members = []
        for i in range(8):  # Will hit free trial limit
            user = AccountFactory()
            if i < 3:  # First 3 succeed
                invite = InviteFactory(organization=org, invited_by=founder, email=user.email)
                membership = invite.accept(user)
                team_members.append(membership)
            else:  # Rest fail due to limit
                invite = InviteFactory(organization=org, invited_by=founder, email=user.email)
                with pytest.raises(ValidationError, match="member limit"):
                    invite.accept(user)
        
        # Verify trial limits enforced
        assert org.get_active_members_count() == 5  # 2 owners + 3 members
        
        # 4. Upgrade plan
        org.plan = 'pro'
        org.on_trial = False
        org.paid_until = timezone.now().date() + timedelta(days=365)
        org.save()
        
        # 5. Continue expansion after upgrade
        for i in range(10):
            user = AccountFactory()
            invite = InviteFactory(organization=org, invited_by=founder, email=user.email)
            membership = invite.accept(user)
            team_members.append(membership)
        
        # Verify expansion
        assert org.get_active_members_count() == 15  # 2 owners + 13 members
        
        # 6. Organizational changes - founder leaves
        # Transfer ownership completely to cofounder
        founder_membership.change_role('member')
        
        # 7. Eventually founder leaves completely
        founder_membership.delete()
        
        # 8. Final verification
        assert org.get_active_members_count() == 14
        assert org.memberships.filter(role='owner').count() == 1
        assert org.get_owner() == cofounder
        
        # Organization continues to exist with new sole owner
        assert org.is_active
        assert not org.is_trial_expired()