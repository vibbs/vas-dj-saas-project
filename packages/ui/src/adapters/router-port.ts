/**
 * Router Port Interface (Hexagonal Architecture)
 *
 * This interface defines the contract for routing functionality needed by UI components.
 * Concrete implementations (adapters) are provided by framework-specific packages.
 *
 * Benefits:
 * - Framework independence: UI components don't depend on Next.js, React Navigation, etc.
 * - Testability: Easy to mock for unit tests
 * - Portability: Same UI components work across web and mobile
 * - Extensibility: Support any router by implementing this interface
 *
 * @example
 * ```tsx
 * // In app code:
 * import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
 * import { ShallowTabs } from '@vas-dj-saas/ui';
 *
 * function MyPage() {
 *   const router = useNextTabRouter();
 *   return <ShallowTabs tabs={tabs} router={router} />;
 * }
 * ```
 */
export interface TabRouterPort {
  /**
   * Get the current value of a query parameter
   * @param key - The parameter key (e.g., 'tab', 'selected')
   * @returns The parameter value or null if not present
   */
  getValue(key: string): string | null;

  /**
   * Set a query parameter value and update the URL
   * @param key - The parameter key to set
   * @param value - The parameter value
   * @param options - Optional navigation options
   */
  setValue(key: string, value: string, options?: RouterNavigationOptions): void;

  /**
   * Get the current pathname
   * @returns The current pathname
   */
  getPathname(): string;

  /**
   * Get all query parameters as a string
   * @returns URLSearchParams string representation
   */
  getSearchParams(): string;
}

/**
 * Options for router navigation
 */
export interface RouterNavigationOptions {
  /** Whether to scroll to top on navigation (default: false for tab changes) */
  scroll?: boolean;
  /** Whether to use shallow routing (Next.js specific, default: true) */
  shallow?: boolean;
}

/**
 * Generic hook for tab routing using the port interface
 *
 * This provides a simplified API for tab components that only need
 * to get/set a single parameter (typically 'tab').
 *
 * @param port - The router port implementation
 * @param paramKey - The query parameter key (default: 'tab')
 * @returns Current value and setter function
 */
export function useTabRouter(
  port: TabRouterPort,
  paramKey: string = 'tab'
): {
  value: string | null;
  setValue: (value: string) => void;
} {
  const value = port.getValue(paramKey);
  const setValue = (nextValue: string) => {
    port.setValue(paramKey, nextValue, { scroll: false, shallow: true });
  };

  return { value, setValue };
}

/**
 * Generic hook for entity drawer routing using the port interface
 *
 * This provides get/set for both tab and selected entity parameters.
 *
 * @param port - The router port implementation
 * @param tabKey - The tab query parameter key (default: 'tab')
 * @param selectedKey - The selected entity query parameter key (default: 'selected')
 * @returns Current values and setter functions
 */
export function useDrawerRouter(
  port: TabRouterPort,
  tabKey: string = 'tab',
  selectedKey: string = 'selected'
): {
  tab: string | null;
  selected: string | null;
  setTab: (value: string) => void;
  setSelected: (value: string | null) => void;
} {
  const tab = port.getValue(tabKey);
  const selected = port.getValue(selectedKey);

  const setTab = (value: string) => {
    port.setValue(tabKey, value, { scroll: false, shallow: true });
  };

  const setSelected = (value: string | null) => {
    if (value === null) {
      // Clear the selected parameter by setting to empty and having adapter handle it
      port.setValue(selectedKey, '', { scroll: false, shallow: true });
    } else {
      port.setValue(selectedKey, value, { scroll: false, shallow: true });
    }
  };

  return { tab, selected, setTab, setSelected };
}
