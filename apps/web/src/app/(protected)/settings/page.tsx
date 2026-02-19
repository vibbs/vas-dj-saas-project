'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  CreditCard,
  Code2,
  ChevronRight,
  Settings
} from 'lucide-react';

/**
 * Settings Hub Page
 *
 * Main landing page for all settings sections.
 * Provides a visual overview of available settings categories
 * with animated cards for navigation.
 */

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'personal',
    title: 'Personal Settings',
    description: 'Manage your profile, security, and notification preferences',
    icon: <User className="w-6 h-6" />,
    href: '/settings/personal',
    color: 'var(--color-primary)',
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Team members, roles, permissions, and organization settings',
    icon: <Building2 className="w-6 h-6" />,
    href: '/settings/organization',
    color: 'var(--color-info)',
  },
  {
    id: 'billing',
    title: 'Billing & Subscription',
    description: 'Plans, invoices, payment methods, and usage',
    icon: <CreditCard className="w-6 h-6" />,
    href: '/settings/billing',
    color: 'var(--color-success)',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'API keys, webhooks, OAuth apps, and integrations',
    icon: <Code2 className="w-6 h-6" />,
    href: '/settings/developer',
    color: 'var(--color-accent)',
  },
];

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
} as const;

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

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div
      className="flex-1"
      style={{
        fontFamily: 'var(--font-family-body)',
      }}
    >
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
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
            <Settings className="w-6 h-6" style={{ color: 'var(--color-primary-foreground)' }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.75rem',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                margin: 0,
              }}
            >
              Settings
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-muted-foreground)',
                margin: 0,
                marginTop: '2px',
              }}
            >
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: 'var(--spacing-lg)',
        }}
      >
        {settingsCategories.map((category) => (
          <motion.button
            key={category.id}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              boxShadow: 'var(--shadow-lg)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(category.href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 'var(--spacing-lg)',
              background: 'var(--color-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'border-color var(--animation-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = category.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `color-mix(in srgb, ${category.color} 15%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                color: category.color,
              }}
            >
              {category.icon}
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                margin: 0,
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              {category.title}
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-muted-foreground)',
                margin: 0,
                marginBottom: 'var(--spacing-md)',
                lineHeight: 1.5,
                flex: 1,
              }}
            >
              {category.description}
            </p>

            {/* Arrow indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: category.color,
              }}
            >
              <span>Manage</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
