import React, { useState, useRef, useEffect } from 'react';
import { ImageProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  processImageSource, 
  getAspectRatioStyles, 
  getObjectFit, 
  getImageDimensions,
  isValidImageUrl,
  createBlurDataURL,
  supportsLazyLoading
} from './imageUtils';

export const Image: React.FC<ImageProps> = ({
  source,
  alt = '',
  width,
  height,
  aspectRatio = 'auto',
  resizeMode = 'cover',
  objectFit,
  borderRadius,
  loading = 'lazy',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  svg,
  format = 'auto',
  fallback,
  errorImage,
  onLoad,
  onError,
  onLoadStart,
  onProgress,
  className,
  style,
  testID,
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  crossOrigin,
  decoding = 'async',
  referrerPolicy,
  sizes,
  srcSet,
  containerStyle,
  containerClassName,
  ...props
}) => {
  const { theme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const processedSource = processImageSource(source);
  const isSvg = svg || processedSource.isSvg;
  const shouldLazyLoad = !priority && supportsLazyLoading(processedSource) && loading === 'lazy';

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

  // Get computed styles
  const aspectRatioStyles = getAspectRatioStyles({ source, aspectRatio, width, height });
  const dimensionStyles = getImageDimensions({ source, width, height, aspectRatio });
  const finalObjectFit = objectFit || getObjectFit(resizeMode);

  // Container styles for aspect ratio and layout
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    ...aspectRatioStyles,
    ...dimensionStyles,
    ...containerStyle,
  };

  // Image styles
  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: finalObjectFit as any,
    objectPosition: 'center',
    display: 'block',
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    transition: 'opacity 0.3s ease-in-out',
    opacity: hasError ? 0 : hasLoaded ? 1 : placeholder === 'blur' ? 0.8 : 1,
    ...style,
  };

  // Placeholder styles
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.muted || '#f3f4f6',
    color: theme.colors.mutedForeground || '#9ca3af',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
    opacity: isLoading ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  };

  // Error/fallback content
  if (hasError) {
    if (errorImage) {
      const errorSource = processImageSource(errorImage);
      return (
        <div style={containerStyles} className={containerClassName}>
          <img
            src={errorSource.uri}
            alt={alt}
            style={imageStyles}
            onLoad={handleLoad}
            data-testid={testID ? `${testID}-error` : undefined}
          />
        </div>
      );
    }
    
    if (fallback) {
      return (
        <div 
          style={containerStyles} 
          className={containerClassName}
          data-testid={testID ? `${testID}-fallback` : undefined}
        >
          {fallback}
        </div>
      );
    }
    
    // Default error state
    return (
      <div 
        style={{ ...containerStyles, ...placeholderStyles, opacity: 1 }}
        className={containerClassName}
        role="img"
        aria-label={ariaLabel || accessibilityLabel || alt || 'Failed to load image'}
        data-testid={testID ? `${testID}-error` : undefined}
      >
        <span>⚠️</span>
      </div>
    );
  }

  // SVG handling
  if (isSvg && !processedSource.isBase64) {
    return (
      <div style={containerStyles} className={containerClassName}>
        <object
          data={processedSource.uri}
          type="image/svg+xml"
          style={imageStyles}
          aria-label={ariaLabel || accessibilityLabel || alt}
          role={role || 'img'}
          onLoad={handleLoad}
          onError={handleError}
          data-testid={testID}
          {...props}
        >
          {/* Fallback for browsers that don't support object */}
          <img
            src={processedSource.uri}
            alt={alt}
            style={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
          />
        </object>
        
        {/* Loading placeholder */}
        {placeholder !== 'empty' && (
          <div style={placeholderStyles}>
            {placeholder === 'blur' && blurDataURL ? (
              <img
                src={blurDataURL}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                aria-hidden="true"
              />
            ) : (
              <span>Loading...</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Regular image handling
  const imageSrc = isValidImageUrl(processedSource.uri) ? processedSource.uri : undefined;

  return (
    <div style={containerStyles} className={`${containerClassName} ${className}`.trim()}>
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          style={imageStyles}
          loading={shouldLazyLoad ? 'lazy' : 'eager'}
          decoding={decoding}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          onLoadStart={handleLoadStart}
          data-testid={testID}
          aria-label={ariaLabel || accessibilityLabel}
          aria-describedby={ariaDescribedBy}
          role={role || 'img'}
          {...props}
        />
      )}
      
      {/* Loading placeholder */}
      {placeholder !== 'empty' && (
        <div style={placeholderStyles}>
          {placeholder === 'blur' && blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                filter: 'blur(8px)',
                transform: 'scale(1.1)', // Prevent blur edge artifacts
              }}
              aria-hidden="true"
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: theme.spacing.xs 
            }}>
              <div style={{
                width: 24,
                height: 24,
                border: `2px solid ${theme.colors.mutedForeground || '#9ca3af'}`,
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: theme.typography.fontSize.xs }}>
                Loading...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add CSS animations for loading states
if (typeof document !== 'undefined') {
  const styleId = 'image-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}