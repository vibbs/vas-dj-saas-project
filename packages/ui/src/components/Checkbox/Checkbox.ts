// Platform-aware Checkbox export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Checkbox as WebCheckbox } from './Checkbox.web';
import { Checkbox as NativeCheckbox } from './Checkbox.native';

// Export the platform-aware Checkbox component
export const Checkbox = createPlatformComponent(
  NativeCheckbox,
  WebCheckbox
);

// Re-export types
export type { CheckboxProps } from './types';