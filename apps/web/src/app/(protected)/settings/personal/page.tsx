'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';
import { ProfileTab } from '@/components/settings/personal/ProfileTab';
import { SecurityTab } from '@/components/settings/personal/SecurityTab';
import { NotificationsTab } from '@/components/settings/personal/NotificationsTab';

/**
 * Personal Settings Page
 *
 * Uses ShallowTabs pattern for:
 * - Profile (basic personal information)
 * - Security (password, 2FA, sessions)
 * - Notifications (email and push preferences)
 *
 * Benefits:
 * - Single page, no route changes
 * - URL query params for state (?tab=security)
 * - Shareable deep links
 * - No full page reloads
 */
export default function PersonalSettingsPage() {
  const router = useNextTabRouter();

  return (
    <div className="flex-1">
        <ShallowTabs
          router={router}
          defaultTab="profile"
          tabs={[
            {
              value: 'profile',
              label: 'Profile',
              component: <ProfileTab />,
            },
            {
              value: 'security',
              label: 'Security',
              component: <SecurityTab />,
            },
            {
              value: 'notifications',
              label: 'Notifications',
              component: <NotificationsTab />,
            },
          ]}
        />
    </div>
  );
}
