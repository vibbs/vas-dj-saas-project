export type ImageSource = string | number | { uri: string } | { default: string };

export interface ImageProps {
  // Source configuration
  source: ImageSource;
  alt?: string;
  
  // Layout and sizing
  width?: number | string;
  height?: number | string;
  aspectRatio?: number | 'auto';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
  
  // Styling
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'; // Web specific
  
  // Loading and performance
  loading?: 'eager' | 'lazy'; // Web only
  priority?: boolean; // Next.js Image priority
  placeholder?: 'blur' | 'empty'; // Loading placeholder strategy
  blurDataURL?: string; // Base64 blur placeholder
  
  // Format and type detection
  svg?: boolean; // Force SVG handling
  format?: 'auto' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'svg' | 'gif';
  
  // Error handling and fallbacks
  fallback?: React.ReactNode | ImageSource;
  errorImage?: ImageSource;
  
  // Events
  onLoad?: () => void;
  onError?: (error?: any) => void;
  onLoadStart?: () => void;
  onProgress?: (event: { loaded: number; total: number }) => void;
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  role?: string;                   // Web: Element role (img, presentation, etc.)
  
  // Advanced options
  crossOrigin?: 'anonymous' | 'use-credentials'; // Web CORS
  decoding?: 'async' | 'sync' | 'auto'; // Web decoding hint
  referrerPolicy?: string; // Web referrer policy
  sizes?: string; // Web responsive sizes
  srcSet?: string; // Web responsive image set
  
  // Container props for aspect ratio containers
  containerStyle?: any;
  containerClassName?: string;
}

export interface ImageUtilityProps {
  source: ImageSource;
  aspectRatio?: number | 'auto';
  width?: number | string;
  height?: number | string;
}

export interface ProcessedImageSource {
  uri: string;
  isLocal: boolean;
  isSvg: boolean;
  isBase64: boolean;
}