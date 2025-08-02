// Platform-aware Tooltip export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Tooltip as WebTooltip } from './Tooltip.web';
import { Tooltip as NativeTooltip } from './Tooltip.native';

// Export the platform-aware Tooltip component
export const Tooltip = createPlatformComponent(
  NativeTooltip,
  WebTooltip
);

// Re-export types
export type { TooltipProps } from './types';