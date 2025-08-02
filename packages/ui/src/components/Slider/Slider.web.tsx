import React, { useId, useState, useRef } from 'react';
import { SliderProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  showValue = false,
  formatValue = (val) => val.toString(),
  onValueChange,
  onChange,
  className,
  style,
  sliderStyle,
  trackStyle,
  thumbStyle,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  'aria-valuemin': ariaValueMin,
  'aria-valuemax': ariaValueMax,
  'aria-valuenow': ariaValueNow,
  // Filter out React Native specific props
  onSlidingStart,
  onSlidingComplete,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();
  const id = useId();
  const sliderId = `slider-${id}`;
  const helpTextId = helpText ? `${sliderId}-help` : undefined;
  const errorTextId = errorText ? `${sliderId}-error` : undefined;
  
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasError = Boolean(errorText);
  
  // Calculate percentage for positioning
  const percentage = ((currentValue - min) / (max - min)) * 100;
  
  // Base styles using theme tokens
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${theme.spacing.xs}px`,
    width: '100%',
  };

  const labelContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
  };

  const valueDisplayStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const sliderContainerStyles = {
    position: 'relative' as const,
    width: '100%',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...sliderStyle,
  };

  const trackStyles = {
    position: 'absolute' as const,
    width: '100%',
    height: '4px',
    backgroundColor: theme.colors.border,
    borderRadius: '2px',
    ...trackStyle,
  };

  const fillTrackStyles = {
    position: 'absolute' as const,
    height: '4px',
    backgroundColor: hasError ? theme.colors.destructive : theme.colors.primary,
    borderRadius: '2px',
    width: `${percentage}%`,
    transition: isDragging ? 'none' : 'width 0.1s ease-out',
  };

  const thumbStyles = {
    position: 'absolute' as const,
    width: '20px',
    height: '20px',
    backgroundColor: theme.colors.background,
    border: `2px solid ${hasError ? theme.colors.destructive : theme.colors.primary}`,
    borderRadius: '50%',
    cursor: disabled ? 'not-allowed' : 'grab',
    left: `calc(${percentage}% - 10px)`,
    transition: isDragging ? 'none' : 'left 0.1s ease-out',
    boxShadow: theme.shadows.sm,
    ...thumbStyle,
  };

  const hiddenInputStyles = {
    position: 'absolute' as const,
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

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

  // Add CSS for focus and hover styles
  React.useEffect(() => {
    const styleId = 'slider-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .slider-input:focus + .slider-track + .slider-thumb {
          box-shadow: 0 0 0 2px ${theme.colors.ring}33, ${theme.shadows.sm};
          outline: none;
        }
        
        .slider-thumb:hover {
          transform: scale(1.1);
        }
        
        .slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(style);
    }
  }, [theme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onValueChange?.(newValue);
    onChange?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    if (!isControlled) {
      setInternalValue(clampedValue);
    }
    
    onValueChange?.(clampedValue);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      handleMouseMove(e as any);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, isControlled, onValueChange]);

  return (
    <div style={{ ...containerStyles, ...style }} className={className}>
      {(label || showValue) && (
        <div style={labelContainerStyles}>
          {label && (
            <label htmlFor={sliderId} style={labelStyles}>
              {label}
              {required && <span style={{ color: theme.colors.destructive }}> *</span>}
            </label>
          )}
          {showValue && (
            <span style={valueDisplayStyles}>
              {formatValue(currentValue)}
            </span>
          )}
        </div>
      )}
      
      <div 
        ref={sliderRef}
        style={sliderContainerStyles}
        onMouseDown={handleMouseDown}
      >
        <input
          type="range"
          id={sliderId}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          required={required}
          onChange={handleInputChange}
          data-testid={testID}
          className="slider-input"
          style={hiddenInputStyles}
          // Accessibility attributes
          aria-label={ariaLabel || accessibilityLabel || label}
          aria-describedby={ariaDescribedBy || [helpTextId, errorTextId].filter(Boolean).join(' ')}
          aria-invalid={ariaInvalid ?? hasError}
          aria-required={ariaRequired ?? required}
          aria-valuemin={ariaValueMin ?? min}
          aria-valuemax={ariaValueMax ?? max}
          aria-valuenow={ariaValueNow ?? currentValue}
          {...props}
        />
        <div className="slider-track" style={trackStyles} />
        <div style={fillTrackStyles} />
        <div className="slider-thumb" style={thumbStyles} />
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