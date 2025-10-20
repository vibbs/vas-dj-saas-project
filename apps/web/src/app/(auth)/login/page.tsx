'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@vas-dj-saas/auth';
import { useAuthActions } from '@vas-dj-saas/auth';
import type { LoginCredentials } from '@vas-dj-saas/api-client';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { env } from '@/lib/env';

/**
 * Login Page
 * Allows users to sign in to their account
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthActions();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Redirect authenticated users to dashboard
  const { isLoading: authLoading } = useAuthGuard({ requireUnauthenticated: true });

  // Check for query params (e.g., registered=true)
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setInfoMessage('Registration successful! Please sign in with your credentials.');
    }
  }, [searchParams]);

  const handleSubmit = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Use the login action from auth store
      await login(credentials.email, credentials.password);

      // Get return URL from query params or default to dashboard
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';

      // Redirect to intended destination
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Login error:', err);

      // Extract error message
      const errorMessage =
        err?.message ||
        'Invalid email or password. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <AuthCard title="Sign In" description="Welcome back">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign In"
      description="Welcome back! Please sign in to your account."
    >
      {/* Info Message */}
      {infoMessage && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{infoMessage}</p>
        </div>
      )}

      {/* Login Form */}
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        showRememberMe={true}
        showForgotPassword={true}
        onForgotPassword={() => {
          // TODO: Implement forgot password
          alert('Forgot password functionality coming soon!');
        }}
        onSignUpClick={() => router.push('/register-organization')}
      />

      {/* Registration Link */}
      {env.features.registration && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/register-organization"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create one
            </Link>
          </p>
        </div>
      )}
    </AuthCard>
  );
}
