'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Security Settings Page
 * Password, 2FA, and security settings
 */
export default function SecuritySettingsPage() {
  return (
    <>
      <SettingsHeader
        title="Security"
        description="Manage your password and security preferences"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Security' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Password</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Change your password and manage password settings.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enable or disable two-factor authentication for added security.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your active sessions across devices.
          </p>
        </Card>
      </div>
    </>
  );
}
