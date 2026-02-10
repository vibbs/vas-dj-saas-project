'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@vas-dj-saas/ui';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface OnboardingTooltipProps {
  /** Unique identifier for this tooltip */
  id: string;
  /** Title of the tooltip */
  title: string;
  /** Description/content of the tooltip */
  description: string;
  /** Current step number (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Position relative to the target element */
  position?: TooltipPosition;
  /** Whether the tooltip is visible */
  isOpen: boolean;
  /** Callback when user clicks Next */
  onNext?: () => void;
  /** Callback when user clicks Skip */
  onSkip?: () => void;
  /** Callback when user clicks Done (last step) */
  onDone?: () => void;
  /** Callback when tooltip is closed */
  onClose?: () => void;
  /** Target element to attach to (CSS selector or ref) */
  targetSelector?: string;
  /** Offset from the target element in pixels */
  offset?: number;
  /** Show step indicator */
  showStepIndicator?: boolean;
  /** Custom action button text */
  actionText?: string;
}

// Arrow pointing to target
const TooltipArrow: React.FC<{ position: TooltipPosition }> = ({ position }) => {
  const getArrowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (position) {
      case 'top':
        return {
          ...base,
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '8px 8px 0 8px',
          borderColor: '#fff transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...base,
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 8px 8px 8px',
          borderColor: 'transparent transparent #fff transparent',
        };
      case 'left':
        return {
          ...base,
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 0 8px 8px',
          borderColor: 'transparent transparent transparent #fff',
        };
      case 'right':
        return {
          ...base,
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 8px 8px 0',
          borderColor: 'transparent #fff transparent transparent',
        };
      default:
        return base;
    }
  };

  return <div style={getArrowStyles()} />;
};

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  id,
  title,
  description,
  currentStep,
  totalSteps,
  position = 'bottom',
  isOpen,
  onNext,
  onSkip,
  onDone,
  onClose,
  targetSelector,
  offset = 12,
  showStepIndicator = true,
  actionText,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate position based on target element
  useEffect(() => {
    if (!isOpen || !targetSelector) {
      setCoords(null);
      return;
    }

    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`OnboardingTooltip: Target element not found: ${targetSelector}`);
      return;
    }

    const calculatePosition = () => {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();

      if (!tooltipRect) return;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - offset;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + offset;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + offset;
          break;
      }

      // Keep tooltip within viewport
      const padding = 16;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      setCoords({ top, left });
    };

    // Initial calculation
    calculatePosition();

    // Recalculate on scroll/resize
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen, targetSelector, position, offset]);

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLastStep = currentStep === totalSteps;

  const handleAction = () => {
    if (isLastStep) {
      onDone?.();
    } else {
      onNext?.();
    }
  };

  // Determine button text
  const buttonText = actionText || (isLastStep ? 'Done' : 'Next');

  return (
    <>
      {/* Backdrop for focus */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="tooltip"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        style={{
          position: 'fixed',
          top: coords?.top ?? 0,
          left: coords?.left ?? 0,
          zIndex: 9999,
          width: 320,
          backgroundColor: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          opacity: coords && !isAnimating ? 1 : 0,
          transform: coords && !isAnimating ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
          visibility: coords ? 'visible' : 'hidden',
        }}
      >
        <TooltipArrow position={position} />

        {/* Content */}
        <div style={{ padding: 20 }}>
          {/* Step indicator */}
          {showStepIndicator && totalSteps > 1 && (
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 12,
              }}
            >
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: 24,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: index < currentStep ? '#3b82f6' : '#e5e7eb',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <h4
            id={`${id}-title`}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#111827',
              margin: 0,
              marginBottom: 8,
            }}
          >
            {title}
          </h4>

          {/* Description */}
          <p
            id={`${id}-description`}
            style={{
              fontSize: 14,
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: '1px solid #f3f4f6',
            backgroundColor: '#fafafa',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <button
            onClick={onSkip}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              transition: 'color 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            Skip tour
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {showStepIndicator && totalSteps > 1 && (
              <span
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                }}
              >
                {currentStep} of {totalSteps}
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTooltip;
