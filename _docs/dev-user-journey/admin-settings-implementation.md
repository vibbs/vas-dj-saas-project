# Admin Settings Implementation Guide

**Status**: In Progress
**Created**: 2025-10-17
**Owner**: Development Team
**Sprint**: User Journey - Admin Settings

---

## 📋 Executive Summary

This document outlines the complete implementation of the customer-facing admin settings system for the VAS-DJ SaaS platform. The implementation includes:

1. **Separate Registration UI** - Clear user journey for organization vs. user signup
2. **RBAC-Protected Settings** - Role-based access control for settings pages
3. **Cross-Platform Service Layer** - Shared API client services for web and mobile
4. **Enhanced JWT Claims** - Organization-aware authentication with permissions

### Key Principles

- **Backend Simplicity**: Reuse existing APIs where possible
- **Service Layer Abstraction**: Never call APIs directly from UI components
- **Cross-Platform First**: Build for web and mobile from day one
- **RBAC by Design**: Permission-based access at every layer

---

## 🎯 Implementation Goals

### Must Have (MVP)
- [ ] Enhanced JWT claims with organization context and permissions
- [ ] Separate UI routes for org registration vs. user signup
- [ ] Personal settings page (profile, password)
- [ ] Organization settings page (general info, delete)
- [ ] RBAC middleware and permission guards
- [ ] Feature-based service layer (accounts, organizations, registration)
- [ ] Celery cleanup task for unverified accounts

### Nice to Have (Future)
- [ ] Preferences (timezone, language, notifications)
- [ ] Branding settings (logo, colors)
- [ ] Developer settings (webhooks, OAuth, API keys)
- [ ] Billing settings (subscription, payment methods)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Registration  │  │   Settings   │  │     RBAC     │      │
│  │   Pages      │  │    Pages     │  │   Guards     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                ┌───────────▼───────────┐                     │
│                │  Service Layer        │                     │
│                │  (api-client package) │                     │
│                └───────────┬───────────┘                     │
└────────────────────────────┼────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │   Django Backend        │
                │  ┌──────────────────┐   │
                │  │ JWT with Claims  │   │
                │  │ (org, role,      │   │
                │  │  permissions)    │   │
                │  └──────────────────┘   │
                │  ┌──────────────────┐   │
                │  │   Existing APIs  │   │
                │  │  - User CRUD     │   │
                │  │  - Org CRUD      │   │
                │  │  - Registration  │   │
                │  └──────────────────┘   │
                └─────────────────────────┘
```

---

## 🔐 JWT Token Claims Enhancement

### Current JWT Structure
```python
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "USER",              # Legacy field from Account.role
  "is_admin": false,           # Legacy field from Account.is_admin
  "org_id": "uuid"            # Single organization
}
```

### Enhanced JWT Structure
```python
{
  "user_id": "uuid",
  "email": "user@example.com",

  # Multi-organization support
  "primary_organization_id": "uuid",    # Primary org from get_primary_organization()
  "organization_role": "OWNER",         # Role in primary org (from OrganizationMembership)
  "permissions": [                      # Computed from OrganizationMembership.get_permissions()
    "view_organization",
    "manage_members",
    "invite_members",
    "manage_billing",
    "manage_settings",
    "delete_organization"
  ],

  # Account verification status
  "is_email_verified": true,

  # All organizations user belongs to
  "organizations": [
    {
      "id": "uuid",
      "slug": "acme-corp",
      "role": "OWNER"
    },
    {
      "id": "uuid2",
      "slug": "other-org",
      "role": "MEMBER"
    }
  ]
}
```

### Implementation Files

**File**: `backend/apps/core/jwt_config.py`
```python
# No changes needed to JWT settings - they're already configured
```

**File**: `backend/apps/accounts/views/auth.py`
```python
def add_custom_claims(access_token, user):
    """
    Add organization context and permissions to JWT access token.

    This function should be called in:
    - login() after successful authentication
    - register() after creating new user
    - refresh_token() when issuing new access token
    - social_auth() after social authentication
    """
    primary_org = user.get_primary_organization()
    membership = user.get_membership_in(primary_org) if primary_org else None

    # Basic user info
    access_token["email"] = user.email
    access_token["is_email_verified"] = user.is_email_verified

    # Organization context
    access_token["primary_organization_id"] = str(primary_org.id) if primary_org else None
    access_token["organization_role"] = membership.role if membership else None
    access_token["permissions"] = membership.get_permissions() if membership else []

    # All organizations user belongs to (for org switching)
    access_token["organizations"] = [
        {
            "id": str(m.organization.id),
            "slug": m.organization.slug,
            "role": m.role
        }
        for m in user.get_active_memberships()
    ]
