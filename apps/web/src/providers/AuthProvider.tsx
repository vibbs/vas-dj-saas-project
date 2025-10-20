'use client';

import React, { useEffect, useRef } from 'react';
import { setBaseUrl, wireAuth, defaultClient } from '@vas-dj-saas/api-client';
import { useAuth } from '@vas-dj-saas/auth';
import { env } from '@/lib/env';

/**
 * AuthProvider
 *
 * Initializes the authentication system:
 * - Configures API base URL
 * - Wires up token management
 * - Triggers auth state hydration
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((state) => state.hydrate);

  // Use a stable ref to avoid infinite loop with useSyncExternalStore
  const getAccessToken = useRef(() => {
    return useAuth.getState().accessToken;
  });

  useEffect(() => {
    // Configure API client base URL
    setBaseUrl(env.apiBaseUrl);

    // Wire up authentication
    wireAuth({
      getAccessToken: () => {
        const token = getAccessToken.current();
        console.log('[Auth] Getting access token:', token ? `${token.substring(0, 20)}...` : 'undefined');
        return token;
      },
      refreshToken: async () => {
        // Token refresh is handled in the auth store's hydrate method
        // This is just a placeholder that throws to trigger the store's refresh logic
        throw new Error('Token refresh handled by auth store');
      },
    });

    // Enable API client logging in development
    if (process.env.NODE_ENV === 'development') {
      defaultClient.enableLogging({ requests: true, responses: true });
    }

    // Hydrate auth state from storage
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
