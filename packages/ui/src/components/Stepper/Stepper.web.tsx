import React from 'react';
import { StepperProps, StepperStep } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Check, AlertCircle } from 'lucide-react';

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  showStepNumbers = true,
  showConnectors = true,
  size = 'md',
  variant = 'default',
  onStepClick,
  className,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  allowClickableSteps = false,
  completedSteps = [],
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const handleStepClick = (stepIndex: number) => {
    if (allowClickableSteps && !steps[stepIndex].disabled) {
      onStepClick?.(stepIndex);
    }
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    return completedSteps.includes(stepIndex) || stepIndex < activeStep;
  };

  const sizeStyles = {
    sm: {
      stepSize: 24,
      fontSize: theme.typography.fontSize.sm,
      iconSize: 12,
      connectorHeight: 2,
      padding: theme.spacing.xs,
    },
    md: {
      stepSize: 32,
      fontSize: theme.typography.fontSize.base,
      iconSize: 16,
      connectorHeight: 2,
      padding: theme.spacing.sm,
    },
    lg: {
      stepSize: 40,
      fontSize: theme.typography.fontSize.lg,
      iconSize: 18,
      connectorHeight: 3,
      padding: theme.spacing.md,
    },
  };

  const currentSize = sizeStyles[size];

  const getStepStyles = (stepIndex: number, step: StepperStep) => {
    const isActive = stepIndex === activeStep;
    const isCompleted = isStepCompleted(stepIndex);
    const isError = step.error;
    const isDisabled = step.disabled;

    let backgroundColor = theme.colors.background;
    let borderColor = theme.colors.border;
    let color = theme.colors.mutedForeground;

    if (isError) {
      backgroundColor = theme.colors.destructive;
      borderColor = theme.colors.destructive;
      color = theme.colors.destructiveForeground;
    } else if (isCompleted) {
      backgroundColor = theme.colors.primary;
      borderColor = theme.colors.primary;
      color = theme.colors.primaryForeground;
    } else if (isActive) {
      backgroundColor = theme.colors.primary;
      borderColor = theme.colors.primary;
      color = theme.colors.primaryForeground;
    }

    if (isDisabled) {
      opacity: 0.5;
    }

    return {
      stepCircle: {
        width: currentSize.stepSize,
        height: currentSize.stepSize,
        borderRadius: variant === 'circle' ? '50%' : theme.borders.radius.sm,
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: currentSize.fontSize,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: allowClickableSteps && !isDisabled ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        opacity: isDisabled ? 0.5 : 1,
      },
      label: {
        color: isActive ? theme.colors.foreground : theme.colors.mutedForeground,
        fontSize: currentSize.fontSize,
        fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
        opacity: isDisabled ? 0.5 : 1,
      },
      description: {
        color: theme.colors.mutedForeground,
        fontSize: currentSize.fontSize * 0.875,
        opacity: isDisabled ? 0.5 : 1,
      },
    };
  };

  const StepComponent: React.FC<{
    step: StepperStep;
    stepIndex: number;
  }> = ({ step, stepIndex }) => {
    const isActive = stepIndex === activeStep;
    const isCompleted = isStepCompleted(stepIndex);
    const isLast = stepIndex === steps.length - 1;
    const styles = getStepStyles(stepIndex, step);

    const stepContent = () => {
      if (step.error) {
        return <AlertCircle size={currentSize.iconSize} />;
      }
      if (isCompleted && !isActive) {
        return <Check size={currentSize.iconSize} />;
      }
      if (step.icon) {
        return step.icon;
      }
      if (showStepNumbers) {
        return stepIndex + 1;
      }
      return null;
    };

    const connector = showConnectors && !isLast && (
      <div
        style={{
          flex: orientation === 'horizontal' ? 1 : 'none',
          height: orientation === 'horizontal' ? currentSize.connectorHeight : currentSize.stepSize,
          width: orientation === 'horizontal' ? 'auto' : currentSize.connectorHeight,
          backgroundColor: isCompleted ? theme.colors.primary : theme.colors.border,
          margin: orientation === 'horizontal' 
            ? `${currentSize.stepSize / 2}px ${theme.spacing.md}px`
            : `${theme.spacing.md}px ${currentSize.stepSize / 2}px`,
          transition: 'background-color 0.2s ease-in-out',
        }}
      />
    );

    return (
      <div
        key={stepIndex}
        style={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'column' : 'row',
          alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
          gap: theme.spacing.sm,
          flex: orientation === 'horizontal' ? 'none' : 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            alignItems: 'center',
            gap: orientation === 'horizontal' ? theme.spacing.md : theme.spacing.sm,
          }}
        >
          <button
            style={styles.stepCircle}
            onClick={() => handleStepClick(stepIndex)}
            disabled={step.disabled || !allowClickableSteps}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Step ${stepIndex + 1}: ${step.label}${step.optional ? ' (optional)' : ''}`}
            data-testid={testID ? `${testID}-step-${stepIndex}` : undefined}
            type="button"
          >
            {stepContent()}
          </button>
          
          {connector}
        </div>

        <div
          style={{
            textAlign: orientation === 'horizontal' ? 'center' : 'left',
            maxWidth: orientation === 'horizontal' ? '150px' : 'none',
          }}
        >
          <div style={styles.label}>
            {step.label}
            {step.optional && (
              <span style={{ fontSize: currentSize.fontSize * 0.875, opacity: 0.7 }}>
                {' '}(optional)
              </span>
            )}
          </div>
          {step.description && (
            <div style={styles.description}>{step.description}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        alignItems: orientation === 'horizontal' ? 'flex-start' : 'stretch',
        gap: orientation === 'horizontal' ? theme.spacing.lg : theme.spacing.md,
        width: '100%',
        ...style,
      }}
      className={className}
      data-testid={testID}
      aria-label={ariaLabel || accessibilityLabel || 'Step progress indicator'}
      aria-describedby={ariaDescribedBy}
      role="progressbar"
      aria-valuenow={activeStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      {...props}
    >
      {steps.map((step, index) => (
        <StepComponent key={index} step={step} stepIndex={index} />
      ))}
    </div>
  );
};