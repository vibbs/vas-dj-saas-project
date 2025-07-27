# accounts/models.py

from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models
from django.utils import timezone
from django.conf import settings
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
        choices=[(tag, tag.value) for tag in GenderTypes],
        default=GenderTypes.UNKNOWN,
    )
    role = models.CharField(
        max_length=10,
        choices=[(tag, tag.value) for tag in UserRoleTypes],
        default=UserRoleTypes.USER,
    )

    # Auth flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # For Django Admin
    is_2fa_enabled = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    # Metadata
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    status = models.CharField(
        max_length=10,
        choices=[(tag, tag.value) for tag in UserStatusTypes],
        default=UserStatusTypes.ACTIVE,
    )

    # Admin roles
    is_org_admin = models.BooleanField(default=False)
    is_org_creator = models.BooleanField(default=False)

    # Optional: Admin permissions
    can_invite_users = models.BooleanField(default=False)
    can_manage_billing = models.BooleanField(default=False)
    can_delete_org = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.email} ({self.organization.name})"

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
        first = str(self.first_name) if self.first_name else ""
        last = str(self.last_name) if self.last_name else ""
        if first and last:
            return f"{first[0].upper()}{last[0].upper()}"
        return str(self.email)[0].upper() if self.email else "UKN"

    # @property
    # def organization(self):
    #     """Get the organization this user belongs to"""
    #     from django.db import connection
    #     from apps.organization.models import Organization

    #     # The tenant schema name corresponds to the organization
    #     schema_name = connection.schema_name
    #     return Organization.objects.get(schema_name=schema_name)

    # @property
    # def is_founder(self):
    #     """Check if this user is the organization founder"""
    #     org = self.organization
    #     return org.created_by_id == self.id if org.created_by else False

    class Meta:
        verbose_name = "Account"
        verbose_name_plural = "Accounts"
        ordering = ["-date_joined"]
        unique_together = [["organization", "email"]]
