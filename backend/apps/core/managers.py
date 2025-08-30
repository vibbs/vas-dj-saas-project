"""
Custom managers for core models supporting multi-tenant architecture.

This module provides managers that automatically filter queries based on
organization context and provide utility methods for tenant-aware operations.
"""

from django.db import models
from typing import Optional


class OrganizationManager(models.Manager):
    """
    Manager for organization-scoped models.
    
    This manager provides methods for filtering and querying models
    that belong to specific organizations in a multi-tenant architecture.
    """
    
    def for_organization(self, organization):
        """
        Filter queryset to only include records for the specified organization.
        
        Args:
            organization: Organization instance or organization ID
            
        Returns:
            QuerySet filtered by organization
        """
        if hasattr(organization, 'id'):
            organization_id = organization.id
        else:
            organization_id = organization
            
        return self.filter(organization_id=organization_id)
    
    def global_records(self):
        """
        Get records that don't belong to any specific organization.
        
        Returns:
            QuerySet of records where organization is null
        """
        return self.filter(organization__isnull=True)
    
    def for_user_organizations(self, user):
        """
        Get records for all organizations the user has access to.
        
        Args:
            user: User instance
            
        Returns:
            QuerySet filtered by user's accessible organizations
        """
        if not user:
            return self.none()
            
        try:
            if not user.is_authenticated:
                return self.none()
        except AttributeError:
            # User object doesn't have is_authenticated (invalid user type)
            return self.none()
            
        # Get user's organization memberships
        from apps.organizations.models import OrganizationMembership
        user_orgs = OrganizationMembership.objects.filter(
            user=user, 
            status='active'
        ).values_list('organization_id', flat=True)
        
        return self.filter(
            models.Q(organization_id__in=user_orgs) |
            models.Q(organization__isnull=True)  # Include global records
        )
    
    def create_for_organization(self, organization, **kwargs):
        """
        Create a new record associated with the specified organization.
        
        Args:
            organization: Organization instance or organization ID
            **kwargs: Additional field values for the record
            
        Returns:
            Created model instance
        """
        if hasattr(organization, 'id'):
            kwargs['organization'] = organization
        else:
            kwargs['organization_id'] = organization
            
        return self.create(**kwargs)


class TenantAwareQuerySet(models.QuerySet):
    """
    QuerySet with tenant-aware methods for organization-scoped models.
    """
    
    def for_organization(self, organization):
        """Filter queryset by organization."""
        if hasattr(organization, 'id'):
            organization_id = organization.id
        else:
            organization_id = organization
            
        return self.filter(organization_id=organization_id)
    
    def global_records(self):
        """Get global records not tied to any organization."""
        return self.filter(organization__isnull=True)
    
    def exclude_organization(self, organization):
        """Exclude records from a specific organization."""
        if hasattr(organization, 'id'):
            organization_id = organization.id
        else:
            organization_id = organization
            
        return self.exclude(organization_id=organization_id)


class TenantAwareManager(OrganizationManager):
    """
    Enhanced manager that combines organization scoping with custom QuerySet.
    
    This manager uses TenantAwareQuerySet to provide both manager-level
    and queryset-level methods for tenant-aware operations.
    """
    
    def get_queryset(self):
        """Return the custom QuerySet for this manager."""
        return TenantAwareQuerySet(self.model, using=self._db)
    
    def for_organization(self, organization):
        """Delegate to QuerySet method."""
        return self.get_queryset().for_organization(organization)
    
    def global_records(self):
        """Delegate to QuerySet method."""
        return self.get_queryset().global_records()
    
    def exclude_organization(self, organization):
        """Delegate to QuerySet method."""
        return self.get_queryset().exclude_organization(organization)