// Platform-aware Text export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Text as WebText } from './Text.web';
import { Text as NativeText } from './Text.native';

// Export the platform-aware Text component
export const Text = createPlatformComponent(
  NativeText,
  WebText
);

// Re-export types
export type { TextProps } from './types';