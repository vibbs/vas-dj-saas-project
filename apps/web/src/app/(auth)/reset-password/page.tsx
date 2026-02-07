'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@vas-dj-saas/api-client';
import { validatePassword, validatePasswordConfirmation } from '@vas-dj-saas/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type PageStatus = 'idle' | 'submitting' | 'success' | 'error' | 'no-token';

/**
 * Reset Password Page
 * Allows users to set a new password using a reset token
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<PageStatus>(token ? 'idle' : 'no-token');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });

  // Redirect authenticated users
  const { isLoading: authLoading } = useAuthGuard({ requireUnauthenticated: true });

  const passwordValidation = validatePassword(newPassword);
  const confirmError = validatePasswordConfirmation(newPassword, confirmPassword);

  const showPasswordError = touched.newPassword && !passwordValidation.isValid;
  const showConfirmError = touched.confirmPassword && confirmError !== null;

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });

    if (!passwordValidation.isValid || confirmError !== null) {
      return;
    }

    if (!token) {
      setStatus('no-token');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const response = await AuthService.confirmPasswordReset({
        token,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });

      if (response.status === 200) {
        setStatus('success');

        // Redirect to login after a short delay
        setTimeout(() => {
          router.replace('/login?passwordReset=true');
        }, 3000);
      } else {
        throw new Error('Password reset failed');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);

      const errorMessage =
        err?.data?.detail ||
        err?.data?.message ||
        err?.message ||
        'Unable to reset your password. The link may be invalid or expired.';

      setError(errorMessage);
      setStatus('error');
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <AuthCard title="Reset Password" description="Set a new password">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    );
  }

  // No token provided
  if (status === 'no-token') {
    return (
      <AuthCard
        title="Invalid Link"
        description="No reset token found"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid. Please request a new password reset.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/forgot-password"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Request New Reset
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthCard
        title="Password Reset!"
        description="Your password has been changed"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your password has been reset successfully.
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

  // Form state (idle or error)
  return (
    <AuthCard
      title="Reset Password"
      description="Create a new password for your account"
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Input */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
            placeholder="Enter new password"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              showPasswordError
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            disabled={status === 'submitting'}
            autoComplete="new-password"
            autoFocus
          />

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.score)}`}
                    style={{ width: `${(passwordValidation.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getPasswordStrengthLabel(passwordValidation.score)}
                </span>
              </div>
              {passwordValidation.feedback.length > 0 && touched.newPassword && (
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {passwordValidation.feedback.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
            placeholder="Confirm new password"
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              showConfirmError
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            }`}
            disabled={status === 'submitting'}
            autoComplete="new-password"
          />
          {showConfirmError && confirmError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {confirmError}
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
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
