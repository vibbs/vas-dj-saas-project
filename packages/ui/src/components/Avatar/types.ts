export interface AvatarProps {
  // Avatar content options
  src?: string;                    // Image URL
  alt?: string;                    // Image alt text
  name?: string;                   // User name for initials fallback
  initials?: string;               // Custom initials override
  fallbackIcon?: React.ReactNode; // Custom fallback icon/content
  
  // Styling options
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'circular' | 'rounded' | 'square';
  color?: string;                  // Background color for initials
  textColor?: string;              // Text color for initials
  
  // Interactive options
  onClick?: () => void;            // Web click handler
  onPress?: () => void;            // React Native press handler
  
  // Platform-specific styling
  className?: string;              // Web only
  style?: any;                     // React Native only
  testID?: string;                 // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'image' | 'button' | 'none'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  role?: string;                   // Web: Element role
  title?: string;                  // Web: Tooltip text
  
  // Image loading options
  loading?: 'lazy' | 'eager';      // Web image loading strategy
  onImageLoad?: () => void;        // Image load success callback
  onImageError?: () => void;       // Image load error callback
}