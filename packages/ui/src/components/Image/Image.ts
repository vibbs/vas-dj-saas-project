// Platform-aware Image export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Image as WebImage } from './Image.web';
import { Image as NativeImage } from './Image.native';

// Export the platform-aware Image component
export const Image = createPlatformComponent(
  NativeImage,
  WebImage
);

// Re-export types
export type { ImageProps, ImageSource, ProcessedImageSource } from './types';