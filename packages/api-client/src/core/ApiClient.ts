/**
 * Core API Client for VAS-DJ SaaS Platform
 * Provides fetch-based HTTP client with:
 * - JWT authentication with automatic refresh
 * - Retry logic with exponential backoff
 * - Multi-tenant headers (X-Org-Id, X-Request-Id)
 * - Standardized error handling
 */

import { ApiError } from "./errors";
import type { AuthProvider } from "./types";

interface RequestConfig extends RequestInit {
  url: string;
  params?: Record<string, unknown> | undefined;
  retry?: RetryConfig | undefined;
  skipAuth?: boolean | undefined;
  orgId?: string | undefined;
}

interface RetryConfig {
  attempts?: number;
  baseMs?: number;
  methods?: string[];
}

interface ApiClientConfig {
  baseUrl?: string;
  auth?: AuthProvider;
  retry?: RetryConfig;
  defaultOrgId?: string;
  onError?: (error: ApiError) => void;
  logging?: {
    requests?: boolean;
    responses?: boolean;
  };
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  attempts: 3,
  baseMs: 300,
  methods: ["GET", "PUT", "DELETE"], // Safe idempotent methods
};

const DEFAULT_BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ||
  process.env["EXPO_PUBLIC_API_BASE_URL"] ||
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  "http://localhost:8000";

/**
 * Generate a UUID v4 for request tracking
 */
function generateRequestId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, unknown>
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff with jitter
 */
function calculateBackoff(attempt: number, baseMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = exponential * 0.1 * Math.random();
  return Math.min(exponential + jitter, 10000); // Cap at 10s
}

/**
 * Check if HTTP status is retriable (5xx or network errors)
 */
function isRetriableStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

/**
 * Check if method is safe to retry
 */
function isRetriableMethod(method: string, allowedMethods: string[]): boolean {
  return allowedMethods.includes(method.toUpperCase());
}

/**
 * Main API Client class
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      auth: config.auth || {
        getAccessToken: () => undefined,
        refreshToken: async () => {},
      },
      retry: { ...DEFAULT_RETRY_CONFIG, ...config.retry },
      defaultOrgId: config.defaultOrgId || "",
      onError: config.onError || (() => {}),
      logging: config.logging || { requests: false, responses: false },
    };
  }

  /**
   * Update configuration
   */
  public configure(updates: Partial<ApiClientConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      retry: { ...this.config.retry, ...updates.retry },
      logging: { ...this.config.logging, ...updates.logging },
    };
  }

  /**
   * Enable/disable logging
   */
  public enableLogging(options: {
    requests?: boolean;
    responses?: boolean;
  }): void {
    this.configure({ logging: options });
  }

  /**
   * Make an HTTP request with full feature set
   */
  public async request<T>(config: RequestConfig): Promise<T> {
    const { url, params, retry, skipAuth, orgId, ...fetchOptions } = config;
    const method = fetchOptions.method || "GET";
    const retryConfig = { ...this.config.retry, ...retry };

    let attempt = 0;
    let lastError: ApiError | null = null;

    const maxAttempts = retryConfig.attempts ?? DEFAULT_RETRY_CONFIG.attempts;

    while (attempt <= maxAttempts) {
      try {
        const response = await this.executeRequest<T>({
          url,
          params: params ?? undefined,
          skipAuth: skipAuth ?? undefined,
          orgId: orgId ?? undefined,
          ...fetchOptions,
          method,
        });

        return response;
      } catch (error) {
        lastError =
          error instanceof ApiError
            ? error
            : new ApiError(
                "An unexpected error occurred",
                500,
                "UNKNOWN_ERROR"
              );

        // Check if we should retry
        const shouldRetry =
          attempt < maxAttempts &&
          isRetriableMethod(
            method,
            retryConfig.methods ?? DEFAULT_RETRY_CONFIG.methods
          ) &&
          (lastError.status === 0 || isRetriableStatus(lastError.status));

        if (!shouldRetry) {
          throw lastError;
        }

        // Wait before retry with exponential backoff
        const backoffMs = calculateBackoff(
          attempt,
          retryConfig.baseMs ?? DEFAULT_RETRY_CONFIG.baseMs
        );
        await sleep(backoffMs);
        attempt++;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new ApiError("Request failed", 500, "UNKNOWN_ERROR");
  }

  /**
   * Execute a single request (without retry logic)
   */
  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const { url, params, skipAuth, orgId, ...fetchOptions } = config;

    // Build headers
    const headers = new Headers(fetchOptions.headers);

    // Add authentication
    if (!skipAuth) {
      const token = this.config.auth.getAccessToken();
      // Only add Authorization header if token exists and is not an empty string
      if (token && token.trim() !== "") {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Add multi-tenant header
    const tenantId = orgId || this.config.defaultOrgId;
    if (tenantId) {
      headers.set("X-Org-Id", tenantId);
    }

    // Add request tracking
    if (!headers.has("X-Request-Id")) {
      headers.set("X-Request-Id", generateRequestId());
    }

    // Add content type for JSON requests
    if (fetchOptions.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Build full URL
    const fullUrl = buildUrl(this.config.baseUrl, url, params);

    // Log request if enabled
    if (this.config.logging?.requests) {
      const sanitizedHeaders: Record<string, string> = {};
      headers.forEach((value, key) => {
        // Redact sensitive headers
        if (
          key.toLowerCase() === "authorization" ||
          key.toLowerCase() === "cookie"
        ) {
          sanitizedHeaders[key] = "[REDACTED]";
        } else {
          sanitizedHeaders[key] = value;
        }
      });

      console.log("[API Request]", {
        method: fetchOptions.method || "GET",
        url: fullUrl,
        headers: sanitizedHeaders,
        body: fetchOptions.body
          ? JSON.parse(fetchOptions.body as string)
          : undefined,
      });
    }

    // Execute fetch
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        credentials: "include", // Include cookies for CORS requests
      });
    } catch (error) {
      // Network error
      throw new ApiError(
        error instanceof Error ? error.message : "Network request failed",
        0,
        "NETWORK_ERROR"
      );
    }

    // Handle 401 - attempt token refresh
    if (response.status === 401 && !skipAuth) {
      await this.handleAuthRefresh();
      // Retry the request once after refresh
      return this.executeRequest({
        ...config,
        params: params ?? undefined,
        skipAuth: skipAuth ?? undefined,
        orgId: orgId ?? undefined,
      });
    }

    // Parse response
    const data = await this.parseResponse<T>(response);

    // Log response if enabled
    if (this.config.logging?.responses) {
      console.log("[API Response]", {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        data,
      });
    }

    // Check if response is OK
    if (!response.ok) {
      throw ApiError.fromResponse(response, data);
    }

    return data;
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    // For non-JSON responses, return as text
    return response.text() as Promise<T>;
  }

  /**
   * Handle authentication refresh (single-flight)
   */
  private async handleAuthRefresh(): Promise<void> {
    // If already refreshing, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        await this.config.auth.refreshToken();
      } catch (error) {
        throw new ApiError(
          "Authentication refresh failed",
          401,
          "AUTH_REFRESH_FAILED"
        );
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

/**
 * Default client instance
 */
export const defaultClient = new ApiClient();

/**
 * Convenience method for making requests
 */
export async function request<T>(config: RequestConfig): Promise<T> {
  return defaultClient.request<T>(config);
}
