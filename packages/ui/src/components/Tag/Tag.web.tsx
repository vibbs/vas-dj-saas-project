import React from 'react';
import { TagProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  closable = false,
  disabled = false,
  outlined = false,
  rounded = false,
  icon,
  onClose,
  onClick,
  className,
  style,
  testID,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  // Filter out React Native specific props
  onPress,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const variants = {
      default: {
        backgroundColor: outlined ? 'transparent' : theme.colors.muted,
        color: theme.colors.mutedForeground,
        borderColor: theme.colors.border,
      },
      primary: {
        backgroundColor: outlined ? 'transparent' : theme.colors.primary,
        color: outlined ? theme.colors.primary : theme.colors.primaryForeground,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: outlined ? 'transparent' : theme.colors.secondary,
        color: outlined ? theme.colors.secondaryForeground : theme.colors.secondaryForeground,
        borderColor: theme.colors.border,
      },
      success: {
        backgroundColor: outlined ? 'transparent' : '#10b981',
        color: outlined ? '#10b981' : '#ffffff',
        borderColor: '#10b981',
      },
      warning: {
        backgroundColor: outlined ? 'transparent' : '#f59e0b',
        color: outlined ? '#f59e0b' : '#ffffff',
        borderColor: '#f59e0b',
      },
      danger: {
        backgroundColor: outlined ? 'transparent' : theme.colors.destructive,
        color: outlined ? theme.colors.destructive : theme.colors.destructiveForeground,
        borderColor: theme.colors.destructive,
      },
      info: {
        backgroundColor: outlined ? 'transparent' : '#3b82f6',
        color: outlined ? '#3b82f6' : '#ffffff',
        borderColor: '#3b82f6',
      },
    };

    return variants[variant];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
          fontSize: theme.typography.fontSize.xs,
          height: '20px',
        };
      case 'md':
        return {
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
          fontSize: theme.typography.fontSize.sm,
          height: '24px',
        };
      case 'lg':
        return {
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          fontSize: theme.typography.fontSize.base,
          height: '32px',
        };
      default:
        return {
          padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
          fontSize: theme.typography.fontSize.sm,
          height: '24px',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${theme.spacing.xs}px`,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    border: `1px solid ${variantStyles.borderColor}`,
    borderRadius: rounded ? '999px' : theme.borders.radius.md,
    cursor: onClick || onClose ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...sizeStyles,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    ...style,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onClose?.();
  };

  const closeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: 1,
    marginLeft: theme.spacing.xs,
    color: 'inherit',
    transition: 'background-color 0.2s ease-in-out',
  };

  return (
    <span
      style={baseStyles}
      className={className}
      onClick={handleClick}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role || (onClick ? 'button' : 'text')}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      tabIndex={onClick && !disabled ? 0 : -1}
      // Keyboard navigation support
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
      // Hover effects
      onMouseEnter={(e) => {
        if (!disabled && onClick) {
          (e.currentTarget as HTMLElement).style.opacity = '0.8';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }
      }}
      {...props}
    >
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      <span>{children}</span>
      
      {closable && (
        <button
          style={closeButtonStyles}
          onClick={handleCloseClick}
          aria-label="Remove tag"
          tabIndex={-1}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};