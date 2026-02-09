import type { NavConfig, NavItem, NavSection } from '@vas-dj-saas/core';
import type { BreadcrumbItem } from '@vas-dj-saas/ui';

/**
 * Generate breadcrumbs from pathname using navigation config
 *
 * @param pathname - Current route pathname (e.g., '/settings/organization/members')
 * @param navConfig - Navigation configuration
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(
  pathname: string,
  navConfig: NavConfig
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = pathname.split('/').filter(Boolean);

  // Build cumulative paths for each segment
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Find matching nav item for this path
    const navItem = findNavItemByHref(currentPath, navConfig);

    if (navItem) {
      breadcrumbs.push({
        label: navItem.label,
        href: currentPath,
        // Last item shouldn't be clickable
        disabled: i === segments.length - 1,
      });
    } else {
      // If no nav item found, use capitalized segment as label
      breadcrumbs.push({
        label: capitalizeSegment(segment),
        href: currentPath,
        disabled: i === segments.length - 1,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Find a navigation item by its href
 */
function findNavItemByHref(
  href: string,
  navConfig: NavConfig
): NavItem | null {
  for (const section of navConfig.sections) {
    const found = findItemInSection(href, section);
    if (found) return found;
  }
  return null;
}

/**
 * Recursively search for nav item in section
 */
function findItemInSection(
  href: string,
  section: NavSection
): NavItem | null {
  for (const item of section.items) {
    if (item.href === href) return item;

    // Check children
    if (item.children) {
      for (const child of item.children) {
        if (child.href === href) return child;

        // Recursively check nested children
        if (child.children) {
          const found = findItemInChildren(href, child.children);
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
  href: string,
  children: NavItem[]
): NavItem | null {
  for (const child of children) {
    if (child.href === href) return child;
    if (child.children) {
      const found = findItemInChildren(href, child.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Capitalize a URL segment for display
 * Examples:
 * - 'settings' -> 'Settings'
 * - 'api-keys' -> 'API Keys'
 * - 'oauth' -> 'OAuth'
 */
function capitalizeSegment(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'api': 'API',
    'oauth': 'OAuth',
    'ui': 'UI',
    'id': 'ID',
  };

  return segment
    .split('-')
    .map(word => {
      const lower = word.toLowerCase();
      return specialCases[lower] || word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Get the current page's navigation item from pathname
 *
 * @param pathname - Current route pathname
 * @param navConfig - Navigation configuration
 * @returns The matching nav item or null
 */
export function getCurrentNavItem(
  pathname: string,
  navConfig: NavConfig
): NavItem | null {
  return findNavItemByHref(pathname, navConfig);
}

/**
 * Get page title and description from navigation config
 *
 * @param pathname - Current route pathname
 * @param navConfig - Navigation configuration
 * @returns Object with title and description, or null if not found
 */
export function getPageMetadata(
  pathname: string,
  navConfig: NavConfig
): { title: string; description?: string } | null {
  const navItem = getCurrentNavItem(pathname, navConfig);

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
