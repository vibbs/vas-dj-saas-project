/**
 * Advanced Features Example
 *
 * This example demonstrates advanced usage patterns and features.
 */

import {
  ApiClient,
  wireAuth,
  setBaseUrl,
  setDefaultOrg,
  enableLogging,
  UsersService,
  OrganizationsService,
  type Account,
} from '@vas-dj-saas/api-client';

// ========================================
// 1. Request Logging (Debugging)
// ========================================

function setupLogging() {
  // Enable request logging for debugging
  enableLogging({
    requests: true,  // Log outgoing requests
    responses: true, // Log incoming responses
  });

  // Note: Sensitive headers (Authorization, Cookie) are automatically redacted
}

// Disable logging in production
function disableLoggingInProduction() {
  if (process.env.NODE_ENV === 'production') {
    enableLogging({
      requests: false,
      responses: false,
    });
  }
}

// ========================================
// 2. Multi-Tenancy (Organization Scoping)
// ========================================

function setupMultiTenancy() {
  // Set default organization for all requests
  setDefaultOrg('org-123');

  // Now all requests will include X-Org-Id: org-123 header
}

async function switchOrganization(orgId: string) {
  // Switch to a different organization
  setDefaultOrg(orgId);

  // Subsequent requests will use the new org
  const users = await UsersService.list();
  console.log('Users in org:', users);
}

// Per-request organization override
async function perRequestOrgOverride() {
  // Global default
  setDefaultOrg('org-123');

  // This request uses the default org
  const users1 = await UsersService.list();

  // This request overrides the org for this call only
  const users2 = await UsersService.list({ orgId: 'org-456' });
}

// ========================================
// 3. Custom API Client Instance
// ========================================

function createCustomClient() {
  // Create a separate client with custom configuration
  const adminClient = new ApiClient({
    baseUrl: 'https://admin.example.com/api/v1',
    auth: {
      getAccessToken: () => localStorage.getItem('adminToken'),
      refreshToken: async () => {
        // Admin-specific refresh logic
      },
    },
    defaultOrgId: 'admin-org',
    logging: {
      requests: true,
      responses: true,
    },
  });

  return adminClient;
}

// Use custom client for specific requests
async function useCustomClient() {
  const adminClient = createCustomClient();

  const response = await adminClient.request({
    url: '/admin/users',
    method: 'GET',
  });

  console.log('Admin users:', response);
}

// ========================================
// 4. Environment-Based Configuration
// ========================================

function setupEnvironmentConfig() {
  // Determine base URL based on environment
  const baseUrl = (() => {
    switch (process.env.NODE_ENV) {
      case 'production':
        return 'https://api.production.com/api/v1';
      case 'staging':
        return 'https://api.staging.com/api/v1';
      case 'development':
      default:
        return 'http://localhost:8000/api/v1';
    }
  })();

  setBaseUrl(baseUrl);

  // Enable logging only in development
  if (process.env.NODE_ENV === 'development') {
    enableLogging({ requests: true, responses: true });
  }
}

// ========================================
// 5. Type-Safe Request Building
// ========================================

async function typeSafeRequests() {
  // TypeScript ensures you pass the correct parameters
  const response = await UsersService.updateProfile({
    firstName: 'John',
    lastName: 'Doe',
    // TypeScript error if you add invalid fields
    // invalidField: 'value', // ❌ Type error
  });

  // Response is fully typed
  if (response.status === 200 && response.data.data) {
    const user: Account = response.data.data;
    console.log(user.email); // ✅ Type-safe access
  }
}

// ========================================
// 6. Conditional Requests
// ========================================

async function conditionalRequests() {
  // Fetch user if we have a token
  const token = localStorage.getItem('accessToken');

  if (token) {
    try {
      const response = await UsersService.me();

      if (response.status === 200 && response.data.data) {
        console.log('Current user:', response.data.data);
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('accessToken');
    }
  }
}

// ========================================
// 7. Parallel Requests
// ========================================

async function parallelRequests() {
  // Fetch multiple resources in parallel
  const [userResponse, orgsResponse] = await Promise.all([
    UsersService.me(),
    OrganizationsService.list(),
  ]);

  if (userResponse.status === 200 && userResponse.data.data) {
    console.log('User:', userResponse.data.data);
  }

  if (orgsResponse.status === 200 && orgsResponse.data.data) {
    console.log('Organizations:', orgsResponse.data.data.results);
  }
}

// ========================================
// 8. Request Cancellation (AbortController)
// ========================================

async function cancellableRequest() {
  const controller = new AbortController();

  // Start request
  const requestPromise = UsersService.list({
    signal: controller.signal,
  });

  // Cancel after 5 seconds
  setTimeout(() => {
    controller.abort();
    console.log('Request cancelled');
  }, 5000);

  try {
    const response = await requestPromise;
    console.log('Users:', response.data);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      throw error;
    }
  }
}

