"""
Reusable mixins for Django REST Framework ViewSets.

These mixins provide common functionality like organization-based filtering,
audit logging, and permission checking for multi-tenant SaaS applications.
"""

from typing import Optional
from django.db.models import QuerySet, Q
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from apps.core.audit import log_audit_event, AuditAction


class OrganizationFilterMixin:
    """
    Mixin that automatically filters querysets by user's organizations.

    This mixin handles all the complexity of tenant isolation, so you don't
    have to write the same filtering logic in every ViewSet.

    Usage:
        class MyViewSet(OrganizationFilterMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            organization_filter_field = 'organization'  # Default

    Features:
        - Automatically filters by user's active organizations
        - Handles superusers (can see all data)
        - Supports custom organization field names
        - Supports M2M relationships via memberships
        - Applies select_related/prefetch_related automatically
        - Logs access denied attempts

    Configuration:
        organization_filter_field (str): Field name for organization FK
            Default: 'organization'
            Example: 'team', 'company', etc.

        organization_filter_method (str): How to filter
            Options: 'foreign_key', 'membership'
            Default: Auto-detect based on model

        organization_select_related (list): Fields to select_related
            Example: ['created_by', 'organization']

        organization_prefetch_related (list): Fields to prefetch_related
            Example: ['members', 'tags']

        allow_superuser_access (bool): Allow superusers to see all data
            Default: True
    """

    organization_filter_field = 'organization'
    organization_filter_method = None  # Auto-detect
    organization_select_related = None
    organization_prefetch_related = None
    allow_superuser_access = True

    def get_queryset(self) -> QuerySet:
        """
        Filter queryset by user's organizations automatically.

        Override this method only if you need additional custom filtering.
        """
        queryset = super().get_queryset() if hasattr(super(), 'get_queryset') else self.queryset

        # Apply organization filtering
        queryset = self._apply_organization_filter(queryset)

        # Apply performance optimizations
        queryset = self._apply_query_optimizations(queryset)

        return queryset

    def _apply_organization_filter(self, queryset: QuerySet) -> QuerySet:
        """
        Apply organization-based filtering to queryset.

        This is the core logic that ensures tenant isolation.
        """
        user = self.request.user

        # Superusers can see everything (if allowed)
        if self.allow_superuser_access and user.is_superuser:
            return queryset

        # Unauthenticated users see nothing
        if not user.is_authenticated:
            return queryset.none()

        # Detect filter method if not specified
        filter_method = self._get_filter_method()

        if filter_method == 'foreign_key':
            return self._filter_by_foreign_key(queryset, user)
        elif filter_method == 'membership':
            return self._filter_by_membership(queryset, user)
        else:
            # Fallback: try foreign key first, then membership
            try:
                return self._filter_by_foreign_key(queryset, user)
            except Exception:
                return self._filter_by_membership(queryset, user)

    def _get_filter_method(self) -> str:
        """
        Auto-detect the appropriate filtering method.

        Returns:
            'foreign_key' if model has direct organization FK
            'membership' if model uses M2M through memberships
        """
        if self.organization_filter_method:
            return self.organization_filter_method

        # Check if model has direct organization field
        model = self.queryset.model
        if hasattr(model, self.organization_filter_field):
            return 'foreign_key'

        # Check if model has organization_memberships (many-to-many)
        if hasattr(model, 'organization_memberships'):
            return 'membership'

        # Default to foreign key
        return 'foreign_key'

    def _filter_by_foreign_key(self, queryset: QuerySet, user) -> QuerySet:
        """
        Filter by direct foreign key to organization.

        For models like: Invoice, Project, Task
        That have: organization = ForeignKey(Organization)
        """
        # Get user's active organizations
        user_org_ids = user.get_active_memberships().values_list(
            'organization_id', flat=True
        )

        # Filter by organization field
        filter_kwargs = {f'{self.organization_filter_field}_id__in': user_org_ids}
        return queryset.filter(**filter_kwargs).distinct()

    def _filter_by_membership(self, queryset: QuerySet, user) -> QuerySet:
        """
        Filter by many-to-many relationship through memberships.

        For models like: Account, Organization
        That have: organization_memberships M2M relationship
        """
        # Get user's active organizations
        user_org_ids = user.get_active_memberships().values_list(
            'organization_id', flat=True
        )

        # Filter by membership
        return queryset.filter(
            organization_memberships__organization_id__in=user_org_ids
        ).distinct()

    def _apply_query_optimizations(self, queryset: QuerySet) -> QuerySet:
        """
        Apply select_related and prefetch_related for performance.

        This prevents N+1 query problems.
        """
        # Apply select_related
        if self.organization_select_related:
            queryset = queryset.select_related(*self.organization_select_related)

        # Apply prefetch_related
        if self.organization_prefetch_related:
            queryset = queryset.prefetch_related(*self.organization_prefetch_related)

        return queryset

    def check_organization_access(self, obj, user=None, raise_exception=True) -> bool:
        """
        Check if user has access to object's organization.

        Args:
            obj: Model instance to check
            user: User to check (defaults to request.user)
            raise_exception: Whether to raise PermissionDenied or return False

        Returns:
            True if user has access, False otherwise (if raise_exception=False)

        Raises:
            PermissionDenied: If user doesn't have access (if raise_exception=True)
        """
        user = user or self.request.user

        # Superusers always have access
        if self.allow_superuser_access and user.is_superuser:
            return True

        # Get object's organization
        if hasattr(obj, self.organization_filter_field):
            obj_org = getattr(obj, self.organization_filter_field)
        else:
            # Try to get via memberships
            obj_orgs = obj.organization_memberships.values_list('organization_id', flat=True)
            user_org_ids = set(user.get_active_memberships().values_list(
                'organization_id', flat=True
            ))
            has_access = bool(set(obj_orgs) & user_org_ids)

            if not has_access:
                if raise_exception:
                    self._log_access_denied(obj, user)
                    raise PermissionDenied("You don't have access to this resource.")
                return False
            return True

        # Check if user is member of object's organization
        has_access = user.get_active_memberships().filter(
            organization=obj_org
        ).exists()

        if not has_access:
            if raise_exception:
                self._log_access_denied(obj, user)
                raise PermissionDenied("You don't have access to this organization's data.")
            return False

        return True

    def _log_access_denied(self, obj, user):
        """Log access denied attempts for security monitoring."""
        model_name = obj.__class__.__name__
        log_audit_event(
            action=AuditAction.ACCESS_DENIED,
            request=self.request,
            user=user,
            resource_type=model_name,
            resource_id=str(obj.pk),
            success=False,
            details={
                'reason': 'user_not_in_organization',
                'model': model_name
            }
        )


