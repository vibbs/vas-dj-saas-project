// Platform-aware Breadcrumbs export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Breadcrumbs as WebBreadcrumbs } from './Breadcrumbs.web';
import { Breadcrumbs as NativeBreadcrumbs } from './Breadcrumbs.native';

// Export the platform-aware Breadcrumbs component
export const Breadcrumbs = createPlatformComponent(
  NativeBreadcrumbs,
  WebBreadcrumbs
);

// Re-export types
export type { BreadcrumbsProps, BreadcrumbItem, BreadcrumbItemComponentProps } from './types';