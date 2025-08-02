// Platform-aware Link export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Link as WebLink } from './Link.web';
import { Link as NativeLink } from './Link.native';

// Export the platform-aware Link component
export const Link = createPlatformComponent(
  NativeLink,
  WebLink
);

// Re-export types
export type { LinkProps } from './types';