```

**Implementation Checklist**:
- [ ] Create `add_custom_claims()` helper function
- [ ] Apply in `login()` view (line ~258-270)
- [ ] Apply in `register()` view (line ~549-565)
- [ ] Apply in `refresh_token()` view (line ~345-354)
- [ ] Apply in `social_auth()` view (line ~1203-1220)
- [ ] Test JWT decoding in frontend to verify claims structure

---

## 🔧 Backend API Modifications

### Change Password Endpoint

**File**: `backend/apps/accounts/views.py`

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.audit.models import AuditLog, AuditAction
from apps.core.exceptions import ValidationException

# Add to existing UserViewSet class
@action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
def change_password(self, request):
    """
    Change user password.

    Requires:
    - old_password: Current password for verification
    - new_password: New password (must meet security requirements)

    Returns: 200 OK on success

    Endpoint: POST /api/v1/accounts/users/change-password/
    """
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # Validation
    if not old_password or not new_password:
        raise ValidationException(
            detail="Both old_password and new_password are required",
            issues=[
                {
                    "message": "Old password is required",
                    "path": ["old_password"],
                    "type": "field_validation"
                } if not old_password else None,
                {
                    "message": "New password is required",
                    "path": ["new_password"],
                    "type": "field_validation"
                } if not new_password else None
            ]
        )

    # Verify current password
    if not request.user.check_password(old_password):
        raise ValidationException(
            detail="Current password is incorrect",
            issues=[
                {
                    "message": "The current password you entered is incorrect",
                    "path": ["old_password"],
                    "type": "password_validation"
                }
            ]
        )

    # Validate new password using Django validators
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError as DjangoValidationError

    try:
        validate_password(new_password, request.user)
    except DjangoValidationError as e:
        raise ValidationException(
            detail="New password does not meet security requirements",
            issues=[
                {
                    "message": str(error),
                    "path": ["new_password"],
                    "type": "password_validation"
                }
                for error in e.messages
            ]
        )

    # Change password
    request.user.set_password(new_password)
    request.user.save(update_fields=['password'])

    # Audit log
    AuditLog.log_event(
        event_type=AuditAction.PASSWORD_CHANGE,
        resource_type='user',
        resource_id=str(request.user.id),
        user=request.user,
        organization=request.user.get_primary_organization(),
        outcome='success',
        details={'action': 'password_changed'}
    )

    return Response({
        'message': 'Password changed successfully. Please login again with your new password.'
    })
```

**Implementation Checklist**:
- [ ] Add `change_password` action to UserViewSet
- [ ] Test with valid credentials
- [ ] Test with invalid old password
- [ ] Test with weak new password
- [ ] Verify audit log entry is created

### RBAC Permission Checks

**File**: `backend/apps/organizations/views.py`

```python
# Enhance existing update method
def update(self, request, pk=None):
    """
    Update organization settings.
    Only ADMIN or OWNER can update organization.
    """
    organization = self.get_object()

    # RBAC check
    if not request.user.is_admin_of(organization) and not request.user.is_superuser:
        return Response(
            {'error': 'Only organization administrators can update settings'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Existing update logic
    serializer = self.get_serializer(organization, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()

        # Audit log
        AuditLog.log_event(
            event_type='org.settings.update',
            resource_type='organization',
            resource_id=str(organization.id),
            user=request.user,
            organization=organization,
            outcome='success',
            details={
                'updated_fields': list(request.data.keys())
            }
        )

        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**Implementation Checklist**:
- [ ] Add RBAC check to organization `update()` method
- [ ] Verify soft_delete already has OWNER check (line 140-144)
- [ ] Test update with ADMIN role
- [ ] Test update with MEMBER role (should fail)

---

## 🧹 Celery Cleanup Task

### Unverified Accounts Cleanup

**File**: `backend/apps/accounts/tasks.py` (NEW FILE)

```python
"""
Celery tasks for account management.
"""

