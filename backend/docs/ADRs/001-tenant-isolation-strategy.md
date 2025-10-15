# ADR 001: Tenant Isolation Strategy

## Status

Accepted

## Context

As a multi-tenant SaaS application, we need to ensure complete data isolation between organizations (tenants). Users must not be able to access data from organizations they don't belong to. This is a **critical security requirement** for compliance, data privacy, and customer trust.

## Decision

We implement **organization-based tenant isolation** using a combination of:

1. **Custom Tenant Middleware** (`apps/organizations/middleware/tenant.py`)
2. **Organization-scoped Database Queries**
3. **Tenant-aware Base Models** (`apps/core/models.py`)
4. **Membership-based Access Control**

### Implementation

#### 1. Tenant Middleware

The `TenantMiddleware` extracts organization context from:
- Subdomain routing (e.g., `acme.saas.com`)
- Request headers (`X-Organization-Slug`)
- Query parameters (fallback)

```python
# Attaches to request
request.organization = organization  # Organization instance
request.org_slug = org_slug         # Subdomain string
```

#### 2. Organization-Scoped Queries

All ViewSets override `get_queryset()` to filter by user's organizations:

```python
def get_queryset(self):
    if self.request.user.is_superuser:
        return Model.objects.all()

    user_org_ids = self.request.user.get_active_memberships().values_list(
        'organization_id', flat=True
    )
    return Model.objects.filter(
        organization_memberships__organization_id__in=user_org_ids
    ).distinct()
```

#### 3. Tenant-Aware Base Models

`TenantAwareModel` provides:
- Automatic organization scoping
- `TenantAwareManager` with `for_organization()` method
- Audit fields (`created_by`, `updated_by`)

#### 4. Membership-Based Access

`OrganizationMembership` model defines:
- User-to-organization relationships
- Role-based permissions (owner, admin, member)
- Status tracking (active, invited, suspended)

## Alternatives Considered

### 1. Schema-Based Multi-Tenancy (django-tenants)

**Rejected**: Too complex for our use case, makes migrations difficult, overkill for our scale.

### 2. Shared Schema with Row-Level Security (RLS)

**Rejected**: PostgreSQL RLS adds complexity, Django ORM doesn't support it natively.

### 3. Separate Databases per Tenant

**Rejected**: Doesn't scale, expensive infrastructure costs, complex maintenance.

## Consequences

### Positive

- ✅ **Strong data isolation** at application level
- ✅ **Simple to understand** and maintain
- ✅ **Flexible** - supports users in multiple organizations
- ✅ **Performant** - single database, efficient queries
- ✅ **Django-native** - uses standard ORM patterns

### Negative

- ⚠️ **Requires discipline** - developers must remember to filter by organization
- ⚠️ **Middleware dependency** - all requests must go through tenant middleware
- ⚠️ **Testing complexity** - tests must include organization context

### Mitigation Strategies

1. **Comprehensive test suite** - 25+ security tests for tenant isolation
2. **Audit logging** - all data access logged with organization context
3. **Code review focus** - security reviews prioritize tenant isolation
4. **Base model abstractions** - `TenantAwareModel` reduces boilerplate
5. **Lint rules** - Static analysis to detect missing organization filters

## Security Fixes Applied (October 2025)

### Critical Fix: AccountViewSet Data Leak

**Before** (VULNERABLE):
```python
queryset = Account.objects.all()  # Returns ALL users!
```

**After** (SECURE):
```python
def get_queryset(self):
    user_org_ids = self.request.user.get_active_memberships().values_list(
        'organization_id', flat=True
    )
    return Account.objects.filter(
        organization_memberships__organization_id__in=user_org_ids
    ).distinct()
```

### Critical Fix: OrganizationViewSet Data Leak

**Before** (VULNERABLE):
```python
queryset = Organization.objects.all()  # Returns ALL organizations!
```

**After** (SECURE):
```python
def get_queryset(self):
    if self.request.user.is_superuser:
        return Organization.objects.all()

    return Organization.objects.filter(
        memberships__user=self.request.user,
        memberships__status='active'
    ).distinct()
```

## Compliance & Audit

- **SOC 2 Type II**: Tenant isolation supports logical access controls
- **GDPR**: Data isolation helps meet data protection requirements
- **HIPAA**: Supports patient data isolation (if applicable)
- **Audit Trail**: All organization-scoped operations logged to `AuditLog`

## References

- [OWASP Multi-Tenancy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multitenant_Architecture_Cheat_Sheet.html)
- [Django Multi-Tenancy Patterns](https://books.agiliq.com/projects/django-multi-tenant/en/latest/)
- Security test suite: `apps/core/tests/security/test_tenant_isolation.py`
- Implementation: `apps/organizations/middleware/tenant.py`

## Revision History

- **2025-10**: Initial implementation with security fixes
- **2025-10**: Added comprehensive security test suite