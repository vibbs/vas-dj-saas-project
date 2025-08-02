import React from 'react';
import { BadgeProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive,
  role = 'status',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.primaryForeground,
      border: `1px solid ${theme.colors.primary}`,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.secondaryForeground,
      border: `1px solid ${theme.colors.border}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.foreground,
      border: '1px solid transparent',
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
      color: theme.colors.destructiveForeground,
      border: `1px solid ${theme.colors.destructive}`,
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.successForeground,
      border: `1px solid ${theme.colors.success}`,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: theme.colors.warningForeground,
      border: `1px solid ${theme.colors.warning}`,
    },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.xs / 2}px ${theme.spacing.xs}px`,
      fontSize: theme.typography.fontSize.xs,
      borderRadius: theme.borders.radius.sm,
    },
    md: {
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borders.radius.md,
    },
    lg: {
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borders.radius.lg,
    },
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: onClick && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const hoverStyles = onClick && !disabled ? {
    ':hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.sm,
    },
  } : {};

  const isInteractive = !!onClick;
  const Element = isInteractive ? 'button' : 'span';

  return (
    <Element
      style={{...baseStyles, ...style}}
      onClick={disabled ? undefined : onClick}
      disabled={isInteractive ? disabled : undefined}
      data-testid={testID}
      className={className}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={isInteractive ? 'button' : role}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
      aria-disabled={isInteractive && disabled}
      tabIndex={isInteractive && !disabled ? 0 : -1}
      // Keyboard navigation support for interactive badges
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {children}
    </Element>
  );
};