from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.billing.models import Plan, Subscription, SubscriptionStatus
from apps.organizations.models import Organization, OrganizationMembership

from .models import Account, AccountAuthProvider


class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model with read-only computed fields."""

    full_name = serializers.CharField(read_only=True)
    abbreviated_name = serializers.CharField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

    class Meta:
        model = Account
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "abbreviated_name",
            "avatar",
            "phone",
            "bio",
            "date_of_birth",
            "gender",
            "role",
            "is_active",
            "is_email_verified",
            "is_phone_verified",
            "is_2fa_enabled",
            "date_joined",
            "status",
            "is_admin",
            "is_org_admin",
            "is_org_creator",
            "can_invite_users",
            "can_manage_billing",
            "can_delete_org",
        ]
        read_only_fields = ["id", "date_joined", "is_active"]
        extra_kwargs = {"password": {"write_only": True}, "email": {"required": True}}


class AccountCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new user accounts with password confirmation."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
            "bio",
            "date_of_birth",
            "gender",
        ]

    def validate(self, attrs):
        """Validate that password and password_confirm match."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(_("Passwords don't match"))
        return attrs

    def create(self, validated_data):
        """Create a new user account."""
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = Account.objects.create_user(password=password, **validated_data)
        return user


class AccountAuthProviderSerializer(serializers.ModelSerializer):
    """Serializer for authentication provider information."""

    class Meta:
        model = AccountAuthProvider
        fields = [
            "id",
            "provider",
            "provider_user_id",
            "email",
            "linked_at",
            "is_primary",
        ]
        read_only_fields = ["id", "linked_at"]


