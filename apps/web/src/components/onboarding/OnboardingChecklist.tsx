'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Progress } from '@vas-dj-saas/ui';
import type { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  progressPercentage: number;
  isComplete: boolean;
  onDismiss: () => void;
  onStepClick?: (stepId: string) => void;
}

// Check icon component
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: 16, height: 16 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Arrow right icon
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: 16, height: 16 }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Chevron icon for collapse
const ChevronIcon: React.FC<{ className?: string; isOpen: boolean }> = ({ className, isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      width: 20,
      height: 20,
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease-in-out',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Close/X icon
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: 16, height: 16 }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Celebration icon for completion
const CelebrationIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 48, height: 48 }}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  steps,
  completedCount,
  totalSteps,
  progressPercentage,
  isComplete,
  onDismiss,
  onStepClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Show celebration animation when all steps are completed
  useEffect(() => {
    if (isComplete && completedCount === totalSteps) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, completedCount, totalSteps]);

  // Don't render if dismissed or complete (after celebration)
  if (isComplete && !showCelebration) {
    return null;
  }

  return (
    <Card
      variant="default"
      size="md"
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <div
            style={{
              color: '#22c55e',
              marginBottom: 12,
              animation: 'bounceIn 0.5s ease-in-out',
            }}
          >
            <CelebrationIcon />
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#22c55e',
              margin: 0,
            }}
          >
            Congratulations!
          </h3>
          <p
            style={{
              fontSize: 14,
              color: '#4b5563',
              margin: '8px 0 0',
            }}
          >
            You&apos;ve completed all onboarding steps!
          </p>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#fafafa',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: progressPercentage === 100 ? '#dcfce7' : '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: progressPercentage === 100 ? '#22c55e' : '#3b82f6',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {progressPercentage === 100 ? <CheckIcon /> : `${progressPercentage}%`}
          </div>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#111827',
                margin: 0,
              }}
            >
              Getting Started
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#6b7280',
                margin: '2px 0 0',
              }}
            >
              {completedCount} of {totalSteps} complete
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            style={{
              padding: 8,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Dismiss onboarding"
            title="Dismiss"
          >
            <CloseIcon />
          </button>
          <ChevronIcon isOpen={isExpanded} />
        </div>
      </div>

      {/* Progress bar */}
      {isExpanded && (
        <div style={{ padding: '12px 20px 0' }}>
          <Progress
            value={progressPercentage}
            variant="linear"
            size="sm"
            color="primary"
          />
        </div>
      )}

      {/* Steps list */}
      {isExpanded && (
        <div
          style={{
            padding: '16px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              stepNumber={index + 1}
              onClick={() => onStepClick?.(step.id)}
            />
          ))}
        </div>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Card>
  );
};

// Individual step item component
interface StepItemProps {
  step: OnboardingStep;
  stepNumber: number;
  onClick?: () => void;
}

const StepItem: React.FC<StepItemProps> = ({ step, stepNumber, onClick }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: step.isComplete ? '#f0fdf4' : '#f9fafb',
        border: `1px solid ${step.isComplete ? '#bbf7d0' : '#e5e7eb'}`,
        cursor: step.href ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (step.href && !step.isComplete) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.borderColor = '#d1d5db';
        }
      }}
      onMouseLeave={(e) => {
        if (step.href && !step.isComplete) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }
      }}
    >
      {/* Step indicator */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: step.isComplete ? '#22c55e' : '#e5e7eb',
          color: step.isComplete ? '#fff' : '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {step.isComplete ? <CheckIcon /> : stepNumber}
      </div>

      {/* Step content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: step.isComplete ? '#166534' : '#111827',
            margin: 0,
            textDecoration: step.isComplete ? 'line-through' : 'none',
          }}
        >
          {step.title}
        </h4>
        <p
          style={{
            fontSize: 12,
            color: step.isComplete ? '#4ade80' : '#6b7280',
            margin: '2px 0 0',
          }}
        >
          {step.description}
        </p>
      </div>

      {/* Action arrow */}
      {step.href && !step.isComplete && (
        <div
          style={{
            color: '#9ca3af',
            flexShrink: 0,
          }}
        >
          <ArrowRightIcon />
        </div>
      )}
    </div>
  );

  // Wrap in Link if has href and not complete
  if (step.href && !step.isComplete) {
    return <Link href={step.href}>{content}</Link>;
  }

  return content;
};

export default OnboardingChecklist;