from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

from apps.accounts.models import Account

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def cleanup_unverified_accounts(self):
    """
    Delete unverified accounts that are older than 24 hours.

    Runs daily at 2 AM via Celery Beat.

    Criteria for deletion:
    - status = 'PENDING'
    - is_email_verified = False
    - created_at < 24 hours ago

    Returns:
        str: Summary of deleted accounts
    """
    try:
        cutoff = timezone.now() - timedelta(hours=24)

        # Find accounts to delete
        accounts_to_delete = Account.objects.filter(
            status='PENDING',
            is_email_verified=False,
            created_at__lt=cutoff
        )

        # Log for monitoring
        count = accounts_to_delete.count()
        emails = list(accounts_to_delete.values_list('email', flat=True))

        logger.info(f"Cleanup task: Found {count} unverified accounts to delete")

        # Delete accounts (this will cascade delete related objects)
        accounts_to_delete.delete()

        logger.info(f"Cleanup task: Successfully deleted {count} unverified accounts")

        return f"Deleted {count} unverified accounts: {', '.join(emails)}"

    except Exception as exc:
        logger.error(f"Cleanup task failed: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
```

**File**: `backend/config/settings/base.py`

```python
# Add to CELERY configuration section

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'cleanup-unverified-accounts': {
        'task': 'apps.accounts.tasks.cleanup_unverified_accounts',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2:00 AM
        'options': {
            'expires': 3600,  # Task expires after 1 hour if not picked up
        }
    },
}
```

**Implementation Checklist**:
- [ ] Create `backend/apps/accounts/tasks.py` file
- [ ] Add `cleanup_unverified_accounts` task
- [ ] Update Celery beat schedule in settings
- [ ] Test task manually: `cleanup_unverified_accounts.delay()`
- [ ] Verify Celery beat picks up scheduled task

---

## 📦 Service Layer Implementation

### Directory Structure

```
packages/api-client/src/
├── services/
│   ├── accounts.service.ts    # NEW - User profile & settings
│   ├── organizations.service.ts # ENHANCE - Org management
│   ├── registration.service.ts  # NEW - Registration flows
│   └── index.ts                 # NEW - Export all services
├── http.ts                      # EXISTS - HTTP client
├── endpoints.ts                 # EXISTS - API endpoints
└── index.ts                     # UPDATE - Export services
```

### Accounts Service

**File**: `packages/api-client/src/services/accounts.service.ts` (NEW)

```typescript
import { apiClient } from '../http';

/**
 * User/Account service for personal settings and profile management.
 *
 * Used by:
 * - Web: Personal settings page
 * - Mobile: Profile screen
 */
export class AccountsService {
  private client = apiClient;

  /**
   * Get user profile by ID
   *
   * @param userId - User UUID
   * @returns User profile data
   *
   * API: GET /api/v1/accounts/users/{userId}/
   */
  async getProfile(userId: string): Promise<any> {
    const response = await this.client.get(`/accounts/users/${userId}/`);
    return response.data;
  }

  /**
   * Update user profile
   *
   * @param userId - User UUID
   * @param data - Partial user data to update
   * @returns Updated user profile
   *
   * API: PATCH /api/v1/accounts/users/{userId}/
   */
  async updateProfile(userId: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
  }): Promise<any> {
    const response = await this.client.patch(`/accounts/users/${userId}/`, data);
    return response.data;
  }

  /**
   * Change user password
   *
   * @param oldPassword - Current password
   * @param newPassword - New password
   *
   * API: POST /api/v1/accounts/users/change-password/
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/accounts/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
```

### Organizations Service

**File**: `packages/api-client/src/services/organizations.service.ts` (ENHANCE)

```typescript
import { apiClient } from '../http';

/**
 * Organization service for org management and settings.
 *
 * Used by:
 * - Web: Organization settings page
 * - Mobile: Organization info screen
 */
export class OrganizationsService {
  private client = apiClient;

  /**
   * Get organization by ID
   *
   * @param orgId - Organization UUID
   * @returns Organization data
   *
   * API: GET /api/v1/organizations/{orgId}/
   */
  async getOrganization(orgId: string): Promise<any> {
    const response = await this.client.get(`/organizations/${orgId}/`);
    return response.data;
  }

