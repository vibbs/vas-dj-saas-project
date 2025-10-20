import type { Account } from '@vas-dj-saas/api-client';

/**
 * Permission configuration for navigation items
 */
export interface NavPermission {
  /** Permission check type */
  type: 'role' | 'custom';

  /** Required roles (OR logic - any role matches) */
  roles?: Array<'admin' | 'orgAdmin' | 'orgCreator' | 'user'>;

  /** Custom permission check function */
  customCheck?: (account: Account) => boolean;
}

/**
 * Feature flag configuration
 */
export interface NavFeatureFlag {
  /** Flag key(s) to check */
  flags: string | string[];

  /** Use AND logic (all flags) vs OR logic (any flag) */
  requiresAll?: boolean;
}

/**
 * Navigation item configuration
 */
export interface NavItem {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon identifier (can be emoji or icon library key) */
  icon: string;

  /** Navigation path */
  href?: string;

  /** Opens in new tab/window */
  external?: boolean;

  // Access Control
  /** Permission requirements */
  permission?: NavPermission;

  /** Feature flag requirements */
  featureFlags?: NavFeatureFlag;

  // Hierarchy
  /** Child navigation items */
  children?: NavItem[];

  /** Can be expanded/collapsed */
  expandable?: boolean;

  // UI Metadata
  /** Badge text/count (for notifications, etc.) */
  badge?: string | number;

  /** Helper text / description */
  description?: string;

  // Platform Targeting
  /** Supported platforms */
  platforms?: Array<'web' | 'mobile' | 'all'>;

  // Behavior
  /** Custom click handler ID */
  onClick?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Order/priority for sorting */
  order?: number;
}

/**
 * Navigation section (group of items)
 */
export interface NavSection {
  /** Unique identifier */
  id: string;

  /** Section title (optional) */
  title?: string;

  /** Section items */
  items: NavItem[];

  /** Section-level permissions */
  permission?: NavPermission;

  /** Section-level feature flags */
  featureFlags?: NavFeatureFlag;

  /** Supported platforms */
  platforms?: Array<'web' | 'mobile' | 'all'>;

  /** Order/priority */
  order?: number;
}

/**
 * Complete navigation configuration
 */
export interface NavConfig {
  /** Config version (for migrations) */
  version: string;

  /** Navigation sections */
  sections: NavSection[];

  /** Config metadata */
  metadata?: {
    lastUpdated?: string;
    author?: string;
    description?: string;
  };
}
