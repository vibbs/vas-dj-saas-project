'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * API Keys Settings Page
 * Manage API keys for organization
 */
export default function ApiKeysPage() {
  return (
    <>
      <SettingsHeader
        title="API Keys"
        description="Manage API keys for your organization"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization', href: '/settings/organization/profile' },
          { label: 'API Keys' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active API Keys</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your organization's active API keys.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Key</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate new API keys with custom permissions.
          </p>
        </Card>
      </div>
    </>
  );
}
