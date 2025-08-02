// Platform-aware Select export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Select as WebSelect } from './Select.web';
import { Select as NativeSelect } from './Select.native';

// Export the platform-aware Select component
export const Select = createPlatformComponent(
  NativeSelect,
  WebSelect
);

// Re-export types
export type { SelectProps, SelectOption } from './types';