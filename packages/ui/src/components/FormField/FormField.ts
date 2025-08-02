// Platform-aware FormField export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { FormField as WebFormField } from './FormField.web';
import { FormField as NativeFormField } from './FormField.native';

// Export the platform-aware FormField component
export const FormField = createPlatformComponent(
  NativeFormField,
  WebFormField
);

// Re-export types
export type { FormFieldProps } from './types';