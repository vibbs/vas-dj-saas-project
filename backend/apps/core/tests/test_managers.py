"""
Comprehensive tests for core managers and querysets.

Tests the multi-tenant organization-scoped managers that provide
automatic filtering and tenant-aware operations.
"""

from unittest.mock import Mock, patch

import pytest
from django.contrib.auth import get_user_model
from django.db import models

from apps.core.managers import (
    OrganizationManager,
    TenantAwareManager,
    TenantAwareQuerySet,
)
from apps.core.models import TenantAwareModel

Account = get_user_model()


# Create a test model for manager testing
class SampleTenantModel(TenantAwareModel):
    """Test model for manager testing."""

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    objects = TenantAwareManager()

    class Meta:
        app_label = "core"


@pytest.mark.django_db
@pytest.mark.managers
class TestOrganizationManager:
    """Test the OrganizationManager class."""

    def test_for_organization_with_organization_instance(self, organization_factory):
        """Test filtering by organization instance."""
        org1 = organization_factory()
        org2 = organization_factory()

        manager = OrganizationManager()
        manager.model = SampleTenantModel

        # Create a mock queryset
        mock_queryset = Mock()
        manager.filter = Mock(return_value=mock_queryset)

        result = manager.for_organization(org1)

        manager.filter.assert_called_once_with(organization_id=org1.id)
        assert result == mock_queryset

    def test_for_organization_with_organization_id(self):
        """Test filtering by organization ID."""
        manager = OrganizationManager()
        manager.model = SampleTenantModel

        mock_queryset = Mock()
        manager.filter = Mock(return_value=mock_queryset)

        org_id = 123
        result = manager.for_organization(org_id)

        manager.filter.assert_called_once_with(organization_id=org_id)
        assert result == mock_queryset

    def test_global_records(self):
        """Test getting global records without organization."""
        manager = OrganizationManager()
        manager.model = SampleTenantModel

        mock_queryset = Mock()
        manager.filter = Mock(return_value=mock_queryset)

        result = manager.global_records()

        manager.filter.assert_called_once_with(organization__isnull=True)
        assert result == mock_queryset

    def test_for_user_organizations_with_authenticated_user(
        self, user_with_org, organization_factory
    ):
        """Test getting records for user's organizations."""
        user = user_with_org
        org1 = organization_factory()
        org2 = organization_factory()

        manager = OrganizationManager()
        manager.model = SampleTenantModel

        # Mock the organization membership query
        with patch(
            "apps.organizations.models.OrganizationMembership.objects.filter"
        ) as mock_filter:
            mock_membership_qs = Mock()
            mock_membership_qs.values_list.return_value = [org1.id, org2.id]
            mock_filter.return_value = mock_membership_qs

            mock_queryset = Mock()
            manager.filter = Mock(return_value=mock_queryset)

            result = manager.for_user_organizations(user)

            # Should query for active memberships
            mock_filter.assert_called_once_with(user=user, status="active")
            mock_membership_qs.values_list.assert_called_once_with(
                "organization_id", flat=True
            )

            # Should filter by user's organizations and global records
            manager.filter.assert_called_once()
            call_args = manager.filter.call_args[0][0]  # Get the Q object
            assert result == mock_queryset

    def test_for_user_organizations_with_unauthenticated_user(self):
        """Test with unauthenticated user returns empty queryset."""
        manager = OrganizationManager()
        manager.model = SampleTenantModel

        mock_empty_qs = Mock()
        manager.none = Mock(return_value=mock_empty_qs)

        # Test with None user
        result = manager.for_user_organizations(None)
        manager.none.assert_called_once()
        assert result == mock_empty_qs

        # Reset mock
        manager.none.reset_mock()

        # Test with unauthenticated user
        user = Mock()
        user.is_authenticated = False
        result = manager.for_user_organizations(user)
        manager.none.assert_called_once()
        assert result == mock_empty_qs

    def test_create_for_organization_with_organization_instance(
        self, organization_factory
    ):
        """Test creating record with organization instance."""
        org = organization_factory()

        manager = OrganizationManager()
        manager.model = SampleTenantModel

        mock_instance = Mock()
        manager.create = Mock(return_value=mock_instance)

        result = manager.create_for_organization(
            org, name="Test Record", description="Test description"
        )

        manager.create.assert_called_once_with(
            organization=org, name="Test Record", description="Test description"
        )
        assert result == mock_instance

    def test_create_for_organization_with_organization_id(self):
        """Test creating record with organization ID."""
        org_id = 456

        manager = OrganizationManager()
        manager.model = SampleTenantModel

        mock_instance = Mock()
        manager.create = Mock(return_value=mock_instance)

        result = manager.create_for_organization(org_id, name="Test Record")

        manager.create.assert_called_once_with(
            organization_id=org_id, name="Test Record"
        )
        assert result == mock_instance

    def test_manager_inheritance(self):
        """Test that OrganizationManager properly inherits from models.Manager."""
        manager = OrganizationManager()

        assert isinstance(manager, models.Manager)
        assert hasattr(manager, "all")
        assert hasattr(manager, "filter")
        assert hasattr(manager, "create")
        assert hasattr(manager, "get")

    def test_manager_methods_exist(self):
        """Test that all expected methods exist on the manager."""
        manager = OrganizationManager()

        expected_methods = [
            "for_organization",
            "global_records",
            "for_user_organizations",
            "create_for_organization",
        ]

        for method in expected_methods:
            assert hasattr(manager, method)
            assert callable(getattr(manager, method))


