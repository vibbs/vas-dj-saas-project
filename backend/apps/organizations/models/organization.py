import uuid
import re
from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseFields
from ..managers import OrganizationManager


class Organization(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(3, message=_("Organization name must be at least 3 characters long."))
        ],
        help_text="Name of the organization (3-100 characters)",
    )
    slug = models.SlugField(
        unique=True,
        max_length=50,
        help_text="URL-friendly version of the organization name"
    )
    description = models.TextField(blank=True, null=True)
    logo = models.URLField(blank=True, null=True)

    # Base fields without organization FK (this is the root tenant)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        "accounts.Account",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_organizations",
    )
    
    # Legacy creator fields (can be removed later)
    creator_email = models.EmailField()
    creator_name = models.CharField(max_length=255, blank=True)

    # Business metadata
    is_active = models.BooleanField(default=True)
    plan = models.CharField(
        max_length=20,
        choices=[
            ('free_trial', 'Free Trial'),
            ('starter', 'Starter'),
            ('pro', 'Pro'),
            ('enterprise', 'Enterprise'),
        ],
        default='free_trial',
        help_text="Current plan tier"
    )
    paid_until = models.DateField(blank=True, null=True)
    on_trial = models.BooleanField(default=False)
    trial_ends_on = models.DateField(blank=True, null=True)
    sub_domain = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique subdomain for the organization (3-50 characters, alphanumeric and hyphens only)",
        validators=[
            MinLengthValidator(3, message=_("Subdomain must be at least 3 characters long.")),
            RegexValidator(
                regex=r'^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$',
                message=_("Subdomain can only contain alphanumeric characters and hyphens. Cannot start or end with hyphen.")
            )
        ],
    )

    # Manager
    objects = OrganizationManager()

    def clean(self):
        """Validate organization data."""
        super().clean()
        
        # Validate subdomain format
        if self.sub_domain:
            # Check for reserved subdomains
            reserved_subdomains = {
                'www', 'api', 'admin', 'mail', 'ftp', 'app', 'apps', 'support',
                'help', 'blog', 'docs', 'status', 'dev', 'test', 'staging'
            }
            if self.sub_domain.lower() in reserved_subdomains:
                raise ValidationError({
                    'sub_domain': _("This subdomain is reserved and cannot be used.")
                })
        
        # Validate plan consistency
        if self.on_trial and self.plan not in ['free_trial']:
            raise ValidationError({
                'plan': _("Organizations on trial must have 'free_trial' plan.")
            })
        
        if self.paid_until and self.on_trial:
            raise ValidationError({
                'paid_until': _("Organizations on trial cannot have a paid_until date.")
            })
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"

    def get_owner_membership(self):
        """Get the owner membership for this organization."""
        return self.memberships.filter(role='owner', status='active').first()

    def get_owner(self):
        """Get the owner account for this organization."""
        owner_membership = self.get_owner_membership()
        return owner_membership.user if owner_membership else None

    def has_active_subscription(self):
        """Check if organization has an active subscription."""
        return hasattr(self, 'subscription') and self.subscription.status in ['active', 'trialing']
    
    def is_trial_expired(self):
        """Check if trial period has expired."""
        from django.utils import timezone
        return self.on_trial and self.trial_ends_on and self.trial_ends_on < timezone.now().date()
    
    def get_active_members_count(self):
        """Get count of active members in organization."""
        return self.memberships.filter(status='active').count()
    
    def get_pending_invites_count(self):
        """Get count of pending invites."""
        return self.invites.filter(status='pending').count()
    
    def can_add_member(self):
        """Check if organization can add more members based on plan limits."""
        # This could be enhanced with actual plan limits
        if self.plan == 'free_trial':
            return self.get_active_members_count() < 5
        elif self.plan == 'starter':
            return self.get_active_members_count() < 10
        elif self.plan == 'pro':
            return self.get_active_members_count() < 50
        # Enterprise has no limit
        return True

    class Meta:
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ["-created_at"]