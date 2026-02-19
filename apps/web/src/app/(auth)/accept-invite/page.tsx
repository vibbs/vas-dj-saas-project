'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { InvitesService } from '@vas-dj-saas/api-client';
import { useAuthStatus, useAuthAccount } from '@vas-dj-saas/auth';
import {
  Building2,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Home,
} from 'lucide-react';

// Animation variants with proper typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  },
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

/**
 * Accept Invite Page
 * Allows users to accept organization invitations with polished UI
 */
export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isAccepted, setIsAccepted] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link. No token provided.');
      return;
    }

    // TODO: Fetch invite information from API
    // For now, we'll show a placeholder
    setInviteInfo({
      organizationName: 'Example Organization',
      organizationLogo: null, // Would be a URL in production
      inviterName: 'John Doe',
      inviterEmail: 'john@example.com',
      role: 'member',
    });
  }, [token]);

  const handleAccept = async () => {
    if (!token) {
      setError('Invalid invite token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call accept invite API (unauthenticated endpoint)
      const response = await InvitesService.accept({ token });

      if (response.status === 200) {
        setIsAccepted(true);

        // Delay navigation to show success animation
        setTimeout(() => {
          if (authStatus === 'authenticated' && account) {
            router.push('/dashboard');
          } else {
            router.push('/login?inviteAccepted=true');
          }
        }, 1500);
      } else {
        throw new Error('Failed to accept invite');
      }
    } catch (err: any) {
      console.error('Accept invite error:', err);

      const errorMessage =
        err?.data?.detail ||
        err?.message ||
        'Failed to accept invite. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/');
  };

  // Role badge styling
  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return {
          background: 'var(--gradient-accent)',
          color: 'var(--color-accent-foreground)',
        };
      case 'owner':
        return {
          background: 'var(--gradient-primary)',
          color: 'var(--color-primary-foreground)',
        };
      default:
        return {
          background: 'var(--color-secondary)',
          color: 'var(--color-secondary-foreground)',
        };
    }
  };

  // Invalid token state
  if (!token) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--color-background)' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={scaleInVariants}
          className="w-full max-w-md text-center"
          style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--spacing-2xl)',
          }}
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--color-destructive)',
              opacity: 0.1,
            }}
          >
            <AlertTriangle
              size={32}
              style={{ color: 'var(--color-destructive)' }}
            />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-foreground)',
            }}
          >
            Invalid Invite
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-6"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            This invite link is invalid or has expired. Please contact the person who invited you for a new link.
          </motion.p>

          <motion.button
            variants={itemVariants}
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-primary-foreground)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Home size={18} />
            Go to Home
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Success state
  if (isAccepted) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--color-background)' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={scaleInVariants}
          className="w-full max-w-md text-center"
          style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            padding: 'var(--spacing-2xl)',
          }}
        >
          {/* Success Icon with confetti effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <CheckCircle2
              size={40}
              style={{ color: 'var(--color-primary-foreground)' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-foreground)',
              }}
            >
              Welcome Aboard!
            </h1>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              You've joined{' '}
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                {inviteInfo?.organizationName}
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            Redirecting you...
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-background)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ opacity: 0.5 }}
      >
        <div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full"
          style={{ background: 'var(--gradient-glow)' }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full"
          style={{ background: 'var(--gradient-glow)' }}
        />
      </div>

      <motion.div
        variants={scaleInVariants}
        className="relative w-full max-w-lg"
        style={{
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header with gradient */}
        <div
          className="relative px-8 py-10 text-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {/* Sparkles decoration */}
          <motion.div
            className="absolute top-4 right-4"
            variants={pulseVariants}
            animate="animate"
          >
            <Sparkles
              size={24}
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4"
            variants={pulseVariants}
            animate="animate"
          >
            <Sparkles
              size={16}
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            />
          </motion.div>

          {/* Organization Logo/Icon */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
            className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--color-card)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {inviteInfo?.organizationLogo ? (
              <img
                src={inviteInfo.organizationLogo}
                alt={inviteInfo.organizationName}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <Building2
                size={36}
                style={{ color: 'var(--color-primary)' }}
              />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-1"
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-primary-foreground)',
            }}
          >
            You're Invited!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            Join an amazing team
          </motion.p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-lg flex items-start gap-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--color-destructive)',
                }}
              >
                <XCircle
                  size={20}
                  style={{ color: 'var(--color-destructive)', flexShrink: 0, marginTop: 2 }}
                />
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-destructive)' }}
                >
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {inviteInfo ? (
            <motion.div variants={containerVariants} className="space-y-6">
              {/* Organization Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl p-5"
                style={{
                  background: 'var(--color-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Organization Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--color-primary-muted)' }}
                  >
                    <Building2
                      size={20}
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      Organization
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{
                        fontFamily: 'var(--font-family-display)',
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {inviteInfo.organizationName}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="my-4 h-px"
                  style={{ background: 'var(--color-border)' }}
                />

                {/* Invite Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Inviter */}
                  <div className="flex items-center gap-2">
                    <UserPlus
                      size={16}
                      style={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        Invited by
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {inviteInfo.inviterName}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <Shield
                      size={16}
                      style={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        Your role
                      </p>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={getRoleBadgeStyle(inviteInfo.role)}
                      >
                        {inviteInfo.role}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex gap-3">
                <motion.button
                  onClick={handleAccept}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'var(--color-primary-foreground)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full border-2 border-t-transparent"
                        style={{ borderColor: 'var(--color-primary-foreground)' }}
                      />
                      Accepting...
                    </>
                  ) : (
                    <>
                      Accept Invite
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleDecline}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'transparent',
                    color: 'var(--color-muted-foreground)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Decline
                </motion.button>
              </motion.div>

              {/* Auth Status Notice */}
              {authStatus === 'unauthenticated' && (
                <motion.div
                  variants={itemVariants}
                  className="text-center pt-4"
                  style={{
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    After accepting, you'll be prompted to{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      sign in
                    </span>{' '}
                    or{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      create an account
                    </span>
                    .
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-3 border-t-transparent"
                style={{ borderColor: 'var(--color-primary)', borderWidth: 3 }}
              />
              <p
                className="mt-4 text-sm"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Loading invite details...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
