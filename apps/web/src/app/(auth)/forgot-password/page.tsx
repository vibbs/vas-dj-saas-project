'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@vas-dj-saas/api-client';
import { validateEmail } from '@vas-dj-saas/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type PageStatus = 'idle' | 'submitting' | 'success';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const successIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 12,
      delay: 0.1,
    },
  },
};

/**
 * Forgot Password Page
 * Allows users to request a password reset email
 * Polished with Framer Motion animations and design system variables
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  // Inline styles using CSS variables
  const styles = {
    container: {
      fontFamily: 'var(--font-family-body)',
    },
    loadingSpinner: {
      borderColor: 'var(--color-primary)',
      borderTopColor: 'transparent',
    },
    successIcon: {
      background: 'var(--color-primary-muted)',
    },
    successIconSvg: {
      color: 'var(--color-primary)',
    },
    text: {
      color: 'var(--color-muted-foreground)',
    },
    textStrong: {
      color: 'var(--color-foreground)',
    },
    textMuted: {
      color: 'var(--color-muted-foreground)',
      opacity: 0.8,
    },
    primaryButton: {
      background: 'var(--gradient-primary)',
      color: 'var(--color-primary-foreground)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      border: 'none',
      fontFamily: 'var(--font-family-body)',
      fontWeight: 500,
    },
    secondaryButton: {
      background: 'var(--color-card)',
      color: 'var(--color-foreground)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      fontFamily: 'var(--font-family-body)',
      fontWeight: 500,
    },
    errorContainer: {
      background: 'var(--color-destructive)',
      opacity: 0.1,
      border: '1px solid var(--color-destructive)',
      borderRadius: 'var(--radius-lg)',
    },
    errorText: {
      color: 'var(--color-destructive)',
    },
    label: {
      color: 'var(--color-foreground)',
      fontFamily: 'var(--font-family-body)',
      fontWeight: 500,
    },
    input: {
      background: 'var(--color-input)',
      color: 'var(--color-foreground)',
      border: `2px solid ${showEmailError ? 'var(--color-destructive)' : isFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: isFocused ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
      fontFamily: 'var(--font-family-body)',
      transition: 'all var(--animation-normal) var(--easing-ease-out)',
    },
    link: {
      color: 'var(--color-primary)',
      fontFamily: 'var(--font-family-body)',
      fontWeight: 500,
    },
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <AuthCard title="Forgot Password" description="Reset your password">
        <div className="flex justify-center py-8" style={styles.container}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-8 w-8 border-2"
            style={styles.loadingSpinner}
          />
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
        <motion.div
          className="text-center py-4"
          style={styles.container}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={styles.successIcon}
            variants={iconVariants}
          >
            <motion.svg
              className="w-8 h-8"
              style={styles.successIconSvg}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              variants={successIconVariants}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </motion.svg>
          </motion.div>

          <motion.p className="mb-2" style={styles.text} variants={itemVariants}>
            If an account exists for{' '}
            <strong style={styles.textStrong}>{email}</strong>, you'll receive
            an email with instructions to reset your password.
          </motion.p>
          <motion.p
            className="text-sm mb-6"
            style={styles.textMuted}
            variants={itemVariants}
          >
            Don't forget to check your spam folder.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex justify-center px-6 py-2.5 text-sm"
                style={styles.primaryButton}
              >
                Back to Login
              </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={() => {
                setStatus('idle');
                setEmail('');
                setTouched(false);
              }}
              className="inline-flex justify-center px-6 py-2.5 text-sm"
              style={styles.secondaryButton}
              whileHover={{
                scale: 1.02,
                borderColor: 'var(--color-border-hover)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              Try Different Email
            </motion.button>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  // Form state
  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive reset instructions"
    >
      <motion.div
        style={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Calming message */}
        <motion.div
          className="mb-6 p-4 rounded-xl text-center"
          style={{
            background: 'var(--color-primary-muted)',
            borderRadius: 'var(--radius-lg)',
          }}
          variants={itemVariants}
        >
          <motion.div
            className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-card)' }}
            whileHover={{ rotate: 15 }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: 'var(--color-primary)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </motion.div>
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
            No worries, it happens to the best of us!
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4 p-4"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-destructive)',
                borderRadius: 'var(--radius-lg)',
              }}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <p className="text-sm" style={styles.errorText}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="email"
              className="block text-sm mb-2"
              style={styles.label}
            >
              Email Address
            </label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                setTouched(true);
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              placeholder="Enter your email"
              className="w-full px-4 py-3"
              style={styles.input}
              disabled={status === 'submitting'}
              autoComplete="email"
              autoFocus
              whileFocus={{ scale: 1.01 }}
            />
            <AnimatePresence>
              {showEmailError && emailError && (
                <motion.p
                  className="mt-2 text-sm"
                  style={styles.errorText}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-3 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={styles.primaryButton}
              whileHover={status !== 'submitting' ? { scale: 1.02, boxShadow: 'var(--shadow-glow)' } : {}}
              whileTap={status !== 'submitting' ? { scale: 0.98 } : {}}
            >
              {status === 'submitting' ? (
                <motion.span className="flex items-center">
                  <motion.svg
                    className="-ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                  Sending...
                </motion.span>
              ) : (
                <motion.span
                  className="flex items-center gap-2"
                  initial={false}
                >
                  Send Reset Link
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </motion.svg>
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Back to Login Link */}
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <motion.span whileHover={{ scale: 1.02 }}>
            <Link href="/login" className="text-sm" style={styles.link}>
              <motion.span
                className="inline-flex items-center gap-1"
                whileHover={{ gap: '8px' }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Login
              </motion.span>
            </Link>
          </motion.span>
        </motion.div>
      </motion.div>
    </AuthCard>
  );
}
