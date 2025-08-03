import { ImageSource, ProcessedImageSource, ImageUtilityProps } from './types';

/**
 * Process image source to extract URI and metadata
 */
export function processImageSource(source: ImageSource): ProcessedImageSource {
  let uri: string;
  let isLocal = false;
  let isSvg = false;
  let isBase64 = false;

  // Handle different source types
  if (typeof source === 'string') {
    uri = source;
    isBase64 = source.startsWith('data:');
    isSvg = source.toLowerCase().includes('.svg') || source.includes('svg+xml');
  } else if (typeof source === 'number') {
    // React Native require() returns a number
    uri = source.toString();
    isLocal = true;
  } else if (source && typeof source === 'object') {
    if ('uri' in source) {
      uri = source.uri;
      isBase64 = source.uri.startsWith('data:');
      isSvg = source.uri.toLowerCase().includes('.svg') || source.uri.includes('svg+xml');
    } else if ('default' in source) {
      // ES module import
      uri = source.default;
      isLocal = true;
      isSvg = source.default.toLowerCase().includes('.svg');
    } else {
      uri = '';
    }
  } else {
    uri = '';
  }

  return {
    uri,
    isLocal,
    isSvg,
    isBase64,
  };
}

/**
 * Calculate aspect ratio styles for container
 */
export function getAspectRatioStyles(props: ImageUtilityProps) {
  const { aspectRatio, width, height } = props;
  
  if (aspectRatio === 'auto') {
    return {};
  }

  if (typeof aspectRatio === 'number') {
    return {
      aspectRatio: aspectRatio.toString(),
    };
  }

  // Calculate aspect ratio from width/height if provided
  if (width && height) {
    const w = typeof width === 'string' ? parseFloat(width) : width;
    const h = typeof height === 'string' ? parseFloat(height) : height;
    
    if (!isNaN(w) && !isNaN(h) && h !== 0) {
      return {
        aspectRatio: (w / h).toString(),
      };
    }
  }

  return {};
}

/**
 * Get CSS object-fit value from resizeMode
 */
export function getObjectFit(resizeMode: string = 'cover'): string {
  const resizeModeMap: Record<string, string> = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'fill',
    center: 'none',
    repeat: 'none', // CSS doesn't have repeat for object-fit, handle separately
  };

  return resizeModeMap[resizeMode] || 'cover';
}

/**
 * Generate responsive image sizes
 */
export function generateImageSizes(width?: number | string): string {
  if (!width) {
    return '100vw';
  }

  if (typeof width === 'number') {
    return `${width}px`;
  }

  // Handle percentage and other CSS units
  return width;
}

/**
 * Check if source is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for data URLs
  if (url.startsWith('data:image/')) return true;
  
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
  if (imageExtensions.test(url)) return true;
  
  // Check for blob URLs
  if (url.startsWith('blob:')) return true;
  
  // Check for valid HTTP/HTTPS URLs
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a blur data URL for placeholder
 */
export function createBlurDataURL(color: string = '#f3f4f6'): string {
  // Create a minimal 1x1 SVG with the specified color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get image dimensions from various sources
 */
export function getImageDimensions(props: ImageUtilityProps) {
  const { width, height, aspectRatio } = props;
  
  const styles: any = {};
  
  if (width) {
    styles.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    styles.height = typeof height === 'number' ? `${height}px` : height;
  }
  
  // Apply aspect ratio if specified and no explicit height
  if (aspectRatio && typeof aspectRatio === 'number' && !height) {
    if (width) {
      const w = typeof width === 'number' ? width : parseFloat(width.toString());
      if (!isNaN(w)) {
        styles.height = `${w / aspectRatio}px`;
      }
    } else {
      styles.aspectRatio = aspectRatio.toString();
    }
  }
  
  return styles;
}

/**
 * Detect if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if the image source supports lazy loading
 */
export function supportsLazyLoading(source: ProcessedImageSource): boolean {
  // Don't lazy load base64 images or local assets
  return !source.isBase64 && !source.isLocal && isBrowser();
}

/**
 * Create a placeholder image source
 */
export function createPlaceholderSource(
  width: number = 400, 
  height: number = 300, 
  text: string = 'Image'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}