/**
 * Core types for API Client
 */

/**
 * Authentication provider interface
 * Consumers must implement this to provide token management
 */
export interface AuthProvider {
  /**
   * Get the current access token
   * Returns undefined if no token is available
   */
  getAccessToken: () => string | undefined;

  /**
   * Refresh the access token
   * Should throw if refresh fails
   */
  refreshToken: () => Promise<void>;
}

/**
 * API Client configuration
 */
export interface ClientConfig {
  /**
   * Base URL for API requests
   * Defaults to window.location.origin or environment variables
   */
  baseUrl?: string;

  /**
   * Authentication provider
   */
  auth?: AuthProvider;

  /**
   * Default organization ID for multi-tenant requests
   */
  defaultOrgId?: string;

  /**
   * Enable request/response logging
   */
  logging?: {
    requests?: boolean;
    responses?: boolean;
  };
}

/**
 * Wire authentication to the default client
 */
export interface WireAuthOptions {
  getAccessToken: () => string | undefined;
  refreshToken: () => Promise<void>;
}

/**
 * Request options for generated functions
 */
export interface RequestOptions {
  /**
   * Organization ID for this request
   */
  orgId?: string;

  /**
   * Skip authentication for this request
   */
  skipAuth?: boolean;

  /**
   * Custom retry configuration
   */
  retry?: {
    attempts?: number;
    baseMs?: number;
  };
}
