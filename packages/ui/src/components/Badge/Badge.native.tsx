import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';
import { BadgeProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'text' as const,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
    success: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },
  };

  const variantTextStyles = {
    primary: { color: theme.colors.primaryForeground },
    secondary: { color: theme.colors.secondaryForeground },
    outline: { color: theme.colors.primary },
    ghost: { color: theme.colors.foreground },
    destructive: { color: theme.colors.destructiveForeground },
    success: { color: theme.colors.successForeground },
    warning: { color: theme.colors.warningForeground },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.xs / 2,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borders.radius.sm,
    },
    md: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borders.radius.md,
    },
    lg: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borders.radius.lg,
    },
  };

  const sizeTextStyles = {
    sm: { fontSize: theme.typography.fontSize.xs },
    md: { fontSize: theme.typography.fontSize.sm },
    lg: { fontSize: theme.typography.fontSize.base },
  };

  const baseStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
    alignSelf: 'flex-start',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    ...sizeTextStyles[size],
    ...variantTextStyles[variant],
  };

  const isInteractive = !!onPress;

  if (isInteractive) {
    return (
      <TouchableOpacity
        style={[baseStyles, style]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Badge')}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled,
        }}
        {...props}
      >
        <Text style={textStyles}>{children}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[baseStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Badge')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};