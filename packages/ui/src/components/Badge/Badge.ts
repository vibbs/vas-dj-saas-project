// Platform-aware Badge export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Badge as WebBadge } from './Badge.web';
import { Badge as NativeBadge } from './Badge.native';

// Export the platform-aware Badge component
export const Badge = createPlatformComponent(
  NativeBadge,
  WebBadge
);

// Re-export types
export type { BadgeProps } from './types';