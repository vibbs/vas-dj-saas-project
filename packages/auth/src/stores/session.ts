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
              const resp = await fetch(
                (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1') + '/auth/refresh/',
                {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (resp.ok) {
                const data = await resp.json();
                set({
                  accessToken: data.access_token || data.access,
                  account: data.user,
                  status: 'authenticated',
                  error: undefined
                });
                return;
              }
            } catch (error) {
              console.warn('Token refresh failed:', error);
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
            if (response.status === 200 && response.data.data) {
              set({ account: response.data.data, status: 'authenticated', error: undefined });
            } else {
              throw new Error('Failed to fetch account');
            }
          } catch (error) {
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
          if (response.status === 200 && response.data.data) {
            const data = response.data.data;
            set({
              accessToken: data.access,
              account: data.user,
              status: 'authenticated',
              error: undefined
            });
          } else {
            throw new Error('Login failed');
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
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
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
