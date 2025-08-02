import React, { useId } from 'react';
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
  type = 'text',
  onChange,
  onFocus,
  onBlur,
  className,
  style,
  inputStyle,
  testID,
  maxLength,
  autoComplete,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  // Filter out React Native specific props
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCorrect,
  autoCapitalize,
  numberOfLines,
  onSubmitEditing,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();
  const id = useId();
  const inputId = `input-${id}`;
  const helpTextId = helpText ? `${inputId}-help` : undefined;
  const errorTextId = errorText ? `${inputId}-error` : undefined;
  
  const hasError = Boolean(errorText);
  
  // Base styles using theme tokens
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${theme.spacing.xs}px`,
    width: '100%',
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
  };

  const inputBaseStyles = {
    width: '100%',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    borderRadius: `${theme.borders.radius.md}px`,
    border: `1px solid ${hasError ? theme.colors.destructive : theme.colors.border}`,
    backgroundColor: disabled ? theme.colors.muted : theme.colors.background,
    color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.5 : 1,
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? '80px' : 'auto',
    ...inputStyle,
  };

  const focusStyles = !disabled ? {
    ':focus': {
      borderColor: hasError ? theme.colors.destructive : theme.colors.ring,
      boxShadow: `0 0 0 2px ${hasError ? theme.colors.destructive : theme.colors.ring}33`,
    },
  } : {};

  const helpTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
  };

  // Add CSS for focus styles
  React.useEffect(() => {
    const styleId = 'input-focus-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .input-focus:focus {
          border-color: ${hasError ? theme.colors.destructive : theme.colors.ring} !important;
          box-shadow: 0 0 0 2px ${hasError ? theme.colors.destructive : theme.colors.ring}33 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [hasError, theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e);
    onChangeText?.(e.target.value);
  };

  const inputProps = {
    id: inputId,
    value,
    defaultValue,
    placeholder,
    disabled,
    readOnly,
    maxLength,
    autoComplete,
    required,
    onChange: handleChange,
    onFocus,
    onBlur,
    'data-testid': testID,
    className: `input-focus ${className || ''}`,
    style: { ...inputBaseStyles, ...style },
    // Accessibility attributes
    'aria-label': ariaLabel || accessibilityLabel || label,
    'aria-describedby': ariaDescribedBy || [helpTextId, errorTextId].filter(Boolean).join(' '),
    'aria-invalid': ariaInvalid ?? hasError,
    'aria-required': ariaRequired ?? required,
    ...props,
  };

  const InputElement = multiline ? 'textarea' : 'input';
  const inputElementProps = multiline 
    ? inputProps 
    : { ...inputProps, type: secureTextEntry ? 'password' : type };

  return (
    <div style={containerStyles}>
      {label && (
        <label htmlFor={inputId} style={labelStyles}>
          {label}
          {required && <span style={{ color: theme.colors.destructive }}> *</span>}
        </label>
      )}
      
      <InputElement {...inputElementProps} />
      
      {helpText && !errorText && (
        <span id={helpTextId} style={helpTextStyles}>
          {helpText}
        </span>
      )}
      
      {errorText && (
        <span id={errorTextId} style={errorTextStyles} role="alert">
          {errorText}
        </span>
      )}
    </div>
  );
};