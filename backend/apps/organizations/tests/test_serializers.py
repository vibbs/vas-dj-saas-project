"""
Test cases for organization serializers.
"""

import pytest
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.exceptions import ValidationError as DRFValidationError

from apps.organizations.serializers import (
    OrganizationSerializer,
    OrganizationMembershipSerializer,
    InviteSerializer,
    CreateInviteSerializer,
    AcceptInviteSerializer,
    MembershipUpdateSerializer,
)
from apps.organizations.models import Invite, OrganizationMembership
from apps.organizations.tests.factories import (
    OrganizationFactory,
    OrganizationMembershipFactory,
    InviteFactory
)
from apps.accounts.tests.factories import AccountFactory


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationSerializer:
    """Test cases for OrganizationSerializer."""

    def test_serialize_organization(self):
        """Test serializing organization data."""
        org = OrganizationFactory(
            name="Test Organization",
            description="A test organization",
            plan="pro",
            on_trial=False
        )
        
        # Add some members for member_count
        OrganizationMembershipFactory(organization=org, status='active')
        OrganizationMembershipFactory(organization=org, status='active')
        OrganizationMembershipFactory(organization=org, status='suspended')  # Shouldn't count
        
        serializer = OrganizationSerializer(org)
        data = serializer.data
        
        assert data['name'] == "Test Organization"
        assert data['description'] == "A test organization"
        assert data['plan'] == "pro"
        assert data['on_trial'] is False
        assert data['member_count'] == 2  # Only active members
        assert data['subscription_status'] == 'none'  # No subscription model
        assert 'id' in data
        assert 'created_at' in data

    def test_serialize_organization_with_subscription(self):
        """Test serializing organization with subscription."""
        # This would need actual subscription model
        org = OrganizationFactory()
        serializer = OrganizationSerializer(org)
        data = serializer.data
        
        assert data['subscription_status'] == 'none'

    def test_update_organization(self):
        """Test updating organization through serializer."""
        org = OrganizationFactory(name="Old Name")
        
        data = {
            'name': 'New Name',
            'description': 'Updated description'
        }
        
        serializer = OrganizationSerializer(org, data=data, partial=True)
        assert serializer.is_valid()
        
        updated_org = serializer.save()
        assert updated_org.name == 'New Name'
        assert updated_org.description == 'Updated description'

    def test_read_only_fields(self):
        """Test that read-only fields cannot be updated."""
        org = OrganizationFactory()
        
        data = {
            'id': 'new-id',
            'slug': 'new-slug',
            'sub_domain': 'new-subdomain',
            'member_count': 999,
            'subscription_status': 'active',
            'created_at': timezone.now(),
            'updated_at': timezone.now(),
        }
        
        serializer = OrganizationSerializer(org, data=data, partial=True)
        assert serializer.is_valid()
        
        # Read-only fields should not change
        updated_org = serializer.save()
        assert str(updated_org.id) != 'new-id'
        assert updated_org.slug != 'new-slug'
        assert updated_org.sub_domain != 'new-subdomain'


@pytest.mark.django_db
@pytest.mark.unit
class TestOrganizationMembershipSerializer:
    """Test cases for OrganizationMembershipSerializer."""

    def test_serialize_membership(self):
        """Test serializing membership data."""
        user = AccountFactory(
            email="test@example.com",
            first_name="John",
            last_name="Doe"
        )
        org = OrganizationFactory(name="Test Org")
        inviter = AccountFactory(email="inviter@example.com")
        
        membership = OrganizationMembershipFactory(
            organization=org,
            user=user,
            role='admin',
            status='active',
            invited_by=inviter
        )
        
        serializer = OrganizationMembershipSerializer(membership)
        data = serializer.data
        
        assert data['user_email'] == "test@example.com"
        assert data['organization_name'] == "Test Org"
        assert data['role'] == 'admin'
        assert data['status'] == 'active'
        assert data['invited_by_email'] == "inviter@example.com"
        assert 'joined_at' in data

    def test_update_membership(self):
        """Test updating membership through serializer."""
        membership = OrganizationMembershipFactory(role='member')
        
        data = {
            'role': 'admin',
            'status': 'active'
        }
        
        serializer = OrganizationMembershipSerializer(membership, data=data, partial=True)
        assert serializer.is_valid()
        
        updated_membership = serializer.save()
        assert updated_membership.role == 'admin'


