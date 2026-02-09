import React from 'react';
import * as LucideIcons from 'lucide-react';
import { IconProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

type LucideIconName = keyof typeof LucideIcons;

export const Icon: React.FC<IconProps> = ({
  children,
  name,
  size = 'md',
  color,
  fill,
  stroke,
  strokeWidth = 1.5,
  viewBox = '0 0 24 24',
  width,
  height,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-hidden': ariaHidden,
  role = 'img',
  alt,
  title,
  onClick,
  style,
  ...restProps
}) => {
  const { theme } = useTheme();

  // Filter out React Native SVG props that cause type conflicts  
  const {
    // React Native SVG transform props
    origin, transform, translateX, translateY, scaleX, scaleY, scale,
    rotation, skewX, skewY, 
    // React Native SVG other props
    strokeDasharray, x, y,
    // React Native event handlers  
    onTouchStart, onTouchMove, onTouchEnd, onTouchCancel,
    onPointerDown, onPointerUp, onPointerMove, onPointerCancel,
    onPress,
    // Keep the rest for web
    ...webCompatibleProps
  } = restProps;

  // Define size mapping
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  // Get actual size value
  const actualSize = typeof size === 'number' ? size : sizeMap[size];
  
  // Use provided dimensions or fall back to size
  const finalWidth = width || actualSize;
  const finalHeight = height || actualSize;

  // Determine colors with theme fallbacks
  const iconColor = color || theme.colors.foreground;
  const iconFill = fill || 'none';
  const iconStroke = stroke || (iconColor as string);

  const baseStyles = {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    userSelect: 'none' as const,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    ...style,
  };

  const hoverStyles = onClick ? {
    ':hover': {
      opacity: 0.8,
      transform: 'scale(1.05)',
    },
  } : {};

  // Use Lucide icon if name is provided  
  if (name) {
    const IconComponent = LucideIcons[name as LucideIconName] as React.ComponentType<any>;
    if (IconComponent) {
      return (
        <IconComponent
          size={finalWidth}
          color={iconColor}
          fill={iconFill}
          stroke={iconStroke}
          strokeWidth={strokeWidth}
          style={baseStyles}
          className={className}
          data-testid={testID}
          role={role}
          aria-label={ariaLabel || accessibilityLabel || alt}
          aria-describedby={ariaDescribedBy}
          aria-hidden={ariaHidden}
          title={title}
          onClick={onClick}
          onKeyDown={(e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          }}
          tabIndex={onClick ? 0 : -1}
          {...(webCompatibleProps as any)}
        />
      );
    }
  }

  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      viewBox={viewBox}
      fill={iconFill as string}
      stroke={iconStroke}
      strokeWidth={strokeWidth}
      style={baseStyles}
      className={className}
      data-testid={testID}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role}
      aria-label={ariaLabel || accessibilityLabel || alt}
      aria-describedby={ariaDescribedBy}
      aria-hidden={ariaHidden}
      // Event handlers
      onClick={onClick}
      // Keyboard navigation support
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      {...(webCompatibleProps as any)}
    >
      {title && <title>{title}</title>}
      {children || (
        <circle cx="12" cy="12" r="10" />
      )}
    </svg>
  );
};