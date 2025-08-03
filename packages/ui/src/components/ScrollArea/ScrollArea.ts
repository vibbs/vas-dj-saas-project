// Platform-aware ScrollArea export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { ScrollArea as WebScrollArea } from './ScrollArea.web';
import { ScrollArea as NativeScrollArea } from './ScrollArea.native';

// Export the platform-aware ScrollArea component
export const ScrollArea = createPlatformComponent(
  NativeScrollArea,
  WebScrollArea
);

// Re-export types
export type { ScrollAreaProps } from './types';