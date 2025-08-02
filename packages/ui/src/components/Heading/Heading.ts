// Platform-aware Heading export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Heading as WebHeading } from './Heading.web';
import { Heading as NativeHeading } from './Heading.native';

// Export the platform-aware Heading component
export const Heading = createPlatformComponent(
  NativeHeading,
  WebHeading
);

// Re-export types
export type { HeadingProps } from './types';