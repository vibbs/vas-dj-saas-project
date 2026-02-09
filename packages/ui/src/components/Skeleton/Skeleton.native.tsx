import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { SkeletonProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = variant === 'text' ? 16 : 40,
  lines = 1,
  animation = 'pulse',
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
  // Filter out web-specific props
  className: _className,
  'aria-label': _ariaLabel,
  'aria-describedby': _ariaDescribedBy,
  'aria-busy': _ariaBusy,
  role: _role,
  ...props
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const waveAnim = useRef(new Animated.Value(-1)).current;

  // Pulse animation
  useEffect(() => {
    if (animation === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [animation, pulseAnim]);

  // Wave animation
  useEffect(() => {
    if (animation === 'wave') {
      const waveAnimation = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        })
      );
      waveAnimation.start();
      return () => waveAnimation.stop();
    }
  }, [animation, waveAnim]);

  const getBaseStyles = (): ViewStyle => {
    const baseWidth = typeof width === 'number' 
        ? width 
        : '100%';
    
    const baseHeight = typeof height === 'number' 
        ? height 
        : 16;

    return {
      backgroundColor: theme.colors.muted,
      borderRadius: variant === 'circular' ? (typeof baseHeight === 'number' ? baseHeight / 2 : 20) : 
                    variant === 'rounded' ? theme.borders.radius.md : 
                    variant === 'text' ? theme.borders.radius.sm : 
                    theme.borders.radius.sm,
      width: baseWidth,
      height: baseHeight,
      opacity: animation === 'pulse' ? pulseAnim : 1,
    };
  };

  const getTextLineStyles = (lineIndex: number): ViewStyle => {
    // Vary the width of text lines for more realistic appearance
    let lineWidthPercent: string = '100%';
    if (lines > 1) {
      if (lineIndex === lines - 1) {
        lineWidthPercent = '60%'; // Last line is shorter
      } else if (lineIndex === 0) {
        lineWidthPercent = '90%'; // First line is slightly shorter
      }
    }

    return {
      ...getBaseStyles(),
      width: lineWidthPercent as any, // Cast to fix DimensionValue type issue
      height: 16,
      marginBottom: lineIndex < lines - 1 ? theme.spacing.xs : 0,
    };
  };

  const getWaveStyles = (): ViewStyle => {
    const translateX = waveAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-100%', '100%'],
    });

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: [{ translateX }],
    };
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <View
        style={style}
        testID={testID}
        // Accessibility attributes
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || 'Loading content'}
        accessibilityHint={accessibilityHint}
        accessible={true}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <View key={index} style={{ overflow: 'hidden' }}>
            <Animated.View style={getTextLineStyles(index)}>
              {animation === 'wave' && (
                <Animated.View style={getWaveStyles()} />
              )}
            </Animated.View>
          </View>
        ))}
      </View>
    );
  }

  // Single skeleton element
  return (
    <View style={{ overflow: 'hidden', ...style }} testID={testID}>
      <Animated.View
        style={getBaseStyles()}
        // Accessibility attributes
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || 'Loading content'}
        accessibilityHint={accessibilityHint}
        accessible={true}
        {...props}
      >
        {animation === 'wave' && (
          <Animated.View style={getWaveStyles()} />
        )}
      </Animated.View>
    </View>
  );
};