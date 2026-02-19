'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  SecondarySidebar,
  Card,
  Heading,
  Text,
  Badge,
  Spinner,
} from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { useMembers } from '@/hooks/useMembers';
import {
  Shield,
  Crown,
  UserCog,
  User,
  Check,
  X,
  Info,
} from 'lucide-react';

// Role definitions with descriptions and permissions
const roleDefinitions = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all organization settings, billing, and member management.',
    icon: Crown,
    color: 'var(--color-warning)',
    permissions: {
      'Manage members': true,
      'Invite members': true,
      'Remove members': true,
      'Change member roles': true,
      'View billing': true,
      'Manage billing': true,
      'Manage API keys': true,
      'View analytics': true,
      'Delete organization': true,
      'Transfer ownership': true,
    },
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Can manage members and most organization settings, but not billing or ownership.',
    icon: UserCog,
    color: 'var(--color-primary)',
    permissions: {
      'Manage members': true,
      'Invite members': true,
      'Remove members': true,
      'Change member roles': true,
      'View billing': true,
      'Manage billing': false,
      'Manage API keys': true,
      'View analytics': true,
      'Delete organization': false,
      'Transfer ownership': false,
    },
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard access to organization resources. Cannot manage other members.',
    icon: User,
    color: 'var(--color-muted-foreground)',
    permissions: {
      'Manage members': false,
      'Invite members': false,
      'Remove members': false,
      'Change member roles': false,
      'View billing': false,
      'Manage billing': false,
      'Manage API keys': false,
      'View analytics': true,
      'Delete organization': false,
      'Transfer ownership': false,
    },
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

/**
 * Organization Roles Page
 *
 * Shows available roles and their permissions.
 * In the current implementation, roles are predefined (owner, admin, member)
 * and cannot be customized. This page serves as documentation for users.
 */
export default function OrganizationRolesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { members, isLoading } = useMembers();

  // Count members by role
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { owner: 0, admin: 0, member: 0 };
    members.forEach((m) => {
      if (m.role && counts[m.role] !== undefined) {
        counts[m.role]++;
      }
    });
    return counts;
  }, [members]);

  // Get organization settings config
  const orgConfig = useMemo(() => {
    return navigationConfig.sections
      .find((s) => s.id === 'settings')
      ?.items.find((i) => i.id === 'settings-organization');
  }, []);

  const handleNavigate = React.useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  if (!orgConfig?.secondarySidebar) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-500">
          Error: Secondary sidebar configuration not found.
        </p>
      </div>
    );
  }

  const secondarySidebarConfig = convertToSecondarySidebarConfig(
    orgConfig.secondarySidebar
  );

  return (
    <div className="flex flex-1">
      {/* Secondary Sidebar */}
      <SecondarySidebar
        config={secondarySidebarConfig}
        activePath={pathname}
        onNavigate={handleNavigate}
        mode="sidebar"
      />

      {/* Main Content */}
      <motion.div
        className="flex-1 p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div style={{ maxWidth: '900px' }}>
          {/* Header */}
          <motion.div variants={itemVariants} style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
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
                <Shield className="w-6 h-6" style={{ color: 'var(--color-primary-foreground)' }} />
              </div>
              <div>
                <Heading level={3}>Roles & Permissions</Heading>
                <Text color="muted" size="sm">
                  Understand the access levels for organization members
                </Text>
              </div>
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div variants={itemVariants}>
            <Card
              style={{
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                background: 'color-mix(in srgb, var(--color-info) 10%, var(--color-card))',
                border: '1px solid var(--color-info)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                <Info size={18} style={{ color: 'var(--color-info)', marginTop: '2px' }} />
                <Text size="sm" style={{ margin: 0 }}>
                  Roles are predefined and cannot be customized. Assign roles to members from the{' '}
                  <a
                    href="/settings/organization/members"
                    style={{ color: 'var(--color-info)', textDecoration: 'underline' }}
                  >
                    Members
                  </a>{' '}
                  page.
                </Text>
              </div>
            </Card>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
              <Spinner size="lg" />
            </div>
          )}

          {/* Role Cards */}
          {!isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {roleDefinitions.map((role, index) => (
                <motion.div key={role.id} variants={itemVariants} custom={index}>
                  <Card
                    style={{
                      padding: 'var(--spacing-lg)',
                      background: 'var(--color-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {/* Role Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--spacing-lg)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: `color-mix(in srgb, ${role.color} 15%, transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: role.color,
                          }}
                        >
                          <role.icon size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, margin: 0, marginBottom: '4px' }}>
                            {role.name}
                          </h4>
                          <Text size="sm" color="muted" style={{ margin: 0 }}>
                            {role.description}
                          </Text>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {roleCounts[role.id] || 0} {roleCounts[role.id] === 1 ? 'member' : 'members'}
                      </Badge>
                    </div>

                    {/* Permissions Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 'var(--spacing-sm)',
                      }}
                    >
                      {Object.entries(role.permissions).map(([permission, allowed]) => (
                        <div
                          key={permission}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-muted)',
                          }}
                        >
                          {allowed ? (
                            <Check
                              size={16}
                              style={{ color: 'var(--color-success)', flexShrink: 0 }}
                            />
                          ) : (
                            <X
                              size={16}
                              style={{ color: 'var(--color-muted-foreground)', flexShrink: 0 }}
                            />
                          )}
                          <Text
                            size="sm"
                            style={{
                              margin: 0,
                              color: allowed
                                ? 'var(--color-foreground)'
                                : 'var(--color-muted-foreground)',
                            }}
                          >
                            {permission}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Legend */}
          <motion.div variants={itemVariants} style={{ marginTop: 'var(--spacing-xl)' }}>
            <Card
              style={{
                padding: 'var(--spacing-md)',
                background: 'var(--color-muted)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Text size="sm" style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                Legend
              </Text>
              <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <Check size={14} style={{ color: 'var(--color-success)' }} />
                  <Text size="sm" color="muted" style={{ margin: 0 }}>
                    Permission granted
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <X size={14} style={{ color: 'var(--color-muted-foreground)' }} />
                  <Text size="sm" color="muted" style={{ margin: 0 }}>
                    Permission denied
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