@pytest.mark.django_db
@pytest.mark.managers
class TestTenantAwareQuerySet:
    """Test the TenantAwareQuerySet class."""

    def test_queryset_inheritance(self):
        """Test that TenantAwareQuerySet inherits from models.QuerySet."""
        qs = TenantAwareQuerySet(model=SampleTenantModel)

        assert isinstance(qs, models.QuerySet)
        assert hasattr(qs, "filter")
        assert hasattr(qs, "exclude")
        assert hasattr(qs, "all")

    def test_for_organization_with_instance(self, organization_factory):
        """Test QuerySet filtering by organization instance."""
        org = organization_factory()

        qs = TenantAwareQuerySet(model=SampleTenantModel)
        mock_filtered_qs = Mock()
        qs.filter = Mock(return_value=mock_filtered_qs)

        result = qs.for_organization(org)

        qs.filter.assert_called_once_with(organization_id=org.id)
        assert result == mock_filtered_qs

    def test_for_organization_with_id(self):
        """Test QuerySet filtering by organization ID."""
        org_id = 789

        qs = TenantAwareQuerySet(model=SampleTenantModel)
        mock_filtered_qs = Mock()
        qs.filter = Mock(return_value=mock_filtered_qs)

        result = qs.for_organization(org_id)

        qs.filter.assert_called_once_with(organization_id=org_id)
        assert result == mock_filtered_qs

    def test_global_records(self):
        """Test QuerySet filtering for global records."""
        qs = TenantAwareQuerySet(model=SampleTenantModel)
        mock_filtered_qs = Mock()
        qs.filter = Mock(return_value=mock_filtered_qs)

        result = qs.global_records()

        qs.filter.assert_called_once_with(organization__isnull=True)
        assert result == mock_filtered_qs

    def test_exclude_organization_with_instance(self, organization_factory):
        """Test QuerySet excluding organization instance."""
        org = organization_factory()

        qs = TenantAwareQuerySet(model=SampleTenantModel)
        mock_excluded_qs = Mock()
        qs.exclude = Mock(return_value=mock_excluded_qs)

        result = qs.exclude_organization(org)

        qs.exclude.assert_called_once_with(organization_id=org.id)
        assert result == mock_excluded_qs

    def test_exclude_organization_with_id(self):
        """Test QuerySet excluding organization ID."""
        org_id = 101112

        qs = TenantAwareQuerySet(model=SampleTenantModel)
        mock_excluded_qs = Mock()
        qs.exclude = Mock(return_value=mock_excluded_qs)

        result = qs.exclude_organization(org_id)

        qs.exclude.assert_called_once_with(organization_id=org_id)
        assert result == mock_excluded_qs

    def test_queryset_method_chaining(self, organization_factory):
        """Test that QuerySet methods can be chained."""
        org1 = organization_factory()
        org2 = organization_factory()

        qs = TenantAwareQuerySet(model=SampleTenantModel)

        # Mock the filter and exclude methods to return the same instance
        qs.filter = Mock(return_value=qs)
        qs.exclude = Mock(return_value=qs)

        # Chain methods
        result = qs.for_organization(org1).exclude_organization(org2)

        # Should be chainable
        assert result == qs
        qs.filter.assert_called_with(organization_id=org1.id)
        qs.exclude.assert_called_with(organization_id=org2.id)


