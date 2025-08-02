import React, { useState } from 'react';
import { AvatarProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  initials,
  fallbackIcon,
  size = 'md',
  variant = 'circular',
  color,
  textColor,
  onClick,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  title,
  // Image options
  loading = 'lazy',
  onImageLoad,
  onImageError,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Define size mapping
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  // Get actual size value
  const actualSize = typeof size === 'number' ? size : sizeMap[size];

  // Define variant styles
  const variantStyles = {
    circular: {
      borderRadius: '50%',
    },
    rounded: {
      borderRadius: theme.borders.radius.md,
    },
    square: {
      borderRadius: theme.borders.radius.sm,
    },
  };

  // Generate initials from name
  const getInitials = () => {
    if (initials) return initials.slice(0, 2).toUpperCase();
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return '?';
  };

  // Generate background color from name
  const getBackgroundColor = () => {
    if (color) return color;
    
    // Generate a consistent color based on name/initials
    const text = name || initials || 'default';
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
      '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
      '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
    ];
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: actualSize,
    height: actualSize,
    fontSize: actualSize * 0.4, // Font size relative to avatar size
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: getBackgroundColor(),
    color: textColor || '#ffffff',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none' as const,
    ...variantStyles[variant],
    ...style,
  };

  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: imageLoaded && !imageError ? 'block' : 'none',
  };

  const hoverStyles = onClick ? {
    ':hover': {
      opacity: 0.9,
      transform: 'scale(1.05)',
      boxShadow: theme.shadows.sm,
    },
  } : {};

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    onImageError?.();
  };

  const showFallback = !src || imageError || !imageLoaded;

  const renderFallback = () => {
    if (fallbackIcon) {
      return fallbackIcon;
    }
    
    // Default user icon if no initials or name
    if (!name && !initials) {
      return (
        <svg
          width={actualSize * 0.6}
          height={actualSize * 0.6}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    }
    
    return getInitials();
  };

  const Container = onClick ? 'button' : 'div';

  return (
    <Container
      style={baseStyles}
      onClick={onClick}
      data-testid={testID}
      className={className}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      role={role || (onClick ? 'button' : 'img')}
      aria-label={ariaLabel || accessibilityLabel || alt || `Avatar for ${name || 'user'}`}
      aria-describedby={ariaDescribedBy}
      title={title || name}
      tabIndex={onClick ? 0 : -1}
      // Keyboard navigation support
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt || `Avatar for ${name || 'user'}`}
          style={imageStyles}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          aria-hidden={showFallback}
        />
      )}
      {showFallback && renderFallback()}
    </Container>
  );
};