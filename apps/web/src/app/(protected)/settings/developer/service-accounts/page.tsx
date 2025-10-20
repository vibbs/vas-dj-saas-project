'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Service Accounts Settings Page
 * Manage service accounts for automation
 */
export default function ServiceAccountsPage() {
  return (
    <>
      <SettingsHeader
        title="Service Accounts"
        description="Manage service accounts for automated workflows"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Developer', href: '/settings/developer/webhooks' },
          { label: 'Service Accounts' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Service Accounts</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage service accounts for automated processes.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Service Account</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create new service accounts with specific permissions.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Service Account Keys</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage authentication keys for service accounts.
          </p>
        </Card>
      </div>
    </>
  );
}
