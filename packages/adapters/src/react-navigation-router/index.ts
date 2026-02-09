import { useNavigation, useRoute } from "@react-navigation/native";
import type { TabRouterPort, RouterNavigationOptions } from "@vas-dj-saas/ui";
import { useCallback, useMemo } from "react";

/**
 * React Navigation Router Adapter
 *
 * Implements TabRouterPort using React Navigation for React Native apps.
 * This adapter manages navigation state and route parameters.
 *
 * Features:
 * - Native navigation integration
 * - Route parameter management
 * - Screen state preservation
 * - Deep linking support
 *
 * @example
 * ```tsx
 * import { useReactNavTabRouter } from '@vas-dj-saas/adapters/react-navigation-router';
 * import { ShallowTabs } from '@vas-dj-saas/ui';
 *
 * export default function SettingsScreen() {
 *   const router = useReactNavTabRouter();
 *   return <ShallowTabs tabs={tabs} router={router} />;
 * }
 * ```
 *
 * Note: This is a basic implementation. You may need to customize it based on:
 * - Your navigation structure (stack, tabs, drawer, etc.)
 * - Deep linking configuration
 * - State persistence requirements
 */
export function useReactNavTabRouter(): TabRouterPort {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Get current route parameters
  const params = useMemo(() => route.params ?? {}, [route.params]);

  const getValue = useCallback(
    (key: string): string | null => {
      return params[key] ?? null;
    },
    [params]
  );

  const setValue = useCallback(
    (key: string, value: string, _options?: RouterNavigationOptions) => {
      // Update route params without navigating to a new screen
      // This is equivalent to "shallow" routing in web
      navigation.setParams({
        ...params,
        [key]: value === "" ? undefined : value, // Remove param if empty
      } as any);
    },
    [navigation, params]
  );

  const getPathname = useCallback(() => {
    // Return current route name
    return route.name ?? "";
  }, [route.name]);

  const getSearchParams = useCallback(() => {
    // Convert params object to URLSearchParams-like string
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  }, [params]);

  return {
    getValue,
    setValue,
    getPathname,
    getSearchParams,
  };
}

/**
 * Alternative implementation for nested navigators
 *
 * Use this if you have nested tab/drawer navigators and need to
 * manage parameters at a specific navigator level.
 *
 * @param navigatorKey - The key of the navigator to target (optional)
 */
export function useReactNavQueryState(
  navigatorKey?: string
): TabRouterPort {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // If navigatorKey provided, try to get params from that navigator
  const params = useMemo(() => {
    if (navigatorKey && navigation.getState) {
      const state = navigation.getState();
      // Find the navigator by key and get its params
      // This is a simplified implementation - adjust based on your nav structure
      const navigator = state.routes.find((r: any) => r.key === navigatorKey);
      return navigator?.params ?? route.params ?? {};
    }
    return route.params ?? {};
  }, [navigatorKey, navigation, route.params]);

  const getValue = useCallback(
    (key: string): string | null => {
      return params[key] ?? null;
    },
    [params]
  );

  const setValue = useCallback(
    (key: string, value: string, _options?: RouterNavigationOptions) => {
      navigation.setParams({
        ...params,
        [key]: value === "" ? undefined : value,
      } as any);
    },
    [navigation, params]
  );

  const getPathname = useCallback(() => route.name ?? "", [route.name]);

  const getSearchParams = useCallback(() => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  }, [params]);

  return {
    getValue,
    setValue,
    getPathname,
    getSearchParams,
  };
}
