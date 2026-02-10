import type {
  HubConfig as CoreHubConfig,
  SecondarySidebarConfig as CoreSecondarySidebarConfig,
  NavConfig,
  NavItem,
  NavSection
} from '@vas-dj-saas/core';
import type { HubCardProps } from '@vas-dj-saas/ui';

// Define types locally since they're not exported from UI package
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  order?: number;
}

interface SummaryMetric {
  label: string;
  value: string | number;
  icon?: string;
}

interface HubConfig {
  title: string;
  description?: string;
  cards: HubCardProps[];
  quickActions?: QuickAction[];
  summaryMetrics?: SummaryMetric[];
}

interface SecondaryNavItem {
  id: string;
  label: string;
  icon?: string;
  href: string;
  badge?: string | number;
  order?: number;
  children?: SecondaryNavItem[];
}

interface SecondarySidebarConfig {
  items: SecondaryNavItem[];
  showOverviewLink?: boolean;
  overviewLabel?: string;
  overviewHref?: string;
}

/**
 * Convert core navigation hub config to UI component hub config
 */
export function convertToHubConfig(coreConfig: CoreHubConfig): HubConfig {
  return {
    title: coreConfig.title,
    description: coreConfig.description,
    cards: coreConfig.cards.map((card): HubCardProps => ({
      id: card.id,
      title: card.title,
      description: card.description,
      icon: card.icon,
      href: card.href,
      metric: card.metric,
      metricLabel: card.metricLabel,
      badge: card.badge,
      badgeVariant: card.badgeVariant as any,
      order: card.order,
    })),
    quickActions: coreConfig.quickActions?.map((action): QuickAction => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      href: action.href,
      onClick: action.onClick,
      variant: action.variant,
      order: action.order,
    })),
    summaryMetrics: coreConfig.summaryMetrics,
  };
}

/**
 * Convert core navigation secondary sidebar config to UI component config
 */
export function convertToSecondarySidebarConfig(
  coreConfig: CoreSecondarySidebarConfig
): SecondarySidebarConfig {
  return {
    items: coreConfig.items.map((item): SecondaryNavItem => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      href: item.href,
      badge: item.badge,
      order: item.order,
      children: item.children,
    })),
    showOverviewLink: coreConfig.showOverviewLink,
    overviewLabel: coreConfig.overviewLabel,
    overviewHref: coreConfig.overviewHref,
  };
}

/**
 * Find a navigation item by its href path
 */
export function findNavItemByPath(
  pathname: string,
  navConfig: NavConfig
): NavItem | null {
  for (const section of navConfig.sections) {
    const found = findItemInSection(pathname, section);
    if (found) return found;
  }
  return null;
}

/**
 * Recursively search for nav item in section
 */
function findItemInSection(
  pathname: string,
  section: NavSection
): NavItem | null {
  for (const item of section.items) {
    if (item.href === pathname) return item;

    // Check children
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) return child;

        // Recursively check nested children
        if (child.children) {
          const found = findItemInChildren(pathname, child.children);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

/**
 * Recursively search in nested children
 */
function findItemInChildren(
  pathname: string,
  children: NavItem[]
): NavItem | null {
  for (const child of children) {
    if (child.href === pathname) return child;
    if (child.children) {
      const found = findItemInChildren(pathname, child.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get page metadata (title and description) from navigation config
 */
export function getPageMetadata(
  pathname: string,
  navConfig: NavConfig
): { title: string; description?: string } | null {
  const navItem = findNavItemByPath(pathname, navConfig);

  if (!navItem) {
    return null;
  }

  // For hub pages, use hubConfig title/description if available
  if (navItem.viewType === 'hub' && navItem.hubConfig) {
    return {
      title: navItem.hubConfig.title,
      description: navItem.hubConfig.description,
    };
  }

  // Otherwise use nav item label and description
  return {
    title: navItem.label,
    description: navItem.description,
  };
}
