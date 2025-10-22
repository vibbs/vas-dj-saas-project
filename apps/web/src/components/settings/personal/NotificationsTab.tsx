'use client';

import React from 'react';
import { Card, Heading, Text } from '@vas-dj-saas/ui';

/**
 * Notifications Tab
 * Email and push notification preferences
 */
export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <Heading level={3}>Notification Preferences</Heading>
        <Text color="muted" size="sm">
          Control how and when you receive notifications
        </Text>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Email Notifications</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Choose which email notifications you want to receive.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Push Notifications</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Manage push notifications for mobile and desktop.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Notification Digest</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Set up daily or weekly notification summaries.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Do Not Disturb</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Set quiet hours to pause notifications.
        </p>
      </Card>
    </div>
  );
}
