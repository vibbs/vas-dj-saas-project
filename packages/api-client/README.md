# @vas-dj-saas/api-client - Type-Safe API Client

A robust, type-safe API client for the VAS-DJ Django backend, providing authentication, error handling, token management, and platform-agnostic network operations.

## 🚀 Quick Start

```bash
# Install the package
pnpm add @vas-dj-saas/api-client

# Peer dependencies
pnpm add @vas-dj-saas/types axios
```

### Basic Usage
```typescript
import { apiClient } from '@vas-dj-saas/api-client';

// Use the default client instance
const user = await apiClient.get('/users/me/');
const users = await apiClient.get('/users/');

// Or create a custom client instance
import { ApiClient } from '@vas-dj-saas/api-client';

const customClient = new ApiClient('https://api.yourdomain.com/v1');
const data = await customClient.get('/custom-endpoint/');
```

### With Authentication
```typescript
import { apiClient } from '@vas-dj-saas/api-client';

// Login automatically sets tokens
const loginResponse = await apiClient.login({
  email: 'user@example.com',
  password: 'password123',
});

// Subsequent requests automatically include auth headers
const profile = await apiClient.get('/users/me/');

// Logout clears tokens
await apiClient.logout();
```

## 🏗️ Architecture

### Type-Safe Design
Built with TypeScript for complete type safety:
```typescript
import type { User, Organization, ApiResponse } from '@vas-dj-saas/types';

// Fully typed responses
const user: User = await apiClient.get<User>('/users/me/');
const orgs: Organization[] = await apiClient.get<Organization[]>('/organizations/');

// Type-safe error handling
try {
  await apiClient.post<User>('/users/', userData);
} catch (error: AuthError) {
  console.error(error.message, error.field);
}
```

### Platform Agnostic
Works seamlessly across web and React Native:
```typescript
// Web: Uses localStorage
// React Native: Uses AsyncStorage (configured separately)
// Node.js: Uses memory storage

const client = new ApiClient({
  baseURL: 'https://api.example.com/v1',
  storage: 'secure', // Platform-appropriate secure storage
});
```

### Automatic Token Management
Handles JWT tokens with automatic refresh:
```typescript
// Tokens are automatically attached to requests
const response = await apiClient.get('/protected-endpoint/');

// Automatic token refresh on 401 errors
// If refresh fails, automatically redirects to login
```

## 🔐 Authentication Features

### Login & Registration
```typescript
import { apiClient } from '@vas-dj-saas/api-client';
import type { LoginCredentials, RegistrationData } from '@vas-dj-saas/types';

// Login
const loginData: LoginCredentials = {
  email: 'user@example.com',
  password: 'password123',
};
const loginResponse = await apiClient.login(loginData);
// Tokens automatically stored and attached to future requests

// Registration
const registrationData: RegistrationData = {
  email: 'newuser@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  organizationName: 'Acme Corp', // Optional for multi-tenant
};
const registerResponse = await apiClient.register(registrationData);

// Social authentication
const socialData = {
  provider: 'google',
  token: 'oauth-token-from-provider',
};
const socialResponse = await apiClient.socialAuth(socialData);
```

### Email Verification
```typescript
// Verify email with token
const verificationResponse = await apiClient.verifyEmail({
  token: 'email-verification-token',
});

// Resend verification email
const resendResponse = await apiClient.resendVerification();

// Check if current token is valid
const tokenStatus = await apiClient.verifyToken();
```

### Token Management
```typescript
// Get currently stored tokens
const tokens = apiClient.getStoredTokens();
console.log(tokens.accessToken, tokens.refreshToken);

// Manually clear tokens
apiClient.clearTokens();

// Check if user is authenticated
const isAuthenticated = !!tokens.accessToken;
```

## 🌐 HTTP Methods

### Generic Methods
```typescript
// GET requests
const data = await apiClient.get<ResponseType>('/endpoint/');
const user = await apiClient.get<User>('/users/123/');

// POST requests
const created = await apiClient.post<User>('/users/', userData);
const response = await apiClient.post('/custom-action/', { param: 'value' });

// PUT requests (update)
const updated = await apiClient.put<User>('/users/123/', updatedUserData);

// DELETE requests
const result = await apiClient.delete('/users/123/');
```

### With Query Parameters
```typescript
// URL search params are handled automatically
const users = await apiClient.get<User[]>('/users/', {
  params: {
    page: 1,
    limit: 20,
    search: 'john',
    role: 'admin',
  },
});
// Generates: /users/?page=1&limit=20&search=john&role=admin
```

