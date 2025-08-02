// Platform-aware Radio export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Radio as WebRadio } from './Radio.web';
import { Radio as NativeRadio } from './Radio.native';

// Export the platform-aware Radio component
export const Radio = createPlatformComponent(
  NativeRadio,
  WebRadio
);

// Re-export types
export type { RadioProps, RadioOption } from './types';