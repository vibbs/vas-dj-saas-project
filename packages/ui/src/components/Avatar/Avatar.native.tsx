import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from 'react-native';
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
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'image' as const,
  // Image options
  onImageLoad,
  onImageError,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  title,
  loading,
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
      borderRadius: actualSize / 2,
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

  const baseStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    width: actualSize,
    height: actualSize,
    backgroundColor: getBackgroundColor(),
    overflow: 'hidden',
    ...variantStyles[variant],
  };

  const textStyles: TextStyle = {
    fontSize: actualSize * 0.4, // Font size relative to avatar size
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    color: textColor || '#ffffff',
    textAlign: 'center',
  };

  const imageStyles: ImageStyle = {
    width: actualSize,
    height: actualSize,
    position: 'absolute' as const,
    ...variantStyles[variant],
  };

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
    
    // Default user icon emoji if no initials or name
    if (!name && !initials) {
      return (
        <Text style={[textStyles, { fontSize: actualSize * 0.6 }]}>
          👤
        </Text>
      );
    }
    
    return (
      <Text style={textStyles} allowFontScaling={false}>
        {getInitials()}
      </Text>
    );
  };

  const avatarContent = (
    <View style={[baseStyles, style]} testID={testID}>
      {showFallback && renderFallback()}
      {src && (
        <Image
          source={{ uri: src }}
          style={[
            imageStyles,
            { opacity: imageLoaded && !imageError ? 1 : 0 }
          ]}
          onLoad={handleImageLoad}
          onError={handleImageError}
          accessibilityIgnoresInvertColors={true}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || `Avatar for ${name || 'user'}`}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole === 'image' ? 'button' : accessibilityRole}
        {...props}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || `Avatar for ${name || 'user'}`}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {avatarContent}
    </View>
  );
};