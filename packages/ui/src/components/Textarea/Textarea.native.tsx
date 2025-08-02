import React, { useState } from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { TextareaProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { FormField } from '../FormField';

export const Textarea: React.FC<TextareaProps> = ({
  value,
  defaultValue,
  placeholder,
  rows = 3,
  maxLength,
  autoFocus = false,
  readOnly = false,
  onChange,
  onChangeText,
  onFocus,
  onBlur,
  onKeyPress,
  size = 'md',
  variant = 'default',
  // FormField props
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
  resize,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;

  // Define size mappings
  const sizeMap = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: theme.spacing.xs,
      minHeight: 80,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: theme.spacing.sm,
      minHeight: 96,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: theme.spacing.md,
      minHeight: 112,
    },
  };

  const sizeConfig = sizeMap[size];

  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borders.radius.md,
    },
    filled: {
      backgroundColor: theme.colors.accent,
      borderColor: 'transparent',
      borderWidth: 1,
      borderRadius: theme.borders.radius.md,
    },
    flushed: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderBottomColor: theme.colors.border,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderRadius: 0,
    },
  };

  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    
    onChange?.(text);
    onChangeText?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    onKeyPress?.(nativeEvent.key);
  };

  const baseStyles: TextStyle & ViewStyle = {
    minHeight: sizeConfig.minHeight,
    fontFamily: theme.typography.fontFamily,
    fontSize: sizeConfig.fontSize,
    lineHeight: sizeConfig.fontSize * 1.5,
    color: theme.colors.foreground,
    padding: sizeConfig.padding,
    textAlignVertical: 'top',
    ...variantStyles[variant],
    ...(isFocused && {
      borderColor: theme.colors.primary,
    }),
    ...(errorText && {
      borderColor: theme.colors.destructive,
    }),
    ...(disabled && {
      opacity: 0.5,
      backgroundColor: theme.colors.muted + '20',
    }),
    ...style,
  };

  const textarea = (
    <TextInput
      value={currentValue}
      defaultValue={defaultValue}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      editable={!readOnly && !disabled}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      style={baseStyles}
      testID={testID}
      multiline={true}
      numberOfLines={rows}
      placeholderTextColor={theme.colors.muted}
      // React Native accessibility
      accessible={true}
      accessibilityLabel={accessibilityLabel || placeholder || label}
      accessibilityHint={accessibilityHint}
      accessibilityRole="text"
      {...(props as TextInputProps)}
    />
  );

  return (
    <FormField
      label={label}
      helpText={helpText}
      errorText={errorText}
      required={required}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      {textarea}
    </FormField>
  );
};