// Platform-aware Textarea export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Textarea as WebTextarea } from './Textarea.web';
import { Textarea as NativeTextarea } from './Textarea.native';

// Export the platform-aware Textarea component
export const Textarea = createPlatformComponent(
  NativeTextarea,
  WebTextarea
);

// Re-export types
export type { TextareaProps } from './types';