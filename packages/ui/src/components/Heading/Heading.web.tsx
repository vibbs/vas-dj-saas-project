import React from 'react';
import { HeadingProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  variant = 'title',
  align = 'left',
  color = 'inherit',
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
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
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    title: {
      fontSize: level === 1 ? theme.typography.fontSize['3xl'] : 
                level === 2 ? theme.typography.fontSize['2xl'] :
                level === 3 ? theme.typography.fontSize.xl :
                level === 4 ? theme.typography.fontSize.lg :
                level === 5 ? theme.typography.fontSize.base :
                theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      lineHeight: theme.typography.lineHeight.tight,
      letterSpacing: theme.typography.letterSpacing.tight,
    },
    subtitle: {
      fontSize: level === 1 ? theme.typography.fontSize['2xl'] : 
                level === 2 ? theme.typography.fontSize.xl :
                level === 3 ? theme.typography.fontSize.lg :
                level === 4 ? theme.typography.fontSize.base :
                level === 5 ? theme.typography.fontSize.sm :
                theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.relaxed,
      letterSpacing: theme.typography.letterSpacing.normal,
    },
  };

  // Define color styles using theme tokens
  const colorStyles = {
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    muted: { color: theme.colors.muted },
    destructive: { color: theme.colors.destructive },
    inherit: { color: 'inherit' },
  };

  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    textAlign: align,
    margin: 0,
    padding: 0,
    ...variantStyles[variant],
    ...colorStyles[color],
  };

  const headingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return React.createElement(
    headingTag,
    {
      style: {...baseStyles, ...style},
      className,
      'data-testid': testID,
      // Accessibility attributes (WCAG 2.1 AA compliant)
      'aria-label': ariaLabel || accessibilityLabel,
      'aria-level': ariaLevel || level,
      role,
      id,
      ...props,
    },
    children
  );
};