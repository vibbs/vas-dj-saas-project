'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsHub } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToHubConfig } from '@/utils/navigation-helpers';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

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
            <>
                <SettingsHeader
                    title="Developer Settings"
                    description="Manage API keys, webhooks, and integrations"
                    breadcrumbs={[
                        { label: 'Settings', href: '/settings' },
                        { label: 'Developer' },
                    ]}
                />
                <div className="flex-1 p-6">
                    <p className="text-red-500">
                        Error: Hub configuration not found for developer settings.
                        Please check the navigation configuration.
                    </p>
                </div>
            </>
        );
    }

    const hubConfig = convertToHubConfig(devConfig.hubConfig);

    return (
        <>
            <SettingsHeader
                title={hubConfig.title}
                description={hubConfig.description}
                breadcrumbs={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Developer' },
                ]}
            />

            <div className="flex-1 p-6">
                <SettingsHub
                    config={hubConfig}
                    onNavigate={handleNavigate}
                />
            </div>
        </>
    );
}
