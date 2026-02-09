import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { BreadcrumbProps, BreadcrumbItem } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '›',
  showHomeIcon = false,
  maxItems,
  size = 'md',
  variant = 'default',
  onItemPress,
  style,
  testID,
  accessibilityLabel,
  // Filter out web-specific props
  className,
  onItemClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();

  const handleItemPress = (item: BreadcrumbItem, index: number) => {
    if (!item.disabled && item.href) {
      onItemPress?.(item, index);
    }
  };

  const processItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 2));
    
    return [
      firstItem,
      { label: '...', disabled: true },
      ...lastItems,
    ];
  };

  const processedItems = processItems();

  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
  };

  const variantStyles = {
    default: {
      color: theme.colors.foreground,
      linkColor: theme.colors.primary,
    },
    minimal: {
      color: theme.colors.mutedForeground,
      linkColor: theme.colors.foreground,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const baseContainerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  };

  const BreadcrumbItemComponent: React.FC<{
    item: BreadcrumbItem;
    index: number;
    isLast: boolean;
  }> = ({ item, index, isLast }) => {
    const isClickable = !item.disabled && item.href;
    const isEllipsis = item.label === '...';

    const baseTextStyles: TextStyle = {
      fontSize: currentSize.fontSize,
      fontFamily: theme.typography.fontFamily,
      color: isLast 
        ? theme.colors.foreground 
        : isClickable 
        ? currentVariant.linkColor 
        : currentVariant.color,
      opacity: item.disabled ? 0.5 : 1,
      fontWeight: isLast ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
    };

    const containerStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: isClickable ? currentSize.paddingHorizontal : theme.spacing.xs,
      borderRadius: theme.borders.radius.sm,
    };

    const content = (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        {item.icon && (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
          </View>
        )}
        {index === 0 && showHomeIcon && !item.icon && (
          <Text style={baseTextStyles}>🏠</Text>
        )}
        <Text style={baseTextStyles}>{item.label}</Text>
      </View>
    );

    if (isEllipsis) {
      return (
        <View style={containerStyles}>
          <Text style={baseTextStyles}>⋯</Text>
        </View>
      );
    }

    if (isClickable) {
      return (
        <TouchableOpacity
          style={containerStyles}
          onPress={() => handleItemPress(item, index)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={item.label}
          accessibilityRole="button"
          accessibilityState={{
            disabled: item.disabled,
          }}
          testID={testID ? `${testID}-item-${index}` : undefined}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={containerStyles}
        accessible={true}
        accessibilityLabel={item.label}
        accessibilityRole={isLast ? 'header' : 'text'}
        testID={testID ? `${testID}-item-${index}` : undefined}
      >
        {content}
      </View>
    );
  };

  return (
    <View
      style={[baseContainerStyles, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Breadcrumb navigation'}
      accessibilityRole="none"
    >
      {processedItems.map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <BreadcrumbItemComponent
            item={item}
            index={index}
            isLast={index === processedItems.length - 1}
          />
          
          {index < processedItems.length - 1 && (
            <Text
              style={{
                fontSize: currentSize.fontSize,
                color: currentVariant.color,
                opacity: 0.6,
                fontFamily: theme.typography.fontFamily,
              }}
              accessible={false}
            >
              {separator}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};