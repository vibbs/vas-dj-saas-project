// Platform-aware Toast export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Toast as WebToast } from './Toast.web';
import { Toast as NativeToast } from './Toast.native';

// Export the platform-aware Toast component
export const Toast = createPlatformComponent(
  NativeToast,
  WebToast
);

// Re-export types
export type { ToastProps } from './types';