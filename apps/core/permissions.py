# In core/permissions.py
from rest_framework.permissions import BasePermission


class OrganizationAccessPermission(BasePermission):
    """Ensure user belongs to the organization associated with the request."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not hasattr(request, "organization") or not request.organization:
            return False

        return request.user.organization == request.organization
