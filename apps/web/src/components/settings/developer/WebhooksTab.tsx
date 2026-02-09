'use client';

import React from 'react';
import { Card, Heading, Text, Button } from '@vas-dj-saas/ui';

/**
 * Webhooks Tab
 * Configure webhook endpoints
 */
export function WebhooksTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={3}>Webhooks</Heading>
          <Text color="muted" size="sm">
            Configure webhook endpoints to receive real-time event notifications
          </Text>
        </div>
        <Button variant="primary" size="md">
          Add Webhook
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Active Webhooks</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your webhook endpoints and view delivery history.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Event Types</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Select which events should trigger webhook notifications.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Webhook Logs</h4>
        <p className="text-gray-600 dark:text-gray-400">
          View delivery logs and debug webhook failures.
        </p>
      </Card>
    </div>
  );
}
