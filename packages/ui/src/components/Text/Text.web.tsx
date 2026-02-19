import React from 'react';
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
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
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
      lineHeight: theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    small: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    large: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.wide,
    },
    overline: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.widest,
      textTransform: 'uppercase' as const,
    },
  };

  // Size can override variant fontSize
  const sizeStyles = size ? {
    fontSize: theme.typography.fontSize[size],
  } : {};

  // Define weight styles
  const weightStyles = {
    normal: { fontWeight: theme.typography.fontWeight.normal },
    medium: { fontWeight: theme.typography.fontWeight.medium },
    semibold: { fontWeight: theme.typography.fontWeight.semibold },
    bold: { fontWeight: theme.typography.fontWeight.bold },
  };

  // Define color styles using theme tokens
  // Note: These use *Foreground colors for text, not background colors
  const colorStyles = {
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondaryForeground },
    muted: { color: theme.colors.mutedForeground },
    destructive: { color: theme.colors.destructive },
    inherit: { color: 'inherit' },
  };

  // Text decoration styles
  const decorationStyles = {
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: [
      underline && 'underline',
      strikethrough && 'line-through',
    ].filter(Boolean).join(' ') || 'none',
  };

  // Truncation styles
  const truncateStyles = truncate ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } : {};

  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    textAlign: align,
    margin: 0,
    padding: 0,
    ...variantStyles[variant],
    ...sizeStyles,
    ...weightStyles[weight],
    ...colorStyles[color],
    ...decorationStyles,
    ...truncateStyles,
  };

  return (
    <p
      style={{...baseStyles, ...style}}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      role={role}
      id={id}
      {...props}
    >
      {children}
    </p>
  );
};