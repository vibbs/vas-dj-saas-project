import React from 'react';
import { DividerProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  color,
  margin = 16,
  length = '100%',
  className,
  testID,
  // Accessibility props
  'aria-orientation': ariaOrientation,
  role = 'separator',
  style,
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  ...props
}) => {
  const { theme } = useTheme();

  const borderColor = color || theme.colors.border;

  const baseStyles: React.CSSProperties = {
    border: 'none',
    backgroundColor: 'transparent',
    ...(orientation === 'horizontal' ? {
      width: length,
      height: thickness,
      borderTop: `${thickness}px ${variant} ${borderColor}`,
      marginTop: margin,
      marginBottom: margin,
    } : {
      width: thickness,
      height: length,
      borderLeft: `${thickness}px ${variant} ${borderColor}`,
      marginLeft: margin,
      marginRight: margin,
      display: 'inline-block',
      verticalAlign: 'top',
    }),
  };

  return (
    <div
      style={{...baseStyles, ...style}}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role}
      aria-orientation={ariaOrientation || orientation}
      {...props}
    />
  );
};