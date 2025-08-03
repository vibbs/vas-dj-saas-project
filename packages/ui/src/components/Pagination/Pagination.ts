// Platform-aware Pagination export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Pagination as WebPagination } from './Pagination.web';
import { Pagination as NativePagination } from './Pagination.native';

// Export the platform-aware Pagination component
export const Pagination = createPlatformComponent(
  NativePagination,
  WebPagination
);

// Re-export types
export type { PaginationProps, PaginationItemProps } from './types';