// ========================================
// 9. Optimistic Updates Pattern
// ========================================

function useOptimisticUpdate() {
  const [user, setUser] = React.useState<Account | null>(null);

  const updateProfile = async (updates: Partial<Account>) => {
    // Store current state for rollback
    const previousUser = user;

    // Optimistically update UI
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    try {
      // Make API call
      const response = await UsersService.updateProfile(updates);

      if (response.status === 200 && response.data.data) {
        // Update with server response
        setUser(response.data.data);
      }
    } catch (error) {
      // Rollback on error
      setUser(previousUser);
      console.error('Update failed:', error);
      throw error;
    }
  };

  return { user, updateProfile };
}

// ========================================
// 10. Request Deduplication
// ========================================

const requestCache = new Map<string, Promise<any>>();

async function deduplicatedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5000
): Promise<T> {
  // Check if request is already in flight
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }

  // Start new request
  const promise = fetcher().finally(() => {
    // Remove from cache after TTL
    setTimeout(() => {
      requestCache.delete(key);
    }, ttl);
  });

  requestCache.set(key, promise);
  return promise;
}

// Usage
async function fetchUserWithDedup() {
  // Multiple calls within 5 seconds will use the same request
  const user1 = await deduplicatedRequest('current-user', () =>
    UsersService.me()
  );

  const user2 = await deduplicatedRequest('current-user', () =>
    UsersService.me()
  );

  // user1 === user2 (same request)
}

// ========================================
// 11. Custom Error Handler
// ========================================

function setupGlobalErrorHandler() {
  const customClient = new ApiClient({
    onError: (error) => {
      // Log to error tracking service
      console.error('[Global Error Handler]', {
        code: error.code,
        status: error.status,
        message: error.message,
        requestId: error.requestId,
      });

      // Show user notification
      if (error.isAuthError()) {
        alert('Please log in again');
        window.location.href = '/login';
      } else if (error.isServerError()) {
        alert('Server error. Please try again later.');
      }
    },
  });

  return customClient;
}

// ========================================
// 12. Middleware Pattern
// ========================================

function createRequestMiddleware() {
  const originalRequest = ApiClient.prototype.request;

  // Add timing middleware
  ApiClient.prototype.request = async function <T>(config: any): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await originalRequest.call(this, config);
      const duration = Date.now() - startTime;

      console.log(`[Timing] ${config.method} ${config.url}: ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Timing] ${config.method} ${config.url}: ${duration}ms (failed)`);
      throw error;
    }
  };
}

// ========================================
// 13. React Query Integration
// ========================================

function useUserQuery() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await UsersService.me();

      if (response.status === 200 && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch user');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

function useOrganizationsQuery() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await OrganizationsService.list();

      if (response.status === 200 && response.data.data) {
        return response.data.data.results || [];
      }

      return [];
    },
  });
}

function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Account>) => {
      const response = await UsersService.updateProfile(updates);

      if (response.status === 200 && response.data.data) {
        return response.data.data;
      }

      throw new Error('Update failed');
    },
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}

// ========================================
// 14. Next.js Server-Side Usage
// ========================================

// app/page.tsx (Next.js App Router)
async function ServerComponent() {
  // Create a server-side client instance
  const serverClient = new ApiClient({
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api/v1',
  });

  try {
    const response = await serverClient.request({
      url: '/organizations/',
      method: 'GET',
    });

    const orgs = response.data.data.results || [];

    return (
      <div>
        <h1>Organizations</h1>
        <ul>
          {orgs.map((org) => (
            <li key={org.id}>{org.name}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return <div>Error loading organizations</div>;
  }
}

// ========================================
// 15. Mobile (React Native) Usage
// ========================================

// React Native specific setup
function setupReactNative() {
  // React Native uses fetch by default, so no special setup needed
  setBaseUrl('https://api.example.com/api/v1');

  wireAuth({
    getAccessToken: async () => {
      // Use AsyncStorage in React Native
      const token = await AsyncStorage.getItem('accessToken');
      return token || undefined;
    },
    refreshToken: async () => {
      const response = await fetch('https://api.example.com/api/v1/auth/refresh/', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('accessToken', data.data.access);
      } else {
        throw new Error('Refresh failed');
      }
    },
  });
}
