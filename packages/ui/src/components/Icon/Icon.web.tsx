import React from 'react';
import { IconProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

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
  ...props
}) => {
  const { theme } = useTheme();

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
  const iconStroke = stroke || iconColor;

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

  // If name is provided, render a placeholder or use an icon library
  // For this example, we'll create some common icons
  const renderNamedIcon = () => {
    const commonIcons: Record<string, React.ReactNode> = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      user: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
      settings: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      ),
      search: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      ),
      bell: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      ),
      heart: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      ),
      star: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      ),
      plus: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      ),
      minus: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12h-15"
        />
      ),
      check: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      ),
      x: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      ),
      'chevron-right': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      ),
      'chevron-left': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      ),
      'chevron-up': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      ),
      'chevron-down': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      ),
    };

    return commonIcons[name || ''] || (
      <circle cx="12" cy="12" r="10" />
    );
  };

  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      viewBox={viewBox}
      fill={iconFill}
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
      title={title}
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
      {...props}
    >
      {name ? renderNamedIcon() : children}
    </svg>
  );
};