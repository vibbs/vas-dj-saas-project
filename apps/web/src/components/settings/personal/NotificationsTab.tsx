'use client';

import React from 'react';
import { Card, Heading, Text, Switch, Spinner, Button } from '@vas-dj-saas/ui';
import { Shield, CreditCard, Users, Megaphone, Mail, Bell, Smartphone, RotateCcw } from 'lucide-react';
import {
  useNotificationPreferences,
  useNotificationCategoryLabels,
  useNotificationChannelLabels,
} from '@/hooks/useNotificationPreferences';
import type { NotificationPreferences, NotificationChannels } from '@vas-dj-saas/api-client';

// Use the same narrow type for preference categories
type NotificationCategory = keyof NotificationPreferences;

type ChannelType = keyof NotificationChannels;

/**
 * Get category icon component
 */
function getCategoryIcon(category: NotificationCategory): React.ReactNode {
  const iconSize = 20;
  const className = 'text-gray-500 dark:text-gray-400';

  switch (category) {
    case 'security':
      return <Shield size={iconSize} className={className} />;
    case 'billing':
      return <CreditCard size={iconSize} className={className} />;
    case 'team':
      return <Users size={iconSize} className={className} />;
    case 'marketing':
      return <Megaphone size={iconSize} className={className} />;
    default:
      return <Bell size={iconSize} className={className} />;
  }
}

/**
 * Get channel icon component
 */
function getChannelIcon(channel: ChannelType): React.ReactNode {
  const iconSize = 16;
  const className = 'text-gray-400';

  switch (channel) {
    case 'email':
      return <Mail size={iconSize} className={className} />;
    case 'inApp':
      return <Bell size={iconSize} className={className} />;
    case 'push':
      return <Smartphone size={iconSize} className={className} />;
    default:
      return null;
  }
}

interface CategoryPreferenceCardProps {
  category: NotificationCategory;
  channels: NotificationChannels;
  categoryLabel: { label: string; description: string };
  channelLabels: Record<ChannelType, { label: string; description: string }>;
  onChannelChange: (category: NotificationCategory, channel: ChannelType, enabled: boolean) => void;
  isSaving: boolean;
}

function CategoryPreferenceCard({
  category,
  channels,
  categoryLabel,
  channelLabels,
  onChannelChange,
  isSaving,
}: CategoryPreferenceCardProps) {
  const channelOrder: ChannelType[] = ['email', 'inApp', 'push'];

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {getCategoryIcon(category)}
        </div>

        {/* Category info and toggles */}
        <div className="flex-1">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {categoryLabel.label}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {categoryLabel.description}
            </p>
          </div>

          {/* Channel toggles */}
          <div className="space-y-3">
            {channelOrder.map((channel: ChannelType) => (
              <div
                key={channel as string}
                className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700 first:border-t-0 first:pt-0"
              >
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel)}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {channelLabels[channel].label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {channelLabels[channel].description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channels[channel]}
                  onCheckedChange={(checked) => onChannelChange(category, channel, checked)}
                  disabled={isSaving}
                  size="sm"
                  aria-label={`${categoryLabel.label} ${channelLabels[channel].label} notifications`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Notifications Tab
 * Email and push notification preferences
 */
export function NotificationsTab() {
  const {
    preferences,
    isLoading,
    isSaving,
    error,
    updateChannel,
    resetToDefaults,
  } = useNotificationPreferences();

  const categoryLabels = useNotificationCategoryLabels();
  const channelLabels = useNotificationChannelLabels();

  const categories: NotificationCategory[] = ['security', 'billing', 'team', 'marketing'];

  const handleChannelChange = (
    category: NotificationCategory,
    channel: ChannelType,
    enabled: boolean
  ) => {
    updateChannel(category, channel, enabled);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all notification preferences to their default values?')) {
      resetToDefaults();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Heading level={3}>Notification Preferences</Heading>
          <Text color="muted" size="sm">
            Control how and when you receive notifications for different activities
          </Text>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetToDefaults}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <RotateCcw size={14} />
          Reset to defaults
        </Button>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Spinner size="sm" />
          Saving preferences...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Category cards */}
      {preferences && (
        <div className="space-y-4">
          {categories.map((category) => (
            <CategoryPreferenceCard
              key={category}
              category={category}
              channels={preferences[category]}
              categoryLabel={categoryLabels[category]}
              channelLabels={channelLabels}
              onChannelChange={handleChannelChange}
              isSaving={isSaving}
            />
          ))}
        </div>
      )}

      {/* Additional info */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <Bell size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              About Notifications
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email notifications are sent to your primary email address.
              In-app notifications appear in the notification center.
              Push notifications are delivered to your registered devices (coming soon).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
