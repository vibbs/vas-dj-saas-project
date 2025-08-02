// Platform-aware Slider export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Slider as WebSlider } from './Slider.web';
import { Slider as NativeSlider } from './Slider.native';

// Export the platform-aware Slider component
export const Slider = createPlatformComponent(
  NativeSlider,
  WebSlider
);

// Re-export types
export type { SliderProps } from './types';