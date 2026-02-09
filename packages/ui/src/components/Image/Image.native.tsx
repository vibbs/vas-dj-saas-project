import React, { useState } from 'react';
import { View, Image as RNImage, ActivityIndicator, Text, ViewStyle, ImageStyle, Platform } from 'react-native';
import { ImageProps, ImageSource } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  processImageSource, 
  getImageDimensions,
  isValidImageUrl,
  createPlaceholderSource,
  isBrowser
} from './imageUtils';

export const Image: React.FC<ImageProps> = ({
  source,
  alt,
  width,
  height,
  aspectRatio = 'auto',
  resizeMode = 'cover',
  borderRadius,
  svg,
  fallback,
  errorImage,
  onLoad,
  onError,
  onLoadStart,
  onProgress,
  style,
  testID,
  accessibilityLabel,
  containerStyle,
  // Filter out web-specific props
  className,
  objectFit,
  loading,
  priority,
  placeholder,
  blurDataURL,
  format,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  crossOrigin,
  decoding,
  referrerPolicy,
  sizes,
  srcSet,
  containerClassName,
  ...props
}) => {
  const { theme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const processedSource = processImageSource(source);
  const isSvg = svg || processedSource.isSvg;
  const isInBrowser = isBrowser();

  // Handle load events
  const handleLoad = () => {
    setIsLoading(false);
    setHasLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error?: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleProgress = (event: any) => {
    if (onProgress && event.nativeEvent) {
      const { loaded, total } = event.nativeEvent;
      onProgress({ loaded, total });
    }
  };

  // Get computed styles
  const dimensionStyles = getImageDimensions({ source, width, height, aspectRatio });

  // Container styles for aspect ratio and layout
  const containerStyles: ViewStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius || 0,
    ...dimensionStyles,
    ...containerStyle,
  };

  // Image styles - for web compatibility in Storybook
  const imageStyles: any = isInBrowser ? {
    width: '100%',
    height: '100%',
    objectFit: resizeMode === 'cover' ? 'cover' : 
               resizeMode === 'contain' ? 'contain' : 
               resizeMode === 'stretch' ? 'fill' : 'none',
    borderRadius: borderRadius || 0,
    display: 'block',
    ...(style as any),
  } : {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius || 0,
    ...(style as ImageStyle),
  };

  // Placeholder styles
  const placeholderStyles: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.muted || '#f3f4f6',
  };

  // Error/fallback content
  if (hasError) {
    if (errorImage) {
      const errorSource = processImageSource(errorImage);
      return (
        <View style={containerStyles}>
          {isInBrowser ? (
            <img
              src={errorSource.uri}
              alt={alt || 'Error image'}
              style={imageStyles}
              onLoad={handleLoad}
              data-testid={testID ? `${testID}-error` : undefined}
            />
          ) : (
            <RNImage
              source={{ uri: errorSource.uri }}
              style={imageStyles}
              resizeMode={resizeMode}
              onLoad={handleLoad}
              accessible={true}
              accessibilityLabel={accessibilityLabel || alt || 'Error image'}
              testID={testID ? `${testID}-error` : undefined}
            />
          )}
        </View>
      );
    }
    
    if (fallback) {
      // Handle fallback as ImageSource
      if (typeof fallback === 'object' && 'uri' in fallback) {
        const fallbackSource = processImageSource(fallback as ImageSource);
        return (
          <RNImage
            source={fallbackSource}
            style={[imageStyles, dimensionStyles]}
            accessible={true}
            accessibilityLabel={accessibilityLabel || alt || 'Fallback image'}
            testID={testID ? `${testID}-fallback` : undefined}
          />
        );
      }
      
      // Handle fallback as ReactNode
      return (
        <View 
          style={containerStyles}
          accessible={true}
          accessibilityLabel={accessibilityLabel || alt || 'Fallback content'}
          testID={testID ? `${testID}-fallback` : undefined}
        >
          {fallback as React.ReactNode}
        </View>
      );
    }
    
    // Default error state
    return (
      <View 
        style={[containerStyles, placeholderStyles]}
        accessible={true}
        accessibilityLabel={accessibilityLabel || alt || 'Failed to load image'}
        {...(isInBrowser ? {} : { accessibilityRole: 'image' })}
        testID={testID ? `${testID}-error` : undefined}
      >
        <Text style={{ 
          fontSize: 24, 
          color: theme.colors.mutedForeground || '#9ca3af' 
        }}>
          ⚠️
        </Text>
        <Text style={{ 
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.mutedForeground || '#9ca3af',
          marginTop: theme.spacing.xs,
          textAlign: 'center',
        }}>
          Failed to load
        </Text>
      </View>
    );
  }

  // For SVG images, we'll need special handling
  if (isSvg) {
    if (isInBrowser) {
      // In browser (Storybook), use object element for SVG
      return (
        <View style={containerStyles}>
          <object
            data={processedSource.uri}
            type="image/svg+xml"
            style={imageStyles}
            aria-label={accessibilityLabel || alt}
            onLoad={handleLoad}
            onError={handleError}
          >
            <img
              src={processedSource.uri}
              alt={alt || 'SVG'}
              style={imageStyles}
              onLoad={handleLoad}
              onError={handleError}
            />
          </object>
        </View>
      );
    } else {
      // In real React Native, warn about SVG support
      console.warn('SVG support requires react-native-svg library for optimal rendering');
    }
  }

  // Prepare image source
  let imageSource: any;
  let imageSrc: string | undefined;
  
  if (typeof source === 'number') {
    // Local require() asset
    imageSource = source;
    imageSrc = source.toString(); // For web fallback
  } else if (typeof source === 'string') {
    if (isValidImageUrl(source)) {
      imageSource = { uri: source };
      imageSrc = source;
    } else {
      // Invalid URL, show placeholder
      const placeholderSrc = createPlaceholderSource(400, 300, 'Invalid URL');
      imageSource = { uri: placeholderSrc };
      imageSrc = placeholderSrc;
    }
  } else if (source && typeof source === 'object') {
    if ('uri' in source) {
      imageSource = source;
      imageSrc = source.uri;
    } else if ('default' in source) {
      imageSource = { uri: source.default };
      imageSrc = source.default;
    }
  }

  if (!imageSource || !imageSrc) {
    // No valid source, show placeholder
    return (
      <View 
        style={[containerStyles, placeholderStyles]}
        accessible={true}
        accessibilityLabel={accessibilityLabel || alt || 'No image source'}
        {...(isInBrowser ? {} : { accessibilityRole: 'image' })}
        testID={testID}
      >
        <Text style={{ 
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.mutedForeground || '#9ca3af',
        }}>
          No image
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      {isInBrowser ? (
        // Web-compatible rendering for Storybook
        <img
          src={imageSrc}
          alt={alt || 'Image'}
          style={imageStyles}
          onLoad={handleLoad}
          onError={handleError}
          data-testid={testID}
        />
      ) : (
        // Native React Native rendering
        <RNImage
          source={imageSource}
          style={imageStyles}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onProgress={handleProgress}
          accessible={true}
          accessibilityLabel={accessibilityLabel || alt || 'Image'}
          accessibilityRole="image"
          testID={testID}
          {...props}
        />
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={placeholderStyles}>
          {isInBrowser ? (
            // Web spinner for Storybook
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing.xs
            }}>
              <div style={{
                width: 20,
                height: 20,
                border: `2px solid ${theme.colors.primary || '#3b82f6'}`,
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.mutedForeground || '#9ca3af'
              }}>
                Loading...
              </span>
            </div>
          ) : (
            // React Native ActivityIndicator
            <>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary || '#3b82f6'}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <Text style={{ 
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.mutedForeground || '#9ca3af',
                textAlign: 'center',
              }}>
                Loading...
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};