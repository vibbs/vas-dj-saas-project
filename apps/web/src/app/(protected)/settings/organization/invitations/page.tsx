'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

/**
 * Organization Invitations Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Pending invitations management
 *
 * URL: /settings/organization/invitations
 */
export default function OrganizationInvitationsPage() {
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
                    title="Invitations"
                    description="Manage pending invitations"
                    breadcrumbs={[
                        { label: 'Settings', href: '/settings' },
                        { label: 'Organization', href: '/settings/organization' },
                        { label: 'Invitations' },
                    ]}
                />
                <div className="flex-1 p-6">
                    <p className="text-red-500">
                        Error: Secondary sidebar configuration not found.
                    </p>
                </div>
            </>
        );
    }

    const secondarySidebarConfig = convertToSecondarySidebarConfig(orgConfig.secondarySidebar);

    return (
        <>
            <SettingsHeader
                title="Invitations"
                description="Manage pending invitations to your organization"
                breadcrumbs={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Organization', href: '/settings/organization' },
                    { label: 'Invitations' },
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
                                <Heading level={3}>Pending Invitations</Heading>
                                <Text color="muted" size="sm">
                                    View and manage invitations sent to join your organization
                                </Text>
                            </div>
                            <Button variant="primary" size="md">
                                Send Invitation
                            </Button>
                        </div>

                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="warning">3</Badge>
                                <Text>Pending invitations</Text>
                            </div>
                            <Text color="muted" size="sm">
                                Invitations list will be implemented here.
                            </Text>
                            <Text color="muted" size="sm" style={{ marginTop: '1rem' }}>
                                This page will include:
                            </Text>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><Text size="sm">List of pending invitations</Text></li>
                                <li><Text size="sm">Resend invitation action</Text></li>
                                <li><Text size="sm">Cancel invitation action</Text></li>
                                <li><Text size="sm">Invitation expiry status</Text></li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
