import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { CheckboxProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  onCheckedChange,
  onPress,
  style,
  checkboxStyle,
  testID,
  value,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  indeterminate,
  onChange,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}) => {
  const { theme } = useTheme();
  
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const checkedValue = isControlled ? checked : internalChecked;
  const hasError = Boolean(errorText);
  
  // Base styles using theme tokens
  const containerStyles: ViewStyle = {
    width: '100%',
  };

  const checkboxContainerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    opacity: disabled ? 0.5 : 1,
  };

  const checkboxStyles: ViewStyle = {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: hasError ? theme.colors.destructive : (checkedValue ? theme.colors.primary : theme.colors.border),
    borderRadius: theme.borders.radius.sm,
    backgroundColor: checkedValue ? theme.colors.primary : theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // Align with first line of text
    marginRight: theme.spacing.sm,
    ...checkboxStyle,
  };

  const labelStyles: TextStyle = {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  };

  const helpTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    marginLeft: 32, // Align with label text (20px checkbox + 12px margin)
  };

  const errorTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    marginLeft: 32, // Align with label text
  };

  const handlePress = () => {
    if (disabled) return;
    
    const newChecked = !checkedValue;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
    onPress?.();
  };

  const CheckmarkIcon = () => (
    <View style={{ width: 12, height: 12 }}>
      <Text style={{ 
        color: theme.colors.primaryForeground, 
        fontSize: 10, 
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 12,
      }}>
        ✓
      </Text>
    </View>
  );

  return (
    <View style={[containerStyles, style]}>
      <TouchableOpacity
        style={checkboxContainerStyles}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || label || 'Checkbox'}
        accessibilityHint={accessibilityHint || helpText}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: checkedValue,
          disabled: disabled,
        }}
        {...props}
      >
        <View style={checkboxStyles}>
          {checkedValue && <CheckmarkIcon />}
        </View>
        
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={{ color: theme.colors.destructive }}> *</Text>}
          </Text>
        )}
      </TouchableOpacity>
      
      {helpText && !errorText && (
        <Text style={helpTextStyles}>
          {helpText}
        </Text>
      )}
      
      {errorText && (
        <Text style={errorTextStyles} accessibilityRole="alert">
          {errorText}
        </Text>
      )}
    </View>
  );
};