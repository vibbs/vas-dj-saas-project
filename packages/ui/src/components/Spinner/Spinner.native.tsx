import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SpinnerProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
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

  // Map size to React Native ActivityIndicator sizes
  const getNativeSize = (size: 'sm' | 'md' | 'lg'): 'small' | 'large' => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'md':
      case 'lg':
        return 'large';
      default:
        return 'small';
    }
  };

  return (
    <ActivityIndicator
      size={getNativeSize(size)}
      color={color || theme.colors.primary}
      style={style}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Loading'}
      accessibilityHint={accessibilityHint}
      accessibilityRole="progressbar"
      accessibilityState={{
        busy: true,
      }}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
      {...props}
    />
  );
};