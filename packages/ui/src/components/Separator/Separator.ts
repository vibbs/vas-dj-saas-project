// Platform-aware Separator export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Separator as WebSeparator } from './Separator.web';
import { Separator as NativeSeparator } from './Separator.native';

// Export the platform-aware Separator component
export const Separator = createPlatformComponent(
  NativeSeparator,
  WebSeparator
);

// Re-export types
export type { SeparatorProps } from './types';
