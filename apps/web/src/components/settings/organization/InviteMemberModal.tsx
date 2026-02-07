'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select, Button } from '@vas-dj-saas/ui';
import type { CreateInviteRequest, CreateInviteRequestRole } from '@vas-dj-saas/api-client';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInviteRequest) => Promise<boolean>;
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member', description: 'Can view and contribute to projects' },
  { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
  { value: 'owner', label: 'Owner', description: 'Full access to everything' },
];

export function InviteMemberModal({ isOpen, onClose, onSubmit }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CreateInviteRequestRole>('member');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit({
        email,
        role,
        message: message || undefined,
      });

      if (success) {
        // Reset form and close modal
        setEmail('');
        setRole('member');
        setMessage('');
        onClose();
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setRole('member');
      setMessage('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Team Member"
      description="Send an invitation to join your organization"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="email"
            label="Email Address"
            placeholder="colleague@example.com"
            value={email}
            onChangeText={setEmail}
            required
            disabled={isSubmitting}
            errorText={error && !email ? 'Email is required' : undefined}
          />

          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(value) => setRole(value as CreateInviteRequestRole)}
            disabled={isSubmitting}
          />

          <Input
            label="Personal Message (optional)"
            placeholder="Add a personal note to the invitation..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            disabled={isSubmitting}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border, #e5e7eb)',
          }}
        >
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !email}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
