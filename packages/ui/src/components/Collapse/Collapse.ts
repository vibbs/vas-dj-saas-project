// Platform-aware Collapse export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Collapse as WebCollapse } from './Collapse.web';
import { Collapse as NativeCollapse } from './Collapse.native';

// Export the platform-aware Collapse component
export const Collapse = createPlatformComponent(
  NativeCollapse,
  WebCollapse
);

// Re-export types
export type { CollapseProps } from './types';