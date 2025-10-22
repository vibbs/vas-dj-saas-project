"use client";

import React from 'react';
import { HubCard } from '../HubCard';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Card } from '../Card';
import { useTheme } from '../../theme/ThemeProvider';
import type { SettingsHubProps } from './types';

/**
 * SettingsHub Component (Native)
 *
 * Hub page component that displays:
 * - Summary metrics (optional)
 * - Grid of hub cards for navigation
 * - Quick actions bar
 */
export const SettingsHub: React.FC<SettingsHubProps> = ({
  config,
  onNavigate,
  className,
  style,
  testID,
  isLoading = false,
  filterCard,
  filterAction,
}) => {
  const { theme } = useTheme();

  // Filter cards based on permissions/feature flags
  const visibleCards = React.useMemo(() => {
    const cards = config.cards || [];
    if (!filterCard) return cards;
    return cards.filter(filterCard);
  }, [config.cards, filterCard]);

  // Filter quick actions
  const visibleActions = React.useMemo(() => {
    const actions = config.quickActions || [];
    if (!filterAction) return actions;
    return actions.filter(filterAction);
  }, [config.quickActions, filterAction]);

  // Sort by order
  const sortedCards = React.useMemo(
    () => [...visibleCards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [visibleCards]
  );

  const sortedActions = React.useMemo(
    () => [...visibleActions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [visibleActions]
  );

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xl,
        ...style,
      }}
      data-testid={testID}
    >
      {/* Summary Metrics (if provided) */}
      {config.summaryMetrics && config.summaryMetrics.length > 0 && (
        <Card style={{ padding: theme.spacing.lg }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md,
            }}
          >
            {config.summaryMetrics.map((metric, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.xs,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                  {metric.icon && <Icon name={metric.icon} size={16} color={theme.colors.muted} />}
                  <Text color="muted" size="sm" style={{ margin: 0 }}>
                    {metric.label}
                  </Text>
                </div>
                <Heading level={3} style={{ margin: 0 }}>
                  {metric.value}
                </Heading>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hub Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
        }}
      >
        {sortedCards.map((card) => (
          <HubCard
            key={card.id}
            {...card}
            isLoading={isLoading}
            onPress={onNavigate ? () => onNavigate(card.href) : undefined}
          />
        ))}
      </div>

      {/* Quick Actions */}
      {sortedActions.length > 0 && (
        <Card style={{ padding: theme.spacing.lg }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md,
            }}
          >
            <Heading level={4} style={{ margin: 0 }}>
              Quick Actions
            </Heading>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.sm,
              }}
            >
              {sortedActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  onPress={onNavigate ? () => onNavigate(action.href || '#') : undefined}
                  disabled={isLoading}
                >
                  <Icon name={action.icon} size={16} />
                  <span style={{ marginLeft: theme.spacing.xs }}>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

SettingsHub.displayName = 'SettingsHub';
