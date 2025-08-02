import React from 'react';
import { Text, TextStyle } from 'react-native';
import { HeadingProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  variant = 'title',
  align = 'left',
  color = 'inherit',
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'header' as const,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-level': ariaLevel,
  role,
  id,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles based on semantic hierarchy
  const variantStyles = {
    display: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'],
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    title: {
      fontSize: level === 1 ? theme.typography.fontSize['3xl'] : 
                level === 2 ? theme.typography.fontSize['2xl'] :
                level === 3 ? theme.typography.fontSize.xl :
                level === 4 ? theme.typography.fontSize.lg :
                level === 5 ? theme.typography.fontSize.base :
                theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold as TextStyle['fontWeight'],
      lineHeight: (level === 1 ? theme.typography.fontSize['3xl'] : 
                   level === 2 ? theme.typography.fontSize['2xl'] :
                   level === 3 ? theme.typography.fontSize.xl :
                   level === 4 ? theme.typography.fontSize.lg :
                   level === 5 ? theme.typography.fontSize.base :
                   theme.typography.fontSize.sm) * theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    subtitle: {
      fontSize: level === 1 ? theme.typography.fontSize['2xl'] : 
                level === 2 ? theme.typography.fontSize.xl :
                level === 3 ? theme.typography.fontSize.lg :
                level === 4 ? theme.typography.fontSize.base :
                level === 5 ? theme.typography.fontSize.sm :
                theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'],
      lineHeight: (level === 1 ? theme.typography.fontSize['2xl'] : 
                   level === 2 ? theme.typography.fontSize.xl :
                   level === 3 ? theme.typography.fontSize.lg :
                   level === 4 ? theme.typography.fontSize.base :
                   level === 5 ? theme.typography.fontSize.sm :
                   theme.typography.fontSize.xs) * theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal as TextStyle['fontWeight'],
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
  };

  // Define color styles using theme tokens
  const colorStyles = {
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    muted: { color: theme.colors.muted },
    destructive: { color: theme.colors.destructive },
    inherit: { color: theme.colors.foreground },
  };

  const baseStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    textAlign: align,
    ...variantStyles[variant],
    ...colorStyles[color],
  };

  return (
    <Text
      style={[baseStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Heading')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </Text>
  );
};