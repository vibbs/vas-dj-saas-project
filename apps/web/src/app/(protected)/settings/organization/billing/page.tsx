'use client';

import React from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Card } from '@vas-dj-saas/ui';

/**
 * Billing Settings Page
 * Subscription and billing information
 */
export default function BillingPage() {
  return (
    <>
      <SettingsHeader
        title="Billing"
        description="Manage your subscription and billing information"
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization', href: '/settings/organization/profile' },
          { label: 'Billing' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View your current subscription plan and usage details.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your payment methods and billing information.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View past invoices and payment history.
          </p>
        </Card>
      </div>
    </>
  );
}
