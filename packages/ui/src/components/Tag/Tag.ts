// Platform-aware Tag export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Tag as WebTag } from './Tag.web';
import { Tag as NativeTag } from './Tag.native';

// Export the platform-aware Tag component
export const Tag = createPlatformComponent(
  NativeTag,
  WebTag
);

// Re-export types
export type { TagProps } from './types';