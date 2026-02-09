import React, { useState } from 'react';
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
  resize = 'vertical',
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
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  style,
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
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      minHeight: '80px',
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      minHeight: '96px',
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      minHeight: '112px',
    },
  };

  const sizeConfig = sizeMap[size];

  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borders.radius.md,
    },
    filled: {
      backgroundColor: theme.colors.accent,
      border: `1px solid transparent`,
      borderRadius: theme.borders.radius.md,
    },
    flushed: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${theme.colors.border}`,
      borderRadius: 0,
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onChangeText?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyPress?.(e.key);
  };

  const baseStyles = {
    width: '100%',
    fontFamily: theme.typography.fontFamily,
    lineHeight: 1.5,
    color: theme.colors.foreground,
    resize: resize,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...sizeConfig,
    ...variantStyles[variant],
    ...(isFocused && {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 2px ${theme.colors.primary}20`,
    }),
    ...(errorText && {
      borderColor: theme.colors.destructive,
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: theme.colors.muted + '20',
    }),
    ...style,
  };

  const textarea = (
    <textarea
      value={currentValue}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      autoFocus={autoFocus}
      readOnly={readOnly}
      disabled={disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      style={baseStyles}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={!!errorText}
      aria-required={required}
      {...props}
    />
  );

  return (
    <FormField
      label={label}
      helpText={helpText}
      errorText={errorText}
      required={required}
      disabled={disabled}
      id={id}
    >
      {textarea}
    </FormField>
  );
};