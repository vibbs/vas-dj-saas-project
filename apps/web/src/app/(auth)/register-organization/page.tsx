'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@vas-dj-saas/auth';
import { AuthService } from '@vas-dj-saas/api-client';
import type { RegistrationFormData } from '@vas-dj-saas/api-client';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';

/**
 * Register Organization Page
 * Allows users to create a new account and organization
 */
export default function RegisterOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect authenticated users to dashboard
  const { isLoading: authLoading } = useAuthGuard({ requireUnauthenticated: true });

  const handleSubmit = async (data: Omit<RegistrationFormData, 'passwordConfirm'>) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Call registration API
      const response = await AuthService.register({
        email: data.email,
        password: data.password,
        passwordConfirm: data.password, // Same as password since form already validated
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        organizationName: data.organizationName,
        preferredSubdomain: data.preferredSubdomain,
      });

      if ((response as { status: number }).status === 201 || (response as { status: number }).status === 200) {
        setSuccessMessage(
          'Registration successful! Please check your email to verify your account.'
        );

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        err?.data?.detail ||
        err?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <AuthCard title="Register" description="Create your account and organization">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create Your Account"
      description="Get started by creating your organization"
    >
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Registration Form */}
      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        onLoginClick={() => router.push('/login')}
      />

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
