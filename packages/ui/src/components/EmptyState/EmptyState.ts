// Platform-aware EmptyState export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { EmptyState as WebEmptyState } from './EmptyState.web';
import { EmptyState as NativeEmptyState } from './EmptyState.native';

// Export the platform-aware EmptyState component
export const EmptyState = createPlatformComponent(
  NativeEmptyState,
  WebEmptyState
);

// Re-export types
export type { EmptyStateProps } from './types';