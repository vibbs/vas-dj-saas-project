'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthAccount } from '@vas-dj-saas/auth';
import type { Account } from '@vas-dj-saas/api-client';

type Role = 'admin' | 'orgAdmin' | 'user';

/**
 * Role Guard Hook
 * Protects routes based on user roles
 */
export function useRoleGuard(requiredRole?: Role, redirectTo: string = '/settings') {
  const account = useAuthAccount();
  const router = useRouter();

  useEffect(() => {
    if (!account || !requiredRole) return;

    const hasAccess = checkRoleAccess(account, requiredRole);

    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [account, requiredRole, redirectTo, router]);

  return {
    hasAccess: account ? checkRoleAccess(account, requiredRole) : false,
    account,
  };
}

/**
 * Check if account has required role access
 */
function checkRoleAccess(account: Account, requiredRole?: Role): boolean {
  if (!requiredRole) return true;

  switch (requiredRole) {
    case 'admin':
      return account.isAdmin || false;

    case 'orgAdmin':
      return account.isOrgAdmin || account.isOrgCreator || account.isAdmin || false;

    case 'user':
      return true; // All authenticated users

    default:
      return false;
  }
}