  /**
   * Update organization
   *
   * @param orgId - Organization UUID
   * @param data - Partial organization data
   * @returns Updated organization
   *
   * API: PATCH /api/v1/organizations/{orgId}/
   * Permission: ADMIN or OWNER only
   */
  async updateOrganization(orgId: string, data: {
    name?: string;
    description?: string;
    logo?: string;
  }): Promise<any> {
    const response = await this.client.patch(`/organizations/${orgId}/`, data);
    return response.data;
  }

  /**
   * Soft delete organization
   *
   * @param orgId - Organization UUID
   * @param reason - Optional deletion reason
   *
   * API: POST /api/v1/organizations/{orgId}/soft-delete/
   * Permission: OWNER only
   */
  async deleteOrganization(orgId: string, reason?: string): Promise<void> {
    await this.client.post(`/organizations/${orgId}/soft-delete/`, { reason });
  }

  /**
   * Get organization stats
   *
   * @param orgId - Organization UUID
   * @returns Organization statistics
   *
   * API: GET /api/v1/organizations/{orgId}/stats/
   */
  async getStats(orgId: string): Promise<any> {
    const response = await this.client.get(`/organizations/${orgId}/stats/`);
    return response.data;
  }

  /**
   * Find organization by domain (for org discovery)
   *
   * @param domain - Email domain (e.g., "acme.com")
   * @returns Organization if found, null otherwise
   *
   * TODO: This requires a new backend endpoint or workaround
   */
  async findByDomain(domain: string): Promise<any | null> {
    // Placeholder - implement when backend endpoint is available
    return null;
  }
}

// Export singleton instance
export const organizationsService = new OrganizationsService();
```

### Registration Service

**File**: `packages/api-client/src/services/registration.service.ts` (NEW)

```typescript
import { apiClient } from '../http';

/**
 * Registration service for user and organization registration flows.
 *
 * Used by:
 * - Web: Registration pages
 * - Mobile: Signup flow
 */
export class RegistrationService {
  private client = apiClient;

  /**
   * Register new organization with owner user
   *
   * Creates:
   * - Account (user)
   * - Organization
   * - OrganizationMembership (role=OWNER)
   *
   * @param data - Registration form data
   * @returns Registration response with tokens and user info
   *
   * API: POST /api/v1/accounts/register/
   */
  async registerOrganization(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    subdomain: string;
  }): Promise<any> {
    const response = await this.client.post('/accounts/register/', {
      email: data.email,
      password: data.password,
      password_confirm: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      organization_name: data.organizationName,
      preferred_subdomain: data.subdomain
    });

    return response.data;
  }

  /**
   * Verify email address with token
   *
   * @param token - Email verification token from email link
   * @returns JWT tokens and user info
   *
   * API: POST /api/v1/auth/verify-email/
   */
  async verifyEmail(token: string): Promise<any> {
    const response = await this.client.post('/auth/verify-email/', { token });
    return response.data;
  }

  /**
   * Resend verification email
   *
   * @param email - User email address
   *
   * API: POST /api/v1/auth/resend-verification-by-email/
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await this.client.post('/auth/resend-verification-by-email/', { email });
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();
```

### Services Index

**File**: `packages/api-client/src/services/index.ts` (NEW)

```typescript
/**
 * Feature-based API services
 *
 * All services are singletons that can be imported and used directly.
 *
 * Example usage:
 * ```typescript
 * import { accountsService } from '@vas-dj-saas/api-client';
 *
 * const user = await accountsService.getProfile(userId);
 * ```
 */

export * from './accounts.service';
export * from './organizations.service';
export * from './registration.service';

// Future services:
// export * from './billing.service';
// export * from './webhooks.service';
// export * from './oauth.service';
```

**Implementation Checklist**:
- [ ] Create `services/` directory in api-client package
- [ ] Create `accounts.service.ts`
- [ ] Create `organizations.service.ts`
- [ ] Create `registration.service.ts`
- [ ] Create `services/index.ts`
- [ ] Test services in web app
- [ ] Verify singleton pattern works correctly

---

## 🔐 Auth Package Enhancement

### Permission Hook

**File**: `packages/auth/src/hooks/usePermissions.ts` (NEW)

```typescript
import { useAuth } from './useAuth';

