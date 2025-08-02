import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { FormFieldProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  id,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();

  const containerStyles: ViewStyle = {
    flexDirection: 'column',
    gap: theme.spacing.xs,
    ...style,
  };

  const labelStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily,
    color: disabled ? theme.colors.muted : theme.colors.foreground,
    lineHeight: theme.typography.fontSize.sm * 1.4,
  };

  const helpTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.muted,
    lineHeight: theme.typography.fontSize.xs * 1.4,
  };

  const errorTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.destructive,
    lineHeight: theme.typography.fontSize.xs * 1.4,
  };

  const requiredStyles: TextStyle = {
    color: theme.colors.destructive,
  };

  // Clone children to pass accessibility props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        accessibilityLabel: accessibilityLabel || label,
        accessibilityHint: accessibilityHint || helpText,
        accessibilityInvalid: !!errorText,
        editable: !disabled,
        ...child.props,
      });
    }
    return child;
  });

  return (
    <View
      style={containerStyles}
      testID={testID}
      // React Native accessibility
      accessible={false} // Let children handle their own accessibility
      {...props}
    >
      {label && (
        <Text style={labelStyles}>
          {label}
          {required && <Text style={requiredStyles}> *</Text>}
        </Text>
      )}
      
      {enhancedChildren}
      
      {helpText && !errorText && (
        <Text style={helpTextStyles}>
          {helpText}
        </Text>
      )}
      
      {errorText && (
        <Text style={errorTextStyles}>
          {errorText}
        </Text>
      )}
    </View>
  );
};