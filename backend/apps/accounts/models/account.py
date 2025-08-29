# accounts/models.py

from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import secrets
from apps.accounts.enums import UserRoleTypes, GenderTypes, UserStatusTypes

from apps.core.models import BaseFields


class AccountManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if (
            extra_fields.get("is_staff") is not True
            or extra_fields.get("is_superuser") is not True
        ):
            raise ValueError("Superuser must have is_staff=True and is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class AccountAuthProvider(BaseFields, models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="auth_providers",
    )
    provider = models.CharField(max_length=50)  # e.g. 'email', 'google', 'github'
    provider_user_id = models.CharField(max_length=255)  # e.g. Google UID
    email = models.EmailField()  # provider email (may differ from primary user email)
    linked_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False)  # main login method

    class Meta:
        unique_together = ("provider", "provider_user_id")  # ensures no dupes

    def __str__(self):
        return f"{self.provider} ({self.email})"


class Account(BaseFields, AbstractBaseUser, PermissionsMixin):
    # User identification
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    avatar = models.URLField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=GenderTypes.choices(),
        default=GenderTypes.UNKNOWN.value,
    )
    role = models.CharField(
        max_length=10,
        choices=UserRoleTypes.choices(),
        default=UserRoleTypes.USER.value,
    )

    # Auth flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # For Django Admin
    is_2fa_enabled = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    # Metadata
    date_joined = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=10,
        choices=UserStatusTypes.choices(),
        default=UserStatusTypes.ACTIVE.value,
    )

    # Admin roles
    is_org_admin = models.BooleanField(default=False)
    is_org_creator = models.BooleanField(default=False)

    # Optional: Admin permissions
    can_invite_users = models.BooleanField(default=False)
    can_manage_billing = models.BooleanField(default=False)
    can_delete_org = models.BooleanField(default=False)
    
    # Email verification fields
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_token_expires = models.DateTimeField(blank=True, null=True)

    objects = AccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.email}"

    @property
    def is_admin(self):
        return self.is_org_admin or self.is_org_creator

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def short_name(self):
        return self.first_name or self.email

    @property
    def abbreviated_name(self):
        # Return the first letter of the first name and the last name
        first = str(self.first_name).strip() if self.first_name else ""
        last = str(self.last_name).strip() if self.last_name else ""
        
        if first and last:
            return f"{first[0].upper()}{last[0].upper()}"
        elif first:
            return first[0].upper()
        elif last:
            return last[0].upper()
        else:
            return str(self.email)[0].upper() if self.email else "UKN"

    def generate_email_verification_token(self):
        """Generate a new email verification token."""
        self.email_verification_token = secrets.token_urlsafe(32)
        self.email_verification_token_expires = timezone.now() + timedelta(hours=24)
        self.save(update_fields=['email_verification_token', 'email_verification_token_expires'])
        return self.email_verification_token

    def verify_email(self, token):
        """Verify email using the provided token."""
        if not self.email_verification_token or not self.email_verification_token_expires:
            return False
        
        if self.email_verification_token != token:
            return False
        
        if timezone.now() > self.email_verification_token_expires:
            return False
        
        # Mark email as verified and clear token
        self.is_email_verified = True
        self.status = UserStatusTypes.ACTIVE.value
        self.email_verification_token = None
        self.email_verification_token_expires = None
        self.save(update_fields=[
            'is_email_verified', 
            'status', 
            'email_verification_token', 
            'email_verification_token_expires'
        ])
        return True

    def send_verification_email(self):
        """Send email verification email to the user."""
        if self.is_email_verified:
            return False
        
        # Generate verification token
        token = self.generate_email_verification_token()
        
        # Import here to avoid circular imports
        from apps.email_service.services import send_email
        
        # Send verification email
        primary_org = self.get_primary_organization()
        verification_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
        
        context = {
            'user': self,
            'verification_token': token,
            'verification_url': verification_url,
            'organization': primary_org or {'name': 'VAS-DJ Platform'},  # Fallback for users without org
            'subject': 'Verify Your Email Address - VAS-DJ'
        }
        
        try:
            send_email(
                organization=primary_org,  # This can be None for users without org
                recipient=self,
                template_slug='email_verification',
                context=context
            )
            return True
        except Exception as e:
            # Log the specific error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email to {self.email}: {str(e)}")
            
            # Log the traceback for better debugging
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # If it's an email template issue, we could fall back to a simple email
            # For now, we'll return False and let the calling code handle it
            return False

    # Membership-based methods
    def get_memberships(self):
        """Get all organization memberships for this user."""
        return self.organization_memberships.all()
    
    def get_active_memberships(self):
        """Get all active organization memberships for this user."""
        return self.organization_memberships.filter(status='active')
    
    def get_primary_organization(self):
        """Get the primary organization for this user (for backward compatibility)."""
        # If user has direct organization (legacy), return it
        if self.organization:
            return self.organization
        
        # Otherwise, get the first active membership's organization
        membership = self.get_active_memberships().first()
        return membership.organization if membership else None
    
    def get_organizations(self):
        """Get all organizations this user is a member of."""
        return [m.organization for m in self.get_active_memberships()]
    
    def has_membership_in(self, organization):
        """Check if user has any membership in the given organization."""
        return self.organization_memberships.filter(
            organization=organization
        ).exists()
    
    def has_active_membership_in(self, organization):
        """Check if user has active membership in the given organization."""
        return self.organization_memberships.filter(
            organization=organization,
            status='active'
        ).exists()
    
    def get_membership_in(self, organization):
        """Get membership in the given organization, if any."""
        return self.organization_memberships.filter(
            organization=organization
        ).first()
    
    def is_owner_of(self, organization):
        """Check if user is owner of the given organization."""
        membership = self.get_membership_in(organization)
        return membership and membership.is_owner()
    
    def is_admin_of(self, organization):
        """Check if user is admin or owner of the given organization."""
        membership = self.get_membership_in(organization)
        return membership and membership.is_admin()
    
    def can_manage_members_in(self, organization):
        """Check if user can manage members in the given organization."""
        membership = self.get_membership_in(organization)
        return membership and membership.can_manage_members()
    
    def can_manage_billing_in(self, organization):
        """Check if user can manage billing in the given organization."""
        membership = self.get_membership_in(organization)
        return membership and membership.can_manage_billing()
    
    def create_default_organization(self, name=None):
        """Create a default organization for this user (for trial users)."""
        from apps.organizations.models import Organization, OrganizationMembership
        from django.utils.text import slugify
        
        if not name:
            name = f"{self.full_name or self.email}'s Organization"
        
        # Generate unique slug
        base_slug = slugify(name)[:40]  # Limit length
        slug = base_slug
        counter = 1
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create organization
        organization = Organization.objects.create(
            name=name,
            slug=slug,
            creator_email=self.email,
            creator_name=self.full_name,
            created_by=self,
            plan='free_trial',
            on_trial=True,
            sub_domain=slug  # Use same as slug for now
        )
        
        # Create owner membership
        membership = OrganizationMembership.objects.create(
            organization=organization,
            user=self,
            role='owner',
            status='active'
        )
        
        return organization, membership

    # Legacy compatibility property (deprecated)
    @property  
    def is_founder(self):
        """Check if this user is founder of their primary organization (deprecated)."""
        org = self.get_primary_organization()
        return org and org.created_by_id == self.id if org and hasattr(org, 'created_by') else False

    class Meta:
        verbose_name = "Account"
        verbose_name_plural = "Accounts"
        ordering = ["-date_joined"]
        # Removed unique_together constraint - users can exist across multiple orgs
