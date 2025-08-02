// Platform-aware Spinner export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Spinner as WebSpinner } from './Spinner.web';
import { Spinner as NativeSpinner } from './Spinner.native';

// Export the platform-aware Spinner component
export const Spinner = createPlatformComponent(
  NativeSpinner,
  WebSpinner
);

// Re-export types
export type { SpinnerProps } from './types';