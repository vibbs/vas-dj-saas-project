'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Table, Badge } from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { MemberDrawer } from '@/components/settings/organization/MemberDrawer';

// Mock member data
interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'pending' | 'inactive';
    joinedAt: string;
}

const mockMembers: Member[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        joinedAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Member',
        status: 'active',
        joinedAt: '2024-02-20',
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Member',
        status: 'pending',
        joinedAt: '2024-03-10',
    },
];

/**
 * Organization Members Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Members table
 * - EntityDrawer for member details
 *
 * URL: /settings/organization/members
 * Drawer: /settings/organization/members?selected=user123
 */
export default function OrganizationMembersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedMemberId = searchParams.get('selected');

    // Get organization settings config
    const orgConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-organization');
    }, []);

    // Find selected member
    const selectedMember = mockMembers.find(m => m.id === selectedMemberId);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle row click - open drawer with shallow routing
     */
    const handleRowClick = (member: Member) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('selected', member.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Table columns
    const columns: TableColumn<Member>[] = [
        {
            key: 'name',
            title: 'Name',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'email',
            title: 'Email',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'role',
            title: 'Role',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'status',
            title: 'Status',
            render: (value, member) => (
                <Badge
                    variant={
                        member.status === 'active' ? 'success' :
                            member.status === 'pending' ? 'warning' :
                                'secondary'
                    }
                >
                    {member.status}
                </Badge>
            ),
        },
        {
            key: 'joinedAt',
            title: 'Joined',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
    ];

    if (!orgConfig?.secondarySidebar) {
        return (
            <div className="flex-1 p-6">
                <p className="text-red-500">
                    Error: Secondary sidebar configuration not found.
                    Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
                </p>
            </div>
        );
    }

    const secondarySidebarConfig = convertToSecondarySidebarConfig(orgConfig.secondarySidebar);

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
                        <div className="flex items-center justify-between">
                            <div>
                                <Heading level={3}>Team Members</Heading>
                                <Text color="muted" size="sm">
                                    Manage your organization&apos;s members and their roles
                                </Text>
                            </div>
                            <Button variant="primary" size="md">
                                Invite Member
                            </Button>
                        </div>

                        <Card>
                            <Table
                                data={mockMembers}
                                columns={columns}
                                onRowPress={handleRowClick}
                                hoverable
                            />
                        </Card>
                    </div>
                </div>
            </div>

            {/* Member Details Drawer */}
            <MemberDrawer
                title={selectedMember ? selectedMember.name : 'Member Details'}
                description={selectedMember?.email}
                headerActions={
                    selectedMember && (
                        <>
                            <Button variant="outline" size="sm">
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                                Remove
                            </Button>
                        </>
                    )
                }
            >
                {selectedMember && (
                    <div className="space-y-6">
                        <div>
                            <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                                Profile Information
                            </Heading>
                            <div className="space-y-3">
                                <div>
                                    <Text color="muted" size="sm">Name</Text>
                                    <Text>{selectedMember.name}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Email</Text>
                                    <Text>{selectedMember.email}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Role</Text>
                                    <Text>{selectedMember.role}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Status</Text>
                                    <Badge
                                        variant={
                                            selectedMember.status === 'active' ? 'success' :
                                                selectedMember.status === 'pending' ? 'warning' :
                                                    'secondary'
                                        }
                                    >
                                        {selectedMember.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Joined</Text>
                                    <Text>{selectedMember.joinedAt}</Text>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                                Permissions
                            </Heading>
                            <Text color="muted" size="sm">
                                Member permissions are managed through their assigned role.
                            </Text>
                        </div>

                        <div>
                            <Heading level={4} style={{ marginBottom: '0.5rem' }}>
                                Activity Log
                            </Heading>
                            <Text color="muted" size="sm">
                                Recent activity for this member will appear here.
                            </Text>
                        </div>
                    </div>
                )}
            </MemberDrawer>
        </>
    );
}
