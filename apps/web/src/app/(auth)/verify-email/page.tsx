'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@vas-dj-saas/api-client';
import { AuthCard } from '@/components/auth/AuthCard';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

/**
 * Email Verification Page
 * Handles email verification via token from URL
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await AuthService.verifyEmail({ token: verificationToken });

      if (response.status === 200) {
        setStatus('success');

        // Redirect to login after a short delay
        setTimeout(() => {
          router.replace('/login?verified=true');
        }, 3000);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      console.error('Email verification error:', err);

      const errorMessage =
        err?.data?.detail ||
        err?.data?.message ||
        err?.message ||
        'Unable to verify your email. The link may be invalid or expired.';

      setError(errorMessage);
      setStatus('error');
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyEmail(token);
  }, [token, verifyEmail]);

  // No token provided
  if (status === 'no-token') {
    return (
      <AuthCard
        title="Invalid Link"
        description="No verification token found"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This verification link is invalid. Please check your email for the correct link or request a new verification email.
          </p>

          <Link
            href="/login"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <AuthCard
        title="Verifying Email"
        description="Please wait while we verify your email address"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your email address...
          </p>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthCard
        title="Email Verified!"
        description="Your email has been successfully verified"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your email address has been verified successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Redirecting to login...
          </p>

          <Link
            href="/login"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  // Error state
  return (
    <AuthCard
      title="Verification Failed"
      description="We couldn't verify your email"
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The verification link may have expired or already been used. You can request a new verification email after logging in.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </Link>
          <Link
            href="/register-organization"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register Again
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
