import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { LabelProps } from './types';

/**
 * Label Component (Web)
 *
 * Renders an accessible label for form elements with theme integration.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email Address</Label>
 * <Input id="email" type="email" />
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({
    children,
    htmlFor,
    required,
    size = 'md',
    disabled = false,
    className,
    style,
    testID,
    accessibilityLabel,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const { theme } = useTheme();

    const sizeStyles = {
      sm: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.tight,
      },
      md: {
        fontSize: theme.typography.fontSize.base,
        lineHeight: theme.typography.lineHeight.normal,
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
        lineHeight: theme.typography.lineHeight.relaxed,
      },
    };

    const currentSize = sizeStyles[size];

    const labelStyles = {
      fontSize: currentSize.fontSize,
      lineHeight: currentSize.lineHeight,
      fontWeight: theme.typography.fontWeight.medium,
      fontFamily: theme.typography.fontFamily,
      color: disabled ? theme.colors.mutedForeground : theme.colors.foreground,
      cursor: disabled ? 'not-allowed' : 'default',
      opacity: disabled ? 0.7 : 1,
      display: 'inline-block',
      marginBottom: theme.spacing.xs,
      ...style,
    };

    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        style={labelStyles}
        className={className}
        data-testid={testID}
        aria-label={ariaLabel || accessibilityLabel}
        aria-disabled={disabled}
        {...props}
      >
        {children}
        {required && (
          <span
            style={{
              marginLeft: theme.spacing.xs,
              color: theme.colors.destructive,
              fontWeight: theme.typography.fontWeight.bold,
            }}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
