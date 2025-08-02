import React from 'react';
import { CardProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Spinner } from '../Spinner';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  role,
  type,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.card,
      color: theme.colors.cardForeground,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: theme.colors.card,
      color: theme.colors.cardForeground,
      border: 'none',
      boxShadow: theme.shadows.md,
    },
    outlined: {
      backgroundColor: 'transparent',
      color: theme.colors.foreground,
      border: `2px solid ${theme.colors.border}`,
      boxShadow: 'none',
    },
    filled: {
      backgroundColor: theme.colors.muted,
      color: theme.colors.mutedForeground,
      border: 'none',
      boxShadow: 'none',
    },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.sm}px`,
      borderRadius: theme.borders.radius.sm,
      minHeight: '80px',
    },
    md: {
      padding: `${theme.spacing.md}px`,
      borderRadius: theme.borders.radius.md,
      minHeight: '120px',
    },
    lg: {
      padding: `${theme.spacing.lg}px`,
      borderRadius: theme.borders.radius.lg,
      minHeight: '160px',
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: theme.typography.fontFamily,
    cursor: onClick ? (disabled ? 'not-allowed' : 'pointer') : 'default',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const hoverStyles: React.CSSProperties = onClick && !disabled ? {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'elevated' ? theme.shadows.lg : theme.shadows.sm,
  } : {};

  // Add CSS animations for loading states
  React.useEffect(() => {
    const styleId = 'card-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement
      style={{
        ...baseStyles, 
        ...style,
        ...(loading ? { animation: 'pulse 2s ease-in-out infinite' } : {})
      }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={onClick ? (disabled || loading) : undefined}
      data-testid={testID}
      className={className}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      {...(onClick && {
        type: type || 'button',
        role: role || 'button',
        tabIndex: disabled ? -1 : 0,
      })}
      {...(!onClick && role && { role })}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      // Keyboard navigation support
      onKeyDown={onClick ? (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      onMouseEnter={onClick ? (e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        Object.assign(e.currentTarget.style, baseStyles, style);
      } : undefined}
      {...props}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <Spinner size="md" color="currentColor" />
        </div>
      )}
      {children}
    </CardElement>
  );
};