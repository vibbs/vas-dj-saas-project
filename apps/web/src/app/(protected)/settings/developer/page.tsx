'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { APIKeysTab } from '@/components/settings/developer/APIKeysTab';
import { WebhooksTab } from '@/components/settings/developer/WebhooksTab';
import { OAuthTab } from '@/components/settings/developer/OAuthTab';
import { ServiceAccountsTab } from '@/components/settings/developer/ServiceAccountsTab';

/**
 * Developer Settings Page
 *
 * Uses ShallowTabs pattern for:
 * - API Keys (generate and manage API keys)
 * - Webhooks (configure webhook endpoints)
 * - OAuth (manage OAuth applications)
 * - Service Accounts (automated workflow accounts)
 *
 * Benefits:
 * - Single page, no route changes
 * - URL query params for state (?tab=webhooks)
 * - Shareable deep links
 * - No full page reloads
 */
export default function DeveloperSettingsPage() {
  const router = useNextTabRouter();

  return (
    <>
      <SettingsHeader
        title="Developer Settings"
        description="Manage API keys, webhooks, OAuth applications, and service accounts"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Developer' },
        ]}
      />

      <div className="flex-1 p-6">
        <ShallowTabs
          router={router}
          defaultTab="api-keys"
          tabs={[
            {
              value: 'api-keys',
              label: 'API Keys',
              component: <APIKeysTab />,
            },
            {
              value: 'webhooks',
              label: 'Webhooks',
              component: <WebhooksTab />,
            },
            {
              value: 'oauth',
              label: 'OAuth',
              component: <OAuthTab />,
            },
            {
              value: 'service-accounts',
              label: 'Service Accounts',
              component: <ServiceAccountsTab />,
            },
          ]}
        />
      </div>
    </>
  );
}
