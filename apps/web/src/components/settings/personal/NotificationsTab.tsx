'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

/**
 * Get category icon component
 */
function getCategoryIcon(category: NotificationCategory): React.ReactNode {
  const iconSize = 20;

  switch (category) {
    case 'security':
      return <Shield size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    case 'billing':
      return <CreditCard size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    case 'team':
      return <Users size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    case 'marketing':
      return <Megaphone size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    default:
      return <Bell size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
  }
}

/**
 * Get channel icon component
 */
function getChannelIcon(channel: ChannelType): React.ReactNode {
  const iconSize = 16;

  switch (channel) {
    case 'email':
      return <Mail size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    case 'inApp':
      return <Bell size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
    case 'push':
      return <Smartphone size={iconSize} style={{ color: 'var(--color-muted-foreground)' }} />;
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
  index: number;
}

function CategoryPreferenceCard({
  category,
  channels,
  categoryLabel,
  channelLabels,
  onChannelChange,
  isSaving,
  index,
}: CategoryPreferenceCardProps) {
  const channelOrder: ChannelType[] = ['email', 'inApp', 'push'];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card
        style={{
          padding: 'var(--spacing-lg)',
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--animation-fast) ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
          {/* Category icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getCategoryIcon(category)}
          </div>

          {/* Category info and toggles */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-foreground)',
                  margin: 0,
                }}
              >
                {categoryLabel.label}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                  margin: 0,
                  marginTop: '2px',
                }}
              >
                {categoryLabel.description}
              </p>
            </div>

            {/* Channel toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {channelOrder.map((channel: ChannelType, channelIndex) => (
                <div
                  key={channel as string}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-sm) 0',
                    borderTop: channelIndex > 0 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {getChannelIcon(channel)}
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-family-body)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--color-foreground)',
                          margin: 0,
                        }}
                      >
                        {channelLabels[channel].label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-family-body)',
                          fontSize: '0.75rem',
                          color: 'var(--color-muted-foreground)',
                          margin: 0,
                        }}
                      >
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
    </motion.div>
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-3xl) 0',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl) 0' }}>
        <p
          style={{
            color: 'var(--color-destructive)',
            marginBottom: 'var(--spacing-md)',
            fontFamily: 'var(--font-family-body)',
          }}
        >
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Heading
            level={3}
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-foreground)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            Notification Preferences
          </Heading>
          <Text
            color="muted"
            size="sm"
            style={{
              fontFamily: 'var(--font-family-body)',
            }}
          >
            Control how and when you receive notifications for different activities
          </Text>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            <RotateCcw size={14} />
            Reset to defaults
          </Button>
        </motion.div>
      </motion.div>

      {/* Saving indicator */}
      {isSaving && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-info)',
            fontFamily: 'var(--font-family-body)',
          }}
        >
          <Spinner size="sm" />
          Saving preferences...
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: 'var(--spacing-md)',
            background: 'color-mix(in srgb, var(--color-destructive) 10%, var(--color-card))',
            border: '1px solid var(--color-destructive)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-destructive)',
              margin: 0,
              fontFamily: 'var(--font-family-body)',
            }}
          >
            {error}
          </p>
        </motion.div>
      )}

      {/* Category cards */}
      {preferences && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {categories.map((category, index) => (
            <CategoryPreferenceCard
              key={category}
              category={category}
              channels={preferences[category]}
              categoryLabel={categoryLabels[category]}
              channelLabels={channelLabels}
              onChannelChange={handleChannelChange}
              isSaving={isSaving}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Additional info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card
          style={{
            padding: 'var(--spacing-lg)',
            background: 'var(--color-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
            <Bell size={20} style={{ color: 'var(--color-muted-foreground)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-foreground)',
                  margin: 0,
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                About Notifications
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Email notifications are sent to your primary email address.
                In-app notifications appear in the notification center.
                Push notifications are delivered to your registered devices (coming soon).
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
