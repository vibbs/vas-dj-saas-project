'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';

// Mock subscription data - will be replaced with API integration
interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
    isCurrent: boolean;
    isPopular?: boolean;
}

const mockPlans: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'monthly',
        features: [
            '5 team members',
            '1 GB storage',
            'Basic support',
            'Community access',
        ],
        isCurrent: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        interval: 'monthly',
        features: [
            '25 team members',
            '10 GB storage',
            'Priority support',
            'API access',
            'Advanced analytics',
        ],
        isCurrent: true,
        isPopular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        interval: 'monthly',
        features: [
            'Unlimited team members',
            '100 GB storage',
            '24/7 dedicated support',
            'Custom integrations',
            'SSO & SAML',
            'SLA guarantee',
        ],
        isCurrent: false,
    },
];

const mockCurrentSubscription = {
    plan: 'Pro',
    status: 'active' as const,
    billingCycle: 'monthly' as const,
    nextBillingDate: '2025-02-15',
    amount: 29,
};

/**
 * Subscription Settings Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Current subscription overview
 * - Plan comparison and upgrade/downgrade options
 *
 * URL: /settings/billing/subscription
 */
export default function SubscriptionPage() {
    const router = useRouter();
    const pathname = usePathname();

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    if (!billingConfig?.secondarySidebar) {
        return (
            <div className="flex-1 p-6">
                <p className="text-red-500">
                    Error: Secondary sidebar configuration not found.
                    Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                </p>
            </div>
        );
    }

    const secondarySidebarConfig = convertToSecondarySidebarConfig(billingConfig.secondarySidebar);

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
            <div className="flex-1 p-6">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Heading level={3}>Subscription</Heading>
                            <Text color="muted" size="sm">
                                Manage your subscription plan and billing cycle
                            </Text>
                        </div>
                    </div>

                    {/* Current Plan Overview */}
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <Text color="muted" size="sm">Current Plan</Text>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Heading level={4}>{mockCurrentSubscription.plan}</Heading>
                                        <Badge variant="success">{mockCurrentSubscription.status}</Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Text color="muted" size="sm">Next billing date</Text>
                                    <Text weight="medium">{mockCurrentSubscription.nextBillingDate}</Text>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                    <Text color="muted" size="sm">Billing Cycle</Text>
                                    <Text weight="medium" style={{ textTransform: 'capitalize' }}>
                                        {mockCurrentSubscription.billingCycle}
                                    </Text>
                                </div>
                                <div className="text-right">
                                    <Text color="muted" size="sm">Amount</Text>
                                    <Text weight="medium">${mockCurrentSubscription.amount}/month</Text>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Available Plans */}
                    <div>
                        <Heading level={4} style={{ marginBottom: '1rem' }}>Available Plans</Heading>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {mockPlans.map((plan) => (
                                <Card key={plan.id}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Heading level={5}>{plan.name}</Heading>
                                            {plan.isPopular && (
                                                <Badge variant="primary">Popular</Badge>
                                            )}
                                            {plan.isCurrent && (
                                                <Badge variant="secondary">Current</Badge>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-3xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm">
                                                    <span className="text-green-500">&#10003;</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            variant={plan.isCurrent ? 'outline' : 'primary'}
                                            size="md"
                                            disabled={plan.isCurrent}
                                            style={{ width: '100%' }}
                                        >
                                            {plan.isCurrent ? 'Current Plan' : plan.price > mockCurrentSubscription.amount ? 'Upgrade' : 'Downgrade'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Billing Actions */}
                    <Card>
                        <div className="p-6">
                            <Heading level={5} style={{ marginBottom: '1rem' }}>Billing Actions</Heading>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" size="md">
                                    Switch to Yearly Billing (Save 20%)
                                </Button>
                                <Button variant="outline" size="md">
                                    Cancel Subscription
                                </Button>
                            </div>
                            <Text color="muted" size="sm" style={{ marginTop: '1rem' }}>
                                Changes to your subscription will take effect at the end of your current billing cycle.
                            </Text>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
