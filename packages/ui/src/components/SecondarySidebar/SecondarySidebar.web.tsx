"use client";

import React from 'react';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { useTheme } from '../../theme/ThemeProvider';
import type { SecondarySidebarProps } from './types';

/**
 * SecondarySidebar Component (Web)
 *
 * In-section navigation that appears when drilling into a hub section.
 * Responsive:
 * - Desktop (≥1280px): Vertical sidebar
 * - Tablet (768-1279px): Horizontal nav bar
 * - Mobile (<768px): Dropdown menu
 *
 * @example
 * ```tsx
 * <SecondarySidebar
 *   config={orgSecondarySidebarConfig}
 *   activePath="/settings/organization/members"
 *   onNavigate={(href) => router.push(href)}
 *   mode="sidebar"
 * />
 * ```
 */
export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  config,
  activePath,
  onNavigate,
  className,
  style,
  testID,
  filterItem,
  mode = 'sidebar',
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
          gap: `${theme.spacing.sm}px`,
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          borderRadius: `${theme.borders.radius.md}px`,
          backgroundColor: isActive ? theme.colors.muted : 'transparent',
          color: isActive ? theme.colors.primary : theme.colors.foreground,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          width: mode === 'sidebar' ? '100%' : 'auto',
          transition: 'all 0.2s ease',
          fontWeight: isActive ? 600 : 400,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = theme.colors.muted;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
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

  if (mode === 'sidebar') {
    return (
      <nav
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${theme.spacing.xs}px`,
          padding: `${theme.spacing.md}px`,
          borderRight: `1px solid ${theme.colors.border}`,
          minWidth: '240px',
          maxWidth: '240px',
          height: '100%',
          ...style,
        }}
        data-testid={testID}
      >
        {allItems.map(renderNavItem)}
      </nav>
    );
  }

  if (mode === 'horizontal') {
    return (
      <nav
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: `${theme.spacing.xs}px`,
          padding: `${theme.spacing.md}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          overflowX: 'auto',
          ...style,
        }}
        data-testid={testID}
      >
        {allItems.map(renderNavItem)}
      </nav>
    );
  }

  // Dropdown mode (for mobile)
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        padding: `${theme.spacing.md}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        ...style,
      }}
      data-testid={testID}
    >
      <select
        value={activePath || ''}
        onChange={(e) => onNavigate?.(e.target.value)}
        style={{
          width: '100%',
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          borderRadius: `${theme.borders.radius.md}px`,
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          color: theme.colors.foreground,
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {allItems.map((item) => (
          <option key={item.id} value={item.href}>
            {item.label}
            {item.badge !== undefined ? ` (${item.badge})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

SecondarySidebar.displayName = 'SecondarySidebar';
