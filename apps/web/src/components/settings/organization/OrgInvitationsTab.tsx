'use client';

import React from 'react';
import { Card, Heading, Text, Button, Badge } from '@vas-dj-saas/ui';

/**
 * Organization Invitations Tab
 * Manage pending invitations
 */
export function OrgInvitationsTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Heading level={3}>Pending Invitations</Heading>
                    <Text color="muted" size="sm">
                        Manage invitations sent to join your organization
                    </Text>
                </div>
                <Button variant="primary" size="md">
                    Send Invitation
                </Button>
            </div>

            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <Text weight="medium">alice@example.com</Text>
                            <Text color="muted" size="sm">Invited 2 days ago · Role: Member</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="warning">Pending</Badge>
                            <Button variant="outline" size="sm">Resend</Button>
                            <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <Text weight="medium">charlie@example.com</Text>
                            <Text color="muted" size="sm">Invited 5 days ago · Role: Admin</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="warning">Pending</Badge>
                            <Button variant="outline" size="sm">Resend</Button>
                            <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
