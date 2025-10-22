'use client';

import React from 'react';
import { Card, Heading, Text } from '@vas-dj-saas/ui';

/**
 * Organization Overview Tab
 * Quick overview of organization status and key metrics
 */
export function OrgOverviewTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <Heading level={3} style={{ marginBottom: '1rem' }}>
                    Organization Summary
                </Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Text color="muted" size="sm">Total Members</Text>
                        <Heading level={4}>12</Heading>
                    </div>
                    <div>
                        <Text color="muted" size="sm">Active Roles</Text>
                        <Heading level={4}>5</Heading>
                    </div>
                    <div>
                        <Text color="muted" size="sm">Pending Invites</Text>
                        <Heading level={4}>3</Heading>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <Heading level={3} style={{ marginBottom: '1rem' }}>
                    Quick Actions
                </Heading>
                <Text color="secondary">
                    Access your most common organization management tasks here.
                </Text>
            </Card>
        </div>
    );
}
