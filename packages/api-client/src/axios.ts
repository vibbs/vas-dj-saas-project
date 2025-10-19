/**
 * Axios-based API Client (optional subpath export)
 * Provides axios wrapper with same features as fetch client
 *
 * Usage:
 *   import { axiosClient } from '@vas-dj-saas/api-client/axios';
 *
 * Note: Requires axios as peer dependency
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './core/errors';
import type { AuthProvider } from './core/types';

let axiosModule: typeof import('axios') | null = null;

/**
 * Lazy load axios to avoid bundling if not used
 */
async function getAxios() {
  if (!axiosModule) {
    axiosModule = await import('axios');
  }
  return axiosModule.default;
}

interface AxiosClientConfig {
  baseURL?: string;
  auth?: AuthProvider;
  defaultOrgId?: string;
  timeout?: number;
}

const DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env['NEXT_PUBLIC_API_BASE_URL'] ||
      process.env['EXPO_PUBLIC_API_BASE_URL'] ||
      'http://localhost:8000';

/**
 * Generate a UUID v4 for request tracking
 */
function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Axios-based API Client
 */
export class AxiosClient {
  private instance: AxiosInstance | null = null;
  private config: Required<AxiosClientConfig>;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: AxiosClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      auth: config.auth || { getAccessToken: () => undefined, refreshToken: async () => {} },
      defaultOrgId: config.defaultOrgId || '',
      timeout: config.timeout || 30000,
    };
  }

  /**
   * Get or create axios instance
   */
  private async getInstance(): Promise<AxiosInstance> {
    if (this.instance) {
      return this.instance;
    }

    const axios = await getAxios();
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = this.config.auth.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add org ID
        if (this.config.defaultOrgId && config.headers) {
          config.headers['X-Org-Id'] = this.config.defaultOrgId;
        }

        // Add request ID
        if (config.headers && !config.headers['X-Request-Id']) {
          config.headers['X-Request-Id'] = generateRequestId();
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.handleAuthRefresh();
            return this.instance!.request(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        // Convert to ApiError
        if (error.response) {
          throw ApiError.fromResponse(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              headers: {
                get: (name: string) => error.response.headers[name.toLowerCase()],
              },
              ok: false,
            } as Response,
            error.response.data
          );
        }

        // Network error
        throw new ApiError(
          error.message || 'Network request failed',
          0,
          'NETWORK_ERROR'
        );
      }
    );

    return this.instance;
  }

  /**
   * Handle authentication refresh (single-flight)
   */
  private async handleAuthRefresh(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        await this.config.auth.refreshToken();
      } catch (error) {
        throw new ApiError(
          'Authentication refresh failed',
          401,
          'AUTH_REFRESH_FAILED'
        );
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make a request
   */
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const instance = await this.getInstance();
    const response = await instance.request<T>(config);
    return response.data;
  }

  /**
   * Configure the client
   */
  public configure(updates: Partial<AxiosClientConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    // Reset instance to pick up new config
    this.instance = null;
  }

  /**
   * Get the underlying axios instance (for advanced usage)
   */
  public async getAxiosInstance(): Promise<AxiosInstance> {
    return this.getInstance();
  }
}

/**
 * Default axios client instance
 */
export const axiosClient = new AxiosClient();

/**
 * Convenience method for making requests
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  return axiosClient.request<T>(config);
}

/**
 * Re-export axios types for convenience
 */
export type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
