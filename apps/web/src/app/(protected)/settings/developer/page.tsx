'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SettingsHub, Card } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';
import { Code2, Key, Webhook, Shield, Terminal } from 'lucide-react';

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

const codeVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

// Developer stats
interface DevStat {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const devStats: DevStat[] = [
    {
        label: 'API Keys',
        value: '3',
        icon: <Key className="w-5 h-5" />,
        color: 'var(--color-primary)',
    },
    {
        label: 'Webhooks',
        value: '2',
        icon: <Webhook className="w-5 h-5" />,
        color: 'var(--color-accent)',
    },
    {
        label: 'OAuth Apps',
        value: '1',
        icon: <Shield className="w-5 h-5" />,
        color: 'var(--color-success)',
    },
];

/**
 * Developer Settings Hub Page
 *
 * Hub page that provides:
 * - Overview cards for developer tools (API Keys, Webhooks, OAuth, Service Accounts)
 * - Quick actions bar (Create API Key, Add Webhook, etc.)
 * - Discovery-focused design to reduce cognitive load
 *
 * Navigation:
 * - Clicking a card navigates to the detail page with secondary sidebar
 * - URL: /settings/developer (hub)
 * - Child routes: /settings/developer/api-keys, /settings/developer/webhooks, etc.
 */
export default function DeveloperSettingsPage() {
    const router = useRouter();

    // Get developer settings config from navigation
    const devConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-developer');
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    if (!devConfig?.hubConfig) {
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
                        Error: Hub configuration not found for developer settings.
                        Please check the navigation configuration.
                    </p>
                </div>
            </motion.div>
        );
    }

    const hubConfig = convertToHubConfig(devConfig.hubConfig);

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
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)',
                        }}
                    >
                        <Code2 className="w-6 h-6" style={{ color: 'var(--color-accent-foreground)' }} />
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
                            Developer Settings
                        </h1>
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-muted-foreground)',
                                margin: 0,
                                marginTop: '2px',
                            }}
                        >
                            API keys, webhooks, OAuth apps, and integrations
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Card */}
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
                            background: 'var(--gradient-accent)',
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
                            {devStats.map((stat, index) => (
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

            {/* API Endpoint Preview Card */}
            <motion.div variants={codeVariants}>
                <Card
                    style={{
                        marginBottom: 'var(--spacing-lg)',
                        background: 'var(--color-card)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <div style={{ padding: 'var(--spacing-lg)' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                marginBottom: 'var(--spacing-md)',
                            }}
                        >
                            <Terminal className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
                            <p
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-muted-foreground)',
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                API Endpoint
                            </p>
                        </div>
                        <div
                            style={{
                                background: 'var(--color-muted)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--spacing-md)',
                                fontFamily: 'var(--font-family-mono)',
                                fontSize: '0.875rem',
                                color: 'var(--color-foreground)',
                                overflowX: 'auto',
                            }}
                        >
                            <code>
                                <span style={{ color: 'var(--color-muted-foreground)' }}>GET</span>{' '}
                                <span style={{ color: 'var(--color-primary)' }}>https://api.example.com/v1</span>
                            </code>
                        </div>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-muted-foreground)',
                                margin: 0,
                                marginTop: 'var(--spacing-sm)',
                            }}
                        >
                            Use your API keys to authenticate requests to our REST API
                        </p>
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
