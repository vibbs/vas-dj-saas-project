'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * OAuth Clients Settings Page
 * Manage OAuth clients for integrations
 */
export default function OAuthClientsPage() {
  return (
    <>
      <SettingsHeader
        title="OAuth Clients"
        description="Manage OAuth applications and clients"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Developer', href: '/settings/developer/webhooks' },
          { label: 'OAuth Clients' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">OAuth Applications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage OAuth applications for third-party integrations.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Authorized Applications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and revoke access for applications connected to your organization.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">OAuth Scopes</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure OAuth scopes and permissions for your applications.
          </p>
        </Card>
      </div>
    </>
  );
}