/**
 * Permission checking hook based on JWT claims.
 *
 * Used by:
 * - Web: RBAC guards, conditional rendering
 * - Mobile: Permission-based UI
 *
 * Example:
 * ```typescript
 * const { hasPermission, isOwner, isAdmin } = usePermissions();
 *
 * if (hasPermission('manage_billing')) {
 *   // Show billing settings
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuth();

  // JWT claims are embedded in user object after authentication
  const claims = user || {};

  /**
   * Check if user has a specific permission
   *
   * @param permission - Permission string (e.g., "manage_billing")
   * @returns true if user has permission
   */
  const hasPermission = (permission: string): boolean => {
    return Array.isArray(claims.permissions) && claims.permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   *
   * @param role - Role string ("OWNER", "ADMIN", "MEMBER")
   * @returns true if user has exact role
   */
  const hasRole = (role: 'OWNER' | 'ADMIN' | 'MEMBER'): boolean => {
    return claims.organization_role === role;
  };

  /**
   * Check if user is organization owner
   */
  const isOwner = hasRole('OWNER');

  /**
   * Check if user is admin or owner
   */
  const isAdmin = hasRole('ADMIN') || hasRole('OWNER');

  /**
   * Check if user is regular member (not admin/owner)
   */
  const isMember = hasRole('MEMBER') && !isAdmin;

  return {
    // Functions
    hasPermission,
    hasRole,

    // Convenience flags
    isOwner,
    isAdmin,
    isMember,

    // Raw data
    permissions: claims.permissions || [],
    organizationRole: claims.organization_role || null,
    organizations: claims.organizations || []
  };
}
```

**File**: `packages/auth/src/hooks/index.ts` (UPDATE)

```typescript
export * from './useAuth';
export * from './usePermissions'; // ADD THIS LINE
```

**Implementation Checklist**:
- [ ] Create `usePermissions.ts` hook
- [ ] Export from `hooks/index.ts`
- [ ] Test permission checking in web app
- [ ] Verify role-based flags work correctly

---

## 🛡️ RBAC Components

### Permission Guard Component

**File**: `apps/web/src/components/guards/Can.tsx` (NEW)

```typescript
import { usePermissions } from '@vas-dj-saas/auth';
import type { ReactNode } from 'react';

interface CanProps {
  /**
   * Permission to check (e.g., "manage_billing")
   */
  permission: string;

  /**
   * Fallback content to render if user doesn't have permission
   */
  fallback?: ReactNode;

  /**
   * Content to render if user has permission
   */
  children: ReactNode;
}

/**
 * Permission-based component guard.
 *
 * Only renders children if user has the specified permission.
 * Otherwise renders fallback or nothing.
 *
 * Example:
 * ```tsx
 * <Can permission="manage_billing">
 *   <BillingSettings />
 * </Can>
 *
 * <Can permission="delete_organization" fallback={<p>Access denied</p>}>
 *   <DeleteButton />
 * </Can>
 * ```
 */
