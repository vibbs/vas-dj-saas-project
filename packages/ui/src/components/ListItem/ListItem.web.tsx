import React from 'react';
import { ListItemProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const ListItem: React.FC<ListItemProps> = ({
  children,
  title,
  subtitle,
  description,
  leading,
  trailing,
  avatar,
  selected = false,
  disabled = false,
  divider = false,
  dense = false,
  multiline = false,
  onClick,
  onLongPress,
  className,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  testID,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-selected': ariaSelected,
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

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: dense 
      ? `${theme.spacing.xs}px ${theme.spacing.md}px`
      : `${theme.spacing.sm}px ${theme.spacing.md}px`,
    backgroundColor: selected ? theme.colors.accent : 'transparent',
    borderBottom: divider ? `1px solid ${theme.colors.border}` : 'none',
    cursor: onClick || onLongPress ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    minHeight: dense ? '40px' : multiline ? 'auto' : '56px',
    ...style,
  };

  const leadingStyles: React.CSSProperties = {
    marginRight: theme.spacing.md,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0, // Allow text to truncate
    ...contentStyle,
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    lineHeight: 1.5,
    ...titleStyle,
  };

  const subtitleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight: 1.4,
    marginTop: theme.spacing.xs / 2,
    ...subtitleStyle,
  };

  const descriptionStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight: 1.4,
    marginTop: theme.spacing.xs,
    whiteSpace: multiline ? 'normal' : 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const trailingStyles: React.CSSProperties = {
    marginLeft: theme.spacing.md,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.(e as any);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onLongPress && !disabled) {
      e.preventDefault();
      onLongPress();
    }
  };

  return (
    <div
      style={containerStyles}
      className={className}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role || (onClick ? 'button' : 'listitem')}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-selected={ariaSelected !== undefined ? ariaSelected : selected}
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
        if (!disabled && (onClick || onLongPress)) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 
            selected ? theme.colors.accent : theme.colors.muted;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 
            selected ? theme.colors.accent : 'transparent';
        }
      }}
      {...props}
    >
      {/* Leading content (avatar or icon) */}
      {(leading || avatar) && (
        <div style={leadingStyles}>
          {avatar || leading}
        </div>
      )}

      {/* Main content */}
      <div style={contentStyles}>
        {/* Custom children override everything */}
        {children ? (
          children
        ) : (
          <>
            {/* Title */}
            {title && (
              <h3 style={titleStyles}>
                {title}
              </h3>
            )}
            
            {/* Subtitle */}
            {subtitle && (
              <p style={subtitleStyles}>
                {subtitle}
              </p>
            )}
            
            {/* Description */}
            {description && (
              <p style={descriptionStyles}>
                {description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Trailing content */}
      {trailing && (
        <div style={trailingStyles}>
          {trailing}
        </div>
      )}
    </div>
  );
};