import React, { useId, useState } from 'react';
import { SwitchProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  size = 'md',
  onCheckedChange,
  onChange,
  className,
  style,
  switchStyle,
  thumbStyle,
  trackStyle,
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
  const switchId = `switch-${id}`;
  const helpTextId = helpText ? `${switchId}-help` : undefined;
  const errorTextId = errorText ? `${switchId}-error` : undefined;
  
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const checkedValue = isControlled ? checked : internalChecked;
  const hasError = Boolean(errorText);
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 32, height: 18, thumbSize: 14, padding: 2 },
    md: { width: 40, height: 22, thumbSize: 18, padding: 2 },
    lg: { width: 48, height: 26, thumbSize: 22, padding: 2 },
  };
  
  const config = sizeConfig[size];
  
  // Base styles using theme tokens
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${theme.spacing.xs}px`,
    width: '100%',
  };

  const switchContainerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${theme.spacing.sm}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const switchWrapperStyles = {
    position: 'relative' as const,
    width: `${config.width}px`,
    height: `${config.height}px`,
    flexShrink: 0,
    marginTop: '2px', // Align with first line of text
  };

  const hiddenInputStyles = {
    position: 'absolute' as const,
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const trackStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: `${config.height / 2}px`,
    backgroundColor: checkedValue 
      ? (hasError ? theme.colors.destructive : theme.colors.primary)
      : theme.colors.border,
    transition: 'background-color 0.2s ease-in-out',
    border: hasError && !checkedValue ? `1px solid ${theme.colors.destructive}` : 'none',
    ...trackStyle,
  };

  const thumbStyles = {
    position: 'absolute' as const,
    top: `${config.padding}px`,
    left: checkedValue 
      ? `${config.width - config.thumbSize - config.padding}px` 
      : `${config.padding}px`,
    width: `${config.thumbSize}px`,
    height: `${config.thumbSize}px`,
    borderRadius: '50%',
    backgroundColor: theme.colors.background,
    boxShadow: theme.shadows.sm,
    transition: 'left 0.2s ease-in-out',
    ...thumbStyle,
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
    marginLeft: `${config.width + theme.spacing.sm}px`, // Align with label text
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginLeft: `${config.width + theme.spacing.sm}px`, // Align with label text
  };

  // Add CSS for focus styles
  React.useEffect(() => {
    const styleId = 'switch-focus-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .switch-focus:focus + .switch-track {
          box-shadow: 0 0 0 2px ${theme.colors.ring}33;
          outline: 2px solid ${theme.colors.ring};
          outline-offset: 2px;
        }
        
        .switch-track:hover {
          opacity: 0.9;
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

  return (
    <div style={containerStyles}>
      <div 
        style={switchContainerStyles} 
        onClick={handleContainerClick}
        className={className}
      >
        <div style={switchWrapperStyles}>
          <input
            type="checkbox"
            id={switchId}
            checked={checkedValue}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
            data-testid={testID}
            className="switch-focus"
            style={hiddenInputStyles}
            role="switch"
            // Accessibility attributes
            aria-label={ariaLabel || accessibilityLabel || label}
            aria-describedby={ariaDescribedBy || [helpTextId, errorTextId].filter(Boolean).join(' ')}
            aria-invalid={ariaInvalid ?? hasError}
            aria-required={ariaRequired ?? required}
            aria-checked={checkedValue}
            {...props}
          />
          <div className="switch-track" style={{...trackStyles, ...switchStyle}}>
            <div style={thumbStyles} />
          </div>
        </div>
        
        {label && (
          <label htmlFor={switchId} style={labelStyles}>
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