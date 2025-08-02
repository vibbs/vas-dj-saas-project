import React from 'react';
import { LinkProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  underline = 'hover',
  external = false,
  disabled = false,
  onClick,
  target,
  rel,
  download,
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-current': ariaCurrent,
  role = 'link',
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      color: theme.colors.primary,
      '&:visited': { color: theme.colors.primary },
    },
    primary: {
      color: theme.colors.primary,
      '&:visited': { color: theme.colors.primary },
    },
    secondary: {
      color: theme.colors.secondary,
      '&:visited': { color: theme.colors.secondary },
    },
    muted: {
      color: theme.colors.muted,
      '&:visited': { color: theme.colors.muted },
    },
    destructive: {
      color: theme.colors.destructive,
      '&:visited': { color: theme.colors.destructive },
    },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    xs: { fontSize: theme.typography.fontSize.xs },
    sm: { fontSize: theme.typography.fontSize.sm },
    base: { fontSize: theme.typography.fontSize.base },
    lg: { fontSize: theme.typography.fontSize.lg },
    xl: { fontSize: theme.typography.fontSize.xl },
  };

  // Define weight styles
  const weightStyles = {
    normal: { fontWeight: theme.typography.fontWeight.normal },
    medium: { fontWeight: theme.typography.fontWeight.medium },
    semibold: { fontWeight: theme.typography.fontWeight.semibold },
    bold: { fontWeight: theme.typography.fontWeight.bold },
  };

  // Define underline styles
  const underlineStyles = {
    always: { textDecoration: 'underline' },
    hover: { 
      textDecoration: 'none',
      '&:hover': { textDecoration: 'underline' }
    },
    never: { textDecoration: 'none' },
  };

  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    display: 'inline',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    ...sizeStyles[size],
    ...weightStyles[weight],
    ...variantStyles[variant],
    ...underlineStyles[underline],
  };

  const hoverStyles = !disabled ? {
    '&:hover': {
      opacity: 0.8,
      ...underlineStyles[underline]['&:hover'],
    },
    '&:focus': {
      outline: `2px solid ${theme.colors.primary}`,
      outlineOffset: '2px',
    },
  } : {};

  // Determine target and rel for external links
  const linkTarget = external ? target || '_blank' : target;
  const linkRel = external ? rel || 'noopener noreferrer' : rel;

  // Handle click events
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e as any);
  };

  // If no href provided, render as button for interactive behavior
  if (!href) {
    return (
      <button
        type="button"
        style={{...baseStyles, ...style}}
        onClick={disabled ? undefined : (onClick as any)}
        disabled={disabled}
        className={className}
        data-testid={testID}
        // Accessibility attributes
        aria-label={ariaLabel || accessibilityLabel}
        aria-describedby={ariaDescribedBy}
        aria-current={ariaCurrent}
        role={role}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={disabled ? undefined : href}
      target={linkTarget}
      rel={linkRel}
      download={download}
      style={{...baseStyles, ...style}}
      onClick={handleClick}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-current={ariaCurrent}
      aria-disabled={disabled}
      role={role}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
      {external && (
        <span 
          style={{ 
            marginLeft: '4px', 
            fontSize: '0.8em',
            opacity: 0.7 
          }}
          aria-hidden="true"
        >
          ↗
        </span>
      )}
    </a>
  );
};