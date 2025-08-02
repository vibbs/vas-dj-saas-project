import React from 'react';
import { ListProps, ListItemProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const List: React.FC<ListProps> = ({
  children,
  type = 'unordered',
  variant = 'default',
  size = 'base',
  marker,
  indent = true,
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles for spacing
  const variantStyles = {
    default: {
      marginTop: 0,
      marginBottom: theme.spacing.md,
      lineHeight: theme.typography.lineHeight.relaxed,
    },
    compact: {
      marginTop: 0,
      marginBottom: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.normal,
    },
    spacious: {
      marginTop: 0,
      marginBottom: theme.spacing.lg,
      lineHeight: theme.typography.lineHeight.loose,
    },
  };

  // Define size styles
  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
    },
    base: {
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
    },
  };

  // Define marker styles
  const getListStyleType = () => {
    if (marker) return marker;
    if (type === 'ordered') return 'decimal';
    if (type === 'unordered') return 'disc';
    return 'none';
  };

  const baseStyles = {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
    paddingLeft: indent ? theme.spacing.lg : 0,
    listStyleType: getListStyleType(),
    listStylePosition: 'outside' as const,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const ListElement = type === 'ordered' ? 'ol' : 'ul';

  return (
    <ListElement
      style={{...baseStyles, ...style}}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      role={role || 'list'}
      {...props}
    >
      {children}
    </ListElement>
  );
};

export const ListItem: React.FC<ListItemProps> = ({
  children,
  value,
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = {
    marginBottom: theme.spacing.xs,
    lineHeight: 'inherit',
  };

  return (
    <li
      style={{...baseStyles, ...style}}
      className={className}
      data-testid={testID}
      value={value}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      role={role || 'listitem'}
      {...props}
    >
      {children}
    </li>
  );
};