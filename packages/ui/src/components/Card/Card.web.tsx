import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Spinner } from '../Spinner';
import { springConfig, fadeInUp } from '../../animations';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  animate = false,
  animationDelay = 0,
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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Define variant styles using theme tokens
  const getVariantStyles = (): React.CSSProperties => {
    const isInteractive = !!onClick && !disabled;
    const showHoverEffect = isHovered && isInteractive;

    switch (variant) {
      case 'default':
        return {
          backgroundColor: showHoverEffect ? theme.colors.cardHover : theme.colors.card,
          color: theme.colors.cardForeground,
          border: `1px solid ${showHoverEffect ? theme.colors.borderHover : theme.colors.border}`,
          boxShadow: showHoverEffect ? theme.shadows.md : theme.shadows.xs,
        };
      case 'elevated':
        return {
          backgroundColor: showHoverEffect ? theme.colors.cardHover : theme.colors.card,
          color: theme.colors.cardForeground,
          border: 'none',
          boxShadow: showHoverEffect ? theme.shadows.xl : theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: showHoverEffect ? theme.colors.muted : 'transparent',
          color: theme.colors.foreground,
          border: `2px solid ${showHoverEffect ? theme.colors.primary : theme.colors.border}`,
          boxShadow: 'none',
        };
      case 'filled':
        return {
          backgroundColor: showHoverEffect ? theme.colors.secondaryHover : theme.colors.muted,
          color: theme.colors.foreground,
          border: 'none',
          boxShadow: showHoverEffect ? theme.shadows.sm : 'none',
        };
      case 'glass':
        return {
          backgroundColor: theme.colors.glass,
          color: theme.colors.cardForeground,
          border: `1px solid ${theme.colors.glassBorder}`,
          boxShadow: showHoverEffect ? theme.shadows.lg : theme.shadows.sm,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        };
      case 'gradient':
        return {
          background: theme.gradients.primary,
          color: theme.colors.primaryForeground,
          border: 'none',
          boxShadow: showHoverEffect
            ? `${theme.shadows.lg}, ${theme.shadows.glow}`
            : theme.shadows.md,
        };
      default:
        return {
          backgroundColor: theme.colors.card,
          color: theme.colors.cardForeground,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.xs,
        };
    }
  };

  // Define size styles using theme tokens
  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.sm}px`,
          borderRadius: theme.borders.radius.md,
          minHeight: '80px',
        };
      case 'md':
        return {
          padding: `${theme.spacing.md}px`,
          borderRadius: theme.borders.radius.lg,
          minHeight: '120px',
        };
      case 'lg':
        return {
          padding: `${theme.spacing.lg}px`,
          borderRadius: theme.borders.radius.xl,
          minHeight: '160px',
        };
      default:
        return {
          padding: `${theme.spacing.md}px`,
          borderRadius: theme.borders.radius.lg,
          minHeight: '120px',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    fontFamily: theme.typography.fontFamilyBody,
    cursor: onClick ? (disabled ? 'not-allowed' : 'pointer') : 'default',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    overflow: 'hidden',
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  // Focus ring styles
  const focusRingStyle: React.CSSProperties = isFocused && !disabled && onClick
    ? {
        boxShadow: `0 0 0 2px ${theme.colors.background}, 0 0 0 4px ${theme.colors.ring}`,
      }
    : {};

  // Inject CSS animations for loading states
  React.useEffect(() => {
    const styleId = 'card-animations-v2';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes card-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes card-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const CardComponent = onClick ? motion.button : motion.div;

  const motionProps = animate
    ? {
        initial: 'hidden',
        animate: 'visible',
        variants: fadeInUp,
        transition: {
          ...springConfig.gentle,
          delay: animationDelay,
        },
      }
    : {};

  const hoverProps = onClick && !disabled
    ? {
        whileHover: { y: -4 },
        whileTap: { scale: 0.98 },
        transition: springConfig.snappy,
      }
    : {};

  return (
    <CardComponent
      style={{
        ...baseStyles,
        ...focusRingStyle,
        ...style,
      }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={onClick ? disabled || loading : undefined}
      data-testid={testID}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...motionProps}
      {...hoverProps}
      {...props}
    >
      {/* Hover glow effect for gradient variant */}
      {variant === 'gradient' && isHovered && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: -20,
            background: theme.gradients.glow,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Loading overlay with shimmer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                variant === 'gradient'
                  ? 'rgba(0, 0, 0, 0.2)'
                  : theme.colors.overlayLight,
              backdropFilter: 'blur(2px)',
              zIndex: 10,
              borderRadius: 'inherit',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springConfig.bouncy}
            >
              <Spinner size="md" color="currentColor" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer effect for loading state */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.gradients.shimmer,
            backgroundSize: '400% 100%',
            animation: 'card-shimmer 2s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 5,
            opacity: 0.3,
          }}
        />
      )}

      {/* Content container */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
        animate={{
          opacity: loading ? 0.4 : 1,
          filter: loading ? 'blur(1px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </CardComponent>
  );
};
