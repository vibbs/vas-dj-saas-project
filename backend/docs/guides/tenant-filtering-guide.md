# Tenant Filtering Guide

## Overview

This guide explains how to use the `TenantAwareViewSetMixin` to handle organization-based filtering automatically, eliminating boilerplate code and ensuring consistent tenant isolation across all ViewSets.

## The Problem

**Before**: Every ViewSet needed manual organization filtering:

```python
# ❌ OLD WAY - Repetitive boilerplate in every ViewSet
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        # This same code in EVERY ViewSet!
        if self.request.user.is_superuser:
            return Account.objects.all()

        user_org_ids = self.request.user.get_active_memberships().values_list(
            'organization_id', flat=True
        )
        return Account.objects.filter(
            organization_memberships__organization_id__in=user_org_ids
        ).distinct()

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        # Same code again!
        if self.request.user.is_superuser:
            return Invoice.objects.all()

        user_org_ids = self.request.user.get_active_memberships().values_list(
            'organization_id', flat=True
        )
        return Invoice.objects.filter(
            organization_id__in=user_org_ids
        ).distinct()

# ... repeat for every ViewSet!
```

**Issues with old way**:
- ❌ 15-20 lines of boilerplate per ViewSet
- ❌ Easy to forget or make mistakes
- ❌ Inconsistent implementation
- ❌ No N+1 query optimization
- ❌ No audit logging
- ❌ Hard to test

## The Solution

**After**: Use `TenantAwareViewSetMixin` - organization filtering is automatic!

```python
# ✅ NEW WAY - Clean and simple
from apps.core.mixins import TenantAwareViewSetMixin

class AccountViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    # That's it! Organization filtering is automatic.

class InvoiceViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    # Done! Fully tenant-isolated.

class ProjectViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    # Easy!
```

**Benefits**:
- ✅ **3 lines instead of 20** per ViewSet
- ✅ **Automatic tenant isolation** - can't forget it
- ✅ **Consistent** across all endpoints
- ✅ **N+1 query prevention** built-in
- ✅ **Audit logging** included
- ✅ **Easy to test** and maintain

## Basic Usage

### 1. Simple ViewSet (Foreign Key Relationship)

For models with direct `organization` foreign key:

```python
from apps.core.mixins import TenantAwareViewSetMixin
from rest_framework import viewsets

class InvoiceViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint for invoices.
    Automatically filtered by user's organizations.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

# Model:
class Invoice(BaseFields):  # BaseFields includes organization FK
    customer = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # organization field inherited from BaseFields
```

**What happens automatically**:
1. Non-superusers only see invoices from their organizations
2. Superusers see all invoices
3. Unauthenticated users see nothing
4. Access denied attempts are logged
5. Queries are optimized to prevent N+1

### 2. ViewSet with Membership Relationship

For models using many-to-many through memberships (like Account, Organization):

```python
class AccountViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint for user accounts.
    Automatically filtered by organization memberships.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

# Model:
class Account(AbstractBaseUser):
    email = models.EmailField(unique=True)
    # Many-to-many relationship via OrganizationMembership
```

**What happens automatically**:
1. Users see accounts from organizations they belong to
2. Handles M2M relationships automatically
3. Uses `.distinct()` to avoid duplicates
4. Optimized queries

## Advanced Configuration

### Customizing Organization Field Name

If your model uses a different field name:

```python
class TeamViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    # Custom organization field name
    organization_filter_field = 'company'  # Instead of 'organization'

# Model:
class Team(models.Model):
    name = models.CharField(max_length=100)
    company = models.ForeignKey(Organization, ...)  # Custom field name
```

### Query Optimizations (Prevent N+1)

Add `select_related` and `prefetch_related` for performance:

```python
class ProjectViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    # Optimize queries - prevent N+1 problem
    organization_select_related = ['created_by', 'organization', 'owner']
    organization_prefetch_related = ['members', 'tags', 'attachments']

# Generated SQL will include JOINs and prefetch queries automatically!
```

