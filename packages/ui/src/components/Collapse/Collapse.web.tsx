import React, { useState, useRef, useEffect } from 'react';
import { CollapseProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Collapse: React.FC<CollapseProps> = ({
  children,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onToggle,
  trigger,
  triggerWhenClosed,
  triggerWhenOpen,
  animationDuration = 300,
  disabled = false,
  className,
  style,
  contentStyle,
  triggerStyle,
  testID,
  // Accessibility props
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-labelledby': ariaLabelledBy,
  role = 'button',
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(newState);
    }
    onToggle?.(newState);
  };

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      
      if (isOpen) {
        setHeight(contentHeight);
        // Set to auto after animation completes
        const timer = setTimeout(() => {
          setHeight('auto');
        }, animationDuration);
        return () => clearTimeout(timer);
      } else {
        // First set to actual height, then to 0 for smooth transition
        setHeight(contentHeight);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [isOpen, animationDuration, children]);

  // Add CSS animations
  useEffect(() => {
    const styleId = 'collapse-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .collapse-content {
          overflow: hidden;
          transition: height ${animationDuration}ms ease-in-out;
        }
        .collapse-trigger:focus {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }
      `;
      document.head.appendChild(style);
    }
  }, [animationDuration, theme.colors.primary]);

  const triggerBaseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    textAlign: 'left',
    ...triggerStyle,
  };

  const contentBaseStyles: React.CSSProperties = {
    height: height === 'auto' ? 'auto' : `${height}px`,
    ...contentStyle,
  };

  const containerStyles: React.CSSProperties = {
    borderRadius: theme.borders.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    ...style,
  };

  const defaultTrigger = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span>Toggle Content</span>
      <span style={{ 
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: `transform ${animationDuration}ms ease-in-out`,
        fontSize: '14px'
      }}>
        ▼
      </span>
    </div>
  );

  const renderTrigger = () => {
    if (triggerWhenClosed && !isOpen) return triggerWhenClosed;
    if (triggerWhenOpen && isOpen) return triggerWhenOpen;
    return trigger || defaultTrigger;
  };

  return (
    <div style={containerStyles} className={className} data-testid={testID} {...props}>
      <button
        style={triggerBaseStyles}
        onClick={toggle}
        disabled={disabled}
        className="collapse-trigger"
        // Accessibility attributes (WCAG 2.1 AA compliant)
        role={role}
        aria-expanded={ariaExpanded !== undefined ? ariaExpanded : isOpen}
        aria-controls={ariaControls}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        // Keyboard navigation support
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {renderTrigger()}
      </button>
      
      <div
        ref={contentRef}
        style={contentBaseStyles}
        className="collapse-content"
        // Accessibility for content
        role="region"
        aria-hidden={!isOpen}
        id={ariaControls}
      >
        <div style={{ padding: `${theme.spacing.md}px` }}>
          {children}
        </div>
      </div>
    </div>
  );
};