### Request Configuration
```typescript
// Custom headers
const data = await apiClient.get('/endpoint/', {
  headers: {
    'Custom-Header': 'value',
  },
});

// Request timeout
const data = await apiClient.get('/endpoint/', {
  timeout: 5000,
});

// Upload files
const formData = new FormData();
formData.append('file', file);
formData.append('metadata', JSON.stringify({ description: 'Profile photo' }));

const uploadResponse = await apiClient.post('/upload/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

## 🛡️ Error Handling

### Structured Error Handling
```typescript
import type { AuthError } from '@vas-dj-saas/types';

try {
  await apiClient.login({ email: 'invalid', password: 'wrong' });
} catch (error: AuthError) {
  console.log(error.message); // User-friendly error message
  console.log(error.code);    // Error code for programmatic handling
  console.log(error.field);   // Field that caused the error (if applicable)
  
  // Handle specific error codes
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      setError('Invalid email or password');
      break;
    case 'EMAIL_NOT_VERIFIED':
      redirectToEmailVerification();
      break;
    case 'RATE_LIMITED':
      setError('Too many attempts. Please try again later.');
      break;
  }
}
```

### Network Error Handling
```typescript
try {
  const data = await apiClient.get('/users/');
} catch (error: AuthError) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle offline or network connectivity issues
    showOfflineMessage();
  } else if (error.code === '500') {
    // Handle server errors
    showServerErrorMessage();
  }
}
```

### Validation Error Handling
```typescript
try {
  await apiClient.post('/users/', userData);
} catch (error: AuthError) {
  if (error.field) {
    // Field-specific validation error
    setFieldError(error.field, error.message);
  } else {
    // General validation error
    setGeneralError(error.message);
  }
}
```

## 🔧 Advanced Configuration

### Custom Client Instance
```typescript
import { ApiClient } from '@vas-dj-saas/api-client';

const customClient = new ApiClient({
  baseURL: 'https://api.yourdomain.com/v1',
  timeout: 10000,
  headers: {
    'Custom-Header': 'value',
  },
  
  // Authentication configuration
  auth: {
    tokenStorage: 'secure', // 'secure', 'local', 'session', 'memory'
    autoRefresh: true,
    refreshBuffer: 300, // Refresh 5 minutes before expiry
  },
  
  // Error handling configuration
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
  
  // Platform-specific configuration
  platform: {
    storage: typeof window !== 'undefined' ? 'localStorage' : 'asyncStorage',
    redirectOnAuthFailure: '/auth/login',
  },
});
```

### Request/Response Interceptors
```typescript
// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to all requests
    config.headers['X-Request-Timestamp'] = Date.now().toString();
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful requests
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log failed requests
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status);
    return Promise.reject(error);
  }
);
```

## 🏢 Multi-Tenant Support

### Organization Context
```typescript
// Set organization context for all requests
apiClient.setOrganization('org_12345');

// All subsequent requests will include organization context
const users = await apiClient.get('/users/'); // Scoped to organization

// Switch organizations
apiClient.setOrganization('org_67890');

// Clear organization context
apiClient.clearOrganization();
```

### Subdomain Handling
```typescript
// Automatically detect organization from subdomain
const client = new ApiClient({
  baseURL: 'https://api.yourdomain.com/v1',
  multiTenant: {
    enabled: true,
    subdomainRouting: true,
    detectFromHostname: true,
  },
});

