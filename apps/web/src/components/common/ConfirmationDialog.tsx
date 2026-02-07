'use client';

import React, { useState } from 'react';
import { Dialog, Button } from '@vas-dj-saas/ui';

type ConfirmationVariant = 'danger' | 'warning' | 'info';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean> | boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

const VARIANT_COLORS: Record<ConfirmationVariant, { bg: string; border: string; text: string }> = {
  danger: { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: '#dc2626' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#d97706' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#2563eb' },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const colors = VARIANT_COLORS[variant];

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const result = await onConfirm();
      if (result) {
        onClose();
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <div
        style={{
          padding: '16px',
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          marginBottom: '20px',
          color: colors.text,
        }}
      >
        <p style={{ margin: 0, color: 'inherit', fontSize: '14px', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isConfirming}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : 'primary'}
          onClick={handleConfirm}
          loading={isConfirming}
          disabled={isConfirming}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
