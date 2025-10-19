"""
Platform Capability System

This module provides a capability map that determines which features are enabled
based on the deployment mode (Global Mode vs Multi-Tenant Mode).

Frontend applications query this to conditionally show/hide features like
organization creation, workspace switching, etc.
"""

from django.conf import settings


def get_platform_capabilities():
    """
    Get the platform capability map based on current configuration.

    Returns:
        dict: Capability map with boolean flags for each feature
    """
    is_global_mode = getattr(settings, "GLOBAL_MODE_ENABLED", False)

    if is_global_mode:
        # Global Mode: Single platform scope, no org management
        return {
            "mode": "global",
            "org_creation": False,  # Cannot create new organizations
            "org_switching": False,  # Cannot switch between organizations
            "org_management": False,  # Cannot manage organization settings
            "org_billing": False,  # No per-org billing
            "subdomain_routing": False,  # No subdomain-based routing
            "member_invites": False,  # No org member invitations
            "org_deletion": False,  # Cannot delete organizations
            "api_keys": True,  # Personal API keys still available
            "personal_settings": True,  # Personal settings available
            "global_scope_slug": getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform"),
        }
    else:
        # Multi-Tenant Mode: Full organization functionality
        return {
            "mode": "multi_tenant",
            "org_creation": True,
            "org_switching": True,
            "org_management": True,
            "org_billing": True,
            "subdomain_routing": True,
            "member_invites": True,
            "org_deletion": True,
            "api_keys": True,
            "personal_settings": True,
            "global_scope_slug": None,  # No global scope in multi-tenant
        }


def is_global_mode_enabled():
    """
    Check if Global Mode is enabled.

    Returns:
        bool: True if GLOBAL_MODE_ENABLED is True
    """
    return getattr(settings, "GLOBAL_MODE_ENABLED", False)


def get_global_scope_org_slug():
    """
    Get the slug of the global scope organization.

    Returns:
        str: Organization slug for global scope, or None if not in global mode
    """
    if is_global_mode_enabled():
        return getattr(settings, "GLOBAL_SCOPE_ORG_SLUG", "platform")
    return None


def can_create_organization():
    """Check if users can create new organizations."""
    return not is_global_mode_enabled()


def can_manage_organization():
    """Check if users can manage organization settings."""
    return not is_global_mode_enabled()


def can_delete_organization():
    """Check if users can delete organizations."""
    return not is_global_mode_enabled()


def can_invite_members():
    """Check if users can invite members to organizations."""
    return not is_global_mode_enabled()


def can_switch_organizations():
    """Check if users can switch between organizations."""
    return not is_global_mode_enabled()
