// Platform-aware Input export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Input as WebInput } from './Input.web';
import { Input as NativeInput } from './Input.native';

// Export the platform-aware Input component
export const Input = createPlatformComponent(
  NativeInput,
  WebInput
);

// Re-export types
export type { InputProps } from './types';