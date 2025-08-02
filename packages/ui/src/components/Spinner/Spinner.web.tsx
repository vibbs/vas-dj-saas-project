import React from 'react';
import { SpinnerProps } from './types';

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  style,
  ...props
}) => {

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      width: '16px',
      height: '16px',
      borderWidth: '2px',
    },
    md: {
      width: '24px',
      height: '24px',
      borderWidth: '3px',
    },
    lg: {
      width: '32px',
      height: '32px',
      borderWidth: '4px',
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-block',
    border: `${sizeStyles[size].borderWidth} solid ${color || 'currentColor'}`,
    borderTop: `${sizeStyles[size].borderWidth} solid transparent`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...sizeStyles[size],
    ...style,
  };

  // Add spin animation styles to document if not already present
  React.useEffect(() => {
    const styleId = 'spinner-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      style={baseStyles}
      className={className}
      data-testid={testID}
      role="status"
      aria-label={ariaLabel || accessibilityLabel || 'Loading'}
      aria-describedby={ariaDescribedBy}
      aria-live="polite"
      aria-busy="true"
      {...props}
    />
  );
};