"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { TabRouterPort, RouterNavigationOptions } from "@vas-dj-saas/ui";
import { useMemo, useCallback } from "react";

/**
 * Next.js Router Adapter
 *
 * Implements TabRouterPort using Next.js App Router navigation hooks.
 * This adapter provides shallow routing with query parameter management.
 *
 * Features:
 * - Shallow routing (no full page reload)
 * - Preserves scroll position
 * - Maintains other query parameters
 * - Handles edge cases (SSR, null searchParams)
 *
 * @example
 * ```tsx
 * import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
 * import { ShallowTabs } from '@vas-dj-saas/ui';
 *
 * export default function SettingsPage() {
 *   const router = useNextTabRouter();
 *   return <ShallowTabs tabs={tabs} router={router} />;
 * }
 * ```
 */
export function useNextTabRouter(): TabRouterPort {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoize pathname with fallback for SSR
  const safePathname = useMemo(() => {
    if (pathname) return pathname;
    if (typeof window !== "undefined") return window.location.pathname;
    return "";
  }, [pathname]);

  // Memoize search params string with fallback for SSR
  const searchParamsString = useMemo(() => {
    try {
      return searchParams?.toString?.() ?? "";
    } catch {
      return "";
    }
  }, [searchParams]);

  const getValue = useCallback(
    (key: string): string | null => {
      if (!searchParamsString) return null;
      const params = new URLSearchParams(searchParamsString);
      return params.get(key);
    },
    [searchParamsString]
  );

  const setValue = useCallback(
    (key: string, value: string, options?: RouterNavigationOptions) => {
      const params = new URLSearchParams(searchParamsString);

      // If value is empty, delete the parameter instead of setting it
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const nextQuery = params.toString();
      const nextUrl =
        nextQuery.length > 0
          ? `${safePathname}?${nextQuery}`
          : safePathname;

      if (nextUrl) {
        router.push(nextUrl, {
          scroll: options?.scroll ?? false,
        });
      }
    },
    [router, safePathname, searchParamsString]
  );

  const getPathname = useCallback(() => safePathname, [safePathname]);

  const getSearchParams = useCallback(
    () => searchParamsString,
    [searchParamsString]
  );

  return {
    getValue,
    setValue,
    getPathname,
    getSearchParams,
  };
}

/**
 * Hook for managing multiple query parameters with Next.js router
 *
 * Useful when you need to manage several query parameters at once
 * (e.g., tab + selected entity + filters).
 *
 * @example
 * ```tsx
 * const router = useNextQueryState();
 * const tab = router.getValue('tab');
 * const selected = router.getValue('selected');
 * router.setValue('tab', 'members');
 * ```
 */
export function useNextQueryState(): TabRouterPort {
  return useNextTabRouter();
}
