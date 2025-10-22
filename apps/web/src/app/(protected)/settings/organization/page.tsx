'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { OrgOverviewTab } from '@/components/settings/organization/OrgOverviewTab';
import { OrgMembersTab } from '@/components/settings/organization/OrgMembersTab';
import { OrgRolesTab } from '@/components/settings/organization/OrgRolesTab';
import { OrgInvitationsTab } from '@/components/settings/organization/OrgInvitationsTab';

/**
 * Organization Settings Page
 * 
 * Uses the hybrid tab pattern:
 * - ShallowTabs for top-level navigation (Overview, Members, Roles, Invitations)
 * - EntityDrawer for entity details (e.g., member details)
 * - URL query params for state (?tab=members&selected=user123)
 * 
 * Benefits:
 * - Reduced cognitive load (single page, no route changes)
 * - Preserved context (list state maintained when viewing details)
 * - Shareable deep links
 * - No full page reloads
 */
export default function OrganizationSettingsPage() {
    const router = useNextTabRouter();

    return (
        <>
            <SettingsHeader
                title="Organization Settings"
                description="Manage your organization's members, roles, and configuration"
                breadcrumbs={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Organization' },
                ]}
            />

            <div className="flex-1 p-6">
                <ShallowTabs
                    router={router}
                    defaultTab="overview"
                    tabs={[
                        {
                            value: 'overview',
                            label: 'Overview',
                            component: <OrgOverviewTab />,
                        },
                        {
                            value: 'members',
                            label: 'Members',
                            component: <OrgMembersTab />,
                            badge: 12, // Will be dynamic from API
                        },
                        {
                            value: 'invitations',
                            label: 'Invitations',
                            component: <OrgInvitationsTab />,
                            badge: 3, // Will be dynamic from API
                        },
                        {
                            value: 'roles',
                            label: 'Roles',
                            component: <OrgRolesTab />,
                        },
                    ]}
                />
            </div>
        </>
    );
}
