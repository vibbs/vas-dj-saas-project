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
  iconColor?: string;
  iconBg?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'invite-member',
    label: 'Invite Team Member',
    description: 'Add someone to your team',
    icon: 'UserPlus',
    href: '/settings/organization?tab=members',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'view-billing',
    label: 'View Billing',
    description: 'Manage subscription & invoices',
    icon: 'CreditCard',
    href: '/settings/billing',
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'manage-settings',
    label: 'Manage Settings',
    description: 'Configure your workspace',
    icon: 'Settings',
    href: '/settings',
    iconColor: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-50 dark:bg-gray-800/50',
  },
  {
    id: 'view-docs',
    label: 'Documentation',
    description: 'Learn how to use features',
    icon: 'BookOpen',
    href: '/docs',
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

interface QuickActionButtonProps {
  action: QuickAction;
  compact?: boolean;
}

/**
 * QuickActionButton Component
 * Single action button with icon and label
 */
function QuickActionButton({ action, compact = false }: QuickActionButtonProps) {
  const iconColor = action.iconColor || 'text-blue-600 dark:text-blue-400';
  const iconBg = action.iconBg || 'bg-blue-50 dark:bg-blue-900/20';

  if (compact) {
    return (
      <Link
        href={action.href}
        className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
      >
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}
        >
          <Icon
            name={action.icon as any}
            size="md"
            className={iconColor}
            aria-hidden
          />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
          {action.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={action.href}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
    >
      <div
        className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <Icon
          name={action.icon as any}
          size="md"
          className={iconColor}
          aria-hidden
        />
      </div>
      <div className="ml-3 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {action.label}
        </p>
        {action.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {action.description}
          </p>
        )}
      </div>
      <Icon
        name="ChevronRight"
        size="sm"
        className="ml-auto text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
          <div className="space-y-1">
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
