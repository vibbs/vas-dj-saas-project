// Platform-aware Modal export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Modal as WebModal } from './Modal.web';
import { Modal as NativeModal } from './Modal.native';

// Export the platform-aware Modal component
export const Modal = createPlatformComponent(
  NativeModal,
  WebModal
);

// Re-export types
export type { ModalProps } from './types';