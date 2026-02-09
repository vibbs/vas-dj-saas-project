'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsHub } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';

/**
 * Billing Settings Hub Page
 *
 * Hub page that provides:
 * - Overview cards for each billing subsection (Subscription, Invoices, Payment Methods)
 * - Quick actions bar (Upgrade Plan, Add Payment Method)
 * - Discovery-focused design to reduce cognitive load
 *
 * Navigation:
 * - Clicking a card navigates to the detail page with secondary sidebar
 * - URL: /settings/billing (hub)
 * - Child routes: /settings/billing/subscription, /settings/billing/invoices, etc.
 */
export default function BillingSettingsPage() {
    const router = useRouter();

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

    const hubConfig = convertToHubConfig(billingConfig.hubConfig);

    return (
        <SettingsHub
            config={hubConfig}
            onNavigate={handleNavigate}
        />
    );
}
