// Platform-aware Dialog export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Dialog as WebDialog } from './Dialog.web';
import { Dialog as NativeDialog } from './Dialog.native';

// Export the platform-aware Dialog component
export const Dialog = createPlatformComponent(
  NativeDialog,
  WebDialog
);

// Re-export types
export type { DialogProps } from './types';