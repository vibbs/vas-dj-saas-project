// Platform-aware Divider export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Divider as WebDivider } from './Divider.web';
import { Divider as NativeDivider } from './Divider.native';

// Export the platform-aware Divider component
export const Divider = createPlatformComponent(
  NativeDivider,
  WebDivider
);

// Re-export types
export type { DividerProps } from './types';