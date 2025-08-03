import React from 'react';
import { AppBarProps, AppBarAction } from './types';
import { useTheme } from '../../theme/ThemeProvider';
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

  const handleActionClick = (action: AppBarAction) => {
    if (!action.disabled) {
      onActionClick?.(action);
    }
  };

  const handleBackClick = () => {
    if (backAction && !backAction.onClick) {
      // Default back behavior
      window.history.back();
    } else {
      backAction?.onClick?.();
    }
  };

  const handleTitleClick = () => {
    onTitleClick?.();
  };

  const variantStyles = {
    default: {
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
      borderColor: theme.colors.border,
      shadow: transparent ? 'none' : `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      shadow: 'none',
    },
    prominent: {
      backgroundColor: transparent ? 'transparent' : theme.colors.primary,
      borderColor: theme.colors.primary,
      shadow: transparent ? 'none' : `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.15)`,
    },
  };

  const currentVariant = variantStyles[variant];

  const appBarStyles = {
    position: position as any,
    top: position === 'fixed' || position === 'sticky' ? 0 : 'auto',
    left: position === 'fixed' ? 0 : 'auto',
    right: position === 'fixed' ? 0 : 'auto',
    width: '100%',
    height: `${height}px`,
    backgroundColor: currentVariant.backgroundColor,
    borderBottom: variant !== 'minimal' ? `1px solid ${currentVariant.borderColor}` : 'none',
    boxShadow: currentVariant.shadow,
    zIndex: position === 'fixed' ? 1000 : 'auto',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing.md}px`,
    gap: theme.spacing.md,
    ...style,
  };

  const titleColor = variant === 'prominent' ? theme.colors.primaryForeground : theme.colors.foreground;
  const subtitleColor = variant === 'prominent' ? theme.colors.primaryForeground : theme.colors.mutedForeground;

  const AppBarActionComponent: React.FC<{
    action: AppBarAction;
  }> = ({ action }) => {
    const actionStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      borderRadius: theme.borders.radius.sm,
      border: 'none',
      backgroundColor: 'transparent',
      color: variant === 'prominent' ? theme.colors.primaryForeground : theme.colors.foreground,
      cursor: action.disabled ? 'not-allowed' : 'pointer',
      opacity: action.disabled ? 0.5 : 1,
      transition: 'all 0.2s ease-in-out',
      position: 'relative' as const,
      textDecoration: 'none',
    };

    const hoverStyles = !action.disabled ? {
      ':hover': {
        backgroundColor: variant === 'prominent' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : `${theme.colors.foreground}10`,
      },
    } : {};

    const content = (
      <>
        {action.icon}
        {action.badge && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: theme.colors.destructive,
              color: theme.colors.destructiveForeground,
              fontSize: theme.typography.fontSize.xs,
              padding: '2px 4px',
              borderRadius: theme.borders.radius.full,
              minWidth: 16,
              height: 16,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {action.badge}
          </span>
        )}
      </>
    );

    if (action.href) {
      return (
        <a
          href={action.href}
          style={{...actionStyles, ...hoverStyles}}
          onClick={(e) => {
            e.preventDefault();
            handleActionClick(action);
          }}
          aria-label={action.label}
          data-testid={testID ? `${testID}-action-${action.id}` : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        style={{...actionStyles, ...hoverStyles}}
        onClick={() => handleActionClick(action)}
        disabled={action.disabled}
        aria-label={action.label}
        data-testid={testID ? `${testID}-action-${action.id}` : undefined}
        type="button"
      >
        {content}
      </button>
    );
  };

  return (
    <header
      style={appBarStyles}
      className={className}
      data-testid={testID}
      aria-label={ariaLabel || accessibilityLabel || 'Application header'}
      aria-describedby={ariaDescribedBy}
      role="banner"
      {...props}
    >
      {/* Leading content */}
      {leading || backAction || logo ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          {backAction && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.spacing.sm,
                borderRadius: theme.borders.radius.sm,
                border: 'none',
                backgroundColor: 'transparent',
                color: titleColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={handleBackClick}
              aria-label={backAction.label || 'Go back'}
              type="button"
            >
              {backAction.icon || <ArrowLeft size={20} />}
            </button>
          )}
          {logo}
          {leading}
        </div>
      ) : null}

      {/* Title section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children || (title || subtitle) ? (
          <div
            style={{
              cursor: onTitleClick ? 'pointer' : 'default',
            }}
            onClick={onTitleClick ? handleTitleClick : undefined}
          >
            {children || (
              <>
                {title && (
                  <h1
                    style={{
                      margin: 0,
                      fontSize: variant === 'prominent' ? theme.typography.fontSize.xl : theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: titleColor,
                      fontFamily: theme.typography.fontFamily,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
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
                      fontFamily: theme.typography.fontFamily,
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
          </div>
        ) : null}
      </div>

      {/* Trailing content and actions */}
      {(trailing || actions.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          {trailing}
          {actions.map((action) => (
            <AppBarActionComponent key={action.id} action={action} />
          ))}
        </div>
      )}
    </header>
  );
};