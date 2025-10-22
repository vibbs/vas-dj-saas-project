import type { Account } from "@vas-dj-saas/api-client";

/**
 * Permission configuration for navigation items
 */
export interface NavPermission {
  /** Permission check type */
  type: "role" | "custom";

  /** Required roles (OR logic - any role matches) */
  roles?: Array<"admin" | "orgAdmin" | "orgCreator" | "user">;

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
 * Quick action configuration for hub pages
 */
export interface QuickAction {
  /** Unique identifier */
  id: string;

  /** Action label */
  label: string;

  /** Icon name */
  icon: string;

  /** Navigation path or handler */
  href?: string;

  /** Custom action handler ID */
  onClick?: string;

  /** Variant style */
  variant?: "primary" | "secondary" | "outline" | "ghost";

  /** Permission requirements */
  permission?: NavPermission;

  /** Feature flag requirements */
  featureFlags?: NavFeatureFlag;

  /** Order/priority */
  order?: number;
}

/**
 * Hub card configuration
 */
export interface HubCard {
  /** Unique identifier */
  id: string;

  /** Card title */
  title: string;

  /** Card description */
  description?: string;

  /** Icon name */
  icon: string;

  /** Navigation path when card is clicked */
  href: string;

  /** Metric value (e.g., "12 members", "5 roles") */
  metric?: string | number;

  /** Metric label (e.g., "Active", "Total") */
  metricLabel?: string;

  /** Badge text/count */
  badge?: string | number;

  /** Badge variant */
  badgeVariant?: "default" | "success" | "warning" | "danger";

  /** Permission requirements */
  permission?: NavPermission;

  /** Feature flag requirements */
  featureFlags?: NavFeatureFlag;

  /** Order/priority */
  order?: number;
}

/**
 * Hub configuration for a section
 */
export interface HubConfig {
  /** Hub title */
  title: string;

  /** Hub description */
  description?: string;

  /** Hub cards */
  cards: HubCard[];

  /** Quick actions */
  quickActions?: QuickAction[];

  /** Summary metrics (displayed above cards) */
  summaryMetrics?: Array<{
    label: string;
    value: string | number;
    icon?: string;
  }>;
}

/**
 * Secondary sidebar item configuration
 */
export interface SecondaryNavItem {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon name */
  icon?: string;

  /** Navigation path */
  href: string;

  /** Badge text/count */
  badge?: string | number;

  /** Permission requirements */
  permission?: NavPermission;

  /** Feature flag requirements */
  featureFlags?: NavFeatureFlag;

  /** Order/priority */
  order?: number;

  /** Child items (for nested secondary nav) */
  children?: SecondaryNavItem[];
}

/**
 * Secondary sidebar configuration for a section
 */
export interface SecondarySidebarConfig {
  /** Items to display in secondary sidebar */
  items: SecondaryNavItem[];

  /** Include "Overview" link back to hub */
  showOverviewLink?: boolean;

  /** Label for overview link (default: "Overview") */
  overviewLabel?: string;

  /** Custom overview link href (defaults to section base path) */
  overviewHref?: string;
}

/**
 * View type for routing and layout logic
 */
export type ViewType = "hub" | "detail" | "tabs" | "standalone";

/**
 * Navigation item configuration
 */
export interface NavItem {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon name (lucide-react icon name, e.g., 'Home', 'User', 'Settings') */
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
  platforms?: Array<"web" | "mobile" | "all">;

  // Behavior
  /** Custom click handler ID */
  onClick?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Order/priority for sorting */
  order?: number;

  // Hub + Secondary Sidebar
  /** View type for this item */
  viewType?: ViewType;

  /** Hub configuration (if viewType is "hub") */
  hubConfig?: HubConfig;

  /** Secondary sidebar configuration (for detail pages under this item) */
  secondarySidebar?: SecondarySidebarConfig;
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
  platforms?: Array<"web" | "mobile" | "all">;

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
