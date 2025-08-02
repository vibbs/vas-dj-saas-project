import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { IconProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Icon: React.FC<IconProps> = ({
  children,
  name,
  size = 'md',
  color,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'image' as const,
  onPress,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-hidden': ariaHidden,
  role,
  alt,
  title,
  fill,
  stroke,
  strokeWidth,
  viewBox,
  width,
  height,
  ...props
}) => {
  const { theme } = useTheme();

  // Define size mapping
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  // Get actual size value
  const actualSize = typeof size === 'number' ? size : sizeMap[size];
  
  // Determine colors with theme fallbacks
  const iconColor = color || theme.colors.foreground;

  const baseStyles: ViewStyle = {
    width: actualSize,
    height: actualSize,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const textStyles: TextStyle = {
    fontSize: actualSize * 0.8, // Slightly smaller than container
    color: iconColor,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
  };

  // Icon name to unicode/emoji mapping for React Native
  const getIconContent = () => {
    const iconMap: Record<string, string> = {
      home: '🏠',
      user: '👤',
      settings: '⚙️',
      search: '🔍',
      bell: '🔔',
      heart: '❤️',
      star: '⭐',
      plus: '➕',
      minus: '➖',
      check: '✓',
      x: '✕',
      'chevron-right': '❯',
      'chevron-left': '❮',
      'chevron-up': '❮',
      'chevron-down': '❯',
    };

    if (name && iconMap[name]) {
      return iconMap[name];
    }

    // If children is provided and it's a string, use it
    if (typeof children === 'string') {
      return children;
    }

    // Default fallback
    return '◯';
  };

  const renderIcon = () => {
    return (
      <Text style={textStyles} allowFontScaling={false}>
        {getIconContent()}
      </Text>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[baseStyles, style]}
        onPress={onPress}
        testID={testID}
        activeOpacity={0.7}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || (name ? `${name} icon` : 'Icon')}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        {renderIcon()}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[baseStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (name ? `${name} icon` : 'Icon')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {renderIcon()}
    </View>
  );
};