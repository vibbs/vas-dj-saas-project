'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Webhooks Settings Page
 * Configure webhook endpoints
 */
export default function WebhooksPage() {
  return (
    <>
      <SettingsHeader
        title="Webhooks"
        description="Configure webhook endpoints for your organization"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Developer', href: '/settings/developer/webhooks' },
          { label: 'Webhooks' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Webhook Endpoints</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and manage webhook endpoints to receive real-time events.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Event Types</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select which events you want to receive via webhooks.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Webhook Logs</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View webhook delivery logs and troubleshoot issues.
          </p>
        </Card>
      </div>
    </>
  );
}
