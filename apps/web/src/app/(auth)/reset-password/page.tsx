'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@vas-dj-saas/api-client';
import { validatePassword, validatePasswordConfirmation } from '@vas-dj-saas/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type PageStatus = 'idle' | 'submitting' | 'success' | 'error' | 'no-token';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

const strengthMeterVariants = {
  hidden: { scaleX: 0 },
  visible: (width: number) => ({
    scaleX: width / 100,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1] as const,
    },
  }),
};

const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

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
  const [showPasswordFocus, setShowPasswordFocus] = useState(false);
  const [showConfirmFocus, setShowConfirmFocus] = useState(false);

  // Redirect authenticated users
  const { isLoading: authLoading } = useAuthGuard({ requireUnauthenticated: true });

  const passwordValidation = validatePassword(newPassword);
  const confirmError = validatePasswordConfirmation(newPassword, confirmPassword);

  const showPasswordError = touched.newPassword && !passwordValidation.isValid;
  const showConfirmError = touched.confirmPassword && confirmError !== null;

  const getPasswordStrengthInfo = (score: number) => {
    if (score <= 1) return { color: 'var(--color-destructive)', label: 'Weak', bgClass: 'destructive' };
    if (score === 2) return { color: 'var(--color-warning)', label: 'Fair', bgClass: 'warning' };
    if (score === 3) return { color: 'var(--color-accent)', label: 'Good', bgClass: 'accent' };
    return { color: 'var(--color-success)', label: 'Strong', bgClass: 'success' };
  };

  const strengthInfo = getPasswordStrengthInfo(passwordValidation.score);
  const strengthWidth = (passwordValidation.score / 4) * 100;

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
          <motion.div
            className="rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: 'var(--color-primary)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </AuthCard>
    );
  }

  // No token provided
  if (status === 'no-token') {
    return (
      <AuthCard title="Invalid Link" description="No reset token found">
        <motion.div
          className="text-center py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={iconVariants}
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-destructive)', opacity: 0.15 }}
          >
            <motion.div
              className="w-16 h-16 absolute rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'transparent' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--color-destructive)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-6"
            style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-family-body)' }}
          >
            This password reset link is invalid. Please request a new password reset.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/forgot-password"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family-body)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Request New Reset
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-foreground)',
                borderColor: 'var(--color-border)',
                fontFamily: 'var(--font-family-body)',
              }}
            >
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthCard title="Password Reset!" description="Your password has been changed">
        <motion.div
          className="text-center py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={iconVariants}
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
          >
            <motion.svg
              className="w-8 h-8"
              style={{ color: 'var(--color-success)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </motion.svg>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-2"
            style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-family-body)' }}
          >
            Your password has been reset successfully.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-sm mb-6"
            style={{ color: 'var(--color-muted-foreground)', opacity: 0.7, fontFamily: 'var(--font-family-body)' }}
          >
            Redirecting to login...
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/login"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family-body)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Continue to Login
            </Link>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  // Form state (idle or error)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <AuthCard title="Reset Password" description="Create a new password for your account">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-lg border overflow-hidden"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'var(--color-destructive)',
              }}
            >
              <motion.p
                variants={shakeVariants}
                animate="shake"
                className="text-sm"
                style={{ color: 'var(--color-destructive)', fontFamily: 'var(--font-family-body)' }}
              >
                {error}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* New Password Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-family-body)' }}
            >
              New Password
            </label>
            <motion.div
              animate={{
                scale: showPasswordFocus ? 1.01 : 1,
                boxShadow: showPasswordFocus ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setShowPasswordFocus(true)}
                onBlur={() => {
                  setShowPasswordFocus(false);
                  setTouched((prev) => ({ ...prev, newPassword: true }));
                }}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--color-input)',
                  color: 'var(--color-foreground)',
                  border: `2px solid ${showPasswordError ? 'var(--color-destructive)' : showPasswordFocus ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '14px',
                }}
                disabled={status === 'submitting'}
                autoComplete="new-password"
                autoFocus
              />
            </motion.div>

            {/* Password Strength Meter */}
            <AnimatePresence>
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Strength bar container */}
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <motion.div
                        className="h-full rounded-full origin-left"
                        style={{ background: 'var(--gradient-primary)' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: strengthWidth / 100 }}
                        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="h-full w-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                          }}
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        />
                      </motion.div>
                    </div>

                    {/* Strength label with icon */}
                    <motion.div
                      className="flex items-center gap-1.5"
                      key={strengthInfo.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: strengthInfo.color }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.3 }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: strengthInfo.color, fontFamily: 'var(--font-family-body)' }}
                      >
                        {strengthInfo.label}
                      </span>
                    </motion.div>
                  </div>

                  {/* Password requirements feedback */}
                  <AnimatePresence>
                    {passwordValidation.feedback.length > 0 && touched.newPassword && (
                      <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-1"
                      >
                        {passwordValidation.feedback.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="text-xs flex items-center gap-2"
                            style={{ color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-family-body)' }}
                          >
                            <span
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: 'var(--color-muted-foreground)' }}
                            />
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-family-body)' }}
            >
              Confirm Password
            </label>
            <motion.div
              animate={{
                scale: showConfirmFocus ? 1.01 : 1,
                boxShadow: showConfirmFocus ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setShowConfirmFocus(true)}
                onBlur={() => {
                  setShowConfirmFocus(false);
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                }}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--color-input)',
                  color: 'var(--color-foreground)',
                  border: `2px solid ${showConfirmError ? 'var(--color-destructive)' : showConfirmFocus ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '14px',
                }}
                disabled={status === 'submitting'}
                autoComplete="new-password"
              />
            </motion.div>
            <AnimatePresence>
              {showConfirmError && confirmError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 text-sm"
                  style={{ color: 'var(--color-destructive)', fontFamily: 'var(--font-family-body)' }}
                >
                  {confirmError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Password match indicator */}
            <AnimatePresence>
              {confirmPassword && newPassword && !confirmError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <motion.svg
                    className="w-4 h-4"
                    style={{ color: 'var(--color-success)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-success)', fontFamily: 'var(--font-family-body)' }}
                  >
                    Passwords match
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              whileHover={{ scale: status === 'submitting' ? 1 : 1.02 }}
              whileTap={{ scale: status === 'submitting' ? 1 : 0.98 }}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family-body)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {status === 'submitting' ? (
                <>
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
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Back to Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Link
            href="/login"
            className="text-sm font-medium transition-all duration-200"
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Back to Login
          </Link>
        </motion.div>
      </AuthCard>
    </motion.div>
  );
}
