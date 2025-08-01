from rest_framework.permissions import BasePermission


class IsOrgAdmin(BasePermission):
    """Allow access only to organization admins."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not hasattr(request, "organization") or not request.organization:
            return False

        return (
            request.user.is_org_admin
            and request.user.organization == request.organization
        )
