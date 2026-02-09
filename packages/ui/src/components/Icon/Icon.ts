// Icon export for web builds
// For web builds, always use the web implementation

import { Icon as WebIcon } from './Icon.web';

// Export the web Icon component
export const Icon = WebIcon;

// Re-export types
export type { IconProps } from './types';