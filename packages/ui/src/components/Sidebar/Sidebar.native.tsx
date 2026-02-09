import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { SidebarProps, SidebarItem } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  collapsible = true,
  position = 'left',
  overlay = false,
  width = 280,
  collapsedWidth = 64,
  variant = 'default',
  onItemPress,
  onToggle,
  style,
  testID,
  accessibilityLabel,
  header,
  footer,
  // Filter out web-specific props
  className,
  onItemClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const currentWidth = collapsed ? collapsedWidth : typeof width === 'number' ? width : 280;

  const handleItemPress = (item: SidebarItem) => {
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
      onItemPress?.(item);
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
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    floating: {
      backgroundColor: theme.colors.background,
      borderColor: 'transparent',
      borderRadius: theme.borders.radius.lg,
      margin: theme.spacing.md,
    },
  };

  const currentVariant = variantStyles[variant];

  const sidebarStyles: ViewStyle = {
    width: currentWidth,
    backgroundColor: currentVariant.backgroundColor,
    borderRightWidth: variant !== 'minimal' ? 1 : 0,
    borderRightColor: currentVariant.borderColor,
    borderRadius: variant === 'floating' ? (currentVariant as any).borderRadius || 0 : 0,
    flex: 1,
  };

  const SidebarItemComponent: React.FC<{
    item: SidebarItem;
    level: number;
  }> = ({ item, level }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const paddingLeft = theme.spacing.md + (level * theme.spacing.lg);

    const itemContainerStyles: ViewStyle = {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingLeft: collapsed ? theme.spacing.md : paddingLeft,
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: item.active ? `${theme.colors.primary}15` : 'transparent',
      borderRadius: theme.borders.radius.sm,
      marginVertical: 2,
      marginHorizontal: theme.spacing.xs,
      opacity: item.disabled ? 0.5 : 1,
    };

    const itemTextStyles: TextStyle = {
      flex: 1,
      color: item.active 
        ? theme.colors.primary 
        : item.disabled 
        ? theme.colors.mutedForeground 
        : theme.colors.foreground,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily,
      fontWeight: item.active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
    };

    const badgeStyles: ViewStyle = {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borders.radius.full,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    };

    const badgeTextStyles: TextStyle = {
      color: theme.colors.primaryForeground,
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeight.medium as any,
    };

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={itemContainerStyles}
          onPress={() => handleItemPress(item)}
          disabled={item.disabled}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          accessibilityState={{
            disabled: item.disabled,
            selected: item.active,
            expanded: hasChildren ? isExpanded : undefined,
          }}
          testID={testID ? `${testID}-item-${item.id}` : undefined}
        >
          {item.icon && (
            <View style={{ marginRight: theme.spacing.sm }}>
              {item.icon}
            </View>
          )}
          
          {!collapsed && (
            <>
              <Text style={itemTextStyles} numberOfLines={1}>
                {item.label}
              </Text>
              
              {item.badge && (
                <View style={badgeStyles}>
                  <Text style={badgeTextStyles}>
                    {item.badge}
                  </Text>
                </View>
              )}
              
              {hasChildren && (
                <View style={{ marginLeft: theme.spacing.sm }}>
                  <Text style={{ color: theme.colors.foreground, fontSize: 12 }}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>

        {hasChildren && isExpanded && !collapsed && (
          <View>
            {item.children!.map(child => (
              <SidebarItemComponent key={child.id} item={child} level={level + 1} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={[sidebarStyles, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Sidebar navigation'}
      accessibilityRole="none"
    >
      {/* Header */}
      {header && (
        <View
          style={{
            padding: theme.spacing.md,
            borderBottomWidth: variant !== 'minimal' ? 1 : 0,
            borderBottomColor: theme.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed && (
            <View style={{ flex: 1 }}>
              {header}
            </View>
          )}
          {collapsible && (
            <TouchableOpacity
              style={{
                padding: theme.spacing.xs,
                borderRadius: theme.borders.radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleToggle}
              accessible={true}
              accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.colors.foreground, fontSize: 18 }}>
                {collapsed ? '☰' : '✕'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.xs }}
        showsVerticalScrollIndicator={false}
      >
        {items.map(item => (
          <SidebarItemComponent key={item.id} item={item} level={0} />
        ))}
      </ScrollView>

      {/* Footer */}
      {footer && !collapsed && (
        <View
          style={{
            padding: theme.spacing.md,
            borderTopWidth: variant !== 'minimal' ? 1 : 0,
            borderTopColor: theme.colors.border,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
};