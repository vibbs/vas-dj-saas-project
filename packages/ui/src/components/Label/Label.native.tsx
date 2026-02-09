import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { LabelProps } from './types';

/**
 * Label Component (React Native)
 *
 * Renders an accessible label for form elements with theme integration.
 *
 * @example
 * ```tsx
 * <Label required>Email Address</Label>
 * <Input placeholder="Enter your email" />
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  children,
  required,
  size = 'md',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  // Filter out web-specific props
  htmlFor,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.tight,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.normal,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.relaxed,
    },
  };

  const currentSize = sizeStyles[size];

  const labelStyles: TextStyle = {
    fontSize: currentSize.fontSize,
    lineHeight: currentSize.lineHeight * currentSize.fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily,
    color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
    opacity: disabled ? 0.7 : 1,
    marginBottom: theme.spacing.xs,
  };

  const requiredStyle: TextStyle = {
    color: theme.colors.destructive,
    fontWeight: theme.typography.fontWeight.bold,
    marginLeft: theme.spacing.xs,
  };

  return (
    <Text
      style={[labelStyles, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Label')}
      accessibilityRole="text"
      {...props}
    >
      {children}
      {required && (
        <Text
          style={requiredStyle}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {' *'}
        </Text>
      )}
    </Text>
  );
};