class RegistrationSerializer(serializers.ModelSerializer):
    """Enhanced serializer for user registration with automatic organization creation."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    # Optional organization details
    organization_name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Organization name (optional, defaults to 'FirstName LastName')",
    )
    preferred_subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        min_length=3,
        max_length=50,
        help_text="Preferred subdomain (optional, auto-generated if not provided)",
    )

    class Meta:
        model = Account
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
            "organization_name",
            "preferred_subdomain",
        ]

    def validate_email(self, value):
        """Ensure email is unique across all accounts."""
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                _("An account with this email already exists.")
            )
        return value

    def validate_organization_name(self, value):
        """Validate organization name length."""
        if value and len(value) > 100:
            raise serializers.ValidationError(
                _("Organization name cannot be longer than 100 characters.")
            )
        return value

    def validate_preferred_subdomain(self, value):
        """Validate subdomain format and uniqueness if provided."""
        if value:
            # Basic subdomain validation
            import re

            if not re.match(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$", value.lower()):
                raise serializers.ValidationError(
                    _(
                        "Subdomain must contain only lowercase letters, numbers, and hyphens, "
                        "and cannot start or end with a hyphen."
                    )
                )

            # Check if subdomain is already taken
            if Organization.objects.filter(sub_domain=value.lower()).exists():
                raise serializers.ValidationError(_("This subdomain is already taken."))

        return value.lower() if value else value

    def validate(self, attrs):
        """Validate that password and password_confirm match and meets requirements."""
        password = attrs.get("password")
        password_confirm = attrs.get("password_confirm")

        # Check password confirmation match
        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": [_("Passwords don't match")]}
            )

        # Validate password strength with custom rules (independent of Django settings)
        password_errors = []

        # Check password length
        if len(password) < 8:
            password_errors.append(_("Password must be at least 8 characters long."))

        # Check for common passwords
        common_passwords = ["password", "password123", "12345678", "qwerty", "abc123"]
        if password.lower() in common_passwords:
            password_errors.append(_("This password is too common."))

        # Check for variety - at least 2 different types of characters
        has_digit = any(c.isdigit() for c in password)
        has_alpha = any(c.isalpha() for c in password)
        has_special = any(c in '!@#$%^&*(),.?":{}|<>' for c in password)

        char_types = sum([has_digit, has_alpha, has_special])
        if char_types < 2:
            password_errors.append(
                _(
                    "Password must contain at least 2 different types of characters (letters, digits, symbols)."
                )
            )

        # Check for too repetitive (same character repeated)
        if len(set(password)) < 4:  # Must have at least 4 different characters
            password_errors.append(_("Password contains too many repeated characters."))

        if password_errors:
            raise serializers.ValidationError({"password": password_errors})

        return attrs

    def _generate_unique_subdomain(self, first_name, last_name, preferred=None):
        """Generate a unique subdomain for the organization."""
        if preferred:
            # Ensure preferred subdomain doesn't exceed 50 characters
            return preferred[:50]

        # Create base subdomain from name
        base = (
            f"{first_name.lower()}-{last_name.lower()}"
            if first_name and last_name
            else "user"
        )

        # Handle unicode characters by transliterating them to ASCII equivalents
        import re
        import unicodedata

        # Normalize unicode characters (é -> e, ü -> u, etc.)
        base = unicodedata.normalize("NFD", base)
        base = "".join(
            c for c in base if unicodedata.category(c) != "Mn"
        )  # Remove accents

        # Remove any non-alphanumeric characters except hyphens
        base = re.sub(r"[^a-z0-9-]", "", base.lower())
        base = re.sub(r"-+", "-", base)  # Replace multiple hyphens with single
        base = base.strip("-")  # Remove leading/trailing hyphens

        # Ensure minimum length
        if len(base) < 3:
            base = f"user-{base}"

        # Truncate base to allow room for counter suffixes (leave 10 chars for counter)
        base = base[:40]

        # Check uniqueness and add suffix if needed
        subdomain = base
        counter = 1
        while Organization.objects.filter(sub_domain=subdomain).exists():
            # Ensure the full subdomain with counter doesn't exceed 50 chars
            suffix = f"-{counter}"
            if len(base) + len(suffix) > 50:
                # Truncate base further to make room for suffix
                truncated_base = base[: 50 - len(suffix)]
                subdomain = f"{truncated_base}{suffix}"
            else:
                subdomain = f"{base}{suffix}"

            counter += 1
            if counter > 100:  # Safety break
                import uuid

                # Ensure UUID suffix doesn't exceed limit
                uuid_suffix = str(uuid.uuid4())[:8]
                if len(base) + len(uuid_suffix) + 1 > 50:
                    truncated_base = base[: 50 - len(uuid_suffix) - 1]
                    subdomain = f"{truncated_base}-{uuid_suffix}"
                else:
                    subdomain = f"{base}-{uuid_suffix}"
                break

        return subdomain[:50]  # Final safety truncation

    @transaction.atomic
    def create(self, validated_data):
        """Create user account with automatic organization setup and trial initialization."""
        # Extract organization-specific data
        organization_name = validated_data.pop("organization_name", "")
        preferred_subdomain = validated_data.pop("preferred_subdomain", None)
        password_confirm = validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # Set default organization name if not provided
        if not organization_name:
            first_name = validated_data.get("first_name", "")
            last_name = validated_data.get("last_name", "")
            organization_name = (
                f"{first_name} {last_name}".strip() or "Personal Organization"
            )

        # Ensure organization name doesn't exceed database limit
        organization_name = organization_name[:100]

        # Generate unique subdomain
        subdomain = self._generate_unique_subdomain(
            validated_data.get("first_name", ""),
            validated_data.get("last_name", ""),
            preferred_subdomain,
        )

        # Create user account first (without organization)
        validated_data["status"] = "PENDING"  # Pending email verification
        try:
            user = Account.objects.create_user(password=password, **validated_data)
        except IntegrityError as e:
            if "accounts_account_email_key" in str(e):
                raise serializers.ValidationError(
                    {"email": _("An account with this email already exists.")}
                )
            else:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": _(
                            "Unable to create account. Please try again."
                        )
                    }
                )

        # Create organization and link via membership
        organization = Organization.objects.create(
            name=organization_name,
            slug=subdomain,  # Use subdomain as slug as well
            sub_domain=subdomain,
            creator_email=validated_data["email"],
            creator_name=f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip(),
            created_by=user,
            plan="free_trial",
            on_trial=True,
            trial_ends_on=timezone.now().date() + timedelta(days=14),  # 14-day trial
            is_active=True,
        )

        # Create owner membership
        OrganizationMembership.objects.create(
            organization=organization, user=user, role="owner", status="active"
        )

        # Set organization on user for backward compatibility
        user.organization = organization
        user.save(update_fields=["organization"])

        # Initialize trial subscription if there's a free trial plan
        try:
            trial_plan = Plan.objects.filter(amount=0, trial_period_days__gt=0).first()
            if trial_plan:
                Subscription.objects.create(
                    organization=organization,
                    plan=trial_plan,
                    status=SubscriptionStatus.TRIALING,
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timedelta(days=14),
                    trial_start=timezone.now(),
                    trial_end=timezone.now() + timedelta(days=14),
                    stripe_subscription_id="trial_" + str(user.id),  # Placeholder
                    stripe_customer_id="trial_customer_" + str(user.id),  # Placeholder
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

    @extend_schema_field(serializers.DictField)
    def get_organization(self, obj):
        """Return basic organization information."""
        # Handle both dictionary structure and object attribute access
        if isinstance(obj, dict):
            user = obj.get("user")
            if user:
                # Get primary organization from user's memberships
                org = user.get_primary_organization()
            else:
                org = obj.get("organization")
        else:
            # Get primary organization from user's memberships
            user = getattr(obj, "user", obj)
            org = (
                user.get_primary_organization()
                if hasattr(user, "get_primary_organization")
                else None
            )

        if org:
            return {
                "id": str(org.id),
                "name": org.name,
                "subdomain": org.sub_domain,
                "on_trial": org.on_trial,
                "trial_ends_on": (
                    org.trial_ends_on.isoformat() if org.trial_ends_on else None
                ),
            }
        return None


class ResendVerificationByEmailSerializer(serializers.Serializer):
    """Serializer for resending email verification by email address (unauthenticated)."""

    email = serializers.EmailField(
        help_text="Email address to resend verification to", required=True
    )

    def validate_email(self, value):
        """Validate email format (but don't check existence for security)"""
        # Basic email format validation is handled by EmailField
        # We intentionally don't check if the email exists in the system
        # to prevent email enumeration attacks
        return value.lower().strip()


class SocialRegistrationSerializer(serializers.Serializer):
    """Serializer for social login registration (Google, GitHub, etc.)."""

    provider = serializers.ChoiceField(
        choices=["google", "github", "facebook", "twitter"],
        help_text="Social auth provider",
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
        help_text="Organization name (optional, defaults to 'FirstName LastName')",
    )
    preferred_subdomain = serializers.CharField(
        required=False,
        allow_blank=True,
        min_length=3,
        max_length=50,
        help_text="Preferred subdomain (optional, auto-generated if not provided)",
    )

    def validate_email(self, value):
        """Check if email is already registered with a different provider."""
        existing_user = Account.objects.filter(email=value).first()
        if existing_user:
            # Check if this is the same provider
            existing_provider = AccountAuthProvider.objects.filter(
                user=existing_user,
                provider=self.initial_data.get("provider"),
                provider_user_id=self.initial_data.get("provider_user_id"),
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

            if not re.match(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$", value.lower()):
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
        provider = validated_data["provider"]
        provider_user_id = validated_data["provider_user_id"]
        email = validated_data["email"]

        # Check if this provider account already exists
        existing_provider = AccountAuthProvider.objects.filter(
            provider=provider, provider_user_id=provider_user_id
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
                is_primary=not existing_user.auth_providers.exists(),  # Primary if first provider
            )

            # Update user info if needed
            if validated_data.get("avatar") and not existing_user.avatar:
                existing_user.avatar = validated_data["avatar"]
                existing_user.save(update_fields=["avatar"])

            return existing_user

        # Create new user with organization (similar to regular registration)
        organization_name = validated_data.get("organization_name", "")
        preferred_subdomain = validated_data.get("preferred_subdomain", None)

        # Set default organization name if not provided
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")
        if not organization_name:
            organization_name = (
                f"{first_name} {last_name}".strip()
                or f"{email.split('@')[0]}'s Organization"
            )

        # Generate unique subdomain (reuse method from RegistrationSerializer)
        registration_serializer = RegistrationSerializer()
        subdomain = registration_serializer._generate_unique_subdomain(
            first_name, last_name, preferred_subdomain
        )

        # Create user account first (without organization)
        user_data = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "avatar": validated_data.get("avatar", ""),
            "is_email_verified": True,  # Trust social provider email verification
            "status": "ACTIVE",  # Skip email verification for social logins
        }

        # Create user without password (social login only) using create_user to ensure proper handling
        user = Account.objects.create_user(password=None, **user_data)
        user.set_unusable_password()  # Explicitly mark password as unusable for social-only accounts
        user.save(update_fields=["password"])

        # Create organization and link via membership
        organization = Organization.objects.create(
            name=organization_name,
            slug=subdomain,  # Use subdomain as slug as well
            sub_domain=subdomain,
            creator_email=email,
            creator_name=f"{first_name} {last_name}".strip(),
            created_by=user,
            plan="free_trial",
            on_trial=True,
            trial_ends_on=timezone.now().date() + timedelta(days=14),  # 14-day trial
            is_active=True,
        )

        # Create owner membership
        OrganizationMembership.objects.create(
            organization=organization, user=user, role="owner", status="active"
        )

        # Set organization on user for backward compatibility
        user.organization = organization
        user.save(update_fields=["organization"])

        # Create auth provider record
        AccountAuthProvider.objects.create(
            user=user,
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            is_primary=True,  # Primary provider for new user
        )

        # Initialize trial subscription
        try:
            trial_plan = Plan.objects.filter(amount=0, trial_period_days__gt=0).first()
            if trial_plan:
                Subscription.objects.create(
                    organization=organization,
                    plan=trial_plan,
                    status=SubscriptionStatus.TRIALING,
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timedelta(days=14),
                    trial_start=timezone.now(),
                    trial_end=timezone.now() + timedelta(days=14),
                    stripe_subscription_id="trial_" + str(user.id),
                    stripe_customer_id="trial_customer_" + str(user.id),
                )
        except Exception:
            pass

        return user


class SocialLoginSerializer(serializers.Serializer):
    """Serializer for existing user social login."""

    provider = serializers.ChoiceField(
        choices=["google", "github", "facebook", "twitter"],
        help_text="Social auth provider",
    )
    provider_user_id = serializers.CharField(
        help_text="Unique user ID from the social provider"
    )
    email = serializers.EmailField(help_text="Email from social provider")

    def validate(self, attrs):
        """Validate that the provider account exists."""
        provider = attrs["provider"]
        provider_user_id = attrs["provider_user_id"]

        # Find the auth provider record
        try:
            auth_provider = AccountAuthProvider.objects.get(
                provider=provider, provider_user_id=provider_user_id
            )
            attrs["user"] = auth_provider.user
        except AccountAuthProvider.DoesNotExist:
            raise serializers.ValidationError(
                "No account found for this social provider. Please register first."
            )

        return attrs
