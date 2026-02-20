import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  wireAuth,
  AuthService,
  UsersService,
  type Account
} from '@vas-dj-saas/api-client';
import { createStorage } from '../utils/storage';

type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

interface AuthState {
  account?: Account;
  accessToken?: string;
  status: AuthStatus;
  error?: string;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

// Create storage adapter that works for both web and mobile
const storage = createStorage();

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',

      async hydrate() {
        const currentState = get();

        // Wire the auth system with our token management
        wireAuth({
          getAccessToken: () => get().accessToken,
          refreshToken: async () => {
            // Attempt to refresh the token
            try {
              // Use correct base URL without /api/v1 suffix (it's already in the endpoint path)
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
              const resp = await fetch(
                `${baseUrl}/api/v1/auth/refresh/`,
                {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (resp.ok) {
                const responseData = await resp.json();
                // Handle both nested and flat response structures
                const data = responseData.data || responseData;

                set({
                  accessToken: data.access_token || data.access,
                  account: data.user,
                  status: 'authenticated',
                  error: undefined
                });
                return;
              }
            } catch {
              // Token refresh failed silently
            }

            // Refresh failed, mark as unauthenticated
            set({
              status: 'unauthenticated',
              accessToken: undefined,
              account: undefined,
              error: undefined
            });

            // Re-throw to signal refresh failure
            throw new Error('Token refresh failed');
          },
        });

        // If we have a token, try to get the current account
        if (currentState.accessToken) {
          try {
            const response = await UsersService.me();

            // Handle both nested and flat response structures
            // Type assertion needed because the response is a union type
            const accountData = (response.data as any)?.data || response.data;

            if (response.status === 200 && accountData) {
              set({ account: accountData, status: 'authenticated', error: undefined });
            } else {
              throw new Error('Failed to fetch account');
            }
          } catch {
            // Token is invalid, clear it
            set({
              status: 'unauthenticated',
              accessToken: undefined,
              account: undefined,
              error: undefined
            });
          }
        } else {
          set({ status: 'unauthenticated' });
        }
      },

      async login(email, password) {
        set({ status: 'authenticating', error: undefined });

        try {
          const response = await AuthService.login({ email, password });

          // Backend returns: { status: 200, code: "...", data: { access, refresh, user } }
          // Response type is V1AuthLoginCreate200 which wraps LoginResponse in data field
          if (response.status === 200 && response.data) {
            // Type assertion needed because the generated types use intersection types
            const loginData = (response.data as any).data;

            if (!loginData || !loginData.access || !loginData.user) {
              throw new Error('Invalid login response structure');
            }

            set({
              accessToken: loginData.access,
              account: loginData.user,
              status: 'authenticated',
              error: undefined
            });
          } else {
            throw new Error('Login failed: Unexpected status code');
          }
        } catch (error: any) {
          const errorMessage = error?.data?.detail ||
                              error?.message ||
                              'Login failed';
          set({
            status: 'unauthenticated',
            error: errorMessage
          });
          throw error;
        }
      },

      async logout() {
        try {
          // Note: Backend logout requires refresh token, but we use httpOnly cookies
          // So we call logout with an empty string (the cookie will be sent automatically)
          await AuthService.logout({ refresh: '' });
        } catch {
          // Continue with logout even if API call fails
        } finally {
          set({
            accessToken: undefined,
            account: undefined,
            status: 'unauthenticated',
            error: undefined
          });
        }
      },

      clearError() {
        set({ error: undefined });
      },

      setError(error: string) {
        set({ error });
      },
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        // Only persist the access token and account info
        // Don't persist status or error
        accessToken: state.accessToken,
        account: state.account,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, trigger the hydration process
        if (state) {
          void state.hydrate();
        }
      },
    }
  )
);

// Sync auth state to a cookie so Next.js middleware can read it server-side
if (typeof document !== 'undefined') {
  useAuth.subscribe((state) => {
    if (state.accessToken) {
      document.cookie = `vas_dj_auth=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      document.cookie = 'vas_dj_auth=; path=/; max-age=0; SameSite=Lax';
    }
  });
}

// Convenience hooks
export const useAuthStatus = () => useAuth((state) => state.status);
export const useAuthAccount = () => useAuth((state) => state.account);
export const useAuthError = () => useAuth((state) => state.error);

// Use a selector that returns a stable reference to avoid infinite loops
// We select multiple primitive values and construct the actions object outside
export const useAuthActions = () => {
  const login = useAuth((state) => state.login);
  const logout = useAuth((state) => state.logout);
  const hydrate = useAuth((state) => state.hydrate);
  const clearError = useAuth((state) => state.clearError);
  const setError = useAuth((state) => state.setError);

  // These are already stable references from the store
  return { login, logout, hydrate, clearError, setError };
};
