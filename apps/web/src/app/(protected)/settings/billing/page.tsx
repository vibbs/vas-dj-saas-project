'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsHub, Card, Heading, Text, Badge } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';
import { useBilling } from '@/hooks/useBilling';
import { CreditCard, RefreshCw } from 'lucide-react';
import type { HubCardProps } from '@vas-dj-saas/ui';

// Define types locally since they're not exported from UI package
interface QuickAction {
    id: string;
    label: string;
    icon: string;
    href?: string;
    onClick?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    order?: number;
}

interface SummaryMetric {
    label: string;
    value: string | number;
    icon?: string;
}

interface HubConfig {
    title: string;
    description?: string;
    cards: HubCardProps[];
    quickActions?: QuickAction[];
    summaryMetrics?: SummaryMetric[];
}

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

const bannerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

/**
 * Billing Settings Hub Page
 *
 * Hub page that provides:
 * - Current plan overview with status
 * - Overview cards for each billing subsection (Subscription, Invoices, Payment Methods)
 * - Quick actions bar (Upgrade Plan, Add Payment Method)
 * - Summary metrics showing billing health
 *
 * Navigation:
 * - Clicking a card navigates to the detail page with secondary sidebar
 * - URL: /settings/billing (hub)
 * - Child routes: /settings/billing/subscription, /settings/billing/invoices, etc.
 */
