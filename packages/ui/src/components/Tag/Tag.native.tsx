import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { TagProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  closable = false,
  disabled = false,
  outlined = false,
  rounded = false,
  icon,
  onClose,
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityRole = 'text' as const,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const variants = {
      default: {
        backgroundColor: outlined ? 'transparent' : theme.colors.muted,
        color: theme.colors.mutedForeground,
        borderColor: theme.colors.border,
      },
      primary: {
        backgroundColor: outlined ? 'transparent' : theme.colors.primary,
        color: outlined ? theme.colors.primary : theme.colors.primaryForeground,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: outlined ? 'transparent' : theme.colors.secondary,
        color: outlined ? theme.colors.secondaryForeground : theme.colors.secondaryForeground,
        borderColor: theme.colors.border,
      },
      success: {
        backgroundColor: outlined ? 'transparent' : '#10b981',
        color: outlined ? '#10b981' : '#ffffff',
        borderColor: '#10b981',
      },
      warning: {
        backgroundColor: outlined ? 'transparent' : '#f59e0b',
        color: outlined ? '#f59e0b' : '#ffffff',
        borderColor: '#f59e0b',
      },
      danger: {
        backgroundColor: outlined ? 'transparent' : theme.colors.destructive,
        color: outlined ? theme.colors.destructive : theme.colors.destructiveForeground,
        borderColor: theme.colors.destructive,
      },
      info: {
        backgroundColor: outlined ? 'transparent' : '#3b82f6',
        color: outlined ? '#3b82f6' : '#ffffff',
        borderColor: '#3b82f6',
      },
    };

    return variants[variant];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.xs / 2,
          paddingHorizontal: theme.spacing.sm,
          fontSize: theme.typography.fontSize.xs,
          minHeight: 20,
        };
      case 'md':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
          minHeight: 24,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
          minHeight: 32,
        };
      default:
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
          minHeight: 24,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: variantStyles.borderColor,
    borderRadius: rounded ? 999 : theme.borders.radius.md,
    backgroundColor: variantStyles.backgroundColor,
    opacity: disabled ? 0.5 : 1,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    minHeight: sizeStyles.minHeight,
    ...style,
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeStyles.fontSize,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: variantStyles.color,
    lineHeight: sizeStyles.fontSize * 1.2,
  };

  const closeButtonStyles: ViewStyle = {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  };

  const closeButtonTextStyles: TextStyle = {
    fontSize: 12,
    fontWeight: 'bold',
    color: variantStyles.color,
    lineHeight: 12,
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const handleClosePress = () => {
    if (disabled) return;
    onClose?.();
  };

  const TagContainer = (onPress || onClick) ? TouchableOpacity : View;

  return (
    <TagContainer
      style={containerStyles}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityRole={onPress || onClick ? 'button' : accessibilityRole}
      accessibilityLabel={accessibilityLabel || ariaLabel || (typeof children === 'string' ? children : 'Tag')}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled,
        ...accessibilityState,
      }}
      {...props}
    >
      {icon && (
        <View style={{ marginRight: theme.spacing.xs }}>
          {icon}
        </View>
      )}
      
      <Text style={textStyles}>{children}</Text>
      
      {closable && (
        <TouchableOpacity
          style={closeButtonStyles}
          onPress={handleClosePress}
          disabled={disabled}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Remove tag"
          accessibilityHint="Tap to remove this tag"
        >
          <Text style={closeButtonTextStyles}>×</Text>
        </TouchableOpacity>
      )}
    </TagContainer>
  );
};