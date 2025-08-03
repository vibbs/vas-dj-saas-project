import React, { useEffect } from 'react';
import { ScrollAreaProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  height = 'auto',
  maxHeight,
  width = '100%',
  maxWidth,
  scrollDirection = 'vertical',
  showScrollbars = true,
  scrollbarSize = 8,
  fadeScrollbars = true,
  onScroll,
  className,
  style,
  contentStyle,
  testID,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'region',
  tabIndex,
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();

  const getOverflowStyle = () => {
    switch (scrollDirection) {
      case 'horizontal':
        return { overflowX: 'auto' as const, overflowY: 'hidden' as const };
      case 'both':
        return { overflowX: 'auto' as const, overflowY: 'auto' as const };
      default:
        return { overflowX: 'hidden' as const, overflowY: 'auto' as const };
    }
  };

  const baseStyles: React.CSSProperties = {
    height: height,
    maxHeight: maxHeight,
    width: width,
    maxWidth: maxWidth,
    borderRadius: theme.borders.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    position: 'relative',
    ...getOverflowStyle(),
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    padding: theme.spacing.sm,
    ...contentStyle,
  };

  // Custom scrollbar styles
  useEffect(() => {
    const styleId = 'scroll-area-styles';
    if (!document.getElementById(styleId) && showScrollbars) {
      const style = document.createElement('style');
      style.id = styleId;
      
      const scrollbarColor = theme.colors.muted;
      const scrollbarHoverColor = theme.colors.mutedForeground;
      
      style.textContent = `
        .scroll-area::-webkit-scrollbar {
          width: ${scrollbarSize}px;
          height: ${scrollbarSize}px;
        }
        
        .scroll-area::-webkit-scrollbar-track {
          background: transparent;
          border-radius: ${scrollbarSize}px;
        }
        
        .scroll-area::-webkit-scrollbar-thumb {
          background: ${scrollbarColor};
          border-radius: ${scrollbarSize}px;
          ${fadeScrollbars ? 'opacity: 0.5;' : ''}
          transition: all 0.2s ease;
        }
        
        .scroll-area::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarHoverColor};
          ${fadeScrollbars ? 'opacity: 0.8;' : ''}
        }
        
        .scroll-area::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        ${!showScrollbars ? `
        .scroll-area::-webkit-scrollbar {
          display: none;
        }
        .scroll-area {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ` : ''}
        
        /* Focus styles for accessibility */
        .scroll-area:focus {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }
      `;
      
      document.head.appendChild(style);
    }
  }, [theme, showScrollbars, scrollbarSize, fadeScrollbars]);

  return (
    <div
      style={baseStyles}
      className={`scroll-area ${className || ''}`}
      onScroll={onScroll}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
      // Keyboard navigation support
      onKeyDown={(e) => {
        const element = e.currentTarget;
        const scrollAmount = 40;
        
        switch (e.key) {
          case 'ArrowDown':
            if (scrollDirection === 'vertical' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollTop += scrollAmount;
            }
            break;
          case 'ArrowUp':
            if (scrollDirection === 'vertical' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollTop -= scrollAmount;
            }
            break;
          case 'ArrowRight':
            if (scrollDirection === 'horizontal' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollLeft += scrollAmount;
            }
            break;
          case 'ArrowLeft':
            if (scrollDirection === 'horizontal' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollLeft -= scrollAmount;
            }
            break;
          case 'Home':
            e.preventDefault();
            if (scrollDirection === 'horizontal' || scrollDirection === 'both') {
              element.scrollLeft = 0;
            } else {
              element.scrollTop = 0;
            }
            break;
          case 'End':
            e.preventDefault();
            if (scrollDirection === 'horizontal' || scrollDirection === 'both') {
              element.scrollLeft = element.scrollWidth;
            } else {
              element.scrollTop = element.scrollHeight;
            }
            break;
          case 'PageDown':
            if (scrollDirection === 'vertical' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollTop += element.clientHeight;
            }
            break;
          case 'PageUp':
            if (scrollDirection === 'vertical' || scrollDirection === 'both') {
              e.preventDefault();
              element.scrollTop -= element.clientHeight;
            }
            break;
        }
      }}
      {...props}
    >
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
};