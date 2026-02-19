import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Spinner } from '../Spinner';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button' as const,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  role,
  type,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    elevated: {
      backgroundColor: theme.colors.card,
      borderColor: 'transparent',
      borderWidth: 0,
      shadowColor: theme.colors.foreground,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 2,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    filled: {
      backgroundColor: theme.colors.muted,
      borderColor: 'transparent',
      borderWidth: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    glass: {
      // Glass-morphism approximation for React Native
      backgroundColor: theme.colors.glass,
      borderColor: theme.colors.glassBorder,
      borderWidth: 1,
      shadowColor: theme.colors.foreground,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    gradient: {
      // Gradient variant uses elevated style with accent border
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.primary,
      borderWidth: 1,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      padding: theme.spacing.sm,
      borderRadius: theme.borders.radius.sm,
      minHeight: 80,
    },
    md: {
      padding: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      minHeight: 120,
    },
    lg: {
      padding: theme.spacing.lg,
      borderRadius: theme.borders.radius.lg,
      minHeight: 160,
    },
  };

  const baseStyles: ViewStyle = {
    position: 'relative',
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  const cardProps = onPress ? {
    onPress: disabled || loading ? undefined : onPress,
    disabled: disabled || loading,
    activeOpacity: 0.8,
    // React Native accessibility (WCAG 2.1 AA compliant)
    accessible: true,
    accessibilityLabel: accessibilityLabel || 'Card',
    accessibilityHint,
    accessibilityRole,
    accessibilityState: {
      disabled: disabled || loading,
      busy: loading,
    },
  } : {
    // Static view accessibility
    accessible: accessibilityLabel ? true : false,
    accessibilityLabel,
    accessibilityHint,
  };

  return (
    <CardComponent
      style={[baseStyles, style]}
      testID={testID}
      {...cardProps}
      {...props}
    >
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -12 }, { translateY: -12 }],
            zIndex: 1,
          }}
        >
          <Spinner 
            size="md" 
            color={variant === 'outlined' ? theme.colors.foreground : theme.colors.cardForeground}
          />
        </View>
      )}
      {children}
    </CardComponent>
  );
};