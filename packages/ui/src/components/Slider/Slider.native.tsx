import React, { useState } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Animated, ViewStyle, TextStyle } from 'react-native';
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
  onSlidingStart,
  onSlidingComplete,
  style,
  sliderStyle,
  trackStyle,
  thumbStyle,
  testID,
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
  'aria-valuemin': ariaValueMin,
  'aria-valuemax': ariaValueMax,
  'aria-valuenow': ariaValueNow,
  ...props
}) => {
  const { theme } = useTheme();
  
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [sliderWidth, setSliderWidth] = useState(300);
  const [animatedValue] = useState(new Animated.Value(defaultValue));
  
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasError = Boolean(errorText);
  
  // Calculate position for the thumb
  const thumbPosition = ((currentValue - min) / (max - min)) * (sliderWidth - 20);
  
  // Update animated value when current value changes
  React.useEffect(() => {
    const newPosition = ((currentValue - min) / (max - min)) * (sliderWidth - 20);
    Animated.timing(animatedValue, {
      toValue: newPosition,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [currentValue, sliderWidth, min, max, animatedValue]);
  
  // Base styles using theme tokens
  const containerStyles: ViewStyle = {
    width: '100%',
  };

  const labelContainerStyles: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  };

  const labelStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: hasError ? theme.colors.destructive : theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
  };

  const valueDisplayStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const sliderContainerStyles: ViewStyle = {
    height: 40,
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    ...sliderStyle,
  };

  const trackContainerStyles: ViewStyle = {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    justifyContent: 'center',
    ...trackStyle,
  };

  const fillTrackStyles: ViewStyle = {
    height: 4,
    backgroundColor: hasError ? theme.colors.destructive : theme.colors.primary,
    borderRadius: 2,
    width: `${((currentValue - min) / (max - min)) * 100}%`,
  };

  const thumbStyles: ViewStyle = {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: hasError ? theme.colors.destructive : theme.colors.primary,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    ...thumbStyle,
  };

  const helpTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
  };

  const errorTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
  };

  const updateValue = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / (sliderWidth - 20)));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    if (!isControlled) {
      setInternalValue(clampedValue);
    }
    
    onValueChange?.(clampedValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      onSlidingStart?.();
    },
    onPanResponderMove: (event, gestureState) => {
      if (disabled) return;
      const newPosition = Math.max(0, Math.min(sliderWidth - 20, thumbPosition + gestureState.dx));
      updateValue(newPosition);
    },
    onPanResponderRelease: () => {
      onSlidingComplete?.(currentValue);
    },
    onPanResponderTerminate: () => {
      onSlidingComplete?.(currentValue);
    },
  });

  const handleTrackPress = (event: any) => {
    if (disabled) return;
    
    const { locationX } = event.nativeEvent;
    updateValue(locationX - 10); // Subtract half thumb width
  };

  return (
    <View style={[containerStyles, style]}>
      {(label || showValue) && (
        <View style={labelContainerStyles}>
          {label && (
            <Text style={labelStyles}>
              {label}
              {required && <Text style={{ color: theme.colors.destructive }}> *</Text>}
            </Text>
          )}
          {showValue && (
            <Text style={valueDisplayStyles}>
              {formatValue(currentValue)}
            </Text>
          )}
        </View>
      )}
      
      <View 
        style={sliderContainerStyles}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
        }}
        testID={testID}
        accessible={true}
        accessibilityLabel={accessibilityLabel || label || 'Slider'}
        accessibilityHint={accessibilityHint || helpText}
        accessibilityRole="adjustable"
        accessibilityValue={{
          min: min,
          max: max,
          now: currentValue,
        }}
        accessibilityState={{
          disabled: disabled,
        }}
        {...props}
      >
        <View
          style={trackContainerStyles}
          onStartShouldSetResponder={() => !disabled}
          onResponderGrant={handleTrackPress}
        >
          <View style={fillTrackStyles} />
        </View>
        
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            thumbStyles,
            {
              left: animatedValue,
            }
          ]}
        />
      </View>
      
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