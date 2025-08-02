import { SvgProps } from "react-native-svg";

// Platform-agnostic icon name type
// This represents Lucide icon names available on both platforms
// Common examples: 'Home', 'User', 'Settings', 'Search', 'Bell', etc.
export type IconName = string;

export interface IconProps extends SvgProps {
  name?: IconName;
  svgFile?: React.FC<SvgProps>; // for custom SVGs
  color?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  stroke?: string;
  strokeWidth?: number;
  viewBox?: string;
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  testID?: string; // Cross-platform testing

  // SVG-specific props (web)
  width?: number | string;
  height?: number | string;

  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string; // React Native: Accessible name
  accessibilityHint?: string; // React Native: Additional context
  accessibilityRole?: "image" | "none" | "button"; // React Native: Element role
  "aria-label"?: string; // Web: Accessible name
  "aria-describedby"?: string; // Web: References to describing elements
  "aria-hidden"?: boolean; // Web: Hide decorative icons from screen readers
  alt?: string; // Web: Alternative text for images
  title?: string; // Web: Tooltip text

  // Event handlers
  onPress?: () => void; // React Native
  onClick?: () => void; // Web
}
