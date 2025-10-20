'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Members & Teams Settings Page
 * Manage team members, invitations, and roles
 */
export default function MembersTeamsPage() {
  return (
    <>
      <SettingsHeader
        title="Members & Teams"
        description="Manage your organization's members and teams"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization', href: '/settings/organization/profile' },
          { label: 'Members & Teams' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all members of your organization.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage pending invitations to join your organization.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Roles & Permissions</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure roles and permissions for team members.
          </p>
        </Card>
      </div>
    </>
  );
}
