'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs, Card } from '@vas-dj-saas/ui';
import { ProfileTab } from '@/components/settings/personal/ProfileTab';
import { SecurityTab } from '@/components/settings/personal/SecurityTab';
import { NotificationsTab } from '@/components/settings/personal/NotificationsTab';
import { User, Shield, Bell } from 'lucide-react';

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
} as const;

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const contentVariants = {
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

// Tab icon components
const tabIcons: Record<string, React.ReactNode> = {
  profile: <User className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  notifications: <Bell className="w-4 h-4" />,
};

/**
 * Personal Settings Page
 *
 * Uses ShallowTabs pattern for:
 * - Profile (basic personal information)
 * - Security (password, 2FA, sessions)
 * - Notifications (email and push preferences)
 *
 * Benefits:
 * - Single page, no route changes
 * - URL query params for state (?tab=security)
 * - Shareable deep links
 * - No full page reloads
 */
export default function PersonalSettingsPage() {
  const router = useNextTabRouter();

  return (
    <motion.div
      className="flex-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        fontFamily: 'var(--font-family-body)',
      }}
    >
      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        style={{
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <User className="w-6 h-6" style={{ color: 'var(--color-primary-foreground)' }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                margin: 0,
              }}
            >
              Personal Settings
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-muted-foreground)',
                margin: 0,
                marginTop: '2px',
              }}
            >
              Manage your profile, security, and notification preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Content */}
      <motion.div variants={contentVariants}>
        <Card
          style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '3px',
              background: 'var(--gradient-primary)',
            }}
          />
          <div style={{ padding: 'var(--spacing-lg)' }}>
            <ShallowTabs
              router={router}
              defaultTab="profile"
              tabs={[
                {
                  value: 'profile',
                  label: 'Profile',
                  icon: tabIcons.profile,
                  component: (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ProfileTab />
                      </motion.div>
                    </AnimatePresence>
                  ),
                },
                {
                  value: 'security',
                  label: 'Security',
                  icon: tabIcons.security,
                  component: (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <SecurityTab />
                      </motion.div>
                    </AnimatePresence>
                  ),
                },
                {
                  value: 'notifications',
                  label: 'Notifications',
                  icon: tabIcons.notifications,
                  component: (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <NotificationsTab />
                      </motion.div>
                    </AnimatePresence>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