export default function BillingSettingsPage() {
    const router = useRouter();
    const {
        currentSubscription,
        invoices,
        billingOverview,
        isLoading,
        isLoadingPlans,
        isLoadingInvoices,
        error,
    } = useBilling();

    // Get billing settings config from navigation
    const billingConfig = React.useMemo(() => {
        const settings = navigationConfig.sections.find(s => s.id === 'settings');
        if (!settings) {
            console.error('[Billing Settings] Settings section not found in navigation config');
            return null;
        }

        const billingItem = settings.items.find(i => i.id === 'settings-billing');
        if (!billingItem) {
            console.error('[Billing Settings] Billing settings item not found');
            return null;
        }

        if (!billingItem.hubConfig) {
            console.error('[Billing Settings] Hub config not found for billing settings');
            return null;
        }

        return billingItem;
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    // Build dynamic hub config with live data
    const dynamicHubConfig = React.useMemo((): HubConfig | null => {
        if (!billingConfig?.hubConfig) return null;

        const baseConfig = convertToHubConfig(billingConfig.hubConfig);

        // Update cards with live metrics
        const updatedCards: HubCardProps[] = baseConfig.cards.map(card => {
            const updatedCard = { ...card };

            // Update subscription card
            if (card.id === 'subscription' || card.href?.includes('subscription')) {
                if (currentSubscription) {
                    updatedCard.badge = currentSubscription.planName;
                    updatedCard.badgeVariant = currentSubscription.isActive ? 'success' : 'warning';
                } else if (!isLoading) {
                    updatedCard.badge = 'No Plan';
                    updatedCard.badgeVariant = 'secondary';
                }
            }

            // Update invoices card
            if (card.id === 'invoices' || card.href?.includes('invoices')) {
                const paidCount = invoices.filter(inv => inv.status === 'paid').length;
                updatedCard.metric = paidCount;
                updatedCard.metricLabel = 'Paid';
            }

            // Update payment methods card
            if (card.id === 'payment-methods' || card.href?.includes('payment-methods')) {
                // Payment methods count would come from usePaymentMethods hook
                // For now, leave as-is since we don't want to fetch twice
            }

            return updatedCard;
        });

        // Build summary metrics
        const summaryMetrics: SummaryMetric[] = [
            {
                label: 'Current Plan',
                value: currentSubscription?.planName || 'Free',
                icon: 'CreditCard',
            },
            {
                label: 'Status',
                value: currentSubscription?.statusDisplay || 'No subscription',
                icon: 'Activity',
            },
            {
                label: 'Total This Year',
                value: `$${(billingOverview?.totalSpentThisYear || 0).toFixed(2)}`,
                icon: 'DollarSign',
            },
            {
                label: 'Outstanding',
                value: `$${(billingOverview?.outstandingBalance || 0).toFixed(2)}`,
                icon: 'Receipt',
            },
        ];

        return {
            ...baseConfig,
            cards: updatedCards,
            summaryMetrics,
        };
    }, [billingConfig, currentSubscription, invoices, billingOverview, isLoading]);

    if (!billingConfig || !billingConfig.hubConfig) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-6"
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
                        Error: Hub configuration not found for billing settings.
                        Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                    </p>
                </div>
            </motion.div>
        );
    }

    // Loading state
    if (isLoading && !currentSubscription) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
                style={{ padding: 'var(--spacing-lg)' }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        gap: 'var(--spacing-lg)',
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCw
                            className="w-8 h-8"
                            style={{ color: 'var(--color-primary)' }}
                        />
                    </motion.div>
                    <Text color="muted" style={{ fontFamily: 'var(--font-family-body)' }}>
                        Loading billing information...
                    </Text>
                </div>
            </motion.div>
        );
    }

    // Error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
                style={{ padding: 'var(--spacing-lg)' }}
            >
                <Card
                    style={{
                        borderColor: 'var(--color-destructive)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <div
                        style={{
                            padding: 'var(--spacing-xl)',
                            textAlign: 'center',
                        }}
                    >
                        <Heading
                            level={4}
                            style={{
                                marginBottom: 'var(--spacing-sm)',
                                fontFamily: 'var(--font-family-display)',
                                color: 'var(--color-foreground)',
                            }}
                        >
                            Unable to load billing information
                        </Heading>
                        <Text
                            color="muted"
                            style={{
                                marginBottom: 'var(--spacing-md)',
                                fontFamily: 'var(--font-family-body)',
                            }}
                        >
                            {error}
                        </Text>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.reload()}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'var(--color-primary)',
                                color: 'var(--color-primary-foreground)',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                fontFamily: 'var(--font-family-body)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background var(--animation-fast) ease',
                            }}
                        >
                            Try again
                        </motion.button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    if (!dynamicHubConfig) {
        return null;
    }

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
            {/* Current Plan Banner */}
            <AnimatePresence mode="wait">
                {currentSubscription && (
                    <motion.div
                        variants={bannerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.98 }}
                    >
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
                            {/* Gradient accent bar */}
                            <div
                                style={{
                                    height: '4px',
                                    background: 'var(--gradient-primary)',
                                }}
                            />
                            <div style={{ padding: 'var(--spacing-lg)' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--spacing-md)',
                                    }}
                                    className="sm:flex-row sm:items-center sm:justify-between"
                                >
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
                                            }}
                                        >
                                            <CreditCard className="w-6 h-6" style={{ color: 'var(--color-primary-foreground)' }} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <Heading
                                                    level={4}
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: 'var(--font-family-display)',
                                                        color: 'var(--color-foreground)',
                                                    }}
                                                >
                                                    {currentSubscription.planName}
                                                </Heading>
                                                <Badge
                                                    variant={currentSubscription.isActive ? 'success' : 'warning'}
                                                >
                                                    {currentSubscription.statusDisplay}
                                                </Badge>
                                            </div>
                                            <Text
                                                color="muted"
                                                size="sm"
                                                style={{
                                                    marginTop: 'var(--spacing-xs)',
                                                    fontFamily: 'var(--font-family-body)',
                                                }}
                                            >
                                                {currentSubscription.cancelAtPeriodEnd
                                                    ? `Cancels on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                                                    : `Renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                                                }
                                            </Text>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            textAlign: 'right',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            background: 'var(--color-muted)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <Text
                                            color="muted"
                                            size="sm"
                                            style={{
                                                fontFamily: 'var(--font-family-body)',
                                                marginBottom: '2px',
                                            }}
                                        >
                                            Monthly cost
                                        </Text>
                                        <Heading
                                            level={4}
                                            style={{
                                                margin: 0,
                                                fontFamily: 'var(--font-family-display)',
                                                color: 'var(--color-primary)',
                                            }}
                                        >
                                            ${currentSubscription.planDetails?.amount || '0.00'}
                                        </Heading>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No Subscription Banner */}
            <AnimatePresence mode="wait">
                {!currentSubscription && !isLoading && (
                    <motion.div
                        variants={bannerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.98 }}
                    >
                        <Card
                            style={{
                                marginBottom: 'var(--spacing-lg)',
                                background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 10%, var(--color-card)) 0%, var(--color-card) 100%)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--color-accent)',
                            }}
                        >
                            <div style={{ padding: 'var(--spacing-lg)' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--spacing-md)',
                                    }}
                                    className="sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <Heading
                                            level={4}
                                            style={{
                                                margin: 0,
                                                marginBottom: 'var(--spacing-xs)',
                                                fontFamily: 'var(--font-family-display)',
                                                color: 'var(--color-foreground)',
                                            }}
                                        >
                                            No Active Subscription
                                        </Heading>
                                        <Text
                                            color="muted"
                                            size="sm"
                                            style={{ fontFamily: 'var(--font-family-body)' }}
                                        >
                                            Choose a plan to unlock premium features for your organization
                                        </Text>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-md)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/settings/billing/subscription')}
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                                            background: 'var(--gradient-accent)',
                                            color: 'var(--color-accent-foreground)',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            fontFamily: 'var(--font-family-body)',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all var(--animation-fast) ease',
                                        }}
                                    >
                                        View Plans
                                    </motion.button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Hub */}
            <motion.div variants={itemVariants}>
                <SettingsHub
                    config={dynamicHubConfig}
                    onNavigate={handleNavigate}
                    isLoading={isLoadingPlans || isLoadingInvoices}
                />
            </motion.div>
        </motion.div>
    );
}