@pytest.mark.django_db
@pytest.mark.unit
class TestInviteSerializer:
    """Test cases for InviteSerializer."""

    def test_serialize_invite(self):
        """Test serializing invite data."""
        inviter = AccountFactory(
            email="inviter@example.com",
            first_name="Jane",
            last_name="Smith"
        )
        org = OrganizationFactory(name="Test Organization")
        
        invite = InviteFactory(
            organization=org,
            invited_by=inviter,
            email="invitee@example.com",
            role='admin',
            status='pending',
            message="Welcome to the team!"
        )
        
        serializer = InviteSerializer(invite)
        data = serializer.data
        
        assert data['email'] == "invitee@example.com"
        assert data['organization_name'] == "Test Organization"
        assert data['role'] == 'admin'
        assert data['status'] == 'pending'
        assert data['invited_by_email'] == "inviter@example.com"
        assert data['message'] == "Welcome to the team!"
        assert 'accept_url' in data
        assert 'is_valid' in data
        assert 'is_expired' in data

    def test_serialize_invite_computed_fields(self):
        """Test computed fields in invite serialization."""
        future_time = timezone.now() + timedelta(days=1)
        past_time = timezone.now() - timedelta(days=1)
        
        # Valid invite
        valid_invite = InviteFactory(
            status='pending',
            expires_at=future_time,
            token="valid_token"
        )
        
        serializer = InviteSerializer(valid_invite)
        data = serializer.data
        
        assert data['is_valid'] is True
        assert data['is_expired'] is False
        assert "valid_token" in data['accept_url']
        
        # Expired invite
        expired_invite = InviteFactory(
            status='pending',
            expires_at=past_time
        )
        
        serializer = InviteSerializer(expired_invite)
        data = serializer.data
        
        assert data['is_valid'] is False
        assert data['is_expired'] is True


