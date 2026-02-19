import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { ButtonProps } from './types';
import { Spinner } from '../Spinner';
import { springConfig } from '../../animations';

interface RippleEffect {
  id: number;
  x: number;
  y: number;
  size: number;
}

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
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  // Ripple effect handler
  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: RippleEffect = {
      id: rippleIdRef.current++,
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, [disabled, loading]);

  const getVariantStyles = (): React.CSSProperties => {
    const isActive = isPressed && !disabled;
    const isHover = isHovered && !disabled;

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled
            ? theme.colors.muted
            : isActive
            ? theme.colors.primaryActive
            : isHover
            ? theme.colors.primaryHover
            : theme.colors.primary,
          color: theme.colors.primaryForeground,
          border: 'none',
          boxShadow: !disabled && isHover ? theme.shadows.md : theme.shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: disabled
            ? theme.colors.muted
            : isHover
            ? theme.colors.secondaryHover
            : theme.colors.secondary,
          color: theme.colors.secondaryForeground,
          border: 'none',
          boxShadow: !disabled && isHover ? theme.shadows.sm : 'none',
        };
      case 'outline':
        return {
          backgroundColor: isHover ? theme.colors.muted : 'transparent',
          color: isHover ? theme.colors.primary : theme.colors.foreground,
          border: `${theme.borders.width.thin}px solid ${
            isHover ? theme.colors.primary : theme.colors.border
          }`,
          boxShadow: 'none',
        };
      case 'ghost':
        return {
          backgroundColor: isHover ? theme.colors.muted : 'transparent',
          color: isHover ? theme.colors.primary : theme.colors.foreground,
          border: 'none',
          boxShadow: 'none',
        };
      case 'destructive':
        return {
          backgroundColor: disabled
            ? theme.colors.muted
            : isActive
            ? theme.colors.destructiveHover
            : isHover
            ? theme.colors.destructiveHover
            : theme.colors.destructive,
          color: theme.colors.destructiveForeground,
          border: 'none',
          boxShadow: !disabled && isHover ? theme.shadows.md : theme.shadows.sm,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryForeground,
          border: 'none',
          boxShadow: theme.shadows.sm,
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          height: '32px',
          paddingLeft: theme.spacing.sm + 4,
          paddingRight: theme.spacing.sm + 4,
          fontSize: theme.typography.fontSize.sm,
          borderRadius: theme.borders.radius.md,
        };
      case 'md':
        return {
          height: '40px',
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
          borderRadius: theme.borders.radius.md,
        };
      case 'lg':
        return {
          height: '48px',
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.lg,
          fontSize: theme.typography.fontSize.lg,
          borderRadius: theme.borders.radius.lg,
        };
      default:
        return {
          height: '40px',
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          fontSize: theme.typography.fontSize.base,
          borderRadius: theme.borders.radius.md,
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  // Focus ring styles
  const focusRingStyle: React.CSSProperties = isFocused && !disabled ? {
    boxShadow: `0 0 0 2px ${theme.colors.background}, 0 0 0 4px ${theme.colors.ring}`,
  } : {};

  // Inject shimmer animation styles
  React.useEffect(() => {
    const styleId = 'button-animations';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes button-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes button-ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [createRipple, disabled, loading, onClick]);

  return (
    <motion.button
      ref={buttonRef}
      className={className}
      style={{
        ...baseStyles,
        ...focusRingStyle,
        ...style,
      }}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
      // Framer Motion props
      whileTap={disabled ? undefined : { scale: 0.98 }}
      animate={{
        y: isHovered && !disabled ? -2 : 0,
      }}
      transition={{
        ...springConfig.snappy,
        y: { duration: 0.15 },
      }}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Loading shimmer overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.gradients.shimmer,
            backgroundSize: '200% 100%',
            animation: 'button-shimmer 1.5s infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content */}
      <motion.span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          position: 'relative',
          zIndex: 1,
        }}
        animate={{
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig.gentle}
            style={{ display: 'flex' }}
          >
            <Spinner size="sm" color="currentColor" />
          </motion.span>
        )}
        {children}
      </motion.span>
    </motion.button>
  );
};
