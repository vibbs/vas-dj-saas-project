// Platform-aware Avatar export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Avatar as WebAvatar } from './Avatar.web';
import { Avatar as NativeAvatar } from './Avatar.native';

// Export the platform-aware Avatar component
export const Avatar = createPlatformComponent(
  NativeAvatar,
  WebAvatar
);

// Re-export types
export type { AvatarProps } from './types';