@pytest.mark.django_db
@pytest.mark.unit
class TestCreateInviteSerializer:
    """Test cases for CreateInviteSerializer."""

    def test_create_valid_invite(self):
        """Test creating a valid invite."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        
        data = {
            'email': 'newuser@example.com',
            'role': 'member',
            'message': 'Join our team!'
        }
        
        serializer = CreateInviteSerializer(
            data=data,
            context={'organization': org, 'invited_by': inviter}
        )
        
        assert serializer.is_valid()
        invite = serializer.save()
        
        assert invite.email == 'newuser@example.com'
        assert invite.role == 'member'
        assert invite.message == 'Join our team!'
        assert invite.organization == org
        assert invite.invited_by == inviter

    def test_create_invite_invalid_email(self):
        """Test creating invite with invalid email."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        
        data = {
            'email': 'invalid-email',
            'role': 'member'
        }
        
        serializer = CreateInviteSerializer(
            data=data,
            context={'organization': org, 'invited_by': inviter}
        )
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors

    def test_create_invite_existing_membership(self):
        """Test creating invite for user who already has membership."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        user = AccountFactory()
        
        # Create existing membership
        OrganizationMembershipFactory(organization=org, user=user)
        
        data = {
            'email': user.email,
            'role': 'member'
        }
        
        serializer = CreateInviteSerializer(
            data=data,
            context={'organization': org, 'invited_by': inviter}
        )
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        assert 'already has a membership' in str(serializer.errors['email'])

    def test_create_invite_existing_pending_invite(self):
        """Test creating invite when pending invite already exists."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        email = "test@example.com"
        
        # Create existing pending invite
        InviteFactory(
            organization=org,
            email=email,
            status='pending'
        )
        
        data = {
            'email': email,
            'role': 'member'
        }
        
        serializer = CreateInviteSerializer(
            data=data,
            context={'organization': org, 'invited_by': inviter}
        )
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        assert 'pending invite already exists' in str(serializer.errors['email'])

    def test_create_invite_after_accepted_invite(self):
        """Test creating new invite after previous was accepted."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        email = "test@example.com"
        
        # Create accepted invite (should not conflict)
        InviteFactory(
            organization=org,
            email=email,
            status='accepted'
        )
        
        data = {
            'email': email,
            'role': 'member'
        }
        
        serializer = CreateInviteSerializer(
            data=data,
            context={'organization': org, 'invited_by': inviter}
        )
        
        assert serializer.is_valid()

    def test_create_invite_missing_context(self):
        """Test creating invite without required context."""
        data = {
            'email': 'test@example.com',
            'role': 'member'
        }
        
        serializer = CreateInviteSerializer(data=data, context={})
        
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        assert 'Organization context required' in str(serializer.errors['email'])


@pytest.mark.django_db
@pytest.mark.unit
class TestAcceptInviteSerializer:
    """Test cases for AcceptInviteSerializer."""

    def test_accept_valid_invite(self):
        """Test accepting a valid invite."""
        user = AccountFactory()
        invite = InviteFactory(
            email=user.email,
            status='pending',
            expires_at=timezone.now() + timedelta(days=1),
            token="valid_token"
        )
        
        data = {'token': 'valid_token'}
        serializer = AcceptInviteSerializer(data=data)
        
        assert serializer.is_valid()
        membership = serializer.save(user)
        
        assert membership.user == user
        assert membership.organization == invite.organization
        assert membership.role == invite.role
        assert membership.status == 'active'

    def test_accept_invalid_token(self):
        """Test accepting invite with invalid token."""
        data = {'token': 'invalid_token'}
        serializer = AcceptInviteSerializer(data=data)
        
        assert not serializer.is_valid()
        assert 'token' in serializer.errors
        assert 'Invalid invite token' in str(serializer.errors['token'])

    def test_accept_expired_invite(self):
        """Test accepting expired invite."""
        invite = InviteFactory(
            status='pending',
            expires_at=timezone.now() - timedelta(days=1),
            token="expired_token"
        )
        
        data = {'token': 'expired_token'}
        serializer = AcceptInviteSerializer(data=data)
        
        assert not serializer.is_valid()
        assert 'token' in serializer.errors
        assert 'invite has expired' in str(serializer.errors['token'])

    def test_accept_non_pending_invite(self):
        """Test accepting non-pending invite."""
        invite = InviteFactory(
            status='revoked',
            expires_at=timezone.now() + timedelta(days=1),
            token="revoked_token"
        )
        
        data = {'token': 'revoked_token'}
        serializer = AcceptInviteSerializer(data=data)
        
        assert not serializer.is_valid()
        assert 'token' in serializer.errors
        assert 'no longer valid' in str(serializer.errors['token'])


@pytest.mark.django_db
@pytest.mark.unit
class TestMembershipUpdateSerializer:
    """Test cases for MembershipUpdateSerializer."""

    def test_update_membership_role(self):
        """Test updating membership role."""
        org = OrganizationFactory()
        # Create two owners so we can change one
        owner1 = OrganizationMembershipFactory(organization=org, role='owner')
        owner2 = OrganizationMembershipFactory(organization=org, role='owner')
        
        data = {'role': 'admin'}
        serializer = MembershipUpdateSerializer(owner1, data=data, partial=True)
        
        assert serializer.is_valid()
        updated_membership = serializer.save()
        assert updated_membership.role == 'admin'

    def test_update_membership_status(self):
        """Test updating membership status."""
        membership = OrganizationMembershipFactory(role='member', status='active')
        
        data = {'status': 'suspended'}
        serializer = MembershipUpdateSerializer(membership, data=data, partial=True)
        
        assert serializer.is_valid()
        updated_membership = serializer.save()
        assert updated_membership.status == 'suspended'

    def test_prevent_last_owner_role_change(self):
        """Test preventing last owner role change."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role='owner')
        
        data = {'role': 'admin'}
        serializer = MembershipUpdateSerializer(owner, data=data, partial=True)
        
        assert not serializer.is_valid()
        assert 'non_field_errors' in serializer.errors
        assert 'at least one owner' in str(serializer.errors['non_field_errors'])

    def test_prevent_last_owner_suspension(self):
        """Test preventing last owner suspension."""
        org = OrganizationFactory()
        owner = OrganizationMembershipFactory(organization=org, role='owner')
        
        data = {'status': 'suspended'}
        serializer = MembershipUpdateSerializer(owner, data=data, partial=True)
        
        assert not serializer.is_valid()
        assert 'non_field_errors' in serializer.errors
        assert 'at least one active owner' in str(serializer.errors['non_field_errors'])

    def test_allow_owner_change_with_other_owners(self):
        """Test allowing owner changes when other owners exist."""
        org = OrganizationFactory()
        owner1 = OrganizationMembershipFactory(organization=org, role='owner')
        owner2 = OrganizationMembershipFactory(organization=org, role='owner')
        
        # Should be able to change role
        data = {'role': 'admin'}
        serializer = MembershipUpdateSerializer(owner1, data=data, partial=True)
        assert serializer.is_valid()
        
        # Should be able to suspend
        data = {'status': 'suspended'}
        serializer = MembershipUpdateSerializer(owner1, data=data, partial=True)
        assert serializer.is_valid()


