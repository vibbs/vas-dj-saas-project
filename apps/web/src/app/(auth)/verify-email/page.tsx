'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@vas-dj-saas/api-client';
import { AuthCard } from '@/components/auth/AuthCard';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

// Animation variants for staggered content entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
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

// Animated checkmark path
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.6, ease: 'easeOut' as const, delay: 0.3 },
      opacity: { duration: 0.2, delay: 0.3 },
    },
  },
};

// Confetti particle component
const ConfettiParticle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      backgroundColor: color,
      left: `${x}%`,
      top: '50%',
    }}
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -80, -120, -160],
      x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
      scale: [0, 1, 1, 0.5],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      delay,
      ease: 'easeOut',
    }}
  />
);

// Celebratory confetti effect
const CelebrationEffect = () => {
  const particles = useMemo(() => {
    const colors = [
      'var(--color-primary)',
      'var(--color-success)',
      'var(--color-accent)',
      '#A78BFA',
      '#34D399',
    ];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      x: 20 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} {...particle} />
      ))}
    </div>
  );
};

// Animated success checkmark
const AnimatedCheckmark = () => (
  <motion.div
    className="relative w-20 h-20 mx-auto mb-6"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
  >
    {/* Pulsing glow effect */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'var(--gradient-glow)',
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />

    {/* Background circle */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'var(--color-success)',
        boxShadow: 'var(--shadow-glow)',
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    />

    {/* Checkmark SVG */}
    <svg
      className="absolute inset-0 w-full h-full p-5"
      viewBox="0 0 24 24"
      fill="none"
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="var(--color-success-foreground)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkmarkVariants}
        initial="hidden"
        animate="visible"
      />
    </svg>
  </motion.div>
);

// Animated error icon
const AnimatedErrorIcon = () => (
  <motion.div
    className="relative w-16 h-16 mx-auto mb-4"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
  >
    <div
      className="absolute inset-0 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-destructive)',
        opacity: 0.15,
      }}
    />
    <div
      className="absolute inset-1 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-destructive)',
        opacity: 0.1,
      }}
    />
    <svg
      className="absolute inset-0 w-full h-full p-4"
      fill="none"
      stroke="var(--color-destructive)"
      viewBox="0 0 24 24"
    >
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </svg>
  </motion.div>
);

// Loading spinner with brand colors
const AnimatedSpinner = () => (
  <motion.div
    className="relative w-14 h-14 mx-auto mb-4"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="w-full h-full rounded-full"
      style={{
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </motion.div>
);

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
        <motion.div
          className="text-center py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AnimatedErrorIcon />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-6"
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            This verification link is invalid. Please check your email for the correct link or request a new verification email.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/login"
              className="inline-flex justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family-body)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              Go to Login
            </Link>
          </motion.div>
        </motion.div>
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
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedSpinner />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Verifying your email address...
          </motion.p>
        </motion.div>
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
        <motion.div
          className="relative text-center py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Celebration confetti effect */}
          <CelebrationEffect />

          <motion.div variants={itemVariants}>
            <AnimatedCheckmark />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mb-2 text-base"
            style={{
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Your email address has been verified successfully.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm mb-6"
            style={{
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Redirecting to login...
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/login"
              className="inline-flex justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--color-primary-foreground)',
                fontFamily: 'var(--font-family-body)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              Continue to Login
            </Link>
          </motion.div>
        </motion.div>
      </AuthCard>
    );
  }

  // Error state
  return (
    <AuthCard
      title="Verification Failed"
      description="We couldn't verify your email"
    >
      <motion.div
        className="text-center py-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <motion.div
            className="relative w-16 h-16 mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-warning)',
                opacity: 0.15,
              }}
            />
            <svg
              className="absolute inset-0 w-full h-full p-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <motion.path
                stroke="var(--color-warning)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </svg>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-destructive)',
                opacity: 0.1,
                border: '1px solid var(--color-destructive)',
              }}
            >
              <motion.div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--color-destructive)',
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--color-destructive)',
                    fontFamily: 'var(--font-family-body)',
                  }}
                >
                  {error}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          variants={itemVariants}
          className="mb-6"
          style={{
            color: 'var(--color-muted-foreground)',
            fontFamily: 'var(--font-family-body)',
          }}
        >
          The verification link may have expired or already been used. You can request a new verification email after logging in.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/login"
            className="inline-flex justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-primary-foreground)',
              fontFamily: 'var(--font-family-body)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Go to Login
          </Link>
          <Link
            href="/register-organization"
            className="inline-flex justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-secondary-foreground)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Register Again
          </Link>
        </motion.div>
      </motion.div>
    </AuthCard>
  );
}
