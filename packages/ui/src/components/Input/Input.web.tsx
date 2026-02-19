import React, { useId, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { springConfig } from '../../animations';

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

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

  const hasError = Boolean(errorText);

  // Update hasValue when value prop changes
  React.useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);

  // Base styles using theme tokens
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${theme.spacing.xs}px`,
    width: '100%',
    position: 'relative',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError
      ? theme.colors.destructive
      : isFocused
      ? theme.colors.primary
      : theme.colors.foreground,
    fontFamily: theme.typography.fontFamilyBody,
    transition: `color ${theme.animation.duration.fast}ms ${theme.animation.easing.easeOut}`,
  };

  const inputWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputBaseStyles: React.CSSProperties = {
    width: '100%',
    padding: `${theme.spacing.sm + 2}px ${theme.spacing.md}px`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamilyBody,
    borderRadius: `${theme.borders.radius.md}px`,
    border: `${theme.borders.width.thin}px solid ${
      hasError
        ? theme.colors.destructive
        : isFocused
        ? theme.colors.inputFocus
        : theme.colors.border
    }`,
    backgroundColor: disabled ? theme.colors.muted : theme.colors.card,
    color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? '100px' : 'auto',
    boxShadow: isFocused
      ? hasError
        ? `0 0 0 3px ${theme.colors.destructive}20, ${theme.shadows.sm}`
        : `0 0 0 3px ${theme.colors.primary}20, ${theme.shadows.sm}`
      : theme.shadows.xs,
    transition: `
      border-color ${theme.animation.duration.fast}ms ${theme.animation.easing.easeOut},
      box-shadow ${theme.animation.duration.fast}ms ${theme.animation.easing.easeOut},
      background-color ${theme.animation.duration.fast}ms ${theme.animation.easing.easeOut}
    `,
    ...inputStyle,
  };

  const helpTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamilyBody,
    lineHeight: theme.typography.lineHeight.normal,
  };

  const errorTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamilyBody,
    lineHeight: theme.typography.lineHeight.normal,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  };

  const characterCountStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamilyMono,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
      onChangeText?.(e.target.value);
    },
    [onChange, onChangeText]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

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
    onFocus: handleFocus,
    onBlur: handleBlur,
    'data-testid': testID,
    className: className || '',
    style: { ...inputBaseStyles, ...style },
    // Accessibility attributes
    'aria-label': ariaLabel || accessibilityLabel || label,
    'aria-describedby':
      ariaDescribedBy || [helpTextId, errorTextId].filter(Boolean).join(' '),
    'aria-invalid': ariaInvalid ?? hasError,
    'aria-required': ariaRequired ?? required,
    ...props,
  };

  const InputElement = multiline ? 'textarea' : 'input';
  const inputElementProps = multiline
    ? inputProps
    : { ...inputProps, type: secureTextEntry ? 'password' : type };

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <motion.div
      style={containerStyles}
      initial={false}
      animate={{ opacity: 1 }}
    >
      {label && (
        <motion.label
          htmlFor={inputId}
          style={labelStyles}
          animate={{
            color: hasError
              ? theme.colors.destructive
              : isFocused
              ? theme.colors.primary
              : theme.colors.foreground,
          }}
          transition={{ duration: 0.15 }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.destructive, marginLeft: 2 }}>
              *
            </span>
          )}
        </motion.label>
      )}

      <div style={inputWrapperStyles}>
        <InputElement {...inputElementProps} />

        {/* Focus glow effect */}
        <AnimatePresence>
          {isFocused && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={springConfig.gentle}
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: theme.borders.radius.md + 2,
                background: hasError
                  ? `${theme.colors.destructive}10`
                  : `${theme.colors.primary}08`,
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Help text with animation */}
      <AnimatePresence mode="wait">
        {helpText && !errorText && (
          <motion.span
            key="help"
            id={helpTextId}
            style={helpTextStyles}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {helpText}
          </motion.span>
        )}

        {errorText && (
          <motion.span
            key="error"
            id={errorTextId}
            style={errorTextStyles}
            role="alert"
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={springConfig.snappy}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorText}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Character count */}
      {maxLength && (
        <motion.div
          style={characterCountStyles}
          animate={{
            color:
              currentLength > maxLength * 0.9
                ? theme.colors.warning
                : currentLength >= maxLength
                ? theme.colors.destructive
                : theme.colors.mutedForeground,
          }}
        >
          {currentLength}/{maxLength}
        </motion.div>
      )}
    </motion.div>
  );
};
