import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend the Axios request config to include our custom _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // for HttpOnly cookies on web flows
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type TokenPair = { accessToken: string; refreshToken?: string };

let getAccessToken: () => string | undefined = () => undefined;
let onAuthError: () => Promise<void> = async () => {};

export const wireAuth = (opts: {
  getAccessToken: () => string | undefined;
  onAuthError: () => Promise<void>;
}) => {
  getAccessToken = opts.getAccessToken;
  onAuthError = opts.onAuthError;
};

// Request interceptor for auth tokens
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as ExtendedAxiosRequestConfig;
    
    if (err?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      await onAuthError(); // triggers refresh flow higher up
      
      // If we have a new token after the refresh, retry the request
      const newToken = getAccessToken();
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      }
    }
    
    return Promise.reject(err);
  }
);

export { http as default };