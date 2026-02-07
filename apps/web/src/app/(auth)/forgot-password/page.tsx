'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@vas-dj-saas/api-client';
import { validateEmail } from '@vas-dj-saas/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type PageStatus = 'idle' | 'submitting' | 'success';

/**
 * Forgot Password Page
 * Allows users to request a password reset email
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Redirect authenticated users
  const { isLoading: authLoading } = useAuthGuard({ requireUnauthenticated: true });

  const emailError = validateEmail(email);
  const showEmailError = touched && emailError !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (emailError !== null) {
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      await AuthService.requestPasswordReset({ email });

      // Always show success for security reasons
      // (don't reveal whether email exists in system)
      setStatus('success');
    } catch (err: any) {
      console.error('Password reset request error:', err);

      // Still show success even on error for security
      // Only show error for network/server issues
      if (err?.message?.includes('network') || err?.status >= 500) {
        setError('Unable to process your request. Please try again later.');
        setStatus('idle');
      } else {
        // For all other cases, show success (security best practice)
        setStatus('success');
      }
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <AuthCard title="Forgot Password" description="Reset your password">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthCard
        title="Check Your Email"
        description="Password reset instructions sent"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            If an account exists for <strong className="text-gray-900 dark:text-white">{email}</strong>, you'll receive an email with instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Don't forget to check your spam folder.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </Link>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setEmail('');
                setTouched(false);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Different Email
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Form state
  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive reset instructions"
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Enter your email"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              showEmailError
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            disabled={status === 'submitting'}
            autoComplete="email"
            autoFocus
          />
          {showEmailError && emailError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {emailError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Login
        </Link>
      </div>
    </AuthCard>
  );
}
