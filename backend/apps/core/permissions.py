"""
Custom permission classes for the application.

Includes permissions for:
- Global mode capability checks
- Organization management
- RBAC enforcement
"""

from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.core.capabilities import (
    can_create_organization,
    can_delete_organization,
    can_invite_members,
    can_manage_organization,
    is_global_mode_enabled,
)


class OrganizationAccessPermission(BasePermission):
    """Ensure user belongs to the organization associated with the request."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not hasattr(request, "organization") or not request.organization:
            return False

        return request.user.organization == request.organization


class CanCreateOrganization(BasePermission):
    """
    Permission to check if users can create organizations.

    In Global Mode: Denies all organization creation
    In Multi-Tenant Mode: Allows authenticated users to create orgs
    """

    message = "Organization creation is not available in the current deployment mode."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Superusers can always create orgs (for admin purposes)
        if request.user.is_superuser:
            return True

        # Check if org creation is allowed
        if not can_create_organization():
            self.message = (
                "Organization creation is disabled. This platform operates in single-tenant mode. "
                "All users share a common workspace."
            )
            return False

        return True


class CanManageOrganization(BasePermission):
    """
    Permission to check if users can manage organization settings.

    In Global Mode: Only superusers can modify platform org
    In Multi-Tenant Mode: Admins/Owners can manage their orgs
    """

    message = "You do not have permission to manage organization settings."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers can always manage
        if request.user.is_superuser:
            return True

        # In global mode, prevent regular users from managing platform org
        if is_global_mode_enabled():
            global_org_slug = getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform")
            if obj.slug == global_org_slug:
                self.message = (
                    "Platform organization settings cannot be modified by users. "
                    "Contact system administrator."
                )
                return False

        # Multi-tenant mode: Check if user is admin/owner
        return request.user.is_admin_of(obj) or request.user.is_owner_of(obj)


class CanDeleteOrganization(BasePermission):
    """
    Permission to check if organizations can be deleted.

    In Global Mode: Platform org cannot be deleted
    In Multi-Tenant Mode: Only owners can delete
    """

    message = "You do not have permission to delete this organization."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Check if it's the platform org first (highest priority)
        if obj.extended_properties.get("is_global_scope", False):
            self.message = "This is a protected system organization and cannot be deleted."
            return False

        # Superusers can delete (except platform org which was already checked)
        if request.user.is_superuser:
            # Even superusers cannot delete platform org (double-check by slug)
            if is_global_mode_enabled():
                global_org_slug = getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform")
                if obj.slug == global_org_slug:
                    self.message = "Platform organization cannot be deleted."
                    return False
            return True

        # Check capability
        if not can_delete_organization():
            self.message = "Organization deletion is not available in the current deployment mode."
            return False

        # Multi-tenant mode: Only owners can delete
        return request.user.is_owner_of(obj)


class CanInviteMembers(BasePermission):
    """
    Permission to check if users can invite members to organizations.

    In Global Mode: Member invitations disabled
    In Multi-Tenant Mode: Admins can invite
    """

    message = "You do not have permission to invite members."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Superusers can always invite
        if request.user.is_superuser:
            return True

        # Check capability
        if not can_invite_members():
            self.message = (
                "Member invitations are not available. "
                "Users can register directly in this deployment mode."
            )
            return False

        return True

    def has_object_permission(self, request, view, obj):
        """Check if user can invite to specific organization."""
        if not self.has_permission(request, view):
            return False

        # Check if user is admin/owner of the organization
        return request.user.is_admin_of(obj)


class IsOrgMember(BasePermission):
    """
    Permission to check if user is a member of the organization.

    Works in both Global Mode and Multi-Tenant Mode.
    """

    message = "You are not a member of this organization."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers have access to all orgs
        if request.user.is_superuser:
            return True

        # Check membership
        membership = request.user.get_membership_in(obj)
        return membership is not None and membership.is_active()


class IsOrgAdmin(BasePermission):
    """
    Permission to check if user is an admin or owner of the organization.

    Works in both Global Mode and Multi-Tenant Mode.
    """

    message = "You must be an organization administrator to perform this action."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers have admin access
        if request.user.is_superuser:
            return True

        # Check if user is admin or owner
        return request.user.is_admin_of(obj) or request.user.is_owner_of(obj)


class IsOrgOwner(BasePermission):
    """
    Permission to check if user is an owner of the organization.

    Works in both Global Mode and Multi-Tenant Mode.
    """

    message = "You must be an organization owner to perform this action."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Superusers have owner access
        if request.user.is_superuser:
            return True

        # Check if user is owner
        return request.user.is_owner_of(obj)
