"""
Comprehensive tests for the core permissions system.

Tests organization-based access control permissions that ensure
users can only access resources within their organization context.
"""

import pytest
from unittest.mock import Mock
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from apps.core.permissions import OrganizationAccessPermission


Account = get_user_model()


@pytest.mark.django_db
@pytest.mark.permissions
class TestOrganizationAccessPermission:
    """Test the OrganizationAccessPermission class."""
    
    def test_permission_denied_for_unauthenticated_user(self):
        """Test that unauthenticated users are denied access."""
        permission = OrganizationAccessPermission()
        request = Mock()
        request.user.is_authenticated = False
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_denied_when_no_organization_on_request(self):
        """Test that requests without organization context are denied."""
        permission = OrganizationAccessPermission()
        request = Mock()
        request.user.is_authenticated = True
        # No organization attribute on request
        delattr(request, 'organization') if hasattr(request, 'organization') else None
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_denied_when_organization_is_none(self):
        """Test that requests with None organization are denied."""
        permission = OrganizationAccessPermission()
        request = Mock()
        request.user.is_authenticated = True
        request.organization = None
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_granted_when_user_belongs_to_organization(self, organization, user_with_org):
        """Test that users belonging to the request organization are granted access."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        # Use a mock user to avoid is_authenticated property issues
        mock_user = Mock()
        mock_user.is_authenticated = True
        mock_user.organization = organization
        
        request.user = mock_user
        request.organization = organization
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is True

    def test_permission_denied_when_user_belongs_to_different_organization(self, organization):
        """Test that users from different organizations are denied access."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        # Create user with different organization
        user = Mock()
        user.is_authenticated = True
        different_org = Mock()
        user.organization = different_org
        
        request.user = user
        request.organization = organization
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_denied_when_user_has_no_organization(self, organization):
        """Test that users without an organization are denied access."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        user = Mock()
        user.is_authenticated = True
        user.organization = None
        
        request.user = user
        request.organization = organization
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_with_real_request_factory(self, organization, user_with_org):
        """Test permission using Django's APIRequestFactory for integration testing."""
        permission = OrganizationAccessPermission()
        factory = APIRequestFactory()
        request = factory.get('/api/test/')
        
        # Set up request context
        request.user = user_with_org
        request.organization = organization
        user_with_org.organization = organization
        
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is True

    def test_permission_inheritance_from_base_permission(self):
        """Test that OrganizationAccessPermission properly inherits from BasePermission."""
        permission = OrganizationAccessPermission()
        
        # Should inherit from BasePermission
        from rest_framework.permissions import BasePermission
        assert isinstance(permission, BasePermission)
        
        # Should have the required methods
        assert hasattr(permission, 'has_permission')
        assert callable(permission.has_permission)

    def test_permission_method_signature(self):
        """Test that has_permission method has the correct signature."""
        permission = OrganizationAccessPermission()
        
        import inspect
        sig = inspect.signature(permission.has_permission)
        params = list(sig.parameters.keys())
        
        # Should have request, view parameters (self is not included in bound method signature)
        assert params == ['request', 'view']

    def test_edge_case_user_organization_comparison_with_same_object(self, organization):
        """Test permission when user.organization and request.organization are the same object."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        user = Mock()
        user.is_authenticated = True
        user.organization = organization  # Same object reference
        
        request.user = user
        request.organization = organization  # Same object reference
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is True

    def test_edge_case_with_organization_attribute_but_falsy_value(self):
        """Test permission when organization attribute exists but is falsy."""
        permission = OrganizationAccessPermission()
        request = Mock()
        request.user.is_authenticated = True
        request.organization = ""  # Falsy but not None
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is False

    def test_permission_with_mock_equality_comparison(self):
        """Test that organization comparison works correctly with mock objects."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        # Create mock organization that's equal to itself
        org = Mock()
        org.__eq__ = Mock(return_value=True)
        
        user = Mock()
        user.is_authenticated = True
        user.organization = org
        
        request.user = user
        request.organization = org
        view = Mock()
        
        result = permission.has_permission(request, view)
        
        assert result is True

    def test_permission_docstring_and_class_attributes(self):
        """Test that the permission class has proper documentation."""
        permission = OrganizationAccessPermission()
        
        # Should have a proper docstring
        assert permission.__doc__ is not None
        assert "organization" in permission.__doc__.lower()
        assert "user" in permission.__doc__.lower()
        
        # Class should have proper name
        assert permission.__class__.__name__ == "OrganizationAccessPermission"


@pytest.mark.django_db
@pytest.mark.permissions
@pytest.mark.integration
class TestOrganizationAccessPermissionIntegration:
    """Integration tests for OrganizationAccessPermission with DRF views."""
    
    def test_permission_integration_with_drf_view(self, organization, user_with_org):
        """Test permission integration in a realistic DRF view scenario."""
        from rest_framework.decorators import api_view, permission_classes
        from rest_framework.response import Response
        from django.test import RequestFactory
        
        @api_view(['GET'])
        @permission_classes([OrganizationAccessPermission])
        def test_view(request):
            return Response({'success': True})
        
        factory = RequestFactory()
        request = factory.get('/api/test/')
        request.user = user_with_org
        request.organization = organization
        user_with_org.organization = organization
        
        # This tests that the permission would work in a real view context
        permission = OrganizationAccessPermission()
        assert permission.has_permission(request, test_view) is True

    def test_permission_with_multiple_organizations(self, organization_factory):
        """Test permission behavior with multiple organizations."""
        permission = OrganizationAccessPermission()
        
        org1 = organization_factory()
        org2 = organization_factory()
        
        request = Mock()
        user = Mock()
        user.is_authenticated = True
        user.organization = org1
        
        request.user = user
        view = Mock()
        
        # Test with matching organization
        request.organization = org1
        assert permission.has_permission(request, view) is True
        
        # Test with different organization
        request.organization = org2
        assert permission.has_permission(request, view) is False

    def test_permission_error_handling(self):
        """Test that permission handles unexpected errors gracefully."""
        permission = OrganizationAccessPermission()
        request = Mock()
        
        # Create a user that raises an exception when accessing is_authenticated
        user = Mock()
        user.is_authenticated = Mock(side_effect=AttributeError("Test error"))
        request.user = user
        
        view = Mock()
        
        # Should handle the exception gracefully (likely by returning False)
        try:
            result = permission.has_permission(request, view)
            # If it doesn't raise an exception, it should return False for safety
            assert result is False
        except AttributeError:
            # If it does raise, that's also acceptable behavior for a permission check
            pass