'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Organization Profile Settings Page
 * Organization name, subdomain, logo, etc.
 */
export default function OrganizationProfilePage() {
  return (
    <>
      <SettingsHeader
        title="Organization Profile"
        description="Manage your organization's profile and settings"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization', href: '/settings/organization/profile' },
          { label: 'Profile' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Organization name, subdomain, and basic information.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Branding</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your organization logo and customize branding.
          </p>
        </Card>
      </div>
    </>
  );
}
