import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { SeparatorProps } from './types';

/**
 * Separator Component (Web)
 *
 * Visually or semantically separates content with theme integration.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({
    className,
    orientation = 'horizontal',
    decorative = true,
    thickness,
    variant = 'default',
    style,
    testID,
    accessibilityLabel,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const { theme } = useTheme();

    const variantColors = {
      default: theme.colors.border,
      muted: theme.colors.muted,
    };

    const separatorStyles = {
      flexShrink: 0,
      backgroundColor: variantColors[variant],
      border: 'none',
      ...(orientation === 'horizontal' ? {
        height: thickness || 1,
        width: '100%',
      } : {
        width: thickness || 1,
        height: '100%',
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        aria-label={ariaLabel || accessibilityLabel}
        style={separatorStyles}
        className={className}
        data-testid={testID}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';