class AuditLoggingMixin:
    """
    Mixin that automatically logs CRUD operations to audit trail.

    Usage:
        class MyViewSet(AuditLoggingMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            audit_actions = {
                'create': AuditAction.RESOURCE_CREATED,
                'update': AuditAction.RESOURCE_UPDATED,
                'destroy': AuditAction.RESOURCE_DELETED,
            }
    """

    audit_actions = None  # Override with dict of action mappings

    def perform_create(self, serializer):
        """Log resource creation."""
        instance = serializer.save()
        self._log_crud_action('create', instance)
        return instance

    def perform_update(self, serializer):
        """Log resource update."""
        instance = serializer.save()
        self._log_crud_action('update', instance)
        return instance

    def perform_destroy(self, instance):
        """Log resource deletion."""
        self._log_crud_action('destroy', instance)
        instance.delete()

    def _log_crud_action(self, action_type: str, instance):
        """Log CRUD operation to audit trail."""
        if not self.audit_actions or action_type not in self.audit_actions:
            return

        audit_action = self.audit_actions[action_type]
        model_name = instance.__class__.__name__

        log_audit_event(
            action=audit_action,
            request=self.request,
            resource_type=model_name,
            resource_id=str(instance.pk),
            success=True,
            details={
                'action': action_type,
                'model': model_name
            }
        )


class TenantAwareViewSetMixin(OrganizationFilterMixin, AuditLoggingMixin):
    """
    Comprehensive mixin combining organization filtering and audit logging.

    This is the recommended mixin for all multi-tenant ViewSets.

    Usage:
        class MyViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer

            # Optional: customize behavior
            organization_select_related = ['created_by', 'organization']
            organization_prefetch_related = ['tags']
            audit_actions = {
                'create': AuditAction.RESOURCE_CREATED,
                'update': AuditAction.RESOURCE_UPDATED,
                'destroy': AuditAction.RESOURCE_DELETED,
            }

    That's it! Organization filtering and audit logging are automatic.
    """
    pass


# Backwards compatibility
TenantMixin = TenantAwareViewSetMixin