// Client automatically includes organization context
// based on current subdomain (e.g., acme.yourdomain.com)
```

## 📱 Platform-Specific Features

### Web Browser
```typescript
// Browser-specific storage
const webClient = new ApiClient({
  storage: {
    type: 'localStorage', // 'localStorage', 'sessionStorage', 'cookie'
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Handle browser-specific scenarios
webClient.interceptors.request.use((config) => {
  // Add CSRF token for web requests
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});
```

### React Native
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native specific configuration
const mobileClient = new ApiClient({
  baseURL: 'https://api.yourdomain.com/v1',
  storage: {
    type: 'asyncStorage',
    implementation: AsyncStorage, // Custom AsyncStorage implementation
  },
});

// Handle React Native specific scenarios
mobileClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network connectivity issues
    if (error.code === 'NETWORK_ERROR') {
      // Show offline banner or retry mechanism
    }
    return Promise.reject(error);
  }
);
```

### Node.js/Server-Side
```typescript
// Server-side configuration
const serverClient = new ApiClient({
  baseURL: 'https://api.yourdomain.com/v1',
  storage: {
    type: 'memory', // No persistent storage on server
  },
  auth: {
    // Use server-to-server authentication
    apiKey: process.env.API_KEY,
    serviceAccount: true,
  },
});
```

## 🧪 Testing Utilities

### Mock API Client
```typescript
import { createMockApiClient } from '@vas-dj-saas/api-client/testing';

const mockClient = createMockApiClient({
  // Mock responses
  responses: {
    'GET /users/me/': { id: 1, email: 'test@example.com', name: 'Test User' },
    'POST /auth/login/': { access: 'mock-token', refresh: 'mock-refresh' },
  },
  
  // Simulate delays
  delay: 100,
  
  // Simulate errors
  errors: {
    'POST /invalid-endpoint/': { code: '404', message: 'Not found' },
  },
});

// Use in tests
test('handles login success', async () => {
  const response = await mockClient.login({
    email: 'test@example.com',
    password: 'password',
  });
  
  expect(response.access).toBe('mock-token');
});
```

### Network Mocking
```typescript
// Mock specific endpoints for testing
import { mockApiEndpoint, clearApiMocks } from '@vas-dj-saas/api-client/testing';

beforeEach(() => {
  mockApiEndpoint('GET', '/users/', {
    data: [{ id: 1, name: 'User 1' }],
    delay: 500,
  });
});

afterEach(() => {
  clearApiMocks();
});

test('fetches users successfully', async () => {
  const users = await apiClient.get('/users/');
  expect(users).toHaveLength(1);
  expect(users[0].name).toBe('User 1');
});
```

## 🔍 Monitoring & Debugging

### Request Logging
```typescript
// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  apiClient.enableLogging({
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logTokenRefresh: true,
  });
}
```

### Performance Monitoring
```typescript
// Add performance monitoring
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);
    return response;
  },
  (error) => {
    const duration = Date.now() - error.config?.metadata?.startTime;
    console.log(`Failed request to ${error.config?.url} took ${duration}ms`);
    return Promise.reject(error);
  }
);
```

### Error Reporting
```typescript
// Integrate with error reporting services
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Report to Sentry, Bugsnag, etc.
    if (error.response?.status >= 500) {
      errorReportingService.captureException(error);
    }
    return Promise.reject(error);
  }
);
```

## 📚 Related Documentation

- **[Backend API Endpoints](../../backend/README.md#api-documentation)** - Django REST API documentation
- **[Authentication System](../auth/README.md)** - Authentication integration
- **[TypeScript Types](../types/README.md)** - Shared type definitions
- **[Web App Integration](../../apps/web/README.md)** - Using API client in Next.js
- **[Mobile App Integration](../../apps/mobile/README.md)** - Using API client in React Native

## 🤝 Contributing

### Development Guidelines
1. **Type Safety**: Maintain strict TypeScript types for all API interactions
2. **Error Handling**: Provide comprehensive error handling and user-friendly messages
3. **Platform Support**: Ensure features work across web, React Native, and Node.js
4. **Testing**: Write unit tests and integration tests for all API methods
5. **Documentation**: Keep API method documentation up to date

### Adding New Endpoints
1. **Define Types**: Add request/response types to `@vas-dj-saas/types`
2. **Implement Method**: Add typed method to ApiClient class
3. **Add Tests**: Write unit tests for new functionality
4. **Update Docs**: Document the new endpoint and usage examples

### Testing Guidelines
1. Test all HTTP methods (GET, POST, PUT, DELETE)
2. Test authentication flows and token management
3. Test error handling for various scenarios
4. Test platform-specific storage mechanisms
5. Test multi-tenant organization context
6. Mock external dependencies appropriately

## 🔧 Troubleshooting

### Common Issues

**CORS Errors:**
```typescript
// Ensure proper CORS configuration on backend
// Add credentials if needed
const client = new ApiClient({
  baseURL: 'https://api.yourdomain.com/v1',
  withCredentials: true,
});
```

**Token Refresh Loops:**
```typescript
// Debug token refresh issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config._retry) {
      console.log('Token refresh retry detected:', error.config.url);
    }
    return Promise.reject(error);
  }
);
```

**Network Timeouts:**
```typescript
// Increase timeout for slow networks
const client = new ApiClient({
  timeout: 30000, // 30 seconds
  retry: {
    attempts: 3,
    delay: 2000,
  },
});
```

**Storage Issues:**
```typescript
// Check storage availability
try {
  const tokens = apiClient.getStoredTokens();
  if (!tokens.accessToken) {
    console.log('No stored tokens found');
  }
} catch (error) {
  console.error('Storage not available:', error);
}
```