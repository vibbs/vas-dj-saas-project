from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)


class IsOrgMember(BasePermission):
    """
    Permission class that requires user to have active membership in the request organization.
    Superusers bypass this check for platform administration.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            logger.warning(f"User {request.user.email} attempted to access org-scoped endpoint without org context")
            return False
        
        # Must have active membership in the organization
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        return request.membership.is_active()


class IsOrgAdmin(BasePermission):
    """
    Permission class that requires user to have admin or owner role in the request organization.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have admin membership
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        return request.membership.is_admin()


class IsOrgOwner(BasePermission):
    """
    Permission class that requires user to have owner role in the request organization.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have owner membership
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        return request.membership.is_owner()


class CanManageMembers(BasePermission):
    """
    Permission class for member management capabilities.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have membership with member management capability
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        return request.membership.can_manage_members()


class CanManageBilling(BasePermission):
    """
    Permission class for billing management capabilities.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have membership with billing management capability
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        return request.membership.can_manage_billing()


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission class that allows read access to all org members but write access only to owners.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have active membership
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        if not request.membership.is_active():
            return False
        
        # Read permissions for all members
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for owners
        return request.membership.is_owner()


class IsAdminOrReadOnly(BasePermission):
    """
    Permission class that allows read access to all org members but write access only to admins/owners.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers bypass all org checks
        if request.user.is_superuser:
            return True
        
        # Must have organization context
        if not hasattr(request, 'org') or not request.org:
            return False
        
        # Must have active membership
        if not hasattr(request, 'membership') or not request.membership:
            return False
        
        if not request.membership.is_active():
            return False
        
        # Read permissions for all members
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for admins/owners
        return request.membership.is_admin()


# Legacy permission for backward compatibility (deprecated)
class OrganizationAccessPermission(BasePermission):
    """
    DEPRECATED: Use IsOrgMember instead.
    Legacy permission class for backward compatibility.
    """
    
    def has_permission(self, request, view):
        logger.warning(
            "OrganizationAccessPermission is deprecated. Use IsOrgMember instead."
        )
        
        if not request.user.is_authenticated:
            return False

        if not hasattr(request, "org") or not request.org:
            return False

        # Legacy: check direct organization relationship
        if hasattr(request.user, 'organization') and request.user.organization:
            return request.user.organization == request.org
        
        # New: check membership relationship
        return request.user.has_active_membership_in(request.org)
