'use client';

import React from 'react';
import { Card, Heading, Text, Button } from '@vas-dj-saas/ui';

/**
 * Service Accounts Tab
 * Automated workflow accounts
 */
export function ServiceAccountsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={3}>Service Accounts</Heading>
          <Text color="muted" size="sm">
            Create and manage service accounts for automated workflows and integrations
          </Text>
        </div>
        <Button variant="primary" size="md">
          Create Service Account
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Active Service Accounts</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Manage service accounts and their permissions.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Credentials</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and manage authentication credentials for service accounts.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Activity Logs</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor service account usage and API activity.
        </p>
      </Card>
    </div>
  );
}
