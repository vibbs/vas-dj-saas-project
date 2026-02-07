/**
 * @vas-dj-saas/api-client
 * Type-safe API client for VAS-DJ SaaS Platform (v1 API)
 *
 * Features:
 * - Fetch-first HTTP client with automatic retry
 * - JWT authentication with token refresh
 * - Multi-tenant support (X-Org-Id header)
 * - Request tracing (X-Request-Id)
 * - Standardized error handling
 * - Tree-shakeable exports
 * - Full TypeScript support
 *
 * @example Basic Usage
 * ```ts
 * import { AuthService, wireAuth } from '@vas-dj-saas/api-client';
 *
 * // Configure authentication
 * wireAuth({
 *   getAccessToken: () => localStorage.getItem('token'),
 *   refreshToken: async () => {
 *     // Your refresh logic
 *   }
 * });
 *
 * // Use services
 * const response = await AuthService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 *
 * @example With Custom Configuration
 * ```ts
 * import { ApiClient } from '@vas-dj-saas/api-client';
 *
 * const client = new ApiClient({
 *   baseUrl: 'https://api.example.com',
 *   defaultOrgId: 'org-123',
 *   retry: { attempts: 5 }
 * });
 * ```
 */

// === Core Client ===
export { ApiClient, defaultClient, request } from './core/ApiClient';

// === Authentication Wire-up ===
import { defaultClient } from './core/ApiClient';
import type { WireAuthOptions } from './core/types';

/**
 * Configure authentication for the default client
 * Call this once during app initialization
 *
 * @example
 * ```ts
 * wireAuth({
 *   getAccessToken: () => localStorage.getItem('accessToken'),
 *   refreshToken: async () => {
 *     const refresh = localStorage.getItem('refreshToken');
 *     const response = await fetch('/api/v1/auth/refresh/', {
 *       method: 'POST',
 *       body: JSON.stringify({ refresh })
 *     });
 *     const data = await response.json();
 *     localStorage.setItem('accessToken', data.access);
 *   }
 * });
 * ```
 */
export function wireAuth(options: WireAuthOptions): void {
  defaultClient.configure({
    auth: {
      getAccessToken: options.getAccessToken,
      refreshToken: options.refreshToken,
    },
  });
}

/**
 * Set default organization ID for all requests
 *
 * @example
 * ```ts
 * setDefaultOrg('org-123');
 * ```
 */
export function setDefaultOrg(orgId: string): void {
  defaultClient.configure({ defaultOrgId: orgId });
}

/**
 * Configure base URL for API requests
 *
 * @example
 * ```ts
 * setBaseUrl('https://api.example.com');
 * ```
 */
export function setBaseUrl(baseUrl: string): void {
  defaultClient.configure({ baseUrl });
}

/**
 * Enable/disable request and response logging
 *
 * @example
 * ```ts
 * enableLogging({ requests: true, responses: true });
 * ```
 */
export function enableLogging(options: { requests?: boolean; responses?: boolean }): void {
  defaultClient.enableLogging(options);
}

// === Services ===
export { AuthService } from './services/auth';
export { UsersService } from './services/users';
export { OrganizationsService } from './services/organizations';
export { InvitesService } from './services/invites';
export { MembersService } from './services/members';

// === Pagination Utilities ===
export {
  extractPageNumber,
  extractCursor,
  hasNextPage,
  hasPreviousPage,
  iterateAll,
  iterateCursor,
  collectAll,
  collectAllCursor,
} from './core/pagination';

// === Error Handling ===
export { ApiError, formatApiError } from './core/errors';
export type { ProblemDetails } from './core/errors';

// === Types ===
// Export all types from types barrel
export * from './types';

// === Validation Schemas ===
// Export Zod schemas for form validation
export * from './schemas';

// === Version ===
export const VERSION = '1.0.0';
export const API_VERSION = 'v1';
