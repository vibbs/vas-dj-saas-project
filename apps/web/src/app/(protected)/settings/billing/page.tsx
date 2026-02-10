'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsHub, Card, Heading, Text, Badge, Spinner } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';
import { useBilling } from '@/hooks/useBilling';
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
        plans,
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
            <div className="flex-1 p-6">
                <p className="text-red-500">
                    Error: Hub configuration not found for billing settings.
                    Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                </p>
            </div>
        );
    }

    // Loading state
    if (isLoading && !currentSubscription) {
        return (
            <div className="flex-1 p-6">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Spinner size="lg" />
                    <Text color="muted">Loading billing information...</Text>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex-1 p-6">
                <Card>
                    <div className="p-6 text-center">
                        <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                            Unable to load billing information
                        </Heading>
                        <Text color="muted" style={{ marginBottom: '1rem' }}>
                            {error}
                        </Text>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!dynamicHubConfig) {
        return null;
    }

    return (
        <div className="flex-1">
            {/* Current Plan Banner */}
            {currentSubscription && (
                <Card style={{ marginBottom: '1.5rem' }}>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Heading level={4} style={{ margin: 0 }}>
                                            {currentSubscription.planName}
                                        </Heading>
                                        <Badge
                                            variant={currentSubscription.isActive ? 'success' : 'warning'}
                                        >
                                            {currentSubscription.statusDisplay}
                                        </Badge>
                                    </div>
                                    <Text color="muted" size="sm" style={{ marginTop: '0.25rem' }}>
                                        {currentSubscription.cancelAtPeriodEnd
                                            ? `Cancels on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                                            : `Renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                                        }
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <Text color="muted" size="sm">Monthly cost</Text>
                                    <Heading level={4} style={{ margin: 0 }}>
                                        ${currentSubscription.planDetails?.amount || '0.00'}
                                    </Heading>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* No Subscription Banner */}
            {!currentSubscription && !isLoading && (
                <Card style={{ marginBottom: '1.5rem' }}>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <Heading level={4} style={{ margin: 0, marginBottom: '0.25rem' }}>
                                    No Active Subscription
                                </Heading>
                                <Text color="muted" size="sm">
                                    Choose a plan to unlock premium features for your organization
                                </Text>
                            </div>
                            <button
                                onClick={() => router.push('/settings/billing/subscription')}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                View Plans
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Settings Hub */}
            <SettingsHub
                config={dynamicHubConfig}
                onNavigate={handleNavigate}
                isLoading={isLoadingPlans || isLoadingInvoices}
            />
        </div>
    );
}
