import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { StepperProps, StepperStep } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  showStepNumbers = true,
  showConnectors = true,
  size = 'md',
  variant = 'default',
  onStepPress,
  style,
  testID,
  accessibilityLabel,
  allowClickableSteps = false,
  completedSteps = [],
  // Filter out web-specific props
  className,
  onStepClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();

  const handleStepPress = (stepIndex: number) => {
    if (allowClickableSteps && !steps[stepIndex].disabled) {
      onStepPress?.(stepIndex);
    }
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    return completedSteps.includes(stepIndex) || stepIndex < activeStep;
  };

  const sizeStyles = {
    sm: {
      stepSize: 24,
      fontSize: theme.typography.fontSize.sm,
      connectorHeight: 2,
      padding: theme.spacing.xs,
    },
    md: {
      stepSize: 32,
      fontSize: theme.typography.fontSize.base,
      connectorHeight: 2,
      padding: theme.spacing.sm,
    },
    lg: {
      stepSize: 40,
      fontSize: theme.typography.fontSize.lg,
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

    return {
      stepCircle: {
        width: currentSize.stepSize,
        height: currentSize.stepSize,
        borderRadius: variant === 'circle' ? currentSize.stepSize / 2 : theme.borders.radius.sm,
        backgroundColor,
        borderWidth: 2,
        borderColor,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        opacity: isDisabled ? 0.5 : 1,
      } as ViewStyle,
      stepText: {
        color,
        fontSize: currentSize.fontSize,
        fontWeight: theme.typography.fontWeight.medium as any,
        fontFamily: theme.typography.fontFamily,
      } as TextStyle,
      label: {
        color: isActive ? theme.colors.foreground : theme.colors.mutedForeground,
        fontSize: currentSize.fontSize,
        fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
        fontFamily: theme.typography.fontFamily,
        opacity: isDisabled ? 0.5 : 1,
      } as TextStyle,
      description: {
        color: theme.colors.mutedForeground,
        fontSize: currentSize.fontSize * 0.875,
        fontFamily: theme.typography.fontFamily,
        opacity: isDisabled ? 0.5 : 1,
      } as TextStyle,
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
        return <Text style={styles.stepText}>!</Text>;
      }
      if (isCompleted && !isActive) {
        return <Text style={styles.stepText}>✓</Text>;
      }
      if (step.icon) {
        return step.icon;
      }
      if (showStepNumbers) {
        return <Text style={styles.stepText}>{stepIndex + 1}</Text>;
      }
      return null;
    };

    const connector = showConnectors && !isLast && (
      <View
        style={{
          flex: orientation === 'horizontal' ? 1 : 0,
          height: orientation === 'horizontal' ? currentSize.connectorHeight : currentSize.stepSize,
          width: orientation === 'horizontal' ? undefined : currentSize.connectorHeight,
          backgroundColor: isCompleted ? theme.colors.primary : theme.colors.border,
          marginHorizontal: orientation === 'horizontal' ? theme.spacing.md : currentSize.stepSize / 2,
          marginVertical: orientation === 'horizontal' ? currentSize.stepSize / 2 : theme.spacing.md,
          alignSelf: 'center',
        }}
      />
    );

    const StepButton = allowClickableSteps && !step.disabled ? TouchableOpacity : View;

    return (
      <View
        key={stepIndex}
        style={{
          flexDirection: orientation === 'horizontal' ? 'column' : 'row',
          alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
          gap: theme.spacing.sm,
          flex: orientation === 'horizontal' ? 0 : 1,
        }}
      >
        <View
          style={{
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            alignItems: 'center',
            gap: orientation === 'horizontal' ? theme.spacing.md : theme.spacing.sm,
          }}
        >
          <StepButton
            style={styles.stepCircle}
            onPress={allowClickableSteps && !step.disabled ? () => handleStepPress(stepIndex) : undefined}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`Step ${stepIndex + 1}: ${step.label}${step.optional ? ' (optional)' : ''}`}
            accessibilityRole={allowClickableSteps && !step.disabled ? 'button' : 'text'}
            accessibilityState={{
              disabled: step.disabled,
              selected: isActive,
            }}
            testID={testID ? `${testID}-step-${stepIndex}` : undefined}
          >
            {stepContent()}
          </StepButton>
          
          {connector}
        </View>

        <View
          style={{
            alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
            maxWidth: orientation === 'horizontal' ? 150 : undefined,
            flex: orientation === 'horizontal' ? 0 : 1,
          }}
        >
          <Text style={styles.label}>
            {step.label}
            {step.optional && (
              <Text style={{ fontSize: currentSize.fontSize * 0.875, opacity: 0.7 }}>
                {' '}(optional)
              </Text>
            )}
          </Text>
          {step.description && (
            <Text style={styles.description}>{step.description}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        {
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          alignItems: orientation === 'horizontal' ? 'flex-start' : 'stretch',
          gap: orientation === 'horizontal' ? theme.spacing.lg : theme.spacing.md,
          width: '100%',
        },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Step progress indicator'}
      accessibilityRole="progressbar"
    >
      {steps.map((step, index) => (
        <StepComponent key={index} step={step} stepIndex={index} />
      ))}
    </View>
  );
};