@pytest.mark.django_db
@pytest.mark.unit
class TestDeprecatedOrganizationCreateSerializer:
    """Test cases for deprecated OrganizationCreateSerializer."""

    def test_create_organization_raises_error(self):
        """Test that deprecated serializer raises error on create."""
        from apps.organizations.serializers import OrganizationCreateSerializer
        
        data = {
            'name': 'Test Org',
            'slug': 'test-org',
            'creator_email': 'test@example.com',
            'creator_name': 'Test User',
            'creator_password': 'password123',
            'sub_domain': 'testorg'
        }
        
        serializer = OrganizationCreateSerializer(data=data)
        assert serializer.is_valid()
        
        with pytest.raises(DRFValidationError, match="Direct organization creation is deprecated"):
            serializer.save()


@pytest.mark.django_db
@pytest.mark.integration
class TestSerializerIntegration:
    """Integration tests for serializers working together."""

    def test_full_invite_workflow(self):
        """Test complete invite workflow through serializers."""
        org = OrganizationFactory()
        inviter = AccountFactory()
        invitee = AccountFactory()
        
        # 1. Create invite
        create_data = {
            'email': invitee.email,
            'role': 'admin',
            'message': 'Join us!'
        }
        
        create_serializer = CreateInviteSerializer(
            data=create_data,
            context={'organization': org, 'invited_by': inviter}
        )
        assert create_serializer.is_valid()
        invite = create_serializer.save()
        
        # 2. Serialize invite for display
        invite_serializer = InviteSerializer(invite)
        invite_data = invite_serializer.data
        
        assert invite_data['is_valid'] is True
        assert invite_data['email'] == invitee.email
        
        # 3. Accept invite
        accept_data = {'token': invite.token}
        accept_serializer = AcceptInviteSerializer(data=accept_data)
        assert accept_serializer.is_valid()
        membership = accept_serializer.save(invitee)
        
        # 4. Serialize membership
        membership_serializer = OrganizationMembershipSerializer(membership)
        membership_data = membership_serializer.data
        
        assert membership_data['role'] == 'admin'
        assert membership_data['status'] == 'active'
        assert membership_data['user_email'] == invitee.email

    def test_membership_management_workflow(self):
        """Test membership management through serializers."""
        org = OrganizationFactory()
        
        # Create owner and admin
        owner = OrganizationMembershipFactory(organization=org, role='owner')
        admin = OrganizationMembershipFactory(organization=org, role='admin')
        
        # Update admin to member
        update_data = {'role': 'member'}
        update_serializer = MembershipUpdateSerializer(admin, data=update_data, partial=True)
        assert update_serializer.is_valid()
        updated_membership = update_serializer.save()
        
        assert updated_membership.role == 'member'
        
        # Suspend member
        suspend_data = {'status': 'suspended'}
        suspend_serializer = MembershipUpdateSerializer(updated_membership, data=suspend_data, partial=True)
        assert suspend_serializer.is_valid()
        suspended_membership = suspend_serializer.save()
        
        assert suspended_membership.status == 'suspended'