import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { springConfig } from '../../animations';

// SVG Icons for each variant
const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  default: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// Animation variants for different positions
const getAnimationVariants = (position: string) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');
  const isRight = position.includes('right');
  const isCenter = !isLeft && !isRight;

  let x = 0;
  if (isLeft) x = -20;
  if (isRight) x = 20;

  return {
    hidden: {
      opacity: 0,
      y: isTop ? -20 : 20,
      x,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: isTop ? -10 : 10,
      x: isCenter ? 0 : (isLeft ? -30 : 30),
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1] as const, // easeIn cubic-bezier
      },
    },
  };
};

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
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  }, [onClose]);

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (!visible || duration <= 0 || isPaused) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        handleClose();
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [visible, duration, isPaused, handleClose]);

  // Sync visibility with prop
  useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);
      setProgress(100);
    } else if (!visible && isVisible) {
      handleClose();
    }
  }, [visible, isVisible, handleClose]);

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      color: theme.colors.foreground,
      iconColor: theme.colors.mutedForeground,
      progressColor: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.card,
      borderColor: `${theme.colors.success}40`,
      color: theme.colors.foreground,
      iconColor: theme.colors.success,
      progressColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.card,
      borderColor: `${theme.colors.warning}40`,
      color: theme.colors.foreground,
      iconColor: theme.colors.warning,
      progressColor: theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.card,
      borderColor: `${theme.colors.destructive}40`,
      color: theme.colors.foreground,
      iconColor: theme.colors.destructive,
      progressColor: theme.colors.destructive,
    },
    info: {
      backgroundColor: theme.colors.card,
      borderColor: `${theme.colors.info}40`,
      color: theme.colors.foreground,
      iconColor: theme.colors.info,
      progressColor: theme.colors.info,
    },
  };

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'top-left': {
      top: theme.spacing.lg,
      left: theme.spacing.lg,
    },
    'top-right': {
      top: theme.spacing.lg,
      right: theme.spacing.lg,
    },
    bottom: {
      bottom: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'bottom-left': {
      bottom: theme.spacing.lg,
      left: theme.spacing.lg,
    },
    'bottom-right': {
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
    },
  };

  const currentVariant = variantStyles[variant];
  const animationVariants = getAnimationVariants(position);

  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    minWidth: '320px',
    maxWidth: '420px',
    borderRadius: theme.borders.radius.lg,
    border: `${theme.borders.width.thin}px solid ${currentVariant.borderColor}`,
    boxShadow: theme.shadows.lg,
    fontFamily: theme.typography.fontFamilyBody,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.relaxed,
    overflow: 'hidden',
    backgroundColor: currentVariant.backgroundColor,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    ...positionStyles[position],
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    paddingBottom: duration > 0 ? theme.spacing.md + 4 : theme.spacing.md,
  };

  const iconContainerStyles: React.CSSProperties = {
    color: currentVariant.iconColor,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: theme.borders.radius.full,
    backgroundColor: `${currentVariant.iconColor}15`,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: theme.colors.mutedForeground,
    cursor: 'pointer',
    padding: theme.spacing.xs,
    margin: `-${theme.spacing.xs}px`,
    borderRadius: theme.borders.radius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `all ${theme.animation.duration.fast}ms ${theme.animation.easing.easeOut}`,
  };

  if (!isVisible && !visible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={baseStyles}
          className={className}
          data-testid={testID}
          variants={animationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={springConfig.snappy}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          // Accessibility attributes (WCAG 2.1 AA compliant)
          role={role || (variant === 'error' ? 'alert' : 'status')}
          aria-label={ariaLabel || accessibilityLabel}
          aria-describedby={ariaDescribedBy}
          aria-live={variant === 'error' ? 'assertive' : ariaLive}
          {...props}
        >
          <div style={contentStyles}>
            {/* Icon */}
            <motion.div
              style={iconContainerStyles}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springConfig.bouncy, delay: 0.1 }}
            >
              {icons[variant]}
            </motion.div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: currentVariant.color,
                    marginBottom:
                      description || children ? theme.spacing.xs : 0,
                  }}
                >
                  {title}
                </motion.div>
              )}
              {description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    color: theme.colors.mutedForeground,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                >
                  {description}
                </motion.div>
              )}
              {children && !description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ color: theme.colors.mutedForeground }}
                >
                  {children}
                </motion.div>
              )}
            </div>

            {/* Close button */}
            {closable && (
              <motion.button
                onClick={handleClose}
                style={closeButtonStyles}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: theme.colors.muted,
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close notification"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Progress bar for auto-dismiss */}
          {duration > 0 && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: `${currentVariant.progressColor}20`,
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: currentVariant.progressColor,
                  borderRadius: '0 2px 2px 0',
                }}
                initial={{ width: '100%' }}
                animate={{
                  width: `${progress}%`,
                  transition: { duration: 0.05, ease: 'linear' },
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
