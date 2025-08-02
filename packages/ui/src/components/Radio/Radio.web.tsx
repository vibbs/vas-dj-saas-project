import React, { useState } from 'react';
import { RadioProps, RadioOption } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { FormField } from '../FormField';

export const Radio: React.FC<RadioProps> = ({
  options,
  value,
  defaultValue,
  name,
  layout = 'vertical',
  size = 'md',
  variant = 'default',
  onChange,
  onValueChange,
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
  
  const currentValue = value !== undefined ? value : internalValue;
  const groupName = name || React.useId();

  // Define size mappings
  const sizeMap = {
    sm: {
      radioSize: 16,
      fontSize: theme.typography.fontSize.sm,
      gap: theme.spacing.xs,
    },
    md: {
      radioSize: 20,
      fontSize: theme.typography.fontSize.base,
      gap: theme.spacing.sm,
    },
    lg: {
      radioSize: 24,
      fontSize: theme.typography.fontSize.lg,
      gap: theme.spacing.md,
    },
  };

  const sizeConfig = sizeMap[size];

  const handleChange = (optionValue: string) => {
    if (disabled) return;
    
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    
    onChange?.(optionValue);
    onValueChange?.(optionValue);
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: `${sizeConfig.gap}px`,
    fontFamily: theme.typography.fontFamily,
    ...style,
  } as const;

  const optionStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${theme.spacing.xs}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    padding: variant === 'card' ? `${theme.spacing.sm}px` : '0',
    borderRadius: variant === 'card' ? `${theme.borders.radius.md}px` : '0',
    border: variant === 'card' ? `1px solid ${theme.colors.border}` : 'none',
    backgroundColor: variant === 'card' ? theme.colors.background : 'transparent',
    transition: 'all 0.2s ease-in-out',
  };

  const radioStyles = {
    width: `${sizeConfig.radioSize}px`,
    height: `${sizeConfig.radioSize}px`,
    borderRadius: '50%',
    border: `2px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    position: 'relative' as const,
    flexShrink: 0,
    marginTop: '2px', // Align with text baseline
  };

  const checkedRadioStyles = {
    ...radioStyles,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  };

  const innerDotStyles = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${sizeConfig.radioSize * 0.4}px`,
    height: `${sizeConfig.radioSize * 0.4}px`,
    borderRadius: '50%',
    backgroundColor: theme.colors.primaryForeground,
  };

  const labelStyles = {
    fontSize: sizeConfig.fontSize,
    color: theme.colors.foreground,
    lineHeight: 1.4,
    flex: 1,
  };

  const descriptionStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.muted,
    marginTop: `${theme.spacing.xs / 2}px`,
    lineHeight: 1.4,
  };

  const renderRadioOption = (option: RadioOption, index: number) => {
    const isChecked = currentValue === option.value;
    const isOptionDisabled = disabled || option.disabled;
    const optionId = `${groupName}-option-${index}`;

    return (
      <label
        key={option.value}
        htmlFor={optionId}
        style={{
          ...optionStyles,
          cursor: isOptionDisabled ? 'not-allowed' : 'pointer',
          opacity: isOptionDisabled ? 0.5 : 1,
          backgroundColor: variant === 'card' && isChecked 
            ? theme.colors.accent 
            : optionStyles.backgroundColor,
          borderColor: variant === 'card' && isChecked 
            ? theme.colors.primary 
            : (variant === 'card' ? theme.colors.border : 'none'),
        }}
      >
        <input
          type="radio"
          id={optionId}
          name={groupName}
          value={option.value}
          checked={isChecked}
          disabled={isOptionDisabled}
          onChange={() => handleChange(option.value)}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
          }}
          aria-describedby={option.description ? `${optionId}-description` : undefined}
        />
        
        <div style={isChecked ? checkedRadioStyles : radioStyles}>
          {isChecked && <div style={innerDotStyles} />}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={labelStyles}>{option.label}</div>
          {option.description && (
            <div 
              id={`${optionId}-description`}
              style={descriptionStyles}
            >
              {option.description}
            </div>
          )}
        </div>
      </label>
    );
  };

  const radioGroup = (
    <div
      style={containerStyles}
      role="radiogroup"
      aria-label={ariaLabel || accessibilityLabel || label}
      aria-describedby={ariaDescribedBy}
      aria-required={required}
      aria-invalid={!!errorText}
      data-testid={testID}
      className={className}
      {...props}
    >
      {options.map(renderRadioOption)}
    </div>
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
      {radioGroup}
    </FormField>
  );
};