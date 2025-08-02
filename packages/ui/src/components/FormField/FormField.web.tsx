import React from 'react';
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
  
  // Generate unique IDs for accessibility
  const fieldId = id || React.useId();
  const helpTextId = helpText ? `${fieldId}-help` : undefined;
  const errorTextId = errorText ? `${fieldId}-error` : undefined;
  
  // Combine describedby IDs
  const describedBy = [helpTextId, errorTextId, ariaDescribedBy]
    .filter(Boolean)
    .join(' ') || undefined;

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${theme.spacing.xs}px`,
    fontFamily: theme.typography.fontFamily,
    ...style,
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: disabled ? theme.colors.muted : theme.colors.foreground,
    lineHeight: 1.4,
  };

  const helpTextStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.muted,
    lineHeight: 1.4,
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.destructive,
    lineHeight: 1.4,
  };

  // Clone children to pass accessibility props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id: fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': !!errorText,
        'aria-required': required,
        disabled,
        ...child.props,
      });
    }
    return child;
  });

  return (
    <div
      style={containerStyles}
      className={className}
      data-testid={testID}
      {...props}
    >
      {label && (
        <label
          htmlFor={fieldId}
          style={labelStyles}
          aria-label={ariaLabel || accessibilityLabel}
        >
          {label}
          {required && (
            <span
              style={{ color: theme.colors.destructive, marginLeft: '2px' }}
              aria-label="required"
            >
              *
            </span>
          )}
        </label>
      )}
      
      {enhancedChildren}
      
      {helpText && !errorText && (
        <div
          id={helpTextId}
          style={helpTextStyles}
          role="status"
          aria-live="polite"
        >
          {helpText}
        </div>
      )}
      
      {errorText && (
        <div
          id={errorTextId}
          style={errorTextStyles}
          role="alert"
          aria-live="assertive"
        >
          {errorText}
        </div>
      )}
    </div>
  );
};