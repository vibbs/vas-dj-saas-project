'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Icon } from '@vas-dj-saas/ui';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  href: string;
  accentColor?: 'primary' | 'success' | 'accent' | 'muted';
}

const defaultActions: QuickAction[] = [
  {
    id: 'invite-member',
    label: 'Invite Team Member',
    description: 'Add someone to your team',
    icon: 'UserPlus',
    href: '/settings/organization?tab=members',
    accentColor: 'primary',
  },
  {
    id: 'view-billing',
    label: 'View Billing',
    description: 'Manage subscription & invoices',
    icon: 'CreditCard',
    href: '/settings/billing',
    accentColor: 'success',
  },
  {
    id: 'manage-settings',
    label: 'Manage Settings',
    description: 'Configure your workspace',
    icon: 'Settings',
    href: '/settings',
    accentColor: 'muted',
  },
  {
    id: 'view-docs',
    label: 'Documentation',
    description: 'Learn how to use features',
    icon: 'BookOpen',
    href: '/docs',
    accentColor: 'accent',
  },
];

const accentStyles: Record<
  NonNullable<QuickAction['accentColor']>,
  { iconColor: string; iconBg: string }
> = {
  primary: {
    iconColor: 'var(--color-primary)',
    iconBg: 'var(--color-primary)',
  },
  success: {
    iconColor: 'var(--color-success)',
    iconBg: 'var(--color-success)',
  },
  accent: {
    iconColor: 'var(--color-accent)',
    iconBg: 'var(--color-accent)',
  },
  muted: {
    iconColor: 'var(--color-muted-foreground)',
    iconBg: 'var(--color-muted-foreground)',
  },
};

interface QuickActionButtonProps {
  action: QuickAction;
  compact?: boolean;
}

/**
 * QuickActionButton Component
 * Single action button with icon and label
 */
function QuickActionButton({ action, compact = false }: QuickActionButtonProps) {
  const accent = action.accentColor || 'primary';
  const styles = accentStyles[accent];

  if (compact) {
    return (
      <Link
        href={action.href}
        className="flex flex-col items-center p-4 rounded-lg transition-all duration-200 group"
        style={{
          border: '1px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
          style={{
            backgroundColor: `color-mix(in srgb, ${styles.iconBg} 10%, transparent)`,
          }}
        >
          <Icon
            name={action.icon as any}
            size="md"
            style={{ color: styles.iconColor }}
            aria-hidden
          />
        </div>
        <span
          className="text-sm font-medium text-center"
          style={{ color: 'var(--color-foreground)' }}
        >
          {action.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={action.href}
      className="flex items-center p-3 rounded-lg transition-all duration-200 group"
      style={{
        border: '1px solid var(--color-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
        style={{
          backgroundColor: `color-mix(in srgb, ${styles.iconBg} 10%, transparent)`,
        }}
      >
        <Icon
          name={action.icon as any}
          size="md"
          style={{ color: styles.iconColor }}
          aria-hidden
        />
      </div>
      <div className="ml-3 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-foreground)' }}
        >
          {action.label}
        </p>
        {action.description && (
          <p
            className="text-xs truncate"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {action.description}
          </p>
        )}
      </div>
      <Icon
        name="ChevronRight"
        size="sm"
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-muted-foreground)' }}
        aria-hidden
      />
    </Link>
  );
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  layout?: 'grid' | 'list';
  compact?: boolean;
}

/**
 * QuickActions Component
 * Grid or list of quick action buttons
 */
export function QuickActions({
  actions = defaultActions,
  layout = 'list',
  compact = false,
}: QuickActionsProps) {
  const isGrid = layout === 'grid' || compact;

  return (
    <Card variant="default" className="h-full">
      <div className="p-5">
        {/* Header */}
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--color-foreground)' }}
        >
          Quick Actions
        </h3>

        {/* Actions */}
        {isGrid ? (
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <QuickActionButton
                key={action.id}
                action={action}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => (
              <QuickActionButton key={action.id} action={action} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default QuickActions;