@pytest.mark.django_db
@pytest.mark.managers
class TestTenantAwareManager:
    """Test the TenantAwareManager class."""

    def test_manager_inheritance(self):
        """Test that TenantAwareManager inherits from OrganizationManager."""
        manager = TenantAwareManager()

        assert isinstance(manager, OrganizationManager)
        assert isinstance(manager, models.Manager)

    def test_get_queryset_returns_custom_queryset(self):
        """Test that get_queryset returns TenantAwareQuerySet."""
        manager = TenantAwareManager()
        manager.model = SampleTenantModel
        manager._db = "default"

        qs = manager.get_queryset()

        assert isinstance(qs, TenantAwareQuerySet)
        assert qs.model == SampleTenantModel

    def test_manager_method_delegation(self, organization_factory):
        """Test that manager methods delegate to QuerySet."""
        org = organization_factory()

        manager = TenantAwareManager()
        manager.model = SampleTenantModel
        manager._db = "default"

        # Mock the get_queryset to return a mock QuerySet
        mock_qs = Mock(spec=TenantAwareQuerySet)
        mock_filtered_qs = Mock()
        mock_global_qs = Mock()
        mock_excluded_qs = Mock()

        mock_qs.for_organization.return_value = mock_filtered_qs
        mock_qs.global_records.return_value = mock_global_qs
        mock_qs.exclude_organization.return_value = mock_excluded_qs

        manager.get_queryset = Mock(return_value=mock_qs)

        # Test delegation
        result1 = manager.for_organization(org)
        result2 = manager.global_records()
        result3 = manager.exclude_organization(org)

        # Verify delegation
        mock_qs.for_organization.assert_called_once_with(org)
        mock_qs.global_records.assert_called_once()
        mock_qs.exclude_organization.assert_called_once_with(org)

        # Verify results
        assert result1 == mock_filtered_qs
        assert result2 == mock_global_qs
        assert result3 == mock_excluded_qs

    def test_manager_has_all_expected_methods(self):
        """Test that manager has all expected methods."""
        manager = TenantAwareManager()

        # Methods from OrganizationManager
        organization_methods = [
            "for_organization",
            "global_records",
            "for_user_organizations",
            "create_for_organization",
        ]

        # Methods from TenantAwareManager
        tenant_methods = ["get_queryset", "exclude_organization"]

        all_methods = organization_methods + tenant_methods

        for method in all_methods:
            assert hasattr(manager, method)
            assert callable(getattr(manager, method))

    def test_manager_preserves_organization_methods(
        self, user_with_org, organization_factory
    ):
        """Test that inherited OrganizationManager methods still work."""
        manager = TenantAwareManager()
        manager.model = SampleTenantModel
        manager._db = "default"

        # Test that inherited methods are still callable
        assert callable(manager.for_user_organizations)
        assert callable(manager.create_for_organization)

        # These methods should still work (they don't delegate to QuerySet)
        with patch("apps.organizations.models.OrganizationMembership.objects.filter"):
            manager.none = Mock()
            manager.for_user_organizations(None)  # Should handle None user
            manager.none.assert_called_once()


@pytest.mark.django_db
@pytest.mark.managers
@pytest.mark.integration
class TestManagerIntegration:
    """Integration tests for managers with actual model operations."""

    def test_organization_manager_with_real_model(self, organization_factory):
        """Test OrganizationManager with a real model scenario."""
        org1 = organization_factory(name="Organization 1")
        org2 = organization_factory(name="Organization 2")

        # This would normally be done with a real model, but we'll simulate
        class MockModel:
            objects = OrganizationManager()

            def __init__(self, organization=None, **kwargs):
                self.organization = organization
                self.id = kwargs.get("id", 1)

            class _meta:
                app_label = "test"

        manager = OrganizationManager()
        manager.model = MockModel

        # Mock the filter method to test the logic
        def mock_filter(**kwargs):
            # Simulate filtering behavior
            if "organization_id" in kwargs:
                return f"Filtered by org_id: {kwargs['organization_id']}"
            elif "organization__isnull" in kwargs:
                return "Global records"
            return "All records"

        manager.filter = mock_filter

        # Test filtering by organization
        result1 = manager.for_organization(org1)
        assert result1 == f"Filtered by org_id: {org1.id}"

        # Test global records
        result2 = manager.global_records()
        assert result2 == "Global records"

    def test_tenant_aware_queryset_chaining_behavior(self):
        """Test that TenantAwareQuerySet methods can be realistically chained."""
        # Create a more realistic test
        qs = TenantAwareQuerySet(model=SampleTenantModel)

        # Mock methods to return self for chaining
        original_filter = qs.filter
        original_exclude = qs.exclude

        def chainable_filter(*args, **kwargs):
            # In real Django, filter returns a new QuerySet, but for testing...
            return qs

        def chainable_exclude(*args, **kwargs):
            return qs

        qs.filter = chainable_filter
        qs.exclude = chainable_exclude

        # Test method chaining
        result = qs.for_organization(123).exclude_organization(456).global_records()

        # Should return the queryset instance (in real usage, would be a new QuerySet)
        assert result == qs

    def test_manager_error_handling(self):
        """Test manager error handling with invalid inputs."""
        manager = OrganizationManager()
        manager.model = SampleTenantModel

        # Mock methods to avoid database calls
        manager.filter = Mock()
        manager.none = Mock()

        # Test with None organization
        manager.for_organization(None)
        manager.filter.assert_called_with(organization_id=None)

        # Test with invalid user types
        manager.for_user_organizations("invalid_user")
        manager.none.assert_called_once()

    def test_queryset_manager_compatibility(self):
        """Test that QuerySet and Manager methods are compatible."""
        manager = TenantAwareManager()
        manager.model = SampleTenantModel
        manager._db = "default"

        # Get the queryset
        qs = manager.get_queryset()

        # Both should have the same method signatures
        import inspect

        manager_sig = inspect.signature(manager.for_organization)
        qs_sig = inspect.signature(qs.for_organization)

        assert manager_sig == qs_sig

        manager_global_sig = inspect.signature(manager.global_records)
        qs_global_sig = inspect.signature(qs.global_records)

        assert manager_global_sig == qs_global_sig
