'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsHub } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { convertToHubConfig } from '@/utils/navigation-helpers';

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
            <>
                <SettingsHeader
                    title="Organization Settings"
                    description="Manage your organization"
                    breadcrumbs={[
                        { label: 'Settings', href: '/settings' },
                        { label: 'Organization' },
                    ]}
                />
                <div className="flex-1 p-6">
                    <p className="text-red-500">
                        Error: Hub configuration not found for organization settings.
                        Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                    </p>
                </div>
            </>
        );
    }

    const hubConfig = convertToHubConfig(orgConfig.hubConfig);

    return (
        <>
            <SettingsHeader
                title={hubConfig.title}
                description={hubConfig.description}
                breadcrumbs={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Organization' },
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
