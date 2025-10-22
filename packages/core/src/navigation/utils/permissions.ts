import type { Account } from '@vas-dj-saas/api-client';
import type { NavPermission } from '../config/nav-schema';

/**
 * Check if account meets permission requirements
 */
export function checkPermission(
  permission: NavPermission | undefined,
  account: Account | undefined
): boolean {
  // No permission requirement = always visible
  if (!permission) {
    console.log('[checkPermission] No permission required, allowing access');
    return true;
  }

  // No account = not authenticated
  if (!account) {
    console.log('[checkPermission] No account, denying access');
    return false;
  }

  // Role-based permission check
  if (permission.type === 'role' && permission.roles) {
    const hasAccess = permission.roles.some((role) => hasRole(account, role));
    console.log('[checkPermission] Role check:', {
      requiredRoles: permission.roles,
      accountRoles: {
        isAdmin: account.isAdmin,
        isOrgAdmin: account.isOrgAdmin,
        isOrgCreator: account.isOrgCreator,
      },
      hasAccess
    });
    return hasAccess;
  }

  // Custom permission check
  if (permission.type === 'custom' && permission.customCheck) {
    try {
      const hasAccess = permission.customCheck(account);
      console.log('[checkPermission] Custom check result:', hasAccess);
      return hasAccess;
    } catch (error) {
      console.error('Custom permission check failed:', error);
      return false;
    }
  }

  // Default deny
  console.log('[checkPermission] No matching permission type, denying access');
  return false;
}

/**
 * Check if account has a specific role
 */
function hasRole(
  account: Account,
  role: 'admin' | 'orgAdmin' | 'orgCreator' | 'user'
): boolean {
  switch (role) {
    case 'admin':
      return account.isAdmin ?? false;
    case 'orgAdmin':
      return account.isOrgAdmin ?? false;
    case 'orgCreator':
      return account.isOrgCreator ?? false;
    case 'user':
      return true; // All authenticated users
    default:
      return false;
  }
}
