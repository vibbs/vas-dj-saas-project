import React from 'react';
import { View, Text, TextInput, ViewStyle, TextStyle } from 'react-native';
import { InputProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Input: React.FC<InputProps> = ({
  value,
  defaultValue,
  placeholder,
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  readOnly = false,
  multiline = false,
  numberOfLines = 4,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCorrect = true,
  autoCapitalize = 'sentences',
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
  style,
  inputStyle,
  testID,
  maxLength,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  type,
  onChange,
  className,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}) => {
  const { theme } = useTheme();
  
  const hasError = Boolean(errorText);
  
  // Base styles using theme tokens
  const containerStyles: ViewStyle = {
    width: '100%',
  };

  const labelStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.xs,
  };

  const inputStyles: ViewStyle = {
    borderWidth: 1,
    borderColor: hasError ? '#ef4444' : '#d1d5db',
    borderRadius: 8,
    backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    opacity: disabled ? 0.5 : 1,
    minHeight: multiline ? 80 : 44, // Ensure minimum touch target
  };

  const inputTextStyles: TextStyle = {
    fontSize: 16,
    color: disabled ? '#6b7280' : '#111827',
    textAlignVertical: multiline ? 'top' : 'center',
    ...inputStyle,
  };

  const helpTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
  };

  const errorTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
  };

  // Map web input types to React Native keyboard types
  const getKeyboardType = () => {
    if (keyboardType !== 'default') return keyboardType;
    
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'tel':
        return 'phone-pad';
      case 'url':
        return 'url';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    if (autoCapitalize !== 'sentences') return autoCapitalize;
    
    switch (type) {
      case 'email':
      case 'url':
        return 'none';
      default:
        return 'sentences';
    }
  };

  return (
    <View style={[containerStyles, style]}>
      {label && (
        <Text style={labelStyles}>
          {label}
          {required && <Text style={{ color: theme.colors.destructive }}> *</Text>}
        </Text>
      )}
      
      <TextInput
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        editable={!disabled && !readOnly}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        secureTextEntry={secureTextEntry || type === 'password'}
        keyboardType={getKeyboardType()}
        autoCorrect={autoCorrect}
        autoCapitalize={getAutoCapitalize()}
        maxLength={maxLength}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        testID={testID}
        style={[inputStyles, inputTextStyles]}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || label || placeholder}
        accessibilityHint={accessibilityHint || helpText}
        accessibilityRole="text"
        accessibilityState={{
          disabled: disabled || readOnly,
        }}
        {...props}
      />
      
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