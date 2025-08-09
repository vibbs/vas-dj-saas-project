'use client';

import { useAuth } from '@vas-dj-saas/auth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  loading?: ReactNode;
}

export function RouteGuard({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true,
  loading
}: RouteGuardProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'idle') {
      // Still loading/hydrating, do nothing
      return;
    }

    if (requireAuth && status === 'unauthenticated') {
      router.replace(redirectTo);
      return;
    }

    if (!requireAuth && status === 'authenticated') {
      // Already authenticated and this is a public route (like login/register)
      router.replace('/dashboard');
      return;
    }
  }, [status, requireAuth, redirectTo, router]);

  // Show loading state while auth is being determined
  if (status === 'idle' || status === 'authenticating') {
    if (loading) {
      return <>{loading}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (requireAuth && status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!requireAuth && status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}