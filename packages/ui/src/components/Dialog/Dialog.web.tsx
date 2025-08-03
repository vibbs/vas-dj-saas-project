import React, { useEffect, useRef } from 'react';
import { DialogProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Dialog: React.FC<DialogProps> = ({
  children,
  isOpen = false,
  onClose,
  title,
  description,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = 'md',
  position = 'center',
  animationDuration = 300,
  backdrop = 'blur',
  className,
  style,
  contentStyle,
  overlayStyle,
  testID,
  // Accessibility props
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-modal': ariaModal = true,
  role = 'dialog',
  // Filter out React Native specific props
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityViewIsModal,
  ...props
}) => {
  const { theme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      // Focus the dialog after it's rendered
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Return focus to the last active element
      if (lastActiveElement.current) {
        lastActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        event.preventDefault();
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Add CSS animations
  useEffect(() => {
    const styleId = 'dialog-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes dialogSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes dialogSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .dialog-content {
          animation: dialogSlideIn ${animationDuration}ms ease-out;
        }
        
        .dialog-overlay {
          animation: overlayFadeIn ${animationDuration}ms ease-out;
        }
        
        .dialog-content:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, [animationDuration]);

  if (!isOpen) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px', width: '90%' };
      case 'md':
        return { maxWidth: '500px', width: '90%' };
      case 'lg':
        return { maxWidth: '700px', width: '90%' };
      case 'xl':
        return { maxWidth: '900px', width: '90%' };
      case 'full':
        return { width: '95%', height: '95%', maxWidth: 'none', maxHeight: 'none' };
      default:
        return { maxWidth: '500px', width: '90%' };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return { alignItems: 'flex-start', paddingTop: '10vh' };
      case 'bottom':
        return { alignItems: 'flex-end', paddingBottom: '10vh' };
      default:
        return { alignItems: 'center' };
    }
  };

  const getBackdropStyles = () => {
    const baseStyle = {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    };

    switch (backdrop) {
      case 'blur':
        return { ...baseStyle, backdropFilter: 'blur(4px)' };
      case 'dark':
        return { ...baseStyle, backgroundColor: 'rgba(0, 0, 0, 0.8)' };
      case 'light':
        return { ...baseStyle, backgroundColor: 'rgba(0, 0, 0, 0.3)' };
      case 'none':
        return { backgroundColor: 'transparent' };
      default:
        return baseStyle;
    }
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 9999,
    ...getBackdropStyles(),
    ...getPositionStyles(),
    ...overlayStyle,
  };

  const dialogStyles: React.CSSProperties = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borders.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.lg,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    ...getSizeStyles(),
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    padding: `${theme.spacing.lg}px ${theme.spacing.lg}px ${theme.spacing.md}px`,
    borderBottom: title || description ? `1px solid ${theme.colors.border}` : 'none',
  };

  const contentStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    ...contentStyle,
  };

  const closeButtonStyles: React.CSSProperties = {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: theme.colors.mutedForeground,
    padding: theme.spacing.xs,
    borderRadius: theme.borders.radius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  };

  const titleId = `dialog-title-${Date.now()}`;
  const descriptionId = `dialog-description-${Date.now()}`;

  return (
    <div
      style={overlayStyles}
      className="dialog-overlay"
      onClick={closeOnBackdropClick ? onClose : undefined}
      data-testid={testID ? `${testID}-overlay` : undefined}
    >
      <div
        ref={dialogRef}
        style={dialogStyles}
        className={`dialog-content ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
        data-testid={testID}
        // Accessibility attributes (WCAG 2.1 AA compliant)
        role={role}
        aria-modal={ariaModal}
        aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
        aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
        tabIndex={-1}
        {...props}
      >
        {showCloseButton && (
          <button
            style={closeButtonStyles}
            onClick={onClose}
            aria-label="Close dialog"
            data-testid={testID ? `${testID}-close` : undefined}
          >
            ×
          </button>
        )}

        {(title || description) && (
          <div style={headerStyles}>
            {title && (
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.foreground,
                  marginBottom: description ? theme.spacing.xs : 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descriptionId}
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.mutedForeground,
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};