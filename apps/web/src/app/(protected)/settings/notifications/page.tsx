'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Notification Settings Page
 * Email and notification preferences
 */
export default function NotificationSettingsPage() {
  return (
    <>
      <SettingsHeader
        title="Notifications"
        description="Manage your notification preferences"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Notifications' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure which email notifications you want to receive.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage push notification settings for mobile and desktop.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Frequency</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Control how often you receive notifications and digests.
          </p>
        </Card>
      </div>
    </>
  );
}
