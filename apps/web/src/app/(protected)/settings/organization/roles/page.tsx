'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

/**
 * Organization Roles Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Roles management interface
 *
 * URL: /settings/organization/roles
 */
export default function OrganizationRolesPage() {
    const router = useRouter();
    const pathname = usePathname();

    // Get organization settings config
    const orgConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-organization');
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    if (!orgConfig?.secondarySidebar) {
        return (
            <>
                <SettingsHeader
                    title="Roles & Permissions"
                    description="Define roles and permission sets"
                    breadcrumbs={[
                        { label: 'Settings', href: '/settings' },
                        { label: 'Organization', href: '/settings/organization' },
                        { label: 'Roles' },
                    ]}
                />
                <div className="flex-1 p-6">
                    <p className="text-red-500">
                        Error: Secondary sidebar configuration not found.
                        Please check the navigation configuration.
                    </p>
                </div>
            </>
        );
    }

    const secondarySidebarConfig = convertToSecondarySidebarConfig(orgConfig.secondarySidebar);

    return (
        <>
            <SettingsHeader
                title="Roles & Permissions"
                description="Define roles and permission sets for your organization"
                breadcrumbs={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Organization', href: '/settings/organization' },
                    { label: 'Roles' },
                ]}
            />

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
                        <div className="flex items-center justify-between">
                            <div>
                                <Heading level={3}>Roles</Heading>
                                <Text color="muted" size="sm">
                                    Manage roles and their associated permissions
                                </Text>
                            </div>
                            <Button variant="primary" size="md">
                                Create Role
                            </Button>
                        </div>

                        <Card className="p-6">
                            <Text>
                                Roles management interface will be implemented here.
                            </Text>
                            <Text color="muted" size="sm" style={{ marginTop: '1rem' }}>
                                This page will include:
                            </Text>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><Text size="sm">List of existing roles</Text></li>
                                <li><Text size="sm">Permission matrix</Text></li>
                                <li><Text size="sm">Role creation/editing interface</Text></li>
                                <li><Text size="sm">Member count per role</Text></li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
