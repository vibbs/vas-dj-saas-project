'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RegisterForm } from '@vas-dj-saas/auth';
import { AuthService } from '@vas-dj-saas/api-client';
import type { RegistrationFormData } from '@vas-dj-saas/api-client';
import { useAuthGuard } from '@/hooks/useAuthGuard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1] as const,
    },
  },
};

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'var(--color-background)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="animate-spin rounded-full h-10 w-10 border-2"
            style={{
              borderColor: 'var(--color-border)',
              borderTopColor: 'var(--color-primary)',
            }}
          />
          <p
            className="text-sm"
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: 'var(--color-background)',
      }}
    >
      {/* Background gradient effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--gradient-glow)',
          opacity: 0.6,
        }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'var(--color-primary)',
          opacity: 0.05,
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'var(--color-accent)',
          opacity: 0.05,
          transform: 'translate(-30%, 30%)',
        }}
      />

      {/* Main content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card */}
        <motion.div
          variants={scaleInVariants}
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <motion.div variants={fadeInUpVariants} className="text-center mb-8">
            {/* Logo/Brand mark */}
            <motion.div
              className="w-14 h-14 mx-auto mb-6 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow)',
              }}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <h1
              className="text-3xl font-semibold tracking-tight"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-foreground)',
              }}
            >
              Create Your Account
            </h1>
            <p
              className="mt-3 text-base"
              style={{
                fontFamily: 'var(--font-family-body)',
                color: 'var(--color-muted-foreground)',
              }}
            >
              Get started by creating your organization
            </p>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-6 p-4 rounded-xl"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--color-success)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-success)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-family-body)',
                  }}
                >
                  {successMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* Registration Form */}
          <motion.div variants={fadeInUpVariants}>
            <RegisterForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
              onLoginClick={() => router.push('/login')}
            />
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeInUpVariants}
            className="mt-8 flex items-center gap-4"
          >
            <div
              className="flex-1 h-px"
              style={{ background: 'var(--color-border)' }}
            />
            <span
              className="text-xs uppercase tracking-wider"
              style={{
                color: 'var(--color-muted-foreground)',
                fontFamily: 'var(--font-family-body)',
              }}
            >
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: 'var(--color-border)' }}
            />
          </motion.div>

          {/* Login Link */}
          <motion.div variants={fadeInUpVariants} className="mt-6 text-center">
            <p
              className="text-sm"
              style={{
                color: 'var(--color-muted-foreground)',
                fontFamily: 'var(--font-family-body)',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium transition-colors duration-200"
                style={{
                  color: 'var(--color-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={fadeInUpVariants}
          className="mt-8 text-center text-xs"
          style={{
            color: 'var(--color-muted-foreground)',
            fontFamily: 'var(--font-family-body)',
          }}
        >
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-2 transition-colors duration-200"
            style={{ color: 'var(--color-muted-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted-foreground)';
            }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-colors duration-200"
            style={{ color: 'var(--color-muted-foreground)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-muted-foreground)';
            }}
          >
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
