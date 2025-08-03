// Platform-aware Table export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Table as WebTable } from './Table.web';
import { Table as NativeTable } from './Table.native';

// Export the platform-aware Table component
export const Table = createPlatformComponent(
  NativeTable,
  WebTable
);

// Re-export types
export type { TableProps, TableColumn } from './types';