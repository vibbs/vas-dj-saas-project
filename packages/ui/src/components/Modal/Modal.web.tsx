import React from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Spinner } from '../Spinner';
import { Card } from '../Card';
import { Button } from '../Button';

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  variant = 'default',
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  showDivider = false,
  animationType = 'fade',
  loading = false,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  'aria-modal': ariaModal = true,
  role = 'dialog',
  initialFocusRef,
  finalFocusRef,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const lastActiveElement = React.useRef<HTMLElement | null>(null);

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      lastActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal or specified element
      setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else if (lastActiveElement.current) {
      // Return focus to the previously focused element
      setTimeout(() => {
        if (finalFocusRef?.current) {
          finalFocusRef.current.focus();
        } else if (lastActiveElement.current) {
          lastActiveElement.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialFocusRef, finalFocusRef]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Add CSS for modal divider styling
  React.useEffect(() => {
    const styleId = 'modal-divider-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .modal-content--with-divider > div:last-child[style*="marginTop: auto"] {
          border-top: 1px solid ${theme.colors.border} !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [theme.colors.border]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          modal: {
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
          },
          backdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
          },
          cardProps: {
            style: {
              borderRadius: 0,
              height: '100%',
            }
          }
        };
      case 'bottom-sheet':
        return {
          modal: {
            position: 'fixed' as const,
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 'none',
            transform: 'translateY(0)',
          },
          backdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          cardProps: {
            style: {
              borderRadius: `${theme.borders.radius.lg}px ${theme.borders.radius.lg}px 0 0`,
            }
          }
        };
      case 'dialog':
        return {
          modal: {},
          backdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          cardProps: {
            variant: 'elevated' as const,
            style: {
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
          }
        };
      default:
        return {
          modal: {},
          backdrop: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          cardProps: {
            variant: 'elevated' as const,
          }
        };
    }
  };

  const getSizeStyles = () => {
    if (variant === 'fullscreen' || variant === 'bottom-sheet') {
      return {};
    }

    switch (size) {
      case 'sm':
        return { width: '400px', maxWidth: '85vw', minHeight: '200px' };
      case 'md':
        return { width: '500px', maxWidth: '90vw', minHeight: '250px' };
      case 'lg':
        return { width: '700px', maxWidth: '90vw', minHeight: '300px' };
      case 'xl':
        return { width: '900px', maxWidth: '95vw', minHeight: '350px' };
      default:
        return { width: '500px', maxWidth: '90vw', minHeight: '250px' };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: variant === 'bottom-sheet' ? 'flex-end' : 'center',
    justifyContent: 'center',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: animationType === 'fade' ? 'opacity 0.2s ease-in-out' : undefined,
    ...variantStyles.backdrop,
  };

  const modalStyles: React.CSSProperties = {
    position: 'relative',
    maxHeight: variant === 'bottom-sheet' ? '80vh' : '90vh',
    outline: 'none',
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    transition: animationType === 'fade' ? 'transform 0.2s ease-in-out' : undefined,
    display: 'flex',
    flexDirection: 'column',
    ...sizeStyles,
    ...variantStyles.modal,
    ...style,
  };

  const modalContentStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    ...(variant === 'fullscreen' ? {
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'left' as const,
    } : {}),
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={backdropRef}
      style={backdropStyles}
      onClick={handleBackdropClick}
      data-testid={testID}
    >
      <Card
        ref={modalRef}
        {...variantStyles.cardProps}
        style={{
          ...modalStyles,
          ...variantStyles.cardProps?.style,
        }}
        className={className}
        // Accessibility attributes (WCAG 2.1 AA compliant)
        role={role}
        aria-modal={ariaModal}
        aria-label={ariaLabel || accessibilityLabel}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        loading={loading}
        {...props}
      >
        {showCloseButton && (
          <Button
            variant="secondary"
            size="sm"
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
              width: '32px',
              height: '32px',
              minHeight: '32px',
              padding: '0',
              border: 'none',
              background: 'transparent',
              color: theme.colors.mutedForeground,
              zIndex: 2,
            }}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </Button>
        )}

        <div 
          style={modalContentStyles}
          data-show-divider={showDivider}
          className={`modal-content ${showDivider ? 'modal-content--with-divider' : ''}`}
        >
          {children}
        </div>
      </Card>
    </div>
  );

  // Render modal in a portal
  return createPortal(modalContent, document.body);
};