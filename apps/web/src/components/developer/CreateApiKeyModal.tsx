'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Checkbox,
  Select,
  Text,
  Icon,
  Badge,
} from '@vas-dj-saas/ui';
// Import types - these will work after api-client package is rebuilt
// For now, we define local types that match the service types
type ApiKeyScope = 'read' | 'write' | 'admin';
type ApiKeyExpiration = 'never' | '30_days' | '90_days' | '1_year';

interface CreateApiKeyResponse {
  id: string;
  name: string;
  description?: string;
  key: string;
  keyHint: string;
  scopes: ApiKeyScope[];
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  createdBy: { id: string; email: string; name?: string };
  organizationId: string;
}

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKey: (
    name: string,
    description: string | undefined,
    scopes: ApiKeyScope[],
    expiration: ApiKeyExpiration
  ) => Promise<CreateApiKeyResponse | null>;
}

type ModalStep = 'form' | 'success';

const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never expires' },
  { value: '30_days', label: '30 days' },
  { value: '90_days', label: '90 days' },
  { value: '1_year', label: '1 year' },
];

export function CreateApiKeyModal({
  isOpen,
  onClose,
  onCreateKey,
}: CreateApiKeyModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState<ApiKeyScope[]>(['read']);
  const [expiration, setExpiration] = useState<ApiKeyExpiration>('never');
  const [nameError, setNameError] = useState<string | null>(null);

  // Success state
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setScopes(['read']);
    setExpiration('never');
    setNameError(null);
    setStep('form');
    setCreatedKey(null);
    setCopied(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      resetForm();
      onClose();
    }
  }, [isCreating, onClose, resetForm]);

  const handleScopeToggle = (scope: ApiKeyScope) => {
    setScopes(prev => {
      if (prev.includes(scope)) {
        // Don't allow removing all scopes
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== scope);
      }
      return [...prev, scope];
    });
  };

  const handleSubmit = async () => {
    // Validate
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setNameError(null);
    setIsCreating(true);

    try {
      const result = await onCreateKey(
        name.trim(),
        description.trim() || undefined,
        scopes,
        expiration
      );

      if (result) {
        setCreatedKey(result);
        setStep('success');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (!createdKey?.key) return;

    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderForm = () => (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
          Name <span style={{ color: 'red' }}>*</span>
        </label>
        <Input
          value={name}
          onChange={e => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          placeholder="e.g., Production API Key"
          errorText={nameError || undefined}
          aria-invalid={!!nameError}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
          Description
        </label>
        <Textarea
          value={description}
          onChange={setDescription}
          placeholder="What will this API key be used for?"
          rows={2}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>
          Permissions
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Checkbox
            checked={scopes.includes('read')}
            onChange={() => handleScopeToggle('read')}
            label="Read"
          />
          <Text color="muted" size="sm" style={{ marginLeft: '28px', marginTop: '-8px' }}>
            Access to read data from the API
          </Text>

          <Checkbox
            checked={scopes.includes('write')}
            onChange={() => handleScopeToggle('write')}
            label="Write"
          />
          <Text color="muted" size="sm" style={{ marginLeft: '28px', marginTop: '-8px' }}>
            Create, update, and delete resources
          </Text>

          <Checkbox
            checked={scopes.includes('admin')}
            onChange={() => handleScopeToggle('admin')}
            label="Admin"
          />
          <Text color="muted" size="sm" style={{ marginLeft: '28px', marginTop: '-8px' }}>
            Full administrative access (use with caution)
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
          Expiration
        </label>
        <Select
          options={EXPIRATION_OPTIONS}
          value={expiration}
          onChange={value => setExpiration(value as ApiKeyExpiration)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border, #e4e4e7)',
        }}
      >
        <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={isCreating}>
          Create API Key
        </Button>
      </div>
    </>
  );

  const renderSuccess = () => (
    <>
      {/* Warning banner */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Icon name="AlertTriangle" size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <Text style={{ fontWeight: 600, margin: 0, marginBottom: '4px', color: '#d97706' }}>
              Save your API key now
            </Text>
            <Text color="muted" size="sm" style={{ margin: 0 }}>
              This is the only time you will be able to see this key. Store it securely - you
              will not be able to retrieve it again.
            </Text>
          </div>
        </div>
      </div>

      {/* Key info */}
      <div style={{ marginBottom: '16px' }}>
        <Text style={{ fontWeight: 500, margin: 0, marginBottom: '4px' }}>
          {createdKey?.name}
        </Text>
        {createdKey?.description && (
          <Text color="muted" size="sm" style={{ margin: 0 }}>
            {createdKey.description}
          </Text>
        )}
      </div>

      {/* API Key display */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--color-muted, #f4f4f5)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Icon name="Key" size={16} />
          <Text size="sm" color="muted" style={{ margin: 0 }}>
            Your API Key
          </Text>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid var(--color-border, #e4e4e7)',
          }}
        >
          <code
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
            }}
          >
            {createdKey?.key}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyKey}
            style={{ minWidth: '80px' }}
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={16} />
            <span style={{ marginLeft: '4px' }}>{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* Scopes and expiration */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div>
          <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '6px' }}>
            Permissions
          </Text>
          <div style={{ display: 'flex', gap: '4px' }}>
            {createdKey?.scopes.map(scope => (
              <Badge key={scope} variant="secondary" size="sm">
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Text color="muted" size="sm" style={{ margin: 0, marginBottom: '6px' }}>
            Expires
          </Text>
          <Text style={{ margin: 0 }}>
            {createdKey?.expiresAt
              ? new Date(createdKey.expiresAt).toLocaleDateString()
              : 'Never'}
          </Text>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border, #e4e4e7)',
        }}
      >
        <Button variant="primary" onClick={handleClose}>
          Done
        </Button>
      </div>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'form' ? 'Create API Key' : 'API Key Created'}
      description={
        step === 'form'
          ? 'Create a new API key for programmatic access to your organization.'
          : undefined
      }
      size="md"
      closeOnBackdropClick={!isCreating}
    >
      {step === 'form' ? renderForm() : renderSuccess()}
    </Dialog>
  );
}
