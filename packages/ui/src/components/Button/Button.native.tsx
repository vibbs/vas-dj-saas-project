import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  children,
  style,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  onPress,
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? theme.colors.muted : theme.colors.primary,
          },
          text: {
            color: theme.colors.primaryForeground,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? theme.colors.muted : theme.colors.secondary,
          },
          text: {
            color: theme.colors.secondaryForeground,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: theme.borders.width.thin,
            borderColor: theme.colors.border,
          },
          text: {
            color: theme.colors.foreground,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.colors.foreground,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: disabled ? theme.colors.muted : theme.colors.destructive,
          },
          text: {
            color: theme.colors.destructiveForeground,
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primaryForeground,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: theme.spacing.sm + 4,
            paddingVertical: theme.spacing.xs + 4,
            minHeight: 32,
          },
          text: {
            fontSize: theme.typography.fontSize.sm,
          },
        };
      case 'md':
        return {
          container: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs + 2,
            minHeight: 40,
          },
          text: {
            fontSize: theme.typography.fontSize.base,
          },
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm + 4,
            minHeight: 48,
          },
          text: {
            fontSize: theme.typography.fontSize.lg,
          },
        };
      default:
        return {
          container: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs + 2,
            minHeight: 40,
          },
          text: {
            fontSize: theme.typography.fontSize.base,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const baseStyles = {
    borderRadius: theme.borders.radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: disabled ? 0.5 : 1,
  };

  const textStyles = {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium as any,
    textAlign: 'center' as const,
  };

  return (
    <TouchableOpacity
      style={[
        baseStyles,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {loading && (
          <ActivityIndicator
            color={variantStyles.text.color}
            size="small"
            style={{ marginRight: theme.spacing.xs + 4 }}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          />
        )}
        {typeof children === 'string' ? (
          <Text style={[
            textStyles,
            variantStyles.text,
            sizeStyles.text,
          ]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
};