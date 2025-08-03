// Platform-aware ListItem export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { ListItem as WebListItem } from './ListItem.web';
import { ListItem as NativeListItem } from './ListItem.native';

// Export the platform-aware ListItem component
export const ListItem = createPlatformComponent(
  NativeListItem,
  WebListItem
);

// Re-export types
export type { ListItemProps } from './types';