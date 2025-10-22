"use client";

import React from 'react';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { useTheme } from '../../theme/ThemeProvider';
import type { HubCardProps } from './types';

/**
 * HubCard Component (Native)
 *
 * Clickable card for hub pages that displays:
 * - Title and description
 * - Icon
 * - Optional metric/count
 * - Optional badge
 *
 * Fixed heights:
 * - Cards with metrics: 220
 * - Cards without metrics: 180
 *
 * @example
 * ```tsx
 * <HubCard
 *   id="members"
 *   title="Members"
 *   description="Manage team members and permissions"
 *   icon="Users"
 *   href="/settings/organization/members"
 *   metric={12}
 *   metricLabel="Active"
 *   onPress={() => navigation.navigate('OrganizationMembers')}
 * />
 * ```
 */
export const HubCard: React.FC<HubCardProps> = ({
  title,
  description,
  icon,
  metric,
  metricLabel,
  badge,
  badgeVariant = "secondary",
  onPress,
  className,
  style,
  testID,
  isLoading = false,
  isDisabled = false,
}) => {
  const { theme } = useTheme();

  // Determine card height based on whether it has metrics
  const hasMetric = metric !== undefined;
  const cardHeight = hasMetric ? 220 : 180;

  return (
    <Card
      onPress={onPress}
      className={className}
      style={{
        opacity: isDisabled ? 0.6 : 1,
        height: cardHeight,
        ...style,
      }}
      testID={testID}
      disabled={isDisabled || isLoading}
    >
      <div
        style={{
          padding: theme.spacing.lg,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header with icon and badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: theme.borders.radius.md,
              backgroundColor: theme.colors.muted,
            }}
          >
            <Icon name={icon} size={24} color={theme.colors.primary} />
          </div>

          {badge !== undefined && (
            <Badge variant={badgeVariant} size="sm">
              {badge}
            </Badge>
          )}
        </div>

        {/* Content - takes up remaining space */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Title and description */}
          <div>
            <Heading level={4} style={{ margin: 0, marginBottom: theme.spacing.xs }}>
              {title}
            </Heading>

            <div style={{ minHeight: description ? 'auto' : 40 }}>
              {description && (
                <Text color="secondary" size="sm" style={{ margin: 0, lineHeight: 1.4 }}>
                  {description}
                </Text>
              )}
            </div>
          </div>

          {/* Metric - always at the bottom if present */}
          {hasMetric && (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: theme.spacing.xs,
                marginTop: 'auto',
                paddingTop: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  lineHeight: 1,
                  margin: 0,
                  color: theme.colors.primary,
                }}
              >
                {metric}
              </Text>
              {metricLabel && (
                <Text color="muted" size="sm" style={{ margin: 0, fontWeight: '500' }}>
                  {metricLabel}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

HubCard.displayName = 'HubCard';
