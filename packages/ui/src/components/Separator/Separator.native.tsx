import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { SeparatorProps } from './types';

/**
 * Separator Component (React Native)
 *
 * Visually or semantically separates content with theme integration.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 */
export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  thickness,
  variant = 'default',
  style,
  testID,
  accessibilityLabel,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const { theme } = useTheme();

  const variantColors = {
    default: theme.colors.border,
    muted: theme.colors.muted,
  };

  const separatorStyles: ViewStyle = {
    backgroundColor: variantColors[variant],
    ...(orientation === 'horizontal' ? {
      height: thickness || 1,
      width: '100%',
    } : {
      width: thickness || 1,
      height: '100%',
    }),
  };

  return (
    <View
      style={[separatorStyles, style]}
      testID={testID}
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel || 'Separator'}
      accessibilityRole={decorative ? 'none' : 'text'}
      {...props}
    />
  );
};
