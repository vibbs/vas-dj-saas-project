'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  SecondarySidebar,
  Card,
  Heading,
  Text,
  Button,
  Spinner,
  EmptyState,
  Icon,
} from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core';
import { convertToSecondarySidebarConfig } from '@/utils/navigation-helpers';
import { useApiKeys } from '@/hooks/useApiKeys';
import { ApiKeyCard } from '@/components/developer/ApiKeyCard';
import { CreateApiKeyModal } from '@/components/developer/CreateApiKeyModal';
import { ApiKeyUsageStats } from '@/components/developer/ApiKeyUsageStats';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';

/**
 * API Keys Management Page
 *
 * Detail page with:
 * - Secondary sidebar for in-section navigation
 * - List of API keys with actions
 * - Create new API key modal
 * - Usage statistics overview
 *
 * URL: /settings/developer/api-keys
 * Create: /settings/developer/api-keys?action=create
 */
export default function ApiKeysPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if create action is requested via URL
  const actionParam = searchParams.get('action');

  // Data hooks
  const {
    apiKeys,
    isLoading,
    error,
    refresh,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    organizationUsage,
  } = useApiKeys();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [keyToRegenerate, setKeyToRegenerate] = useState<string | null>(null);

  // Handle action param in URL
  useEffect(() => {
    if (actionParam === 'create') {
      setIsCreateModalOpen(true);
      // Clear the action param from URL
      router.replace(pathname, { scroll: false });
    }
  }, [actionParam, pathname, router]);

  // Get developer settings config
  const devConfig = React.useMemo(() => {
    return navigationConfig.sections
      .find(s => s.id === 'settings')
      ?.items.find(i => i.id === 'settings-developer');
  }, []);

  const handleNavigate = React.useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const handleRevoke = async () => {
    if (!keyToRevoke) return false;
    const success = await revokeApiKey(keyToRevoke);
    return success;
  };

  const handleRegenerate = async () => {
    if (!keyToRegenerate) return false;
    const result = await regenerateApiKey(keyToRegenerate);
    return !!result;
  };

  // Get key name for dialogs
  const getKeyName = (keyId: string | null) => {
    if (!keyId) return '';
    const key = apiKeys.find(k => k.id === keyId);
    return key?.name || 'this API key';
  };

  // Filter active vs revoked keys
  const activeKeys = apiKeys.filter(k => k.status === 'active');
  const revokedKeys = apiKeys.filter(k => k.status === 'revoked');

  if (!devConfig?.secondarySidebar) {
    return (
      <div className="flex-1 p-6">
        <p className="text-red-500">
          Error: Secondary sidebar configuration not found.
          Please check the navigation configuration in packages/core/src/navigation/config/nav-items.ts
        </p>
      </div>
    );
  }

  const secondarySidebarConfig = convertToSecondarySidebarConfig(devConfig.secondarySidebar);

  return (
    <>
      <div className="flex flex-1">
        {/* Secondary Sidebar */}
        <SecondarySidebar
          config={secondarySidebarConfig}
          activePath={pathname}
          onNavigate={handleNavigate}
          mode="sidebar"
        />

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Heading level={3}>API Keys</Heading>
                <Text color="muted" size="sm">
                  Generate and manage API keys for programmatic access to your organization
                </Text>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Icon name="Plus" size={16} />
                <span style={{ marginLeft: '6px' }}>Create API Key</span>
              </Button>
            </div>

            {/* Usage Overview */}
            {!isLoading && organizationUsage && (
              <ApiKeyUsageStats
                usage={organizationUsage}
                title="Organization API Usage"
                showChart={true}
              />
            )}

            {/* Error State */}
            {error && (
              <Card>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <Text color="destructive">{error}</Text>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => refresh()}
                    style={{ marginTop: '12px' }}
                  >
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && !error && (
              <Card>
                <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                  <Spinner size="lg" />
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && apiKeys.length === 0 && (
              <Card>
                <EmptyState
                  title="No API Keys"
                  description="Create an API key to access your organization's data programmatically."
                  icon={<Icon name="Key" size={48} />}
                  action={
                    <Button
                      variant="primary"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Icon name="Plus" size={16} />
                      <span style={{ marginLeft: '6px' }}>Create your first API key</span>
                    </Button>
                  }
                />
              </Card>
            )}

            {/* Active API Keys */}
            {!isLoading && !error && activeKeys.length > 0 && (
              <div>
                <Heading level={4} style={{ marginBottom: '16px' }}>
                  Active Keys ({activeKeys.length})
                </Heading>
                <div className="space-y-4">
                  {activeKeys.map(key => (
                    <ApiKeyCard
                      key={key.id}
                      apiKey={key}
                      onRevoke={setKeyToRevoke}
                      onRegenerate={setKeyToRegenerate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Revoked API Keys */}
            {!isLoading && !error && revokedKeys.length > 0 && (
              <div>
                <Heading level={4} style={{ marginBottom: '16px' }}>
                  Revoked Keys ({revokedKeys.length})
                </Heading>
                <div className="space-y-4">
                  {revokedKeys.map(key => (
                    <ApiKeyCard
                      key={key.id}
                      apiKey={key}
                      onRevoke={setKeyToRevoke}
                      onRegenerate={setKeyToRegenerate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Security Notice */}
            {!isLoading && !error && apiKeys.length > 0 && (
              <Card>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Icon name="Shield" size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <div>
                    <Text style={{ fontWeight: 600, margin: 0, marginBottom: '4px' }}>
                      Security Best Practices
                    </Text>
                    <Text color="muted" size="sm" style={{ margin: 0 }}>
                      Keep your API keys secure and never share them publicly. Use environment
                      variables to store keys in your applications. Rotate keys regularly and
                      revoke any keys that may have been compromised.
                    </Text>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateKey={createApiKey}
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!keyToRevoke}
        onClose={() => setKeyToRevoke(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${getKeyName(keyToRevoke)}"? This action cannot be undone. Any applications using this key will immediately lose access.`}
        confirmText="Revoke Key"
        variant="danger"
      />

      {/* Regenerate Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!keyToRegenerate}
        onClose={() => setKeyToRegenerate(null)}
        onConfirm={handleRegenerate}
        title="Regenerate API Key"
        description={`Are you sure you want to regenerate "${getKeyName(keyToRegenerate)}"? The current key will be revoked immediately and a new key will be generated. You will need to update all applications using this key.`}
        confirmText="Regenerate Key"
        variant="warning"
      />
    </>
  );
}
