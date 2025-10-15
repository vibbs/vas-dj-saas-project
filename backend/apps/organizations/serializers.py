from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from .models import Organization, OrganizationMembership, Invite


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model."""
    
    member_count = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.IntegerField)
    def get_member_count(self, obj):
        """
        Get the number of active members in this organization.
        Uses annotation from queryset if available, otherwise falls back to query.
        """
        # Check if the queryset was annotated with member_count
        if hasattr(obj, 'active_member_count'):
            return obj.active_member_count
        # Fallback to query (slower, but works if annotation not provided)
        return obj.memberships.filter(status='active').count()
    
    @extend_schema_field(serializers.CharField)
    def get_subscription_status(self, obj):
        """Get the current subscription status."""
        if hasattr(obj, 'subscription'):
            return obj.subscription.status
        return 'none'
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'sub_domain',
            'plan', 'is_active', 'on_trial', 'trial_ends_on', 'paid_until',
            'member_count', 'subscription_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'sub_domain', 'member_count', 'subscription_status',
            'created_at', 'updated_at'
        ]


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationMembership model."""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    invited_by_email = serializers.CharField(source='invited_by.email', read_only=True)
    
    class Meta:
        model = OrganizationMembership
        fields = [
            'id', 'organization', 'organization_name', 'user', 'user_email', 'user_name',
            'role', 'status', 'joined_at', 'invited_by', 'invited_by_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'organization_name', 'user_email', 'user_name', 'invited_by_email',
            'joined_at', 'created_at', 'updated_at'
        ]


class InviteSerializer(serializers.ModelSerializer):
    """Serializer for Invite model."""
    
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    invited_by_email = serializers.CharField(source='invited_by.email', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.full_name', read_only=True)
    accept_url = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    @extend_schema_field(serializers.CharField)
    def get_accept_url(self, obj):
        """Get the URL for accepting this invite."""
        return obj.get_accept_url()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_valid(self, obj):
        """Check if invite is still valid."""
        return obj.is_valid()
    
    @extend_schema_field(serializers.BooleanField) 
    def get_is_expired(self, obj):
        """Check if invite has expired."""
        return obj.is_expired()
    
    class Meta:
        model = Invite
        fields = [
            'id', 'organization', 'organization_name', 'email', 'role', 'status',
            'invited_by', 'invited_by_email', 'invited_by_name', 'message',
            'expires_at', 'accept_url', 'is_valid', 'is_expired',
            'created_at', 'updated_at', 'accepted_at', 'accepted_by'
        ]
        read_only_fields = [
            'id', 'organization_name', 'invited_by_email', 'invited_by_name',
            'accept_url', 'is_valid', 'is_expired', 'token',
            'created_at', 'updated_at', 'accepted_at', 'accepted_by'
        ]


class CreateInviteSerializer(serializers.ModelSerializer):
    """Serializer for creating new invites."""
    
    class Meta:
        model = Invite
        fields = ['email', 'role', 'message']
    
    def validate_email(self, value):
        """Validate email and check for existing membership."""
        organization = self.context.get('organization')
        if not organization:
            raise serializers.ValidationError("Organization context required")
        
        # Check if user already has membership
        from apps.accounts.models import Account
        try:
            user = Account.objects.get(email=value)
            if user.has_membership_in(organization):
                raise serializers.ValidationError(
                    "User already has a membership in this organization"
                )
        except Account.DoesNotExist:
            pass  # OK, user doesn't exist yet
        
        # Check for existing pending invite
        existing_invite = Invite.objects.filter(
            organization=organization,
            email=value,
            status='pending'
        ).first()
        
        if existing_invite:
            raise serializers.ValidationError(
                "A pending invite already exists for this email"
            )
        
        return value
    
    def create(self, validated_data):
        """Create invite with organization and invited_by from context."""
        validated_data['organization'] = self.context['organization']
        validated_data['invited_by'] = self.context['invited_by']
        return super().create(validated_data)


class AcceptInviteSerializer(serializers.Serializer):
    """Serializer for accepting an invite."""
    
    token = serializers.CharField(help_text="Invite token")
    
    def validate_token(self, value):
        """Validate the invite token."""
        try:
            invite = Invite.objects.get(token=value)
            if not invite.is_valid():
                if invite.is_expired():
                    raise serializers.ValidationError("This invite has expired")
                else:
                    raise serializers.ValidationError("This invite is no longer valid")
            
            self.invite = invite
            return value
        except Invite.DoesNotExist:
            raise serializers.ValidationError("Invalid invite token")
    
    def save(self, user):
        """Accept the invite for the given user."""
        return self.invite.accept(user)


class MembershipUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating membership role/status."""
    
    class Meta:
        model = OrganizationMembership
        fields = ['role', 'status']
    
    def validate(self, attrs):
        """Validate membership update."""
        membership = self.instance
        new_role = attrs.get('role', membership.role)
        new_status = attrs.get('status', membership.status)
        
        # Prevent removing the last owner
        if (membership.role == 'owner' and 
            new_role != 'owner' and 
            membership.organization.memberships.filter(
                role='owner', status='active'
            ).exclude(id=membership.id).count() == 0):
            raise serializers.ValidationError(
                "Cannot change role - organization must have at least one owner"
            )
        
        # Prevent suspending the last owner
        if (membership.role == 'owner' and 
            new_status == 'suspended' and
            membership.organization.memberships.filter(
                role='owner', status='active'
            ).exclude(id=membership.id).count() == 0):
            raise serializers.ValidationError(
                "Cannot suspend - organization must have at least one active owner"
            )
        
        return attrs


# Legacy serializer for backward compatibility (deprecated)
class OrganizationCreateSerializer(serializers.ModelSerializer):
    """DEPRECATED: Use account registration instead."""
    creator_password = serializers.CharField(write_only=True)

    class Meta:
        model = Organization
        fields = [
            "name",
            "slug",
            "creator_email",
            "creator_name",
            "creator_password",
            "description",
            "sub_domain",
        ]

    def create(self, validated_data):
        # This is deprecated - new organizations should be created via user registration
        raise serializers.ValidationError(
            "Direct organization creation is deprecated. Use user registration instead."
        )
