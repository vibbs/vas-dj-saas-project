import React, { useEffect, useState } from 'react';
import { ToastProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Toast: React.FC<ToastProps> = ({
  children,
  variant = 'default',
  position = 'top-right',
  duration = 5000,
  visible = true,
  onClose,
  title,
  description,
  closable = true,
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role,
  ...props
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(visible);

  // Auto-dismiss functionality
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  // Sync visibility with prop
  useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);
      setIsAnimating(true);
    } else if (!visible && isVisible) {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      color: theme.colors.foreground,
    },
    success: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
      color: theme.colors.successForeground,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
      color: theme.colors.warningForeground,
    },
    error: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
      color: theme.colors.destructiveForeground,
    },
    info: {
      backgroundColor: theme.colors.info,
      borderColor: theme.colors.info,
      color: theme.colors.infoForeground,
    },
  };

  // Position styles
  const positionStyles = {
    'top': { top: theme.spacing.md, left: '50%', transform: 'translateX(-50%)' },
    'top-left': { top: theme.spacing.md, left: theme.spacing.md },
    'top-right': { top: theme.spacing.md, right: theme.spacing.md },
    'bottom': { bottom: theme.spacing.md, left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: theme.spacing.md, left: theme.spacing.md },
    'bottom-right': { bottom: theme.spacing.md, right: theme.spacing.md },
  };

  const baseStyles = {
    position: 'fixed' as const,
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '400px',
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    border: `1px solid`,
    boxShadow: theme.shadows.lg,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.relaxed,
    transition: 'all 0.3s ease-in-out',
    opacity: isAnimating ? 1 : 0,
    transform: `translateY(${isAnimating ? '0' : (position.includes('top') ? '-20px' : '20px')})`,
    ...positionStyles[position],
    ...variantStyles[variant],
    // Allow style overrides to override positioning
    ...style,
  };

  // Add CSS animations
  React.useEffect(() => {
    const styleId = 'toast-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={baseStyles}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role || (variant === 'error' ? 'alert' : 'status')}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-live={variant === 'error' ? 'assertive' : ariaLive}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.sm }}>
        {/* Icon based on variant */}
        <div style={{ 
          fontSize: '18px', 
          lineHeight: 1, 
          marginTop: '2px',
          flexShrink: 0 
        }}>
          {variant === 'success' && '✓'}
          {variant === 'warning' && '⚠'}
          {variant === 'error' && '✕'}
          {variant === 'info' && 'ℹ'}
          {variant === 'default' && '•'}
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{ 
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: description || children ? theme.spacing.xs : 0
            }}>
              {title}
            </div>
          )}
          {description && (
            <div style={{ opacity: 0.9 }}>
              {description}
            </div>
          )}
          {children && !description && (
            <div>{children}</div>
          )}
        </div>
        
        {/* Close button */}
        {closable && (
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: theme.spacing.xs,
              margin: `-${theme.spacing.xs}px`,
              borderRadius: theme.borders.radius.sm,
              fontSize: '16px',
              lineHeight: 1,
              opacity: 0.7,
              transition: 'opacity 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};