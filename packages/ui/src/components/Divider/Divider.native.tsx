import React from 'react';
import { View, ViewStyle } from 'react-native';
import { DividerProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  color,
  margin = 16,
  length = '100%',
  style,
  testID,
  // Accessibility props
  accessibilityRole = 'none' as const,
  accessibilityLabel,
  // Filter out web-specific props
  className,
  'aria-orientation': ariaOrientation,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const borderColor = color || theme.colors.border;

  // Convert variant to React Native border style
  const getBorderStyle = () => {
    switch (variant) {
      case 'dashed':
        return 'dashed';
      case 'dotted':
        return 'dotted';
      default:
        return 'solid';
    }
  };

  const baseStyles: ViewStyle = orientation === 'horizontal' ? {
    width: length as any,
    height: thickness,
    borderTopWidth: thickness,
    borderTopColor: borderColor,
    borderStyle: getBorderStyle(),
    marginTop: margin,
    marginBottom: margin,
  } : {
    width: thickness,
    height: length as any,
    borderLeftWidth: thickness,
    borderLeftColor: borderColor,
    borderStyle: getBorderStyle(),
    marginLeft: margin,
    marginRight: margin,
  };

  return (
    <View
      style={[baseStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={accessibilityRole !== 'none'}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  );
};