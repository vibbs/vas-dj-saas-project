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
  if (!permission) return true;

  // No account = not authenticated
  if (!account) return false;

  // Role-based permission check
  if (permission.type === 'role' && permission.roles) {
    return permission.roles.some((role) => hasRole(account, role));
  }

  // Custom permission check
  if (permission.type === 'custom' && permission.customCheck) {
    try {
      return permission.customCheck(account);
    } catch (error) {
      console.error('Custom permission check failed:', error);
      return false;
    }
  }

  // Default deny
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
