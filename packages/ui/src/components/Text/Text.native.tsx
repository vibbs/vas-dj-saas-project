import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { TextProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size,
  weight = 'normal',
  align = 'left',
  color = 'inherit',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'text' as const,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  id,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles with semantic meaning
  const variantStyles = {
    body: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    small: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    large: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.wide,
    },
    overline: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.widest,
      textTransform: 'uppercase' as TextStyle['textTransform'],
    },
  };

  // Size can override variant fontSize
  const sizeStyles = size ? {
    fontSize: theme.typography.fontSize[size],
    lineHeight: theme.typography.fontSize[size] * theme.typography.lineHeight.relaxed,
  } : {};

  // Define weight styles
  const weightStyles = {
    normal: { fontWeight: theme.typography.fontWeight.normal as TextStyle['fontWeight'] },
    medium: { fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'] },
    semibold: { fontWeight: theme.typography.fontWeight.semibold as TextStyle['fontWeight'] },
    bold: { fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'] },
  };

  // Define color styles using theme tokens
  const colorStyles = {
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    muted: { color: theme.colors.muted },
    destructive: { color: theme.colors.destructive },
    inherit: { color: theme.colors.foreground },
  };

  // Text decoration styles
  const decorationStyles: TextStyle = {
    fontStyle: italic ? 'italic' : 'normal',
    textDecorationLine: [
      underline && 'underline',
      strikethrough && 'line-through',
    ].filter(Boolean).join(' ') as TextStyle['textDecorationLine'] || 'none',
  };

  const baseStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    textAlign: align,
    ...variantStyles[variant],
    ...sizeStyles,
    ...weightStyles[weight],
    ...colorStyles[color],
    ...decorationStyles,
  };

  return (
    <RNText
      style={[baseStyles, style]}
      testID={testID}
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Text')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </RNText>
  );
};