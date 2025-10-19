/**
 * Custom fetch mutator for Orval-generated code
 * Routes all generated API calls through our ApiClient
 */

import { defaultClient } from './ApiClient';

export const customFetch = <T>(
  url: string,
  config?: RequestInit
): Promise<T> => {
  const requestConfig: Record<string, unknown> = {
    url,
    method: config?.method || 'GET',
  };

  if (config?.headers !== undefined) {
    requestConfig['headers'] = config.headers;
  }

  if (config?.body !== undefined) {
    requestConfig['body'] = config.body;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return defaultClient.request<T>(requestConfig as any);
};
