import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class OrganizationMembershipManager(models.Manager):
    def active(self):
        """Return only active memberships."""
        return self.filter(status="active")

    def for_user(self, user):
        """Get all memberships for a user."""
        return self.filter(user=user)

    def for_organization(self, organization):
        """Get all memberships for an organization."""
        return self.filter(organization=organization)


class OrganizationMembership(models.Model):
    """
    N:M relationship between Account and Organization with roles and status.
    This is the core of the membership-based tenancy system.
    """

    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    STATUS_CHOICES = [
        ("invited", "Invited"),
        ("active", "Active"),
        ("suspended", "Suspended"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    joined_at = models.DateTimeField(default=timezone.now)

    # Who invited/managed this membership
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_membership_invites",
    )

    objects = OrganizationMembershipManager()

    class Meta:
        unique_together = [["organization", "user"]]
        verbose_name = "Organization Membership"
        verbose_name_plural = "Organization Memberships"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "organization"], name="membership_user_org_idx"
            ),
            models.Index(
                fields=["organization", "status"], name="membership_org_status_idx"
            ),
            models.Index(fields=["user", "status"], name="membership_user_status_idx"),
            models.Index(fields=["role", "status"], name="membership_role_status_idx"),
            models.Index(fields=["status"], name="membership_status_idx"),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.organization.name} ({self.role})"

    def clean(self):
        """Validate business rules for memberships."""
        super().clean()

        # Note: User is required at database level, so no need to validate here

        # Validate status transitions
        if self.pk:
            try:
                current = OrganizationMembership.objects.get(pk=self.pk)
                if current.status == "active" and self.status == "invited":
                    raise ValidationError(
                        {
                            "status": _(
                                "Cannot change active membership back to invited status."
                            )
                        }
                    )
            except OrganizationMembership.DoesNotExist:
                pass

        # Ensure at least one owner per organization (skip for testing inactive memberships)
        if self.role != "owner" and self.pk and self.status == "active":
            # Check if this is the last owner being changed
            other_owners = OrganizationMembership.objects.filter(
                organization=self.organization, role="owner", status="active"
            ).exclude(pk=self.pk)

            if not other_owners.exists():
                # Check if current membership was an owner
                try:
                    current = OrganizationMembership.objects.get(pk=self.pk)
                    if current.role == "owner" and current.status == "active":
                        raise ValidationError(
                            _("Organization must have at least one active owner.")
                        )
                except OrganizationMembership.DoesNotExist:
                    pass

        # Validate organization membership limits (only for active memberships)
        if not self.pk and self.organization and self.status == "active":
            if not self.organization.can_add_member():
                raise ValidationError(
                    _("Organization has reached its member limit for the current plan.")
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def is_active(self):
        """Check if this membership is active."""
        return self.status == "active"

    def is_owner(self):
        """Check if this membership has owner role."""
        return self.role == "owner" and self.is_active()

    def is_admin(self):
        """Check if this membership has admin or owner role."""
        return self.role in ["admin", "owner"] and self.is_active()

    def can_manage_members(self):
        """Check if this membership can manage other members."""
        return self.is_admin()

    def can_manage_billing(self):
        """Check if this membership can manage billing."""
        return self.is_owner()  # Only owners can manage billing for now

    def get_permissions(self):
        """Get list of permissions for this membership."""
        permissions = ["view_organization"]

        if self.is_active():
            if self.role == "member":
                permissions.extend(["view_members"])
            elif self.role == "admin":
                permissions.extend(["view_members", "manage_members", "invite_members"])
            elif self.role == "owner":
                permissions.extend(
                    [
                        "view_members",
                        "manage_members",
                        "invite_members",
                        "manage_billing",
                        "delete_organization",
                        "manage_settings",
                    ]
                )

        return permissions

    def activate(self):
        """Activate this membership."""
        self.status = "active"
        self.joined_at = timezone.now()
        self.save(update_fields=["status", "joined_at", "updated_at"])

    def suspend(self):
        """Suspend this membership."""
        if self.status == "suspended":
            raise ValidationError(_("Membership is already suspended."))

        if self.is_owner():
            # Check if there are other owners
            other_owners = OrganizationMembership.objects.filter(
                organization=self.organization, role="owner", status="active"
            ).exclude(pk=self.pk)

            if not other_owners.exists():
                raise ValidationError(
                    _("Cannot suspend the last active owner of an organization.")
                )

        self.status = "suspended"
        self.save(update_fields=["status", "updated_at"])

    def reactivate(self):
        """Reactivate a suspended membership."""
        if self.status != "suspended":
            raise ValidationError(_("Can only reactivate suspended memberships."))

        # Check organization member limits
        if not self.organization.can_add_member():
            raise ValidationError(
                _("Organization has reached its member limit for the current plan.")
            )

        self.status = "active"
        self.joined_at = timezone.now()
        self.save(update_fields=["status", "joined_at", "updated_at"])

    def change_role(self, new_role):
        """Change membership role with validation."""
        if new_role not in dict(self.ROLE_CHOICES):
            raise ValidationError(_("Invalid role specified."))

        if self.role == new_role:
            return  # No change needed

        # If changing from owner, ensure there's another owner
        if self.role == "owner" and new_role != "owner":
            other_owners = OrganizationMembership.objects.filter(
                organization=self.organization, role="owner", status="active"
            ).exclude(pk=self.pk)

            if not other_owners.exists():
                raise ValidationError(
                    _("Organization must have at least one active owner.")
                )

        self.role = new_role
        self.save(update_fields=["role", "updated_at"])
