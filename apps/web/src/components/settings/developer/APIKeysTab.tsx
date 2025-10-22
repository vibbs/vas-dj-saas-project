'use client';

import React from 'react';
import { Card, Heading, Text, Button } from '@vas-dj-saas/ui';

/**
 * API Keys Tab
 * Generate and manage API keys
 */
export function APIKeysTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={3}>API Keys</Heading>
          <Text color="muted" size="sm">
            Generate and manage API keys for accessing the platform API
          </Text>
        </div>
        <Button variant="primary" size="md">
          Create API Key
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Active API Keys</h4>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your active API keys. Keep your keys secure and rotate them regularly.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">API Documentation</h4>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to use the API with our comprehensive documentation and examples.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-base font-semibold mb-4">Rate Limits</h4>
        <p className="text-gray-600 dark:text-gray-400">
          View your current API usage and rate limits.
        </p>
      </Card>
    </div>
  );
}
