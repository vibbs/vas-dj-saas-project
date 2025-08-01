// Platform-aware Button export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Button as WebButton } from './Button.web';
import { Button as NativeButton } from './Button.native';

// Export the platform-aware Button component
export const Button = createPlatformComponent(
  NativeButton,
  WebButton
);

// Re-export types
export type { ButtonProps } from './types';