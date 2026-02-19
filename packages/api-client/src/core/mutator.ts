/**
 * Custom fetch mutator for Orval-generated code
 * Routes all generated API calls through our ApiClient
 *
 * Note: This bypasses the ApiClient wrapper to access the raw Response object
 * because the generated code expects { data, status, headers } format
 */

import { defaultClient } from './ApiClient';

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

const DEFAULT_BASE_URL =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ||
  process.env["EXPO_PUBLIC_API_BASE_URL"] ||
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  "http://localhost:8000";

export const customFetch = async <T>(
  url: string,
  config?: RequestInit
): Promise<T> => {
  // Build full URL
  // The generated endpoints already include the full path (e.g., /api/v1/auth/login/)
  // So we just need to prepend the base domain
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_BASE_URL}${url}`;

  // Build headers
  const headers = new Headers(config?.headers);

  // Add JWT Authorization header from auth provider (if configured)
  // Access the private config to get auth provider
  const authConfig = (defaultClient as any)['config']?.auth;
  if (authConfig && typeof authConfig.getAccessToken === 'function') {
    const token = authConfig.getAccessToken();
    if (token && token.trim() !== '') {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Add request tracking
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", generateRequestId());
  }

  // Execute fetch with credentials for CORS
  const response = await fetch(fullUrl, {
    ...config,
    headers,
    credentials: "include",
  });

  // Parse response based on content type
  const contentType = response.headers.get("Content-Type") || "";
  let data: unknown;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // JSON parsing failed, return empty object
      data = {};
    }
  } else {
    // Non-JSON response (likely HTML error page)
    const text = await response.text();

    // If response is not OK and not JSON, create an error object
    if (!response.ok) {
      data = {
        error: true,
        message: `Request failed with status ${response.status}`,
        status: response.status,
        details: text.substring(0, 200), // Include first 200 chars for debugging
      };
    } else {
      // Successful non-JSON response
      data = { text };
    }
  }

  // Return in the format expected by generated code: { data, status, headers }
  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
