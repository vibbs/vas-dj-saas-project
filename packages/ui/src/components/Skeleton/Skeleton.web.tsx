import React from 'react';
import { SkeletonProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = variant === 'text' ? '1em' : 40,
  lines = 1,
  animation = 'pulse',
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-busy': ariaBusy = true,
  role = 'progressbar',
  ...props
}) => {
  const { theme } = useTheme();

  // Add CSS for animations
  React.useEffect(() => {
    const styleId = 'skeleton-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes skeleton-wave {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-wave-container {
          overflow: hidden;
          position: relative;
        }
        .skeleton-wave-animation {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: skeleton-wave 1.6s linear 0.5s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getBaseStyles = (): React.CSSProperties => ({
    backgroundColor: theme.colors.muted,
    borderRadius: variant === 'circular' ? '50%' : 
                  variant === 'rounded' ? theme.borders.radius.md : 
                  variant === 'text' ? theme.borders.radius.sm : 
                  theme.borders.radius.sm,
    display: 'block',
    width: typeof width === 'string' ? width : `${width}px`,
    height: typeof height === 'string' ? height : `${height}px`,
    position: 'relative',
    animation: animation === 'pulse' ? 'skeleton-pulse 1.5s ease-in-out infinite' : 'none',
  });

  const getTextLineStyles = (lineIndex: number): React.CSSProperties => {
    // Vary the width of text lines for more realistic appearance
    let lineWidth = '100%';
    if (lines > 1) {
      if (lineIndex === lines - 1) {
        lineWidth = '60%'; // Last line is shorter
      } else if (lineIndex === 0) {
        lineWidth = '90%'; // First line is slightly shorter
      }
    }

    return {
      ...getBaseStyles(),
      width: lineWidth,
      height: '1em',
      marginBottom: lineIndex < lines - 1 ? theme.spacing.xs : 0,
    };
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div
        data-testid={testID}
        className={`${animation === 'wave' ? 'skeleton-wave-container' : ''} ${className || ''}`}
        // Accessibility attributes
        role={role}
        aria-label={ariaLabel || accessibilityLabel || 'Loading content'}
        aria-describedby={ariaDescribedBy}
        aria-busy={ariaBusy}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            style={getTextLineStyles(index)}
          >
            {animation === 'wave' && <div className="skeleton-wave-animation" />}
          </div>
        ))}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      style={getBaseStyles()}
      className={`${animation === 'wave' ? 'skeleton-wave-container' : ''} ${className || ''}`}
      data-testid={testID}
      // Accessibility attributes
      role={role}
      aria-label={ariaLabel || accessibilityLabel || 'Loading content'}
      aria-describedby={ariaDescribedBy}
      aria-busy={ariaBusy}
      {...props}
    >
      {animation === 'wave' && <div className="skeleton-wave-animation" />}
    </div>
  );
};