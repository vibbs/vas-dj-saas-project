'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Table, Badge, Select, Spinner } from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';
import type { OrganizationMembership, OrganizationMembershipRole, OrganizationMembershipStatus } from '@vas-dj-saas/api-client';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { MemberDrawer } from '@/components/settings/organization/MemberDrawer';
import { InviteMemberModal } from '@/components/settings/organization/InviteMemberModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useMembers } from '@/hooks/useMembers';
import { useInvitations } from '@/hooks/useInvitations';

const ROLE_OPTIONS = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
];

const STATUS_BADGE_VARIANT: Record<OrganizationMembershipStatus, 'success' | 'warning' | 'secondary'> = {
    active: 'success',
    invited: 'warning',
    suspended: 'secondary',
};

/**
 * Organization Members Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Members table with real API data
 * - EntityDrawer for member details
 * - Invite member modal
 *
 * URL: /settings/organization/members
 * Drawer: /settings/organization/members?selected=user123
 */
export default function OrganizationMembersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedMemberId = searchParams.get('selected');

    // Data hooks
    const { members, isLoading, error, updateRole, updateStatus, removeMember, refresh } = useMembers();
    const { createInvite } = useInvitations();

    // Modal states
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<OrganizationMembership | null>(null);
    const [memberToSuspend, setMemberToSuspend] = useState<OrganizationMembership | null>(null);

    // Get organization settings config
    const orgConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-organization');
    }, []);

    // Find selected member
    const selectedMember = members.find(m => m.id === selectedMemberId);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle row click - open drawer with shallow routing
     */
    const handleRowClick = (member: OrganizationMembership) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('selected', member.id);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    /**
     * Handle role change
     */
    const handleRoleChange = async (memberId: string, newRole: string) => {
        await updateRole(memberId, newRole as OrganizationMembershipRole);
    };

    /**
     * Handle remove member confirmation
     */
    const handleRemoveMember = async () => {
        if (!memberToRemove) return false;
        const success = await removeMember(memberToRemove.id);
        if (success) {
            // Close drawer if removed member was selected
            if (selectedMemberId === memberToRemove.id) {
                router.push(pathname, { scroll: false });
            }
        }
        return success;
    };

    /**
     * Handle suspend/reactivate member
     */
    const handleToggleSuspend = async () => {
        if (!memberToSuspend) return false;
        const newStatus: OrganizationMembershipStatus = memberToSuspend.status === 'suspended' ? 'active' : 'suspended';
        return await updateStatus(memberToSuspend.id, newStatus);
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Table columns
    const columns: TableColumn<OrganizationMembership>[] = [
        {
            key: 'userName',
            title: 'Name',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'userEmail',
            title: 'Email',
            sortable: true,
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'role',
            title: 'Role',
            sortable: true,
            render: (value, member) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select
                        options={ROLE_OPTIONS}
                        value={member.role || 'member'}
                        onChange={(newRole) => handleRoleChange(member.id, newRole as string)}
                        size="sm"
                    />
                </div>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (value, member) => (
                <Badge variant={STATUS_BADGE_VARIANT[member.status || 'active']}>
                    {member.status || 'active'}
                </Badge>
            ),
        },
        {
            key: 'joinedAt',
            title: 'Joined',
            sortable: true,
            render: (value) => <span>{formatDate(String(value))}</span>,
        },
        {
            key: 'id',
            title: 'Actions',
            render: (value, member) => (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', gap: '8px' }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToSuspend(member)}
                    >
                        {member.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        style={{ color: '#dc2626' }}
                    >
                        Remove
                    </Button>
                </div>
            ),
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
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setIsInviteModalOpen(true)}
                            >
                                Invite Member
                            </Button>
                        </div>

                        {/* Error State */}
                        {error && (
                            <Card>
                                <div style={{ padding: '24px', textAlign: 'center' }}>
                                    <Text color="destructive">{error}</Text>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => refresh()}
                                        style={{ marginTop: '12px' }}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Loading State */}
                        {isLoading && !error && (
                            <Card>
                                <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                                    <Spinner size="lg" />
                                </div>
                            </Card>
                        )}

                        {/* Members Table */}
                        {!isLoading && !error && (
                            <Card>
                                {members.length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <Text color="muted">No members found</Text>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setIsInviteModalOpen(true)}
                                            style={{ marginTop: '16px' }}
                                        >
                                            Invite your first member
                                        </Button>
                                    </div>
                                ) : (
                                    <Table
                                        data={members}
                                        columns={columns}
                                        onRowPress={handleRowClick}
                                        hoverable
                                    />
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Details Drawer */}
            <MemberDrawer
                title={selectedMember ? selectedMember.userName : 'Member Details'}
                description={selectedMember?.userEmail}
                headerActions={
                    selectedMember && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMemberToSuspend(selectedMember)}
                            >
                                {selectedMember.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setMemberToRemove(selectedMember)}
                            >
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
                                    <Text>{selectedMember.userName}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Email</Text>
                                    <Text>{selectedMember.userEmail}</Text>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Role</Text>
                                    <Select
                                        options={ROLE_OPTIONS}
                                        value={selectedMember.role || 'member'}
                                        onChange={(newRole) => handleRoleChange(selectedMember.id, newRole as string)}
                                        size="sm"
                                    />
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Status</Text>
                                    <Badge variant={STATUS_BADGE_VARIANT[selectedMember.status || 'active']}>
                                        {selectedMember.status || 'active'}
                                    </Badge>
                                </div>
                                <div>
                                    <Text color="muted" size="sm">Joined</Text>
                                    <Text>{formatDate(selectedMember.joinedAt)}</Text>
                                </div>
                                {selectedMember.invitedByEmail && (
                                    <div>
                                        <Text color="muted" size="sm">Invited By</Text>
                                        <Text>{selectedMember.invitedByEmail}</Text>
                                    </div>
                                )}
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

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={createInvite}
            />

            {/* Remove Member Confirmation */}
            <ConfirmationDialog
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                description={`Are you sure you want to remove ${memberToRemove?.userName} from the organization? They will lose access to all organization resources.`}
                confirmText="Remove Member"
                variant="danger"
            />

            {/* Suspend/Reactivate Member Confirmation */}
            <ConfirmationDialog
                isOpen={!!memberToSuspend}
                onClose={() => setMemberToSuspend(null)}
                onConfirm={handleToggleSuspend}
                title={memberToSuspend?.status === 'suspended' ? 'Reactivate Member' : 'Suspend Member'}
                description={
                    memberToSuspend?.status === 'suspended'
                        ? `Are you sure you want to reactivate ${memberToSuspend?.userName}? They will regain access to organization resources.`
                        : `Are you sure you want to suspend ${memberToSuspend?.userName}? They will temporarily lose access to organization resources.`
                }
                confirmText={memberToSuspend?.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                variant={memberToSuspend?.status === 'suspended' ? 'info' : 'warning'}
            />
        </>
    );
}
