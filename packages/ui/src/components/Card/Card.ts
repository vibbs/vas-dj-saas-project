// Platform-aware Card export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Card as WebCard } from './Card.web';
import { Card as NativeCard } from './Card.native';

// Export the platform-aware Card component
export const Card = createPlatformComponent(
  NativeCard,
  WebCard
);

// Re-export types
export type { CardProps } from './types';