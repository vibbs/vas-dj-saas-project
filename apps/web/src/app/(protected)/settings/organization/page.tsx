'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SettingsHub, Card } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';
import { Building2, Users, Shield, Mail } from 'lucide-react';

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

// Quick stats for organization overview
interface OrgStat {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const orgStats: OrgStat[] = [
    {
        label: 'Team Members',
        value: '12',
        icon: <Users className="w-5 h-5" />,
        color: 'var(--color-primary)',
    },
    {
        label: 'Active Roles',
        value: '5',
        icon: <Shield className="w-5 h-5" />,
        color: 'var(--color-info)',
    },
    {
        label: 'Pending Invites',
        value: '3',
        icon: <Mail className="w-5 h-5" />,
        color: 'var(--color-accent)',
    },
];

/**
 * Organization Settings Hub Page
 *
 * Hub page that provides:
 * - Overview cards for each org subsection (Members, Roles, Invitations, etc.)
 * - Quick actions bar (Invite Member, Create Role, etc.)
 * - Discovery-focused design to reduce cognitive load
 *
 * Navigation:
 * - Clicking a card navigates to the detail page with secondary sidebar
 * - URL: /settings/organization (hub)
 * - Child routes: /settings/organization/members, /settings/organization/roles, etc.
 */
export default function OrganizationSettingsPage() {
    const router = useRouter();

    // Get organization settings config from navigation
    const orgConfig = React.useMemo(() => {
        const settings = navigationConfig.sections.find(s => s.id === 'settings');
        if (!settings) {
            console.error('[Organization Settings] Settings section not found in navigation config');
            return null;
        }

        const orgItem = settings.items.find(i => i.id === 'settings-organization');
        if (!orgItem) {
            console.error('[Organization Settings] Organization settings item not found');
            return null;
        }

        if (!orgItem.hubConfig) {
            console.error('[Organization Settings] Hub config not found for organization settings');
            return null;
        }

        return orgItem;
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    if (!orgConfig || !orgConfig.hubConfig) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
                style={{ padding: 'var(--spacing-lg)' }}
            >
                <div
                    style={{
                        padding: 'var(--spacing-lg)',
                        background: 'color-mix(in srgb, var(--color-destructive) 10%, var(--color-card))',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-destructive)',
                    }}
                >
                    <p style={{ color: 'var(--color-destructive)', margin: 0 }}>
                        Error: Hub configuration not found for organization settings.
                        Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                    </p>
                </div>
            </motion.div>
        );
    }

    const hubConfig = convertToHubConfig(orgConfig.hubConfig);

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
                        <Building2 className="w-6 h-6" style={{ color: 'var(--color-primary-foreground)' }} />
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
                            Organization Settings
                        </h1>
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-muted-foreground)',
                                margin: 0,
                                marginTop: '2px',
                            }}
                        >
                            Manage your team, roles, and organization preferences
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
                <Card
                    style={{
                        marginBottom: 'var(--spacing-lg)',
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
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: 'var(--spacing-lg)',
                            }}
                        >
                            {orgStats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.2 + index * 0.1,
                                        duration: 0.4,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-muted-foreground)',
                                                margin: 0,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                            }}
                                        >
                                            {stat.label}
                                        </p>
                                        <p
                                            style={{
                                                fontFamily: 'var(--font-family-display)',
                                                fontSize: '1.5rem',
                                                fontWeight: 600,
                                                color: 'var(--color-foreground)',
                                                margin: 0,
                                            }}
                                        >
                                            {stat.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Settings Hub */}
            <motion.div variants={itemVariants}>
                <SettingsHub
                    config={hubConfig}
                    onNavigate={handleNavigate}
                />
            </motion.div>
        </motion.div>
    );
}
