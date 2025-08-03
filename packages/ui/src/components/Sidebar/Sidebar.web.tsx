import React, { useState } from 'react';
import { SidebarProps, SidebarItem } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  collapsible = true,
  position = 'left',
  overlay = false,
  width = 280,
  collapsedWidth = 64,
  variant = 'default',
  onItemClick,
  onToggle,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  header,
  footer,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const currentWidth = collapsed ? collapsedWidth : width;

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      // Toggle expansion for items with children
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else if (!item.disabled) {
      onItemClick?.(item);
    }
  };

  const handleToggle = () => {
    if (collapsible) {
      onToggle?.(!collapsed);
    }
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      shadow: overlay ? theme.shadows.lg : 'none',
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      shadow: 'none',
    },
    floating: {
      backgroundColor: theme.colors.background,
      borderColor: 'transparent',
      shadow: theme.shadows.lg,
      borderRadius: theme.borders.radius.lg,
      margin: theme.spacing.md,
    },
  };

  const currentVariant = variantStyles[variant];

  const sidebarStyles = {
    position: overlay ? 'fixed' as const : 'relative' as const,
    top: overlay ? 0 : 'auto',
    [position]: overlay ? 0 : 'auto',
    width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
    height: overlay ? '100vh' : '100%',
    backgroundColor: currentVariant.backgroundColor,
    border: variant !== 'minimal' ? `1px solid ${currentVariant.borderColor}` : 'none',
    boxShadow: currentVariant.shadow,
    borderRadius: variant === 'floating' ? currentVariant.borderRadius : 0,
    transition: 'all 0.3s ease-in-out',
    zIndex: overlay ? 1000 : 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    ...style,
  };

  const SidebarItemComponent: React.FC<{
    item: SidebarItem;
    level: number;
  }> = ({ item, level }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const paddingLeft = theme.spacing.md + (level * theme.spacing.lg);

    const itemStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      paddingLeft: collapsed ? theme.spacing.md : paddingLeft,
      minHeight: 40,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      color: item.active 
        ? theme.colors.primary 
        : item.disabled 
        ? theme.colors.mutedForeground 
        : theme.colors.foreground,
      backgroundColor: item.active ? `${theme.colors.primary}15` : 'transparent',
      borderRadius: theme.borders.radius.sm,
      margin: `2px ${theme.spacing.xs}px`,
      transition: 'all 0.2s ease-in-out',
      opacity: item.disabled ? 0.5 : 1,
      textDecoration: 'none',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: item.active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
    };

    const hoverStyles = !item.disabled ? {
      ':hover': {
        backgroundColor: item.active 
          ? `${theme.colors.primary}25` 
          : `${theme.colors.foreground}10`,
      },
    } : {};

    return (
      <div key={item.id}>
        <button
          style={{...itemStyles, ...hoverStyles, border: 'none', width: '100%', textAlign: 'left'}}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-current={item.active ? 'page' : undefined}
          data-testid={testID ? `${testID}-item-${item.id}` : undefined}
          type="button"
        >
          {item.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {item.icon}
            </span>
          )}
          
          {!collapsed && (
            <>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              
              {item.badge && (
                <span
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.primaryForeground,
                    fontSize: theme.typography.fontSize.xs,
                    padding: `2px ${theme.spacing.xs}px`,
                    borderRadius: theme.borders.radius.full,
                    minWidth: 16,
                    height: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div>
            {item.children!.map(child => (
              <SidebarItemComponent key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {overlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: collapsed ? 'none' : 'block',
          }}
          onClick={() => onToggle?.(true)}
        />
      )}
      
      <nav
        style={sidebarStyles}
        className={className}
        data-testid={testID}
        aria-label={ariaLabel || accessibilityLabel || 'Sidebar navigation'}
        aria-describedby={ariaDescribedBy}
        role="navigation"
        {...props}
      >
        {/* Header */}
        {header && (
          <div
            style={{
              padding: theme.spacing.md,
              borderBottom: variant !== 'minimal' ? `1px solid ${theme.colors.border}` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: theme.spacing.sm,
            }}
          >
            {!collapsed && header}
            {collapsible && (
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: theme.spacing.xs,
                  borderRadius: theme.borders.radius.sm,
                  color: theme.colors.foreground,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleToggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                type="button"
              >
                {collapsed ? <Menu size={18} /> : <X size={18} />}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: theme.spacing.xs,
          }}
        >
          {items.map(item => (
            <SidebarItemComponent key={item.id} item={item} level={0} />
          ))}
        </div>

        {/* Footer */}
        {footer && !collapsed && (
          <div
            style={{
              padding: theme.spacing.md,
              borderTop: variant !== 'minimal' ? `1px solid ${theme.colors.border}` : 'none',
            }}
          >
            {footer}
          </div>
        )}
      </nav>
    </>
  );
};