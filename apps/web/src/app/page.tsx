'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@vas-dj-saas/auth';

/**
 * Root Page - Smart Router
 * Redirects users based on authentication status:
 * - Authenticated → /home (protected dashboard)
 * - Unauthenticated → /login
 * - Loading → shows loading spinner
 */
export default function RootPage() {
  const router = useRouter();
  const authStatus = useAuthStatus();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/home');
    } else if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
    // 'idle' and 'authenticating' states show loading spinner
  }, [authStatus, router]);

  // Show loading spinner while determining auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
