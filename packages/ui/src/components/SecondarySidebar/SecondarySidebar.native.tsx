"use client";

import React from 'react';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { useTheme } from '../../theme/ThemeProvider';
import type { SecondarySidebarProps } from './types';

/**
 * SecondarySidebar Component (Native)
 *
 * On mobile, the secondary sidebar is always rendered as a dropdown/list.
 */
export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  config,
  activePath,
  onNavigate,
  className,
  style,
  testID,
  filterItem,
}) => {
  const { theme } = useTheme();

  // Filter items based on permissions/feature flags
  const visibleItems = React.useMemo(() => {
    let items = config.items || [];
    if (filterItem) {
      items = items.filter(filterItem);
    }
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [config.items, filterItem]);

  // Add overview link if configured
  const allItems = React.useMemo(() => {
    if (config.showOverviewLink) {
      return [
        {
          id: 'overview',
          label: config.overviewLabel || 'Overview',
          href: config.overviewHref || '',
          icon: 'Home',
          order: -1,
        },
        ...visibleItems,
      ];
    }
    return visibleItems;
  }, [config.showOverviewLink, config.overviewLabel, config.overviewHref, visibleItems]);

  const renderNavItem = (item: typeof allItems[number]) => {
    const isActive = activePath === item.href;

    return (
      <button
        key={item.id}
        onClick={() => onNavigate?.(item.href)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
          borderRadius: theme.borders.radius.md,
          backgroundColor: isActive ? theme.colors.muted : 'transparent',
          color: isActive ? theme.colors.primary : theme.colors.foreground,
          border: 'none',
          textAlign: 'left',
          width: '100%',
          fontWeight: isActive ? '600' : '400',
        }}
        data-testid={`secondary-nav-${item.id}`}
      >
        {item.icon && <Icon name={item.icon} size={18} />}
        <Text size="sm" style={{ margin: 0, flex: 1 }}>
          {item.label}
        </Text>
        {item.badge !== undefined && (
          <Badge variant="secondary" size="sm">
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs,
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.colors.border,
        ...style,
      }}
      data-testid={testID}
    >
      {allItems.map(renderNavItem)}
    </div>
  );
};

SecondarySidebar.displayName = 'SecondarySidebar';
