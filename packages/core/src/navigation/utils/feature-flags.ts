import type { NavFeatureFlag } from '../config/nav-schema';

/**
 * Feature flag context (can be extended with LaunchDarkly, etc.)
 */
export interface FeatureFlagContext {
  flags: Record<string, boolean>;
}

/**
 * Check if feature flags are enabled
 */
export function checkFeatureFlags(
  featureFlags: NavFeatureFlag | undefined,
  context: FeatureFlagContext
): boolean {
  // No feature flag requirement = always visible
  if (!featureFlags) return true;

  const flagKeys = Array.isArray(featureFlags.flags)
    ? featureFlags.flags
    : [featureFlags.flags];

  if (flagKeys.length === 0) return true;

  // AND logic: all flags must be enabled
  if (featureFlags.requiresAll) {
    return flagKeys.every((key) => context.flags[key] === true);
  }

  // OR logic: at least one flag must be enabled
  return flagKeys.some((key) => context.flags[key] === true);
}

/**
 * Create default feature flag context
 */
export function createFeatureFlagContext(
  flags: Record<string, boolean> = {}
): FeatureFlagContext {
  return { flags };
}
