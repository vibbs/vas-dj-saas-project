import React, { useId, useState } from 'react';
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
  indeterminate = false,
  onCheckedChange,
  onChange,
  className,
  style,
  checkboxStyle,
  testID,
  value,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  // Filter out React Native specific props
  onPress,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();
  const id = useId();
  const checkboxId = `checkbox-${id}`;
  const helpTextId = helpText ? `${checkboxId}-help` : undefined;
  const errorTextId = errorText ? `${checkboxId}-error` : undefined;
  
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const checkedValue = isControlled ? checked : internalChecked;
  const hasError = Boolean(errorText);
  
  // Base styles using theme tokens
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${theme.spacing.xs}px`,
    width: '100%',
  };

  const checkboxContainerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${theme.spacing.sm}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const checkboxStyles = {
    position: 'relative' as const,
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginTop: '2px', // Align with first line of text
  };

  const hiddenCheckboxStyles = {
    position: 'absolute' as const,
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const customCheckboxStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '20px',
    height: '20px',
    border: `2px solid ${hasError ? theme.colors.destructive : (checkedValue ? theme.colors.primary : theme.colors.border)}`,
    borderRadius: `${theme.borders.radius.sm}px`,
    backgroundColor: checkedValue ? theme.colors.primary : theme.colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    pointerEvents: 'none',
    ...checkboxStyle,
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: 1.5,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none' as const,
  };

  const helpTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    marginLeft: '32px', // Align with label text
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginLeft: '32px', // Align with label text
  };

  // Add CSS for focus styles and animations
  React.useEffect(() => {
    const styleId = 'checkbox-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .checkbox-focus:focus + .custom-checkbox {
          box-shadow: 0 0 0 2px ${theme.colors.ring}33;
          border-color: ${theme.colors.ring};
        }
        
        .checkmark {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.15s ease-in-out;
        }
        
        .checkmark.checked {
          opacity: 1;
          transform: scale(1);
        }
        
        .custom-checkbox:hover {
          border-color: ${theme.colors.primary};
        }
      `;
      document.head.appendChild(style);
    }
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
    onChange?.(e);
  };

  const handleContainerClick = () => {
    if (disabled) return;
    
    const newChecked = !checkedValue;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
  };

  const CheckmarkIcon = () => (
    <svg
      className={`checkmark ${checkedValue ? 'checked' : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke={theme.colors.primaryForeground}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const IndeterminateIcon = () => (
    <svg
      className="indeterminate-mark"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6h8"
        stroke={theme.colors.primaryForeground}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div style={containerStyles}>
      <div 
        style={checkboxContainerStyles} 
        onClick={handleContainerClick}
        className={className}
      >
        <div style={checkboxStyles}>
          <input
            type="checkbox"
            id={checkboxId}
            checked={checkedValue}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
            data-testid={testID}
            className="checkbox-focus"
            style={hiddenCheckboxStyles}
            // Accessibility attributes
            aria-label={ariaLabel || accessibilityLabel || label}
            aria-describedby={ariaDescribedBy || [helpTextId, errorTextId].filter(Boolean).join(' ')}
            aria-invalid={ariaInvalid ?? hasError}
            aria-required={ariaRequired ?? required}
            {...props}
          />
          <div className="custom-checkbox" style={customCheckboxStyles}>
            {indeterminate ? <IndeterminateIcon /> : checkedValue && <CheckmarkIcon />}
          </div>
        </div>
        
        {label && (
          <label htmlFor={checkboxId} style={labelStyles}>
            {label}
            {required && <span style={{ color: theme.colors.destructive }}> *</span>}
          </label>
        )}
      </div>
      
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