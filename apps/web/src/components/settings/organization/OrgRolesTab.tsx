'use client';

import React from 'react';
import { Card, Heading, Text, Button } from '@vas-dj-saas/ui';

/**
 * Organization Roles Tab
 * Manage custom roles and permissions
 */
export function OrgRolesTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Heading level={3}>Roles & Permissions</Heading>
                    <Text color="muted" size="sm">
                        Define custom roles and permissions for your team
                    </Text>
                </div>
                <Button variant="primary" size="md">
                    Create Role
                </Button>
            </div>

            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <Heading level={4}>Admin</Heading>
                        <Text color="muted" size="sm">Full access to all organization settings</Text>
                    </div>
                    <div>
                        <Heading level={4}>Member</Heading>
                        <Text color="muted" size="sm">Standard access for team members</Text>
                    </div>
                    <div>
                        <Heading level={4}>Guest</Heading>
                        <Text color="muted" size="sm">Limited read-only access</Text>
                    </div>
                </div>
            </Card>
        </div>
    );
}
