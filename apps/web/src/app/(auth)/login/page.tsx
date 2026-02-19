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

  // Check for query params (registered, verified, passwordReset)
  useEffect(() => {
    const registered = searchParams.get('registered');
    const verified = searchParams.get('verified');
    const passwordReset = searchParams.get('passwordReset');

    if (verified === 'true') {
      setInfoMessage('Your email has been verified! Please sign in to continue.');
    } else if (passwordReset === 'true') {
      setInfoMessage('Your password has been reset! Please sign in with your new password.');
    } else if (registered === 'true') {
      setInfoMessage('Registration successful! Please check your email to verify your account, then sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Use the login action from auth store
      await login(credentials.email, credentials.password);

      // Get return URL from query params or default to home
      const returnUrl = searchParams.get('returnUrl') || '/home';

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
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--color-primary)' }}
          ></div>
        </div>
      </AuthCard>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <AuthCard
        title="Sign In"
        description="Welcome back! Please sign in to your account."
      >
        {/* Info Message */}
        {infoMessage && (
          <div
            className="mb-4 p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-primary-light, rgba(59, 130, 246, 0.1))',
              borderColor: 'var(--color-primary-border, rgba(59, 130, 246, 0.3))'
            }}
          >
            <p
              className="text-sm"
              style={{ color: 'var(--color-primary-text, var(--color-primary))' }}
            >
              {infoMessage}
            </p>
          </div>
        )}

        {/* Login Form */}
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          showRememberMe={true}
          showForgotPassword={true}
          onForgotPassword={() => router.push('/forgot-password')}
          onSignUpClick={() => router.push('/register-organization')}
        />

        {/* Registration Link */}
        {env.features.registration && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register-organization"
                className="font-medium transition-colors"
                style={{
                  color: 'var(--color-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary-hover, var(--color-primary))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                Create one
              </Link>
            </p>
          </div>
        )}
      </AuthCard>
    </div>
  );
}
