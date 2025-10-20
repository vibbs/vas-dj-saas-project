'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Integrations Settings Page
 * Third-party integrations management
 */
export default function IntegrationsPage() {
  return (
    <>
      <SettingsHeader
        title="Integrations"
        description="Connect third-party services to your organization"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization', href: '/settings/organization/profile' },
          { label: 'Integrations' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Connected Integrations</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your active third-party integrations.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Integrations</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and connect new integrations to enhance your workflow.
          </p>
        </Card>
      </div>
    </>
  );
}
