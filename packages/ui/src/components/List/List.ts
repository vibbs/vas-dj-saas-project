// Platform-aware List export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { List as WebList, ListItem as WebListItem } from './List.web';
import { List as NativeList, ListItem as NativeListItem } from './List.native';

// Export the platform-aware List components
export const List = createPlatformComponent(
  NativeList,
  WebList
);

export const ListItem = createPlatformComponent(
  NativeListItem,
  WebListItem
);

// Re-export types
export type { ListProps, ListItemProps } from './types';