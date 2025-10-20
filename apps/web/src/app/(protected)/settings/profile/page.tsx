'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Profile Settings Page
 * Personal profile information
 */
export default function ProfileSettingsPage() {
  return (
    <>
      <SettingsHeader
        title="Profile"
        description="Manage your personal information and profile settings"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Profile' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Profile settings page coming soon. This will include name, email, avatar, bio, and other personal details.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Avatar</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and manage your profile picture.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your contact details including phone number and alternate email.
          </p>
        </Card>
      </div>
    </>
  );
}
