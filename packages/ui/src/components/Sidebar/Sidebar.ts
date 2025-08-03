// Platform-aware Sidebar export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Sidebar as WebSidebar } from './Sidebar.web';
import { Sidebar as NativeSidebar } from './Sidebar.native';

// Export the platform-aware Sidebar component
export const Sidebar = createPlatformComponent(
  NativeSidebar,
  WebSidebar
);

// Re-export types
export type { SidebarProps, SidebarItem, SidebarItemComponentProps } from './types';