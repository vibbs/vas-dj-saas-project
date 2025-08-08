import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend the Axios request config to include our custom _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
import { 
  ApiResponse, 
  LoginCredentials, 
  LoginResponse, 
  RegistrationData, 
  RegistrationResponse,
  SocialAuthData,
  SocialAuthResponse,
  EmailVerificationData,
  EmailVerificationResponse,
  ResendVerificationResponse,
  TokenVerificationResponse,
  AuthError
} from '@vas-dj-saas/types';

export class ApiClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth tokens
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.refreshAuthToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearAuthTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    // For React Native, we'll need AsyncStorage
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    // For React Native, we'll need AsyncStorage
    return null;
  }

  private setAuthTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    // For React Native, we'll need AsyncStorage
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    // For React Native, we'll need AsyncStorage
  }

  private async refreshAuthToken(): Promise<string | null> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        const { access, refresh: newRefresh } = response.data;
        this.setAuthTokens(access, newRefresh);
        return access;
      } catch (error) {
        this.clearAuthTokens();
        throw error;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  private handleApiError(error: AxiosError): AuthError {
    const response = error.response;
    
    if (response?.data) {
      const data = response.data as any;
      
      // Handle validation errors
      if (data.errors || data.error) {
        return {
          message: data.message || data.error || 'An error occurred',
          code: data.code || response.status.toString(),
        };
      }
      
      // Handle field-specific errors
      if (typeof data === 'object' && !data.message) {
        const firstField = Object.keys(data)[0];
        const firstError = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField];
        return {
          message: firstError || 'Validation error',
          field: firstField,
          code: response.status.toString(),
        };
      }
    }
    
    // Default error handling
    return {
      message: error.message || 'Network error occurred',
      code: response?.status?.toString() || 'NETWORK_ERROR',
    };
  }

  // Generic HTTP methods
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login/', credentials);
    this.setAuthTokens(response.access, response.refresh);
    return response;
  }

  async register(data: RegistrationData): Promise<RegistrationResponse> {
    const response = await this.post<RegistrationResponse>('/auth/register/', data);
    this.setAuthTokens(response.access, response.refresh);
    return response;
  }

  async socialAuth(data: SocialAuthData): Promise<SocialAuthResponse> {
    const response = await this.post<SocialAuthResponse>('/auth/social/', data);
    this.setAuthTokens(response.access, response.refresh);
    return response;
  }

  async verifyEmail(data: EmailVerificationData): Promise<EmailVerificationResponse> {
    return this.post<EmailVerificationResponse>('/auth/verify-email/', data);
  }

  async resendVerification(): Promise<ResendVerificationResponse> {
    return this.post<ResendVerificationResponse>('/auth/resend-verification/');
  }

  async verifyToken(): Promise<TokenVerificationResponse> {
    return this.get<TokenVerificationResponse>('/auth/verify/');
  }

  async logout(): Promise<{ message: string }> {
    const refreshToken = this.getRefreshToken();
    try {
      const response = await this.post<{ message: string }>('/auth/logout/', {
        refresh: refreshToken
      });
      return response;
    } finally {
      this.clearAuthTokens();
    }
  }

  // Token management
  getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.getAuthToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  clearTokens(): void {
    this.clearAuthTokens();
  }
}

// Create a default instance
export const apiClient = new ApiClient();