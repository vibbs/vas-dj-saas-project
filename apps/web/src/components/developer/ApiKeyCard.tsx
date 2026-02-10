'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Text, Icon } from '@vas-dj-saas/ui';
// Import types - these will work after api-client package is rebuilt
// For now, we define local types that match the service types
type ApiKeyScope = 'read' | 'write' | 'admin';
type ApiKeyStatus = 'active' | 'revoked' | 'expired';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key?: string;
  keyHint: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  createdBy: { id: string; email: string; name?: string };
  organizationId: string;
}

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (keyId: string) => void;
  onRegenerate: (keyId: string) => void;
  onViewDetails?: (keyId: string) => void;
}

const SCOPE_LABELS: Record<ApiKeyScope, string> = {
  read: 'Read',
  write: 'Write',
  admin: 'Admin',
};

const SCOPE_COLORS: Record<ApiKeyScope, 'secondary' | 'primary' | 'warning'> = {
  read: 'secondary',
  write: 'primary',
  admin: 'warning',
};

export function ApiKeyCard({
  apiKey,
  onRevoke,
  onRegenerate,
  onViewDetails,
}: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);
  const isRevoked = apiKey.status === 'revoked';
  const isExpired = apiKey.status === 'expired' ||
    (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date());

  const handleCopyKeyHint = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.keyHint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusBadge = () => {
    if (isRevoked) {
      return <Badge variant="secondary">Revoked</Badge>;
    }
    if (isExpired) {
      return <Badge variant="warning">Expired</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <Card
      style={{
        opacity: isRevoked ? 0.7 : 1,
        padding: 0,
      }}
    >
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Text style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>
                {apiKey.name}
              </Text>
              {getStatusBadge()}
            </div>
            {apiKey.description && (
              <Text color="muted" size="sm" style={{ margin: 0 }}>
                {apiKey.description}
              </Text>
            )}
          </div>
        </div>

        {/* Key Value (masked) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--color-muted, #f4f4f5)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontFamily: 'monospace',
          }}
        >
          <Icon name="Key" size={16} />
          <code style={{ flex: 1, fontSize: '14px' }}>
            vdj_************************************{apiKey.keyHint}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyKeyHint}
            style={{ minWidth: 'auto', padding: '4px 8px' }}
            aria-label="Copy key hint"
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={16} />
          </Button>
        </div>

        {/* Scopes */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {apiKey.scopes.map(scope => (
            <Badge key={scope} variant={SCOPE_COLORS[scope]} size="sm">
              {SCOPE_LABELS[scope]}
            </Badge>
          ))}
        </div>

        {/* Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border, #e4e4e7)',
          }}
        >
          <div>
            <Text color="muted" size="xs" style={{ margin: 0, marginBottom: '2px' }}>
              Created
            </Text>
            <Text size="sm" style={{ margin: 0 }}>
              {formatDate(apiKey.createdAt)}
            </Text>
          </div>
          <div>
            <Text color="muted" size="xs" style={{ margin: 0, marginBottom: '2px' }}>
              Last used
            </Text>
            <Text size="sm" style={{ margin: 0 }}>
              {formatRelativeTime(apiKey.lastUsedAt)}
            </Text>
          </div>
          <div>
            <Text color="muted" size="xs" style={{ margin: 0, marginBottom: '2px' }}>
              Expires
            </Text>
            <Text size="sm" style={{ margin: 0 }}>
              {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}
            </Text>
          </div>
          <div>
            <Text color="muted" size="xs" style={{ margin: 0, marginBottom: '2px' }}>
              Created by
            </Text>
            <Text size="sm" style={{ margin: 0 }}>
              {apiKey.createdBy.name || apiKey.createdBy.email}
            </Text>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border, #e4e4e7)',
          }}
        >
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(apiKey.id)}
            >
              <Icon name="BarChart3" size={16} />
              <span style={{ marginLeft: '4px' }}>View Usage</span>
            </Button>
          )}
          {!isRevoked && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerate(apiKey.id)}
              >
                <Icon name="RefreshCw" size={16} />
                <span style={{ marginLeft: '4px' }}>Regenerate</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRevoke(apiKey.id)}
              >
                <Icon name="Ban" size={16} />
                <span style={{ marginLeft: '4px' }}>Revoke</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
