'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus, useAuthAccount } from '@vas-dj-saas/auth';

export interface UseAuthGuardOptions {
  /**
   * Redirect to this path if not authenticated
   * @default '/login'
   */
  redirectTo?: string;

  /**
   * If true, redirects authenticated users away
   * Useful for login/register pages
   * @default false
   */
  requireUnauthenticated?: boolean;

  /**
   * Path to redirect authenticated users to
   * Only used if requireUnauthenticated is true
   * @default '/home'
   */
  authenticatedRedirect?: string;
}

/**
 * Auth guard hook for protecting routes
 *
 * @example Protected route
 * ```tsx
 * function HomePage() {
 *   const { isLoading } = useAuthGuard();
 *   if (isLoading) return <LoadingSpinner />;
 *   return <Dashboard />;
 * }
 * ```
 *
 * @example Auth-only route (login/register)
 * ```tsx
 * function LoginPage() {
 *   const { isLoading } = useAuthGuard({ requireUnauthenticated: true });
 *   if (isLoading) return <LoadingSpinner />;
 *   return <LoginForm />;
 * }
 * ```
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/login',
    requireUnauthenticated = false,
    authenticatedRedirect = '/home',
  } = options;

  const router = useRouter();
  const status = useAuthStatus();
  const account = useAuthAccount();

  const isLoading = status === 'idle' || status === 'authenticating';
  const isAuthenticated = status === 'authenticated' && !!account;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect unauthenticated users to login
    if (!requireUnauthenticated && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const returnUrl = currentPath !== redirectTo ? `?returnUrl=${encodeURIComponent(currentPath)}` : '';
      router.push(`${redirectTo}${returnUrl}`);
      return;
    }

    // Redirect authenticated users away from auth pages
    if (requireUnauthenticated && isAuthenticated) {
      // Check for returnUrl in query params
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      router.push(returnUrl || authenticatedRedirect);
      return;
    }
  }, [isLoading, isAuthenticated, requireUnauthenticated, redirectTo, authenticatedRedirect, router]);

  return {
    isLoading,
    isAuthenticated,
    account,
  };
}
