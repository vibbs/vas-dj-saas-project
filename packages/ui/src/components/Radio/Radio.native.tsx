import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { RadioProps } from './types';
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
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;

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

  const containerStyles: ViewStyle = {
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: sizeConfig.gap,
    ...style,
  };

  const optionStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    opacity: disabled ? 0.5 : 1,
    padding: variant === 'card' ? theme.spacing.sm : 0,
    borderRadius: variant === 'card' ? theme.borders.radius.md : 0,
    borderWidth: variant === 'card' ? 1 : 0,
    borderColor: theme.colors.border,
    backgroundColor: variant === 'card' ? theme.colors.background : 'transparent',
  };

  const radioStyles: ViewStyle = {
    width: sizeConfig.radioSize,
    height: sizeConfig.radioSize,
    borderRadius: sizeConfig.radioSize / 2,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // Align with text baseline
  };

  const checkedRadioStyles: ViewStyle = {
    ...radioStyles,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  };

  const innerDotStyles: ViewStyle = {
    width: sizeConfig.radioSize * 0.4,
    height: sizeConfig.radioSize * 0.4,
    borderRadius: (sizeConfig.radioSize * 0.4) / 2,
    backgroundColor: theme.colors.primaryForeground,
  };

  const labelStyles: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
    lineHeight: sizeConfig.fontSize * 1.4,
    flex: 1,
  };

  const descriptionStyles: TextStyle = {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs / 2,
    lineHeight: theme.typography.fontSize.xs * 1.4,
  };

  const renderRadioOption = (option: any, index: number) => {
    const isChecked = currentValue === option.value;
    const isOptionDisabled = disabled || option.disabled;

    return (
      <TouchableOpacity
        key={option.value}
        style={{
          ...optionStyles,
          backgroundColor: variant === 'card' && isChecked 
            ? theme.colors.accent 
            : optionStyles.backgroundColor,
          borderColor: variant === 'card' && isChecked 
            ? theme.colors.primary 
            : (variant === 'card' ? theme.colors.border : 'transparent'),
        }}
        onPress={() => handleChange(option.value)}
        disabled={isOptionDisabled}
        activeOpacity={0.7}
        // React Native accessibility
        accessible={true}
        accessibilityRole="radio"
        accessibilityLabel={`${option.label}${option.description ? `. ${option.description}` : ''}`}
        accessibilityState={{
          checked: isChecked,
          disabled: isOptionDisabled,
        }}
      >
        <View style={isChecked ? checkedRadioStyles : radioStyles}>
          {isChecked && <View style={innerDotStyles} />}
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={labelStyles}>{option.label}</Text>
          {option.description && (
            <Text style={descriptionStyles}>
              {option.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const radioGroup = (
    <View
      style={containerStyles}
      testID={testID}
      // React Native accessibility
      accessible={false} // Let individual options handle accessibility
      {...props}
    >
      {options.map(renderRadioOption)}
    </View>
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
      {radioGroup}
    </FormField>
  );
};