import { useState } from 'react';
import type { TabRouterPort } from '../src/adapters/router-port';

/**
 * Mock Router Adapter for Storybook
 *
 * Simulates router behavior without actual URL navigation.
 * Useful for testing and demonstrating components in isolation.
 */
export function useMockTabRouter(): TabRouterPort {
  const [params, setParams] = useState<Record<string, string>>({});

  const getValue = (key: string): string | null => {
    return params[key] ?? null;
  };

  const setValue = (key: string, value: string) => {
    setParams((prev) => {
      if (value === '' || value === null || value === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const getPathname = () => '/storybook';

  const getSearchParams = () => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    return searchParams.toString();
  };

  return {
    getValue,
    setValue,
    getPathname,
    getSearchParams,
  };
}

/**
 * Create a controlled mock router for Storybook with specific initial values
 */
export function createMockRouter(initialParams: Record<string, string> = {}): TabRouterPort {
  let params = { ...initialParams };

  return {
    getValue: (key: string) => params[key] ?? null,
    setValue: (key: string, value: string) => {
      if (value === '' || value === null || value === undefined) {
        delete params[key];
      } else {
        params[key] = value;
      }
    },
    getPathname: () => '/storybook',
    getSearchParams: () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });
      return searchParams.toString();
    },
  };
}
