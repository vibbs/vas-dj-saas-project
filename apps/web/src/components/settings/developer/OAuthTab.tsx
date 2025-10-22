'use client';

import React from 'react';
import { Card, Heading, Text, Button } from '@vas-dj-saas/ui';

/**
 * OAuth Tab
 * Manage OAuth applications
 */
export function OAuthTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={3}>OAuth Applications</Heading>
          <Text color="muted" size="sm">
            Manage OAuth applications for third-party integrations
          </Text>
        </div>
        <Button variant="primary" size="md">
          Create OAuth App
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Your Applications</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your OAuth applications, client IDs, and secrets.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Authorized Applications</h4>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage third-party applications you&apos;ve authorized.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">OAuth Documentation</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to implement OAuth 2.0 authentication flows.
        </p>
      </Card>
    </div>
  );
}
