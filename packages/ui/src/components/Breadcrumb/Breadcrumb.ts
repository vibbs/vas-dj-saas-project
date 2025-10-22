// Platform-aware Breadcrumb export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Breadcrumb as WebBreadcrumb } from './Breadcrumb.web';
import { Breadcrumb as NativeBreadcrumb } from './Breadcrumb.native';

// Export the platform-aware Breadcrumb component
export const Breadcrumb = createPlatformComponent(
  NativeBreadcrumb,
  WebBreadcrumb
);

// Re-export types
export type { BreadcrumbProps, BreadcrumbItem, BreadcrumbItemComponentProps } from './types';