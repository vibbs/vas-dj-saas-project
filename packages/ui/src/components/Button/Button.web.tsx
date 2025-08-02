import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  onClick,
  style,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  role = 'button',
  type = 'button',
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.muted : theme.colors.primary,
          color: theme.colors.primaryForeground,
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.colors.muted : theme.colors.secondary,
          color: theme.colors.secondaryForeground,
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.foreground,
          border: `${theme.borders.width.thin}px solid ${theme.colors.border}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.foreground,
          border: 'none',
        };
      case 'destructive':
        return {
          backgroundColor: disabled ? theme.colors.muted : theme.colors.destructive,
          color: theme.colors.destructiveForeground,
          border: 'none',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryForeground,
          border: 'none',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: '32px',
          paddingLeft: theme.spacing.sm + 4,
          paddingRight: theme.spacing.sm + 4,
          fontSize: theme.typography.fontSize.sm,
        };
      case 'md':
        return {
          height: '40px',
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
        };
      case 'lg':
        return {
          height: '48px',
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.lg,
          fontSize: theme.typography.fontSize.lg,
        };
      default:
        return {
          height: '40px',
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borders.radius.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    boxShadow: 'none',
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  // Add spin animation styles to document if not already present
  React.useEffect(() => {
    const styleId = 'button-spin-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const hoverStyles: React.CSSProperties = {
    filter: disabled ? 'none' : 'brightness(0.9)',
  };

  return (
    <button
      className={className}
      style={{
        ...baseStyles,
        ...style,
      }}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, baseStyles, style);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
          e.preventDefault();
          onClick?.();
        }
      }}
      type={type}
      role={role}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {loading && (
        <div
          style={{
            marginRight: theme.spacing.xs + 4,
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};