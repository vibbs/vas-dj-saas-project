// Platform-aware Label export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Label as WebLabel } from './Label.web';
import { Label as NativeLabel } from './Label.native';

// Export the platform-aware Label component
export const Label = createPlatformComponent(
  NativeLabel,
  WebLabel
);

// Re-export types
export type { LabelProps } from './types';
