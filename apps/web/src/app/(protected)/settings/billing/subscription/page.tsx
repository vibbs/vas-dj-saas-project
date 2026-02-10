'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge, Spinner, Dialog } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { useBilling } from '@/hooks/useBilling';
import type { Plan } from '@vas-dj-saas/api-client';

/**
 * Subscription Settings Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Current subscription overview
 * - Plan comparison and upgrade/downgrade options
 * - Cancel/reactivate subscription
 *
 * URL: /settings/billing/subscription
 */
export default function SubscriptionPage() {
    const router = useRouter();
    const pathname = usePathname();

    const {
        currentSubscription,
        plans,
        isLoading,
        isLoadingPlans,
        isUpdating,
        error,
        changePlan,
        cancelSubscription,
        reactivateSubscription,
        createCheckoutSession,
    } = useBilling();

    // Dialog state for cancel confirmation
    const [showCancelDialog, setShowCancelDialog] = React.useState(false);

    // Get billing settings config
    const billingConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-billing');
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle plan selection
     */
    const handleSelectPlan = React.useCallback(async (plan: Plan) => {
        if (isUpdating) return;

        if (currentSubscription) {
            // Upgrade/downgrade existing subscription
            const success = await changePlan(plan.id);
            if (success) {
                // Show success feedback
                console.log('Plan changed successfully');
            }
        } else {
            // Create new subscription via checkout
            const result = await createCheckoutSession(plan.id);
            if (result.success && result.checkoutUrl) {
                // Redirect to Stripe checkout
                window.location.href = result.checkoutUrl;
            }
        }
    }, [currentSubscription, changePlan, createCheckoutSession, isUpdating]);

    /**
     * Handle cancel subscription
     */
    const handleCancelSubscription = React.useCallback(async () => {
        setShowCancelDialog(false);
        const success = await cancelSubscription(false); // Cancel at period end
        if (success) {
            console.log('Subscription cancelled');
        }
    }, [cancelSubscription]);

    /**
     * Handle reactivate subscription
     */
    const handleReactivate = React.useCallback(async () => {
        const success = await reactivateSubscription();
        if (success) {
            console.log('Subscription reactivated');
        }
    }, [reactivateSubscription]);

    /**
     * Get button text based on plan comparison
     */
    const getPlanButtonText = (plan: Plan): string => {
        if (!currentSubscription) return 'Subscribe';

        const currentAmount = parseFloat(currentSubscription.planDetails?.amount || '0');
        const planAmount = parseFloat(plan.amount);

        if (plan.id === currentSubscription.plan) return 'Current Plan';
        if (planAmount > currentAmount) return 'Upgrade';
        return 'Downgrade';
    };

    /**
     * Check if plan is current
     */
    const isCurrentPlan = (plan: Plan): boolean => {
        return currentSubscription?.plan === plan.id;
    };

    /**
     * Format price display
     */
    const formatPrice = (amount: string, interval?: string): string => {
        const price = parseFloat(amount);
        const intervalLabel = interval === 'year' ? '/year' : '/month';
        return `$${price.toFixed(2)}${intervalLabel}`;
    };

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
        <>
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

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                                <Spinner size="lg" />
                                <Text color="muted">Loading subscription details...</Text>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <Card>
                                <div className="p-6 text-center">
                                    <Text color="muted">{error}</Text>
                                </div>
                            </Card>
                        )}

                        {/* Current Plan Overview */}
                        {!isLoading && currentSubscription && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <Text color="muted" size="sm">Current Plan</Text>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Heading level={4}>{currentSubscription.planName}</Heading>
                                                <Badge
                                                    variant={
                                                        currentSubscription.isActive ? 'success' :
                                                        currentSubscription.isCanceled ? 'destructive' :
                                                        'warning'
                                                    }
                                                >
                                                    {currentSubscription.statusDisplay}
                                                </Badge>
                                                {currentSubscription.cancelAtPeriodEnd && (
                                                    <Badge variant="warning">Canceling</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Text color="muted" size="sm">
                                                {currentSubscription.cancelAtPeriodEnd ? 'Ends on' : 'Next billing date'}
                                            </Text>
                                            <Text weight="medium">
                                                {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                                            </Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div>
                                            <Text color="muted" size="sm">Billing Cycle</Text>
                                            <Text weight="medium" style={{ textTransform: 'capitalize' }}>
                                                {currentSubscription.planDetails?.intervalDisplay || 'Monthly'}
                                            </Text>
                                        </div>
                                        <div className="text-right">
                                            <Text color="muted" size="sm">Amount</Text>
                                            <Text weight="medium">
                                                {formatPrice(
                                                    currentSubscription.planDetails?.amount || '0',
                                                    currentSubscription.planDetails?.interval
                                                )}
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Trial info */}
                                    {currentSubscription.isTrialing && currentSubscription.trialEnd && (
                                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <Text size="sm" color="primary">
                                                Trial ends on {new Date(currentSubscription.trialEnd).toLocaleDateString()}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* No Subscription State */}
                        {!isLoading && !currentSubscription && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Heading level={4}>No Active Subscription</Heading>
                                            <Text color="muted" size="sm">
                                                Select a plan below to get started
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Available Plans */}
                        {!isLoadingPlans && plans.length > 0 && (
                            <div>
                                <Heading level={4} style={{ marginBottom: '1rem' }}>Available Plans</Heading>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {plans.map((plan) => {
                                        const isCurrent = isCurrentPlan(plan);
                                        const buttonText = getPlanButtonText(plan);
                                        const features = plan.features as Record<string, unknown> | undefined;
                                        const featureList = features?.list as string[] || [];

                                        return (
                                            <Card key={plan.id}>
                                                <div className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Heading level={5}>{plan.name}</Heading>
                                                        {isCurrent && (
                                                            <Badge variant="secondary">Current</Badge>
                                                        )}
                                                    </div>
                                                    <div className="mb-4">
                                                        <span className="text-3xl font-bold">
                                                            ${parseFloat(plan.amount).toFixed(0)}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            /{plan.interval === 'year' ? 'year' : 'month'}
                                                        </span>
                                                    </div>

                                                    {plan.description && (
                                                        <Text color="muted" size="sm" style={{ marginBottom: '1rem' }}>
                                                            {plan.description}
                                                        </Text>
                                                    )}

                                                    {featureList.length > 0 && (
                                                        <ul className="space-y-2 mb-6">
                                                            {featureList.map((feature, index) => (
                                                                <li key={index} className="flex items-center gap-2 text-sm">
                                                                    <span className="text-green-500">&#10003;</span>
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {plan.trialPeriodDays && plan.trialPeriodDays > 0 && !currentSubscription && (
                                                        <Text size="sm" color="primary" style={{ marginBottom: '0.5rem' }}>
                                                            {plan.trialPeriodDays} day free trial
                                                        </Text>
                                                    )}

                                                    <Button
                                                        variant={isCurrent ? 'outline' : 'primary'}
                                                        size="md"
                                                        disabled={isCurrent || isUpdating}
                                                        onClick={() => handleSelectPlan(plan)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        {isUpdating ? 'Processing...' : buttonText}
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Loading Plans State */}
                        {isLoadingPlans && (
                            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                                <Spinner size="md" />
                                <Text color="muted">Loading available plans...</Text>
                            </div>
                        )}

                        {/* Billing Actions */}
                        {currentSubscription && (
                            <Card>
                                <div className="p-6">
                                    <Heading level={5} style={{ marginBottom: '1rem' }}>Billing Actions</Heading>
                                    <div className="flex flex-wrap gap-3">
                                        {currentSubscription.cancelAtPeriodEnd ? (
                                            <Button
                                                variant="primary"
                                                size="md"
                                                onClick={handleReactivate}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? 'Processing...' : 'Reactivate Subscription'}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="md"
                                                onClick={() => setShowCancelDialog(true)}
                                                disabled={isUpdating}
                                            >
                                                Cancel Subscription
                                            </Button>
                                        )}
                                    </div>
                                    <Text color="muted" size="sm" style={{ marginTop: '1rem' }}>
                                        {currentSubscription.cancelAtPeriodEnd
                                            ? 'Your subscription will end on the date shown above. Reactivate to continue using premium features.'
                                            : 'Changes to your subscription will take effect at the end of your current billing cycle.'
                                        }
                                    </Text>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Subscription Dialog */}
            <Dialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                title="Cancel Subscription?"
            >
                <div className="space-y-4">
                    <Text>
                        Are you sure you want to cancel your subscription? You will continue to have access
                        until the end of your current billing period.
                    </Text>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Canceling...' : 'Cancel Subscription'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
