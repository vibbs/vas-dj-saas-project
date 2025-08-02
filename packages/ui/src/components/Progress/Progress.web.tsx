import React from 'react';
import { ProgressProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'linear',
  size = 'md',
  color = 'primary',
  track = true,
  label = false,
  thickness,
  radius,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-valuemin': ariaValueMin = 0,
  'aria-valuemax': ariaValueMax = 100,
  'aria-valuenow': ariaValueNow,
  role = 'progressbar',
  ...props
}) => {
  const { theme } = useTheme();

  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const currentValue = ariaValueNow !== undefined ? ariaValueNow : clampedValue;

  // Size configurations
  const sizeConfig = {
    sm: { height: 4, radius: 24, thickness: 2, fontSize: theme.typography.fontSize.xs },
    md: { height: 6, radius: 32, thickness: 3, fontSize: theme.typography.fontSize.sm },
    lg: { height: 8, radius: 40, thickness: 4, fontSize: theme.typography.fontSize.sm },
    xl: { height: 12, radius: 48, thickness: 6, fontSize: theme.typography.fontSize.xl },
  };

  const config = sizeConfig[size];
  const progressRadius = radius || config.radius;
  const strokeWidth = thickness || config.thickness;

  // Color configurations
  const getProgressColor = () => {
    switch (color) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.destructive;
      default: return theme.colors.primary;
    }
  };

  const progressColor = getProgressColor();
  const trackColor = theme.colors.muted;

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * progressRadius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
    const svgSize = (progressRadius + strokeWidth) * 2;

    return (
      <div
        className={className}
        data-testid={testID}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: label ? theme.spacing.xs : 0,
        }}
        // Accessibility attributes
        role={role}
        aria-label={ariaLabel || accessibilityLabel || `Progress ${clampedValue}%`}
        aria-describedby={ariaDescribedBy}
        aria-valuemin={ariaValueMin}
        aria-valuemax={ariaValueMax}
        aria-valuenow={currentValue}
        {...props}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg
            width={svgSize}
            height={svgSize}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            {track && (
              <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={progressRadius}
                fill="none"
                stroke={trackColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            )}
            {/* Progress */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={progressRadius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.3s ease-in-out',
              }}
            />
          </svg>
          
          {/* Center label */}
          {label && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: config.fontSize,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.foreground,
                lineHeight: 1,
              }}
            >
              {Math.round(clampedValue)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  // Linear variant
  return (
    <div
      className={className}
      data-testid={testID}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: label ? theme.spacing.xs : 0,
        width: '100%',
      }}
      // Accessibility attributes
      role={role}
      aria-label={ariaLabel || accessibilityLabel || `Progress ${clampedValue}%`}
      aria-describedby={ariaDescribedBy}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-valuenow={currentValue}
      {...props}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: config.height,
          backgroundColor: track ? trackColor : 'transparent',
          borderRadius: config.height / 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${clampedValue}%`,
            backgroundColor: progressColor,
            borderRadius: config.height / 2,
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>
      
      {/* Label below */}
      {label && (
        <div
          style={{
            fontSize: config.fontSize,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.foreground,
            textAlign: 'center',
          }}
        >
          {Math.round(clampedValue)}%
        </div>
      )}
    </div>
  );
};