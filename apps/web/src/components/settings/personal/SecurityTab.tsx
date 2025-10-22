'use client';

import React from 'react';
import { Card, Heading, Text } from '@vas-dj-saas/ui';

/**
 * Security Tab
 * Password, 2FA, and security settings
 */
export function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <Heading level={3}>Security Settings</Heading>
        <Text color="muted" size="sm">
          Manage your password, two-factor authentication, and security preferences
        </Text>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Password</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Change your password and manage password requirements.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Two-Factor Authentication</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account with 2FA.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Active Sessions</h4>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage devices where you&apos;re currently logged in.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Security Log</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Recent security events and login activity.
        </p>
      </Card>
    </div>
  );
}
