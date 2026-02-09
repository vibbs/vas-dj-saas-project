import React, { useState, useRef, useEffect } from 'react';
import { TooltipProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  visible: controlledVisible,
  delay = 200,
  offset = 8,
  disabled = false,
  arrow = true,
  className,
  testID,
  style,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'tooltip',
  ...props
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(controlledVisible || false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = controlledVisible !== undefined;
  const shouldShow = isControlled ? controlledVisible : isVisible;

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - offset;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'top-start':
        top = triggerRect.top + scrollY - tooltipRect.height - offset;
        left = triggerRect.left + scrollX;
        break;
      case 'top-end':
        top = triggerRect.top + scrollY - tooltipRect.height - offset;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom-start':
        top = triggerRect.bottom + scrollY + offset;
        left = triggerRect.left + scrollX;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + scrollY + offset;
        left = triggerRect.right + scrollX - tooltipRect.width;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + offset;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 0) left = theme.spacing.sm;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - theme.spacing.sm;
    if (top < 0) top = theme.spacing.sm;
    if (top + tooltipRect.height > viewportHeight + scrollY) top = viewportHeight + scrollY - tooltipRect.height - theme.spacing.sm;

    setPosition({ top, left });
  };

  // Show tooltip with delay
  const showTooltip = () => {
    if (disabled || isControlled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (disabled || isControlled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(false);
  };

  // Toggle tooltip for click trigger
  const toggleTooltip = () => {
    if (disabled || isControlled) return;
    
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Handle trigger events
  const getTriggerProps = () => {
    const props: any = {};

    if (trigger === 'hover') {
      props.onMouseEnter = showTooltip;
      props.onMouseLeave = hideTooltip;
    } else if (trigger === 'focus') {
      props.onFocus = showTooltip;
      props.onBlur = hideTooltip;
    } else if (trigger === 'click') {
      props.onClick = toggleTooltip;
    }

    return props;
  };

  // Update position when visible
  useEffect(() => {
    if (shouldShow) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [shouldShow, placement, content]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Add CSS for animations
  React.useEffect(() => {
    const styleId = 'tooltip-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes tooltip-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes tooltip-fade-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const tooltipStyles = {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    zIndex: 10000,
    backgroundColor: theme.colors.foreground,
    color: theme.colors.background,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.borders.radius.sm,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.normal,
    fontFamily: theme.typography.fontFamily,
    maxWidth: '200px',
    wordWrap: 'break-word' as const,
    boxShadow: theme.shadows.md,
    animation: shouldShow ? 'tooltip-fade-in 0.2s ease-out' : 'tooltip-fade-out 0.2s ease-out',
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? 'scale(1)' : 'scale(0.95)',
    transition: 'opacity 0.2s, transform 0.2s',
    pointerEvents: 'none' as const,
  };

  // Arrow styles
  const getArrowStyles = () => {
    const arrowSize = 6;
    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      border: `${arrowSize}px solid transparent`,
    };

    if (placement.startsWith('top')) {
      arrowStyles.bottom = -arrowSize * 2;
      arrowStyles.left = '50%';
      arrowStyles.transform = 'translateX(-50%)';
      arrowStyles.borderTopColor = theme.colors.foreground;
      arrowStyles.borderBottomWidth = 0;
    } else if (placement.startsWith('bottom')) {
      arrowStyles.top = -arrowSize * 2;
      arrowStyles.left = '50%';
      arrowStyles.transform = 'translateX(-50%)';
      arrowStyles.borderBottomColor = theme.colors.foreground;
      arrowStyles.borderTopWidth = 0;
    } else if (placement === 'left') {
      arrowStyles.right = -arrowSize * 2;
      arrowStyles.top = '50%';
      arrowStyles.transform = 'translateY(-50%)';
      arrowStyles.borderLeftColor = theme.colors.foreground;
      arrowStyles.borderRightWidth = 0;
    } else if (placement === 'right') {
      arrowStyles.left = -arrowSize * 2;
      arrowStyles.top = '50%';
      arrowStyles.transform = 'translateY(-50%)';
      arrowStyles.borderRightColor = theme.colors.foreground;
      arrowStyles.borderLeftWidth = 0;
    }

    return arrowStyles;
  };

  return (
    <>
      <div
        ref={triggerRef}
        style={{ display: 'inline-block', cursor: trigger === 'click' ? 'pointer' : 'default' }}
        {...getTriggerProps()}
        data-testid={testID}
        aria-describedby={shouldShow ? 'tooltip-content' : undefined}
        {...props}
      >
        {children}
      </div>
      
      {shouldShow && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          style={{...tooltipStyles, ...style}}
          className={className}
          // Accessibility attributes (WCAG 2.1 AA compliant)
          role={role}
          aria-label={ariaLabel || accessibilityLabel}
          aria-describedby={ariaDescribedBy}
        >
          {content}
          {arrow && <div style={getArrowStyles()} />}
        </div>
      )}
    </>
  );
};