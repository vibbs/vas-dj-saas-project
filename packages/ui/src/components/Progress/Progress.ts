// Platform-aware Progress export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Progress as WebProgress } from './Progress.web';
import { Progress as NativeProgress } from './Progress.native';

// Export the platform-aware Progress component
export const Progress = createPlatformComponent(
  NativeProgress,
  WebProgress
);

// Re-export types
export type { ProgressProps } from './types';