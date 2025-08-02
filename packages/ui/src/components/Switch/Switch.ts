// Platform-aware Switch export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Switch as WebSwitch } from './Switch.web';
import { Switch as NativeSwitch } from './Switch.native';

// Export the platform-aware Switch component
export const Switch = createPlatformComponent(
  NativeSwitch,
  WebSwitch
);

// Re-export types
export type { SwitchProps } from './types';