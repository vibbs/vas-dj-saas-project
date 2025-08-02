import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle, TextStyle } from 'react-native';
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
  onPress,
  style,
  switchStyle,
  thumbStyle,
  trackStyle,
  testID,
  value,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  onChange,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}) => {
  const { theme } = useTheme();
  
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [animatedValue] = useState(new Animated.Value(defaultChecked ? 1 : 0));
  
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
  
  // Update animation when checked value changes
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: checkedValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [checkedValue, animatedValue]);
  
  // Base styles using theme tokens
  const containerStyles: ViewStyle = {
    width: '100%',
  };

  const switchContainerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    opacity: disabled ? 0.5 : 1,
  };

  const switchWrapperStyles: ViewStyle = {
    width: config.width,
    height: config.height,
    marginTop: 2, // Align with first line of text
    marginRight: theme.spacing.sm,
  };

  const trackStyles: ViewStyle = {
    width: '100%',
    height: '100%',
    borderRadius: config.height / 2,
    justifyContent: 'center',
    backgroundColor: checkedValue 
      ? (hasError ? theme.colors.destructive : theme.colors.primary)
      : theme.colors.border,
    borderWidth: hasError && !checkedValue ? 1 : 0,
    borderColor: hasError ? theme.colors.destructive : 'transparent',
    ...trackStyle,
  };

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.padding, config.width - config.thumbSize - config.padding],
  });

  const thumbStyles: ViewStyle = {
    position: 'absolute',
    width: config.thumbSize,
    height: config.thumbSize,
    borderRadius: config.thumbSize / 2,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    top: config.padding,
    ...thumbStyle,
  };

  const labelStyles: TextStyle = {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  };

  const helpTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    marginLeft: config.width + theme.spacing.sm, // Align with label text
  };

  const errorTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    marginLeft: config.width + theme.spacing.sm, // Align with label text
  };

  const handlePress = () => {
    if (disabled) return;
    
    const newChecked = !checkedValue;
    
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
    onPress?.();
  };

  return (
    <View style={[containerStyles, style]}>
      <TouchableOpacity
        style={switchContainerStyles}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || label || 'Switch'}
        accessibilityHint={accessibilityHint || helpText}
        accessibilityRole="switch"
        accessibilityState={{
          checked: checkedValue,
          disabled: disabled,
        }}
        {...props}
      >
        <View style={switchWrapperStyles}>
          <View style={[trackStyles, switchStyle]}>
            <Animated.View 
              style={[
                thumbStyles,
                { left: thumbPosition }
              ]} 
            />
          </View>
        </View>
        
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={{ color: theme.colors.destructive }}> *</Text>}
          </Text>
        )}
      </TouchableOpacity>
      
      {helpText && !errorText && (
        <Text style={helpTextStyles}>
          {helpText}
        </Text>
      )}
      
      {errorText && (
        <Text style={errorTextStyles} accessibilityRole="alert">
          {errorText}
        </Text>
      )}
    </View>
  );
};