import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { ProgressProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'linear',
  size = 'md',
  color = 'primary',
  track = true,
  label = false,
  thickness,
  radius,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-valuemin': ariaValuemin,
  'aria-valuemax': ariaValuemax,
  'aria-valuenow': ariaValuenow,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Size configurations
  const sizeConfig = {
    sm: { height: 4, radius: 24, thickness: 2, fontSize: theme.typography.fontSize.xs },
    md: { height: 6, radius: 32, thickness: 3, fontSize: theme.typography.fontSize.sm },
    lg: { height: 8, radius: 40, thickness: 4, fontSize: theme.typography.fontSize.sm },
    xl: { height: 12, radius: 48, thickness: 6, fontSize: theme.typography.fontSize.xl },
  };

  const config = sizeConfig[size];
  const progressRadius = radius || config.radius;
  const strokeWidth = thickness || config.thickness;

  // Color configurations
  const getProgressColor = () => {
    switch (color) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.destructive;
      default: return theme.colors.primary;
    }
  };

  const progressColor = getProgressColor();
  const trackColor = theme.colors.muted;

  if (variant === 'circular') {
    // For React Native without SVG dependencies, we'll create a simpler circular progress
    // using nested circular views and rotation transforms
    const circularSize = (progressRadius + strokeWidth) * 2;
    const innerSize = progressRadius * 2;
    
    const containerStyle: ViewStyle = {
      alignItems: 'center',
      gap: label ? theme.spacing.xs : 0,
      ...style,
    };

    const outerCircleStyle: ViewStyle = {
      width: circularSize,
      height: circularSize,
      borderRadius: circularSize / 2,
      backgroundColor: track ? trackColor : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    const innerCircleStyle: ViewStyle = {
      width: innerSize,
      height: innerSize,
      borderRadius: innerSize / 2,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Create a simple arc approximation using multiple small segments
    const progressSegmentStyle: ViewStyle = {
      position: 'absolute',
      width: circularSize,
      height: circularSize,
      borderRadius: circularSize / 2,
      borderWidth: strokeWidth,
      borderColor: 'transparent',
      borderTopColor: progressColor,
      transform: [{ rotate: `${(clampedValue / 100) * 360}deg` }],
    };

    const labelStyle: TextStyle = {
      fontSize: config.fontSize,
      fontWeight: theme.typography.fontWeight.medium as any,
      color: theme.colors.foreground,
      fontFamily: theme.typography.fontFamily,
    };

    return (
      <View
        style={containerStyle}
        testID={testID}
        // Accessibility attributes
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || `Progress ${clampedValue} percent`}
        accessibilityHint={accessibilityHint}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: clampedValue,
        }}
        accessible={true}
        {...props}
      >
        <View style={outerCircleStyle}>
          {/* Progress arc - simplified approach */}
          <View style={progressSegmentStyle} />
          
          {/* Inner circle to create the ring effect */}
          <View style={innerCircleStyle}>
            {/* Center label */}
            {label && (
              <Text style={labelStyle}>
                {Math.round(clampedValue)}%
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Linear variant
  const containerStyle: ViewStyle = {
    width: '100%',
    gap: label ? theme.spacing.xs : 0,
    ...style,
  };

  const trackStyle: ViewStyle = {
    width: '100%',
    height: config.height,
    backgroundColor: track ? trackColor : 'transparent',
    borderRadius: config.height / 2,
    overflow: 'hidden',
  };

  const progressStyle: ViewStyle = {
    height: '100%',
    width: `${clampedValue}%`,
    backgroundColor: progressColor,
    borderRadius: config.height / 2,
  };

  const labelStyle: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.foreground,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
  };

  return (
    <View
      style={containerStyle}
      testID={testID}
      // Accessibility attributes
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || `Progress ${clampedValue} percent`}
      accessibilityHint={accessibilityHint}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clampedValue,
      }}
      accessible={true}
      {...props}
    >
      <View style={trackStyle}>
        <View style={progressStyle} />
      </View>
      
      {/* Label below */}
      {label && (
        <Text style={labelStyle}>
          {Math.round(clampedValue)}%
        </Text>
      )}
    </View>
  );
};