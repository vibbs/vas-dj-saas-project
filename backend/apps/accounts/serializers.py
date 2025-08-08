from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.db import transaction
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Account, AccountAuthProvider
from apps.organizations.models import Organization
from apps.billing.models import Plan, Subscription, SubscriptionStatus


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model with read-only computed fields."""
    full_name = serializers.CharField(read_only=True)
    abbreviated_name = serializers.CharField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = Account
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'abbreviated_name',
            'avatar', 'phone', 'bio', 'date_of_birth', 'gender', 'role',
            'is_active', 'is_email_verified', 'is_phone_verified', 'is_2fa_enabled',
            'date_joined', 'status', 'is_admin', 'is_org_admin', 'is_org_creator',
            'can_invite_users', 'can_manage_billing', 'can_delete_org'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }


class AccountCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new user accounts with password confirmation."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'bio', 'date_of_birth', 'gender'
        ]

    def validate(self, attrs):
        """Validate that password and password_confirm match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(_("Passwords don't match"))
        return attrs

    def create(self, validated_data):
        """Create a new user account."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        return user


class AccountAuthProviderSerializer(serializers.ModelSerializer):
    """Serializer for authentication provider information."""

    class Meta:
        model = AccountAuthProvider
        fields = ['id', 'provider', 'provider_user_id', 'email', 'linked_at', 'is_primary']
        read_only_fields = ['id', 'linked_at']


class RegistrationSerializer(serializers.ModelSerializer):
    """Enhanced serializer for user registration with automatic organization creation."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # Optional organization details
    organization_name = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text="Organization name (optional, defaults to 'FirstName LastName')"
    )
    preferred_subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        min_length=3,
        max_length=50,
        help_text="Preferred subdomain (optional, auto-generated if not provided)"
    )

    class Meta:
        model = Account
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'organization_name', 'preferred_subdomain'
        ]

    def validate_email(self, value):
        """Ensure email is unique across all accounts."""
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("An account with this email already exists."))
        return value

    def validate_preferred_subdomain(self, value):
        """Validate subdomain format and uniqueness if provided."""
        if value:
            # Basic subdomain validation
            import re
            if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', value.lower()):
                raise serializers.ValidationError(
                    _("Subdomain must contain only lowercase letters, numbers, and hyphens, "
                      "and cannot start or end with a hyphen.")
                )
            
            # Check if subdomain is already taken
            if Organization.objects.filter(sub_domain=value.lower()).exists():
                raise serializers.ValidationError(_("This subdomain is already taken."))
        
        return value.lower() if value else value

    def validate(self, attrs):
        """Validate that password and password_confirm match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(_("Passwords don't match"))
        return attrs

    def _generate_unique_subdomain(self, first_name, last_name, preferred=None):
        """Generate a unique subdomain for the organization."""
        if preferred:
            return preferred
        
        # Create base subdomain from name
        base = f"{first_name.lower()}-{last_name.lower()}" if first_name and last_name else "user"
        
        # Remove any non-alphanumeric characters except hyphens
        import re
        base = re.sub(r'[^a-z0-9-]', '', base.lower())
        base = re.sub(r'-+', '-', base)  # Replace multiple hyphens with single
        base = base.strip('-')  # Remove leading/trailing hyphens
        
        # Ensure minimum length
        if len(base) < 3:
            base = f"user-{base}"
        
        # Check uniqueness and add suffix if needed
        subdomain = base
        counter = 1
        while Organization.objects.filter(sub_domain=subdomain).exists():
            subdomain = f"{base}-{counter}"
            counter += 1
            if counter > 100:  # Safety break
                import uuid
                subdomain = f"{base}-{str(uuid.uuid4())[:8]}"
                break
        
        return subdomain

    @transaction.atomic
    def create(self, validated_data):
        """Create user account with automatic organization setup and trial initialization."""
        # Extract organization-specific data
        organization_name = validated_data.pop('organization_name', '')
        preferred_subdomain = validated_data.pop('preferred_subdomain', None)
        password_confirm = validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Set default organization name if not provided
        if not organization_name:
            first_name = validated_data.get('first_name', '')
            last_name = validated_data.get('last_name', '')
            organization_name = f"{first_name} {last_name}".strip() or "Personal Organization"
        
        # Generate unique subdomain
        subdomain = self._generate_unique_subdomain(
            validated_data.get('first_name', ''),
            validated_data.get('last_name', ''),
            preferred_subdomain
        )
        
        # Create organization first
        organization = Organization.objects.create(
            name=organization_name,
            sub_domain=subdomain,
            creator_email=validated_data['email'],
            creator_name=f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip(),
            on_trial=True,
            trial_ends_on=timezone.now().date() + timedelta(days=14),  # 14-day trial
            is_active=True
        )
        
        # Create user account linked to organization
        validated_data['organization'] = organization
        validated_data['is_org_creator'] = True
        validated_data['is_org_admin'] = True
        validated_data['can_invite_users'] = True
        validated_data['can_manage_billing'] = True
        validated_data['can_delete_org'] = True
        validated_data['status'] = 'PENDING'  # Pending email verification
        
        user = Account.objects.create_user(password=password, **validated_data)
        
        # Initialize trial subscription if there's a free trial plan
        try:
            trial_plan = Plan.objects.filter(amount=0, trial_period_days__gt=0).first()
            if trial_plan:
                Subscription.objects.create(
                    account=user,
                    organization=organization,
                    plan=trial_plan,
                    status=SubscriptionStatus.TRIALING,
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timedelta(days=14),
                    trial_start=timezone.now(),
                    trial_end=timezone.now() + timedelta(days=14),
                    stripe_subscription_id='trial_' + str(user.id),  # Placeholder
                    stripe_customer_id='trial_customer_' + str(user.id),  # Placeholder
                )
        except Exception:
            # If subscription creation fails, continue - user can still use basic features
            pass
        
        # Send email verification
        try:
            user.send_verification_email()
        except Exception:
            # If email sending fails, continue - user can still access their account
            pass
        
        return user


class RegistrationResponseSerializer(serializers.Serializer):
    """Serializer for registration response data."""
    access = serializers.CharField(help_text="JWT access token")
    refresh = serializers.CharField(help_text="JWT refresh token")
    user = AccountSerializer(help_text="User information")
    organization = serializers.SerializerMethodField()
    
    def get_organization(self, obj):
        """Return basic organization information."""
        if hasattr(obj, 'organization') and obj.organization:
            return {
                'id': str(obj.organization.id),
                'name': obj.organization.name,
                'subdomain': obj.organization.sub_domain,
                'on_trial': obj.organization.on_trial,
                'trial_ends_on': obj.organization.trial_ends_on
            }
        return None


class SocialRegistrationSerializer(serializers.Serializer):
    """Serializer for social login registration (Google, GitHub, etc.)."""
    provider = serializers.ChoiceField(
        choices=['google', 'github', 'facebook', 'twitter'],
        help_text="Social auth provider"
    )
    provider_user_id = serializers.CharField(
        help_text="Unique user ID from the social provider"
    )
    email = serializers.EmailField(help_text="Email from social provider")
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.URLField(required=False, allow_blank=True)
    
    # Optional organization details (same as regular registration)
    organization_name = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text="Organization name (optional, defaults to 'FirstName LastName')"
    )
    preferred_subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        min_length=3,
        max_length=50,
        help_text="Preferred subdomain (optional, auto-generated if not provided)"
    )

    def validate_email(self, value):
        """Check if email is already registered with a different provider."""
        existing_user = Account.objects.filter(email=value).first()
        if existing_user:
            # Check if this is the same provider
            existing_provider = AccountAuthProvider.objects.filter(
                user=existing_user,
                provider=self.initial_data.get('provider'),
                provider_user_id=self.initial_data.get('provider_user_id')
            ).first()
            
            if not existing_provider:
                # Email exists but different provider or no provider
                raise serializers.ValidationError(
                    "An account with this email already exists. Please use a different provider or login directly."
                )
        
        return value

    def validate_preferred_subdomain(self, value):
        """Validate subdomain format and uniqueness if provided."""
        if value:
            # Basic subdomain validation (reuse from RegistrationSerializer)
            import re
            if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', value.lower()):
                raise serializers.ValidationError(
                    "Subdomain must contain only lowercase letters, numbers, and hyphens, "
                    "and cannot start or end with a hyphen."
                )
            
            # Check if subdomain is already taken
            if Organization.objects.filter(sub_domain=value.lower()).exists():
                raise serializers.ValidationError("This subdomain is already taken.")
        
        return value.lower() if value else value

    @transaction.atomic
    def create(self, validated_data):
        """Create or link user account with social provider."""
        provider = validated_data['provider']
        provider_user_id = validated_data['provider_user_id']
        email = validated_data['email']
        
        # Check if this provider account already exists
        existing_provider = AccountAuthProvider.objects.filter(
            provider=provider,
            provider_user_id=provider_user_id
        ).first()
        
        if existing_provider:
            # User already exists with this provider, just return the user
            return existing_provider.user
        
        # Check if user exists with this email
        existing_user = Account.objects.filter(email=email).first()
        
        if existing_user:
            # Link this provider to existing user
            AccountAuthProvider.objects.create(
                user=existing_user,
                provider=provider,
                provider_user_id=provider_user_id,
                email=email,
                is_primary=not existing_user.auth_providers.exists()  # Primary if first provider
            )
            
            # Update user info if needed
            if validated_data.get('avatar') and not existing_user.avatar:
                existing_user.avatar = validated_data['avatar']
                existing_user.save(update_fields=['avatar'])
            
            return existing_user
        
        # Create new user with organization (similar to regular registration)
        organization_name = validated_data.get('organization_name', '')
        preferred_subdomain = validated_data.get('preferred_subdomain', None)
        
        # Set default organization name if not provided
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        if not organization_name:
            organization_name = f"{first_name} {last_name}".strip() or f"{email.split('@')[0]}'s Organization"
        
        # Generate unique subdomain (reuse from RegistrationSerializer)
        subdomain = self._generate_unique_subdomain(first_name, last_name, preferred_subdomain)
        
        # Create organization
        organization = Organization.objects.create(
            name=organization_name,
            sub_domain=subdomain,
            creator_email=email,
            creator_name=f"{first_name} {last_name}".strip(),
            on_trial=True,
            trial_ends_on=timezone.now().date() + timedelta(days=14),  # 14-day trial
            is_active=True
        )
        
        # Create user account
        user_data = {
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'avatar': validated_data.get('avatar', ''),
            'organization': organization,
            'is_org_creator': True,
            'is_org_admin': True,
            'can_invite_users': True,
            'can_manage_billing': True,
            'can_delete_org': True,
            'is_email_verified': True,  # Trust social provider email verification
            'status': 'ACTIVE'  # Skip email verification for social logins
        }
        
        # Create user without password (social login only)
        user = Account.objects.create(**user_data)
        
        # Create auth provider record
        AccountAuthProvider.objects.create(
            user=user,
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            is_primary=True  # Primary provider for new user
        )
        
        # Initialize trial subscription
        try:
            trial_plan = Plan.objects.filter(amount=0, trial_period_days__gt=0).first()
            if trial_plan:
                Subscription.objects.create(
                    account=user,
                    organization=organization,
                    plan=trial_plan,
                    status=SubscriptionStatus.TRIALING,
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timedelta(days=14),
                    trial_start=timezone.now(),
                    trial_end=timezone.now() + timedelta(days=14),
                    stripe_subscription_id='trial_' + str(user.id),
                    stripe_customer_id='trial_customer_' + str(user.id),
                )
        except Exception:
            pass
        
        return user

    def _generate_unique_subdomain(self, first_name, last_name, preferred=None):
        """Generate a unique subdomain for the organization."""
        if preferred:
            return preferred
        
        # Create base subdomain from name
        base = f"{first_name.lower()}-{last_name.lower()}" if first_name and last_name else "user"
        
        # Remove any non-alphanumeric characters except hyphens
        import re
        base = re.sub(r'[^a-z0-9-]', '', base.lower())
        base = re.sub(r'-+', '-', base)  # Replace multiple hyphens with single
        base = base.strip('-')  # Remove leading/trailing hyphens
        
        # Ensure minimum length
        if len(base) < 3:
            base = f"user-{base}"
        
        # Check uniqueness and add suffix if needed
        subdomain = base
        counter = 1
        while Organization.objects.filter(sub_domain=subdomain).exists():
            subdomain = f"{base}-{counter}"
            counter += 1
            if counter > 100:  # Safety break
                import uuid
                subdomain = f"{base}-{str(uuid.uuid4())[:8]}"
                break
        
        return subdomain


class SocialLoginSerializer(serializers.Serializer):
    """Serializer for existing user social login."""
    provider = serializers.ChoiceField(
        choices=['google', 'github', 'facebook', 'twitter'],
        help_text="Social auth provider"
    )
    provider_user_id = serializers.CharField(
        help_text="Unique user ID from the social provider"
    )
    email = serializers.EmailField(help_text="Email from social provider")

    def validate(self, attrs):
        """Validate that the provider account exists."""
        provider = attrs['provider']
        provider_user_id = attrs['provider_user_id']
        
        # Find the auth provider record
        try:
            auth_provider = AccountAuthProvider.objects.get(
                provider=provider,
                provider_user_id=provider_user_id
            )
            attrs['user'] = auth_provider.user
        except AccountAuthProvider.DoesNotExist:
            raise serializers.ValidationError(
                "No account found for this social provider. Please register first."
            )
        
        return attrs