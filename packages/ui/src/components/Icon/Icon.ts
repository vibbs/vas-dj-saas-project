// Platform-aware Icon export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Icon as WebIcon } from './Icon.web';
import { Icon as NativeIcon } from './Icon.native';

// Export the platform-aware Icon component
export const Icon = createPlatformComponent(
  NativeIcon,
  WebIcon
);

// Re-export types
export type { IconProps } from './types';