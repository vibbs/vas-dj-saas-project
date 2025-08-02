// Platform-aware Skeleton export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Skeleton as WebSkeleton } from './Skeleton.web';
import { Skeleton as NativeSkeleton } from './Skeleton.native';

// Export the platform-aware Skeleton component
export const Skeleton = createPlatformComponent(
  NativeSkeleton,
  WebSkeleton
);

// Re-export types
export type { SkeletonProps } from './types';