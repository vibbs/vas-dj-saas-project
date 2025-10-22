import { useMemo } from 'react';
import type { Account } from '@vas-dj-saas/api-client';
import { navigationConfig } from '../config/nav-items';
import { checkPermission } from '../utils/permissions';
import { checkFeatureFlags, type FeatureFlagContext } from '../utils/feature-flags';
import type { NavItem, NavSection } from '../config/nav-schema';

export interface UseNavigationOptions {
  /** Current platform */
  platform?: 'web' | 'mobile' | 'all';

  /** Feature flag context */
  featureFlags?: FeatureFlagContext;

  /** User account (if not provided, assumed unauthenticated) */
  account?: Account;
}

export interface UseNavigationResult {
  /** Filtered navigation sections */
  sections: NavSection[];

  /** User account */
  account?: Account;
}

/**
 * Main navigation hook
 * Returns filtered navigation based on permissions, feature flags, and platform
 */
export function useNavigation(
  options: UseNavigationOptions = {}
): UseNavigationResult {
  const {
    platform = 'web',
    featureFlags = { flags: {} },
    account,
  } = options;

  const sections = useMemo(() => {
    const filtered = filterSections(
      navigationConfig.sections,
      account,
      platform,
      featureFlags
    );

    // Debug logging
    console.log('[useNavigation] Raw sections:', navigationConfig.sections);
    console.log('[useNavigation] Filtered sections:', filtered);
    console.log('[useNavigation] Account:', account);
    console.log('[useNavigation] Platform:', platform);

    return filtered;
  }, [account, platform, featureFlags]);

  return {
    sections,
    account,
  };
}

/**
 * Filter sections based on permissions, feature flags, and platform
 */
function filterSections(
  sections: NavSection[],
  account: Account | undefined,
  platform: string,
  featureFlags: FeatureFlagContext
): NavSection[] {
  return sections
    .filter((section) => {
      // Check section-level permissions
      if (!checkPermission(section.permission, account)) return false;

      // Check section-level feature flags
      if (!checkFeatureFlags(section.featureFlags, featureFlags)) return false;

      // Check platform support
      if (
        section.platforms &&
        !section.platforms.includes(platform as any) &&
        !section.platforms.includes('all')
      ) {
        return false;
      }

      return true;
    })
    .map((section) => ({
      ...section,
      items: filterItems(section.items, account, platform, featureFlags),
    }))
    .filter((section) => section.items.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Filter navigation items recursively
 */
function filterItems(
  items: NavItem[],
  account: Account | undefined,
  platform: string,
  featureFlags: FeatureFlagContext
): NavItem[] {
  return items
    .filter((item) => {
      // Check permissions
      if (!checkPermission(item.permission, account)) return false;

      // Check feature flags
      if (!checkFeatureFlags(item.featureFlags, featureFlags)) return false;

      // Check platform
      if (
        item.platforms &&
        !item.platforms.includes(platform as any) &&
        !item.platforms.includes('all')
      ) {
        return false;
      }

      // Check disabled state
      if (item.disabled) return false;

      return true;
    })
    .map((item) => {
      // Recursively filter children
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterItems(
          item.children,
          account,
          platform,
          featureFlags
        );

        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter((item) => {
      // Remove expandable items with no visible children
      if (item.expandable && item.children) {
        return item.children.length > 0;
      }
      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
