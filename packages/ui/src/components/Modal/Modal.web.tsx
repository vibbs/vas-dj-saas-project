import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Spinner } from '../Spinner';
import { Button } from '../Button';
import {
  springConfig,
  modalBackdrop,
  modalContent,
  bottomSheet,
  scaleIn,
} from '../../animations';

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
      lastActiveElement.current = document.activeElement as HTMLElement;

      setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else if (lastActiveElement.current) {
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
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

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

  const getVariantConfig = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          modalStyle: {
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            borderRadius: 0,
          },
          backdropStyle: {
            backgroundColor: theme.colors.overlayDark,
          },
          animation: scaleIn,
        };
      case 'bottom-sheet':
        return {
          modalStyle: {
            position: 'fixed' as const,
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 'none',
            borderRadius: `${theme.borders.radius.xl}px ${theme.borders.radius.xl}px 0 0`,
          },
          backdropStyle: {
            backgroundColor: theme.colors.overlay,
            alignItems: 'flex-end' as const,
          },
          animation: bottomSheet,
        };
      case 'dialog':
        return {
          modalStyle: {
            boxShadow: theme.shadows.xl,
          },
          backdropStyle: {
            backgroundColor: theme.colors.overlayLight,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          },
          animation: modalContent,
        };
      default:
        return {
          modalStyle: {},
          backdropStyle: {
            backgroundColor: theme.colors.overlay,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
          animation: modalContent,
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
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

  const variantConfig = getVariantConfig();
  const sizeStyles = getSizeStyles();

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...variantConfig.backdropStyle,
  };

  const modalStyles: React.CSSProperties = {
    position: 'relative',
    maxHeight: variant === 'bottom-sheet' ? '80vh' : '90vh',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borders.radius.xl,
    boxShadow: theme.shadows.xl,
    overflow: 'hidden',
    ...sizeStyles,
    ...variantConfig.modalStyle,
    ...style,
  };

  const modalContentStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.lg,
    ...(variant === 'fullscreen'
      ? {
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'left' as const,
        }
      : {}),
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === backdropRef.current) {
      onClose();
    }
  };

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          style={backdropStyles}
          onClick={handleBackdropClick}
          data-testid={testID}
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            ref={modalRef}
            style={modalStyles}
            className={className}
            variants={variantConfig.animation}
            initial="hidden"
            animate="visible"
            exit="exit"
            // Accessibility
            role={role}
            aria-modal={ariaModal}
            aria-label={ariaLabel || accessibilityLabel}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={ariaLabelledBy}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {showCloseButton && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  position: 'absolute',
                  top: theme.spacing.md,
                  right: theme.spacing.md,
                  zIndex: 10,
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  style={{
                    width: '36px',
                    height: '36px',
                    minHeight: '36px',
                    padding: 0,
                    borderRadius: theme.borders.radius.full,
                    color: theme.colors.mutedForeground,
                  }}
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </motion.div>
            )}

            {/* Loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.overlayLight,
                    backdropFilter: 'blur(2px)',
                    zIndex: 20,
                    borderRadius: 'inherit',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={springConfig.bouncy}
                  >
                    <Spinner size="lg" color={theme.colors.primary} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <motion.div
              style={modalContentStyles}
              animate={{
                opacity: loading ? 0.5 : 1,
                filter: loading ? 'blur(1px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>

            {/* Divider accent line at bottom */}
            {showDivider && (
              <div
                style={{
                  height: 3,
                  background: theme.gradients.primary,
                  marginTop: 'auto',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal
  if (typeof document === 'undefined') return null;
  return createPortal(modalElement, document.body);
};
