import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppBarProps, AppBarAction } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { springConfig } from '../../animations';
import { ArrowLeft } from 'lucide-react';

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  logo,
  actions = [],
  backAction,
  position = 'static',
  elevation = 2,
  transparent = false,
  height = 64,
  variant = 'default',
  onActionClick,
  onTitleClick,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  leading,
  trailing,
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleActionClick = (action: AppBarAction) => {
    if (!action.disabled) {
      onActionClick?.(action);
    }
  };

  const handleBackClick = () => {
    if (backAction && !backAction.onClick) {
      window.history.back();
    } else {
      backAction?.onClick?.();
    }
  };

  const handleTitleClick = () => {
    onTitleClick?.();
  };

  // Map elevation to theme shadows
  const elevationShadows: Record<number, string> = {
    0: 'none',
    1: theme.shadows.xs,
    2: theme.shadows.sm,
    3: theme.shadows.md,
    4: theme.shadows.lg,
    5: theme.shadows.xl,
  };

  const variantStyles = {
    default: {
      backgroundColor: transparent
        ? 'transparent'
        : theme.colors.background,
      borderColor: theme.colors.border,
      shadow: transparent
        ? 'none'
        : elevationShadows[Math.min(elevation, 5)] || theme.shadows.sm,
      backdropFilter: 'blur(12px)',
      accentGradient: 'none',
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      shadow: 'none',
      backdropFilter: 'none',
      accentGradient: 'none',
    },
    prominent: {
      backgroundColor: transparent ? 'transparent' : theme.colors.primary,
      borderColor: theme.colors.primary,
      shadow: transparent
        ? 'none'
        : elevationShadows[Math.min(elevation, 5)] || theme.shadows.md,
      backdropFilter: 'blur(12px)',
      accentGradient: theme.gradients.primary,
    },
    glass: {
      backgroundColor: theme.colors.glass,
      borderColor: theme.colors.glassBorder,
      shadow: theme.shadows.sm,
      backdropFilter: 'blur(16px)',
      accentGradient: 'none',
    },
  };

  const currentVariant =
    variantStyles[variant as keyof typeof variantStyles] ||
    variantStyles.default;

  const appBarStyles: React.CSSProperties = {
    position: position as React.CSSProperties['position'],
    top: position === 'fixed' || position === 'sticky' ? 0 : 'auto',
    left: position === 'fixed' ? 0 : 'auto',
    right: position === 'fixed' ? 0 : 'auto',
    width: '100%',
    height: `${height}px`,
    backgroundColor: currentVariant.backgroundColor,
    borderBottom:
      variant !== 'minimal'
        ? `${theme.borders.width.thin}px solid ${currentVariant.borderColor}`
        : 'none',
    boxShadow: currentVariant.shadow,
    backdropFilter: currentVariant.backdropFilter,
    WebkitBackdropFilter: currentVariant.backdropFilter,
    zIndex:
      position === 'fixed' ? 1000 : position === 'sticky' ? 100 : 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing.lg}px`,
    gap: theme.spacing.md,
    fontFamily: theme.typography.fontFamilyBody,
    ...style,
  };

  const titleColor =
    variant === 'prominent'
      ? theme.colors.primaryForeground
      : theme.colors.foreground;
  const subtitleColor =
    variant === 'prominent'
      ? `${theme.colors.primaryForeground}cc`
      : theme.colors.mutedForeground;

  const AppBarActionComponent: React.FC<{
    action: AppBarAction;
  }> = ({ action }) => {
    const isHovered = hoveredAction === action.id;

    const actionStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.borders.radius.md,
      border: 'none',
      backgroundColor: 'transparent',
      color:
        variant === 'prominent'
          ? theme.colors.primaryForeground
          : theme.colors.foreground,
      cursor: action.disabled ? 'not-allowed' : 'pointer',
      opacity: action.disabled ? 0.5 : 1,
      position: 'relative',
      textDecoration: 'none',
      outline: 'none',
    };

    const content = (
      <>
        {action.icon}
        <AnimatePresence>
          {action.badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={springConfig.bouncy}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: theme.colors.destructive,
                color: theme.colors.destructiveForeground,
                fontSize: theme.typography.fontSize.xs,
                padding: '2px 5px',
                borderRadius: theme.borders.radius.full,
                minWidth: 18,
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              {action.badge}
            </motion.span>
          )}
        </AnimatePresence>
      </>
    );

    const MotionWrapper = action.href ? motion.a : motion.button;

    return (
      <MotionWrapper
        {...(action.href ? { href: action.href } : { type: 'button' })}
        style={actionStyles}
        onClick={(e: React.MouseEvent) => {
          if (action.href) e.preventDefault();
          handleActionClick(action);
        }}
        disabled={action.disabled}
        aria-label={action.label}
        data-testid={testID ? `${testID}-action-${action.id}` : undefined}
        onMouseEnter={() => setHoveredAction(action.id)}
        onMouseLeave={() => setHoveredAction(null)}
        whileHover={
          action.disabled
            ? undefined
            : {
                scale: 1.05,
                backgroundColor:
                  variant === 'prominent'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : theme.colors.muted,
              }
        }
        whileTap={action.disabled ? undefined : { scale: 0.95 }}
        transition={springConfig.snappy}
      >
        {content}
      </MotionWrapper>
    );
  };

  return (
    <motion.header
      style={appBarStyles}
      className={className}
      data-testid={testID}
      aria-label={ariaLabel || accessibilityLabel || 'Application header'}
      aria-describedby={ariaDescribedBy}
      role="banner"
      initial={{ y: -height }}
      animate={{ y: 0 }}
      transition={springConfig.gentle}
      {...props}
    >
      {/* Leading content */}
      {(leading || backAction || logo) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          {backAction && (
            <motion.button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.spacing.sm,
                borderRadius: theme.borders.radius.md,
                border: 'none',
                backgroundColor: 'transparent',
                color: titleColor,
                cursor: 'pointer',
                outline: 'none',
              }}
              onClick={handleBackClick}
              aria-label={backAction.label || 'Go back'}
              type="button"
              whileHover={{
                scale: 1.05,
                backgroundColor:
                  variant === 'prominent'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : theme.colors.muted,
              }}
              whileTap={{ scale: 0.95, x: -2 }}
              transition={springConfig.snappy}
            >
              {backAction.icon || <ArrowLeft size={20} />}
            </motion.button>
          )}
          {logo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springConfig.gentle, delay: 0.1 }}
            >
              {logo}
            </motion.div>
          )}
          {leading}
        </div>
      )}

      {/* Title section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {(children || title || subtitle) && (
          <motion.div
            style={{
              cursor: onTitleClick ? 'pointer' : 'default',
            }}
            onClick={onTitleClick ? handleTitleClick : undefined}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springConfig.gentle, delay: 0.05 }}
            whileHover={onTitleClick ? { x: 2 } : undefined}
          >
            {children || (
              <>
                {title && (
                  <h1
                    style={{
                      margin: 0,
                      fontSize:
                        variant === 'prominent'
                          ? theme.typography.fontSize.xl
                          : theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: titleColor,
                      fontFamily: theme.typography.fontFamilyDisplay,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: theme.typography.letterSpacing.tight,
                    }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.sm,
                      color: subtitleColor,
                      fontFamily: theme.typography.fontFamilyBody,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Trailing content and actions */}
      {(trailing || actions.length > 0) && (
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {trailing}
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springConfig.gentle, delay: 0.05 * index }}
            >
              <AppBarActionComponent action={action} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Gradient accent line for prominent variant */}
      {variant === 'prominent' && currentVariant.accentGradient !== 'none' && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: theme.gradients.accent,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </motion.header>
  );
};