export function Can({ permission, fallback = null, children }: CanProps) {
  const { hasPermission } = usePermissions();

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
```

**Implementation Checklist**:
- [ ] Create `components/guards/` directory
- [ ] Create `Can.tsx` component
- [ ] Test with valid permission
- [ ] Test with invalid permission
- [ ] Test fallback rendering

---

## 🌐 Frontend Pages

### Settings Layout

**File**: `apps/web/src/app/settings/layout.tsx` (NEW)

See full implementation in plan above.

**Implementation Checklist**:
- [ ] Create settings layout with sidebar
- [ ] Verify responsive design
- [ ] Test navigation between settings pages

### Settings Sidebar Component

**File**: `apps/web/src/components/admin/SettingsSidebar.tsx` (NEW)

See full implementation in plan above.

**Implementation Checklist**:
- [ ] Create SettingsSidebar component
- [ ] Implement role-based menu items
- [ ] Add active route highlighting
- [ ] Test with different user roles

### Personal Settings Page

**File**: `apps/web/src/app/settings/personal/page.tsx` (NEW)

**Implementation Checklist**:
- [ ] Create personal settings page
- [ ] Implement profile section
- [ ] Implement password change section
- [ ] Connect to accounts service
- [ ] Test form submission
- [ ] Test validation errors

### Organization Settings Page

**File**: `apps/web/src/app/settings/organization/page.tsx` (NEW)

**Implementation Checklist**:
- [ ] Create organization settings page
- [ ] Implement general info section
- [ ] Implement danger zone (delete org)
- [ ] Connect to organizations service
- [ ] Test RBAC protection
- [ ] Test delete confirmation

### Developer Settings (Placeholder)

**File**: `apps/web/src/app/settings/developers/page.tsx` (NEW)

**Implementation Checklist**:
- [ ] Create placeholder page
- [ ] Add "coming soon" message
- [ ] List future features

### Billing Settings (Placeholder)

**File**: `apps/web/src/app/settings/billing/page.tsx` (NEW)

**Implementation Checklist**:
- [ ] Create placeholder page
- [ ] Add "coming soon" message
- [ ] List future features

---

## 🔒 RBAC Middleware

**File**: `apps/web/src/middleware.ts` (UPDATE)

See full implementation in plan above.

**Implementation Checklist**:
- [ ] Add RBAC checks to middleware
- [ ] Protect organization settings route
- [ ] Protect billing settings route
- [ ] Test with different user roles
- [ ] Verify redirects work correctly

---

## ✅ Testing Checklist

### Backend Tests
- [ ] JWT claims include all required fields
- [ ] Password change validates old password
- [ ] Password change enforces strength requirements
- [ ] Org update requires ADMIN/OWNER role
- [ ] Celery cleanup task runs successfully
- [ ] Audit logs are created for all actions

### Service Layer Tests
- [ ] All services export correctly
- [ ] Service methods call correct endpoints
- [ ] Error handling works properly
- [ ] Singleton pattern works as expected

### Frontend Tests
- [ ] usePermissions hook returns correct values
- [ ] Can component renders based on permissions
- [ ] Middleware redirects unauthorized users
- [ ] Settings pages load correctly
- [ ] Form submissions work
- [ ] Validation errors display properly

### E2E Flow Tests
- [ ] User can register new organization
- [ ] Email verification works
- [ ] User can update profile
- [ ] User can change password
- [ ] ADMIN can update organization
- [ ] OWNER can delete organization
- [ ] MEMBER cannot access admin settings

---

## 📝 Progress Tracking

### Phase 1: Backend ✅
- [ ] JWT claims enhancement
- [ ] Password change endpoint
- [ ] RBAC checks in views
- [ ] Celery cleanup task

### Phase 2: Service Layer ✅
- [ ] Accounts service
- [ ] Organizations service
- [ ] Registration service
- [ ] Services index

### Phase 3: Auth Package ✅
- [ ] usePermissions hook
- [ ] Export from auth package

### Phase 4: RBAC Components ✅
- [ ] Can guard component
- [ ] Middleware updates

### Phase 5: Frontend Pages ✅
- [ ] Settings layout
- [ ] Personal settings
- [ ] Organization settings
- [ ] Developer settings (placeholder)
- [ ] Billing settings (placeholder)

### Phase 6: Testing & Documentation ✅
- [ ] All tests passing
- [ ] Documentation complete
- [ ] PR ready for review

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Migrations created and tested
- [ ] Celery beat schedule configured

### Deployment Steps
1. [ ] Run database migrations
2. [ ] Deploy backend changes
3. [ ] Deploy frontend changes
4. [ ] Verify Celery beat is running
5. [ ] Monitor logs for errors
6. [ ] Test critical user flows

### Post-deployment
- [ ] Smoke test all features
- [ ] Monitor error tracking
- [ ] Check Celery task execution
- [ ] Verify JWT claims in production
- [ ] Collect user feedback

---

## 📚 Reference Documentation

- [Authentication & Authorization](../backend/docs/features/authentication-authorization.md)
- [Organization Management](../backend/docs/features/organization-management.md)
- [API Client Package](../../packages/api-client/README.md)
- [Auth Package](../../packages/auth/README.md)
- [UI Package](../../packages/ui/README.md)

---

**Last Updated**: 2025-10-17
**Status**: In Progress
**Next Review**: TBD