### Audit Logging

Enable automatic audit logging for all CRUD operations:

```python
from apps.core.audit import AuditAction

class InvoiceViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    # Enable audit logging
    audit_actions = {
        'create': AuditAction.RESOURCE_CREATED,
        'update': AuditAction.RESOURCE_UPDATED,
        'destroy': AuditAction.RESOURCE_DELETED,
    }

# All create/update/delete operations logged automatically!
```

### Disabling Superuser Access

If you want to restrict even superusers to their organizations:

```python
class SensitiveDataViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = SensitiveData.objects.all()
    serializer_class = SensitiveDataSerializer

    # Superusers must also be organization members
    allow_superuser_access = False
```

### Manual Filter Method

Specify how to filter if auto-detection isn't working:

```python
class CustomViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = CustomModel.objects.all()
    serializer_class = CustomSerializer

    # Force specific filter method
    organization_filter_method = 'foreign_key'  # or 'membership'
```

## Complete Example

Here's a comprehensive real-world example:

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.mixins import TenantAwareViewSetMixin
from apps.core.audit import AuditAction
from .models import Project
from .serializers import ProjectSerializer, ProjectStatsSerializer

class ProjectViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint for project management.

    Features:
    - Automatic organization filtering (tenant isolation)
    - Query optimization (N+1 prevention)
    - Audit logging for all changes
    - Custom action for statistics
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    # Organization filtering configuration
    organization_select_related = ['created_by', 'organization', 'owner']
    organization_prefetch_related = ['members', 'tags']

    # Audit logging
    audit_actions = {
        'create': AuditAction.RESOURCE_CREATED,
        'update': AuditAction.RESOURCE_UPDATED,
        'destroy': AuditAction.RESOURCE_DELETED,
    }

    # Standard DRF configuration
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'owner']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'priority']

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get project statistics.

        Organization access is automatically checked!
        """
        project = self.get_object()  # Automatically checks organization access

        # Your business logic here
        stats = {
            'total_tasks': project.tasks.count(),
            'completed_tasks': project.tasks.filter(status='completed').count(),
            'team_size': project.members.count(),
        }

        serializer = ProjectStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archive a project.

        Access control and audit logging are automatic!
        """
        project = self.get_object()
        project.status = 'archived'
        project.save()

        # This is automatically logged because of audit_actions
        return Response({'status': 'Project archived successfully'})
```

## Migration Guide

### Updating Existing ViewSets

**Step 1**: Add the mixin

```python
# Before
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()

# After
from apps.core.mixins import TenantAwareViewSetMixin

class MyViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
```

**Step 2**: Remove manual `get_queryset()` (if it only does organization filtering)

```python
# Before
class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()

    def get_queryset(self):
        # Delete this entire method if it only does org filtering!
        user_org_ids = self.request.user.get_active_memberships().values_list(...)
        return MyModel.objects.filter(...)

# After
class MyViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    # Done! Method removed.
```

**Step 3**: Keep custom filtering if needed

```python
# If you have ADDITIONAL custom filtering, keep get_queryset():
class MyViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = MyModel.objects.all()

    def get_queryset(self):
        # Call super() to get organization-filtered queryset
        queryset = super().get_queryset()

        # Then add your custom filtering
        if self.request.query_params.get('active_only'):
            queryset = queryset.filter(is_active=True)

        return queryset
```

## Testing

The mixin makes testing easier:

```python
import pytest
from rest_framework import status

@pytest.mark.django_db
def test_tenant_isolation(api_client, user1, user2, organization1, organization2):
    """Test that users cannot access other organizations' data."""

    # user1 belongs to organization1
    # user2 belongs to organization2

    project1 = Project.objects.create(organization=organization1, name="Org 1 Project")
    project2 = Project.objects.create(organization=organization2, name="Org 2 Project")

    # User 1 authenticates
    api_client.force_authenticate(user=user1)

    # User 1 can see their project
    response = api_client.get(f'/api/v1/projects/{project1.id}/')
    assert response.status_code == status.HTTP_200_OK

    # User 1 CANNOT see user 2's project (tenant isolation!)
    response = api_client.get(f'/api/v1/projects/{project2.id}/')
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
```

## Manual Access Checking

Need to manually check access in a custom action?

```python
from apps.core.mixins import TenantAwareViewSetMixin
from rest_framework.decorators import action

class ProjectViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple projects."""

        project_ids = request.data.get('project_ids', [])
        projects = Project.objects.filter(id__in=project_ids)

        # Manually check access for each project
        for project in projects:
            self.check_organization_access(project)  # Raises PermissionDenied if no access

        # Safe to proceed - user has access to all projects
        for project in projects:
            project.status = request.data['status']
            project.save()

        return Response({'status': 'success'})
```

## Common Patterns

### Pattern 1: Simple CRUD ViewSet

```python
class InvoiceViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
```

**Lines of code**: 3 (vs 20+ without mixin)

### Pattern 2: ViewSet with Optimizations

```python
class ProjectViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    organization_select_related = ['created_by', 'organization']
    organization_prefetch_related = ['members']
```

**Lines of code**: 5 (vs 30+ with manual optimization)

### Pattern 3: ViewSet with Audit Logging

```python
class InvoiceViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    audit_actions = {
        'create': AuditAction.RESOURCE_CREATED,
        'update': AuditAction.RESOURCE_UPDATED,
        'destroy': AuditAction.RESOURCE_DELETED,
    }
```

**Lines of code**: 8 (vs 50+ with manual logging)

## Troubleshooting

### Issue: "AttributeError: get_active_memberships"

**Cause**: User model doesn't have `get_active_memberships()` method.

**Solution**: Add method to your Account model:

```python
class Account(AbstractBaseUser):
    def get_active_memberships(self):
        return self.organization_memberships.filter(status='active')
```

### Issue: "Nothing is filtered, users see all data"

**Cause**: Mixin not first in inheritance order.

**Solution**: Put mixin BEFORE `viewsets.ModelViewSet`:

```python
# ❌ Wrong order
class MyViewSet(viewsets.ModelViewSet, TenantAwareViewSetMixin):
    pass

# ✅ Correct order
class MyViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    pass
```

### Issue: "M2M relationships not working"

**Cause**: Model uses memberships but mixin is using foreign_key method.

**Solution**: Explicitly set filter method:

```python
class AccountViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    organization_filter_method = 'membership'  # Force membership filtering
```

## Benefits Summary

| Aspect | Without Mixin | With Mixin |
|--------|--------------|------------|
| **Lines of code** | 20-50 per ViewSet | 3-10 per ViewSet |
| **Consistency** | Manual, error-prone | Automatic, consistent |
| **N+1 Prevention** | Manual optimization needed | Built-in |
| **Audit Logging** | Manual implementation | Built-in |
| **Testing** | Complex setup | Simple |
| **Maintenance** | Update every ViewSet | Update once in mixin |
| **Security** | Easy to forget | Impossible to forget |

## Next Steps

1. **Update existing ViewSets**: Start with most critical endpoints
2. **Add query optimizations**: Use `organization_select_related/prefetch_related`
3. **Enable audit logging**: Add `audit_actions` configuration
4. **Write tests**: Verify tenant isolation for all endpoints
5. **Monitor**: Check audit logs for access denied attempts

## References

- **Mixin Source**: `apps/core/mixins.py`
- **ADR 001**: Tenant Isolation Strategy
- **Security Best Practices**: `docs/guides/security-best-practices.md`
- **Test Examples**: `apps/core/tests/security/test_tenant_isolation.py`

---

**Summary**: The `TenantAwareViewSetMixin` reduces boilerplate from 20+ lines to 3 lines per ViewSet while ensuring consistent tenant isolation, query optimization, and audit logging across your entire API.
