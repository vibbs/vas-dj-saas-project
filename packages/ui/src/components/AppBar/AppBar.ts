// Platform-aware AppBar export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { AppBar as WebAppBar } from './AppBar.web';
import { AppBar as NativeAppBar } from './AppBar.native';

// Export the platform-aware AppBar component
export const AppBar = createPlatformComponent(
  NativeAppBar,
  WebAppBar
);

// Re-export types
export type { AppBarProps, AppBarAction, AppBarActionComponentProps } from './types';