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
 * HubCard Component (Web)
 *
 * Clickable card for hub pages that displays:
 * - Title and description
 * - Icon
 * - Optional metric/count
 * - Optional badge
 *
 * Fixed height: 220px (consistent for all cards)
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
 *   onPress={() => router.push('/settings/organization/members')}
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

  // Fixed height for all cards regardless of content
  const hasMetric = metric !== undefined;
  const cardHeight = '220px';

  const handleClick = React.useCallback(() => {
    if (!isDisabled && !isLoading && onPress) {
      onPress();
    }
  }, [isDisabled, isLoading, onPress]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !isLoading && onPress) {
      e.preventDefault();
      onPress();
    }
  }, [isDisabled, isLoading, onPress]);

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        cursor: isDisabled || isLoading ? 'not-allowed' : onPress ? 'pointer' : 'default',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        height: cardHeight,
      }}
      data-testid={testID}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress && !isDisabled && !isLoading ? 0 : undefined}
      aria-disabled={isDisabled || isLoading}
    >
      <Card style={{ height: '100%', ...style }}
        className='5px'>
        <div
          style={{
            padding: `${theme.spacing.lg}px`,
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
              gap: `${theme.spacing.sm}px`,
              marginBottom: `${theme.spacing.md}px`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: `${theme.borders.radius.md}px`,
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
              justifyContent: 'space-between',
              gap: `${theme.spacing.md}px`,
            }}
          >
            {/* Title and description */}
            <div>
              <Heading level={4} style={{ margin: 0, marginBottom: `${theme.spacing.xs}px` }}>
                {title}
              </Heading>

              {description && (
                <Text color="secondary" size="sm" style={{ margin: 0, lineHeight: 1.4 }}>
                  {description}
                </Text>
              )}
            </div>

            {/* Metric - always at the bottom if present */}
            {hasMetric && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: `${theme.spacing.xs}px`,
                }}
              >
                <Text
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    lineHeight: 1,
                    margin: 0,
                    color: theme.colors.primary,
                  }}
                >
                  {metric}
                </Text>
                {metricLabel && (
                  <Text color="muted" size="sm" style={{ margin: 0, fontWeight: 500 }}>
                    {metricLabel}
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

HubCard.displayName = 'HubCard';
