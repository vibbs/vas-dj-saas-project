import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { wireAuth } from '@vas-dj-saas/api-client';
import { login, me, logout, refreshToken, type Session } from '@vas-dj-saas/api-client/endpoints';
import type { User } from '@vas-dj-saas/types';
import { createStorage } from '../utils/storage';

type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user?: User;
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
          onAuthError: async () => {
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
                  user: data.user,
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
              user: undefined,
              error: undefined
            });
          },
        });

        // If we have a token, try to get the current user
        if (currentState.accessToken) {
          try {
            const user = await me();
            set({ user, status: 'authenticated', error: undefined });
          } catch (error) {
            // Token is invalid, clear it
            set({ 
              status: 'unauthenticated', 
              accessToken: undefined, 
              user: undefined,
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
          const session = await login({ email, password });
          set({ 
            accessToken: session.access, 
            user: session.user, 
            status: 'authenticated',
            error: undefined
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                              error?.response?.data?.detail || 
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
          await logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        } finally {
          set({ 
            accessToken: undefined, 
            user: undefined, 
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
        // Only persist the access token and user info
        // Don't persist status or error
        accessToken: state.accessToken,
        user: state.user,
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
export const useAuthUser = () => useAuth((state) => state.user);
export const useAuthError = () => useAuth((state) => state.error);
export const useAuthActions = () => useAuth((state) => ({
  login: state.login,
  logout: state.logout,
  hydrate: state.hydrate,
  clearError: state.clearError,
  setError: state.setError,
}));