'use client';

import React from 'react';
import { Card, Heading, Text } from '@vas-dj-saas/ui';

/**
 * Profile Tab
 * Personal profile information and settings
 */
export function ProfileTab() {
  return (
    <div className="space-y-6">
      <div>
        <Heading level={3}>Personal Information</Heading>
        <Text color="muted" size="sm">
          Manage your personal profile details
        </Text>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Basic Information</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Profile settings coming soon. This will include name, email, avatar, bio, and other personal details.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Avatar</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage your profile picture.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Contact Information</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your contact details including phone number and alternate email.
        </p>
      </Card>
    </div>
  );
}
