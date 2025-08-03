import React from 'react';
import { EmptyStateProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const EmptyState: React.FC<EmptyStateProps> = ({
  children,
  title = 'No data available',
  description,
  icon,
  image,
  action,
  size = 'md',
  variant = 'default',
  className,
  style,
  titleStyle,
  descriptionStyle,
  testID,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'region',
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.lg}px ${theme.spacing.md}px`,
          iconSize: '32px',
          titleSize: theme.typography.fontSize.lg,
          descriptionSize: theme.typography.fontSize.sm,
          gap: theme.spacing.sm,
        };
      case 'md':
        return {
          padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
          iconSize: '48px',
          titleSize: theme.typography.fontSize.xl,
          descriptionSize: theme.typography.fontSize.base,
          gap: theme.spacing.md,
        };
      case 'lg':
        return {
          padding: `${theme.spacing.xxl}px ${theme.spacing.xl}px`,
          iconSize: '64px',
          titleSize: theme.typography.fontSize['2xl'],
          descriptionSize: theme.typography.fontSize.lg,
          gap: theme.spacing.lg,
        };
      default:
        return {
          padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
          iconSize: '48px',
          titleSize: theme.typography.fontSize.xl,
          descriptionSize: theme.typography.fontSize.base,
          gap: theme.spacing.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: sizeStyles.padding,
    minHeight: variant === 'minimal' ? 'auto' : '200px',
    backgroundColor: variant === 'illustration' ? theme.colors.muted : 'transparent',
    borderRadius: variant === 'illustration' ? theme.borders.radius.lg : 0,
    border: variant === 'illustration' ? `1px solid ${theme.colors.border}` : 'none',
    ...style,
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeStyles.iconSize,
    height: sizeStyles.iconSize,
    marginBottom: sizeStyles.gap,
    color: theme.colors.mutedForeground,
    fontSize: sizeStyles.iconSize,
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizeStyles.titleSize,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    marginBottom: description ? theme.spacing.xs : sizeStyles.gap,
    ...titleStyle,
  };

  const descriptionStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizeStyles.descriptionSize,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: 1.5,
    maxWidth: '400px',
    marginBottom: action ? sizeStyles.gap : 0,
    ...descriptionStyle,
  };

  const actionContainerStyles: React.CSSProperties = {
    marginTop: sizeStyles.gap,
  };

  const defaultIcon = (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: theme.colors.muted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${parseInt(sizeStyles.iconSize) * 0.4}px`,
    }}>
      📭
    </div>
  );

  return (
    <div
      style={containerStyles}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {/* Custom children override everything */}
      {children ? (
        children
      ) : (
        <>
          {/* Icon or Image */}
          {(icon || image || variant !== 'minimal') && (
            <div style={iconContainerStyles}>
              {image || icon || defaultIcon}
            </div>
          )}

          {/* Title */}
          {title && (
            <h2 style={titleStyles}>
              {title}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p style={descriptionStyles}>
              {description}
            </p>
          )}

          {/* Action */}
          {action && (
            <div style={actionContainerStyles}>
              {action}
            </div>
          )}
        </>
      )}
    </div>
  );
};