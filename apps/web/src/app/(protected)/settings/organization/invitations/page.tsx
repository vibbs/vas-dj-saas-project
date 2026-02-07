'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SecondarySidebar, Card, Heading, Text, Button, Badge, Table, Spinner } from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';
import type { Invite, InviteStatus } from '@vas-dj-saas/api-client';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { InviteMemberModal } from '@/components/settings/organization/InviteMemberModal';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useInvitations } from '@/hooks/useInvitations';

const STATUS_BADGE_VARIANT: Record<InviteStatus, 'warning' | 'success' | 'secondary' | 'destructive'> = {
    pending: 'warning',
    accepted: 'success',
    expired: 'secondary',
    revoked: 'destructive',
};

/**
 * Organization Invitations Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - Pending invitations management with real API data
 *
 * URL: /settings/organization/invitations
 */
export default function OrganizationInvitationsPage() {
    const router = useRouter();
    const pathname = usePathname();

    // Data hook
    const { invitations, isLoading, error, createInvite, resendInvite, revokeInvite, refresh } = useInvitations();

    // Modal states
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);
    const [resendingId, setResendingId] = useState<string | null>(null);

    // Get organization settings config
    const orgConfig = React.useMemo(() => {
        return navigationConfig.sections
            .find(s => s.id === 'settings')
            ?.items.find(i => i.id === 'settings-organization');
    }, []);

    const handleNavigate = React.useCallback((href: string) => {
        router.push(href);
    }, [router]);

    /**
     * Handle resend invite
     */
    const handleResend = async (inviteId: string) => {
        setResendingId(inviteId);
        try {
            await resendInvite(inviteId);
        } finally {
            setResendingId(null);
        }
    };

    /**
     * Handle revoke invite confirmation
     */
    const handleRevokeInvite = async () => {
        if (!inviteToRevoke) return false;
        return await revokeInvite(inviteToRevoke.id);
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

    /**
     * Get time ago string
     */
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    // Filter to show only pending invitations by default
    const pendingInvitations = invitations.filter(i => i.status === 'pending');

    // Table columns
    const columns: TableColumn<Invite>[] = [
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
            render: (value) => (
                <span style={{ textTransform: 'capitalize' }}>{String(value || 'member')}</span>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (value, invite) => (
                <Badge variant={STATUS_BADGE_VARIANT[invite.status || 'pending']}>
                    {invite.status || 'pending'}
                </Badge>
            ),
        },
        {
            key: 'invitedByName',
            title: 'Invited By',
            render: (value) => <span>{String(value)}</span>,
        },
        {
            key: 'createdAt',
            title: 'Sent',
            sortable: true,
            render: (value, invite) => (
                <span title={formatDate(String(value))}>
                    {getTimeAgo(String(value))}
                </span>
            ),
        },
        {
            key: 'id',
            title: 'Actions',
            render: (value, invite) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {invite.status === 'pending' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(invite.id)}
                                loading={resendingId === invite.id}
                                disabled={resendingId === invite.id}
                            >
                                Resend
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInviteToRevoke(invite)}
                                style={{ color: '#dc2626' }}
                            >
                                Revoke
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    if (!orgConfig?.secondarySidebar) {
        return (
            <div className="flex-1 p-6">
                <p className="text-red-500">
                    Error: Secondary sidebar configuration not found.
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
                                <Heading level={3}>Pending Invitations</Heading>
                                <Text color="muted" size="sm">
                                    View and manage invitations sent to join your organization
                                </Text>
                            </div>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setIsInviteModalOpen(true)}
                            >
                                Send Invitation
                            </Button>
                        </div>

                        {/* Summary Card */}
                        {!isLoading && !error && pendingInvitations.length > 0 && (
                            <Card>
                                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Badge variant="warning">{pendingInvitations.length}</Badge>
                                    <Text>pending invitation{pendingInvitations.length !== 1 ? 's' : ''}</Text>
                                </div>
                            </Card>
                        )}

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

                        {/* Invitations Table */}
                        {!isLoading && !error && (
                            <Card>
                                {invitations.length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center' }}>
                                        <Text color="muted">No invitations sent yet</Text>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setIsInviteModalOpen(true)}
                                            style={{ marginTop: '16px' }}
                                        >
                                            Send your first invitation
                                        </Button>
                                    </div>
                                ) : (
                                    <Table
                                        data={invitations}
                                        columns={columns}
                                        hoverable
                                    />
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={createInvite}
            />

            {/* Revoke Invitation Confirmation */}
            <ConfirmationDialog
                isOpen={!!inviteToRevoke}
                onClose={() => setInviteToRevoke(null)}
                onConfirm={handleRevokeInvite}
                title="Revoke Invitation"
                description={`Are you sure you want to revoke the invitation sent to ${inviteToRevoke?.email}? They will no longer be able to join your organization using this invitation.`}
                confirmText="Revoke Invitation"
                variant="danger"
            />
        </>
    );
}
