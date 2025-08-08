# @vas-dj-saas/auth - Authentication System

Cross-platform authentication library providing JWT token management, authentication hooks, and UI components for the VAS-DJ SaaS platform.

## 🚀 Quick Start

```bash
# Install the package
pnpm add @vas-dj-saas/auth

# Peer dependencies
pnpm add @vas-dj-saas/api-client @vas-dj-saas/ui @vas-dj-saas/types @vas-dj-saas/utils
```

### Basic Setup
```typescript
import { AuthProvider, useAuth } from '@vas-dj-saas/auth';
import { apiClient } from '@vas-dj-saas/api-client';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider apiClient={apiClient}>
      <MyApp />
    </AuthProvider>
  );
}

// Use authentication in components
function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginForm />;
  
  return <Dashboard user={user} onLogout={logout} />;
}
```

## 🏗️ Architecture

### JWT Token Management
- **Access tokens** with automatic refresh
- **Secure storage** using platform-appropriate methods
- **Token validation** and expiry handling
- **Automatic logout** on token expiry

### Cross-Platform Support
- **Web**: localStorage/sessionStorage with fallbacks
- **React Native**: Secure storage (Keychain/Keystore)
- **Server-Side**: Cookie-based sessions for SSR

### Multi-Tenant Support
- **Organization context** management
- **Role-based permissions** handling
- **Organization switching** functionality
- **Subdomain routing** support

## 🔐 Core Components

### AuthService
Central authentication service managing all auth operations:

```typescript
import { AuthService } from '@vas-dj-saas/auth';

const authService = new AuthService({
  apiClient,
  storage: 'secure', // 'secure', 'local', 'session', 'memory'
  tokenRefreshBuffer: 300, // Refresh 5 minutes before expiry
  autoRefresh: true,
});

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Logout
await authService.logout();

// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Get current user
const user = authService.getCurrentUser();

// Refresh tokens
await authService.refreshTokens();
```

### Token Storage
Platform-aware secure token storage:

```typescript
import { storage } from '@vas-dj-saas/auth/utils';

// Automatically uses the best storage for platform
await storage.setTokens({
  access: 'access-token',
  refresh: 'refresh-token',
});

const tokens = await storage.getTokens();
await storage.clearTokens();

// Manual storage type selection
const secureStorage = storage.create('secure'); // Keychain/Keystore
const localStorageWeb = storage.create('local'); // localStorage
const sessionStorageWeb = storage.create('session'); // sessionStorage
const memoryStorage = storage.create('memory'); // In-memory (testing)
```

## 🎣 Authentication Hooks

### useAuth
Primary authentication hook:

```typescript
import { useAuth } from '@vas-dj-saas/auth';

function MyComponent() {
  const {
    // Authentication state
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Authentication actions
    login,
    logout,
    register,
    
    // Token management
    refreshTokens,
    getAccessToken,
    
    // User management
    updateProfile,
    changePassword,
  } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login({ email, password })}>
          Login
        </button>
      )}
    </div>
  );
}
```

### useAuthState
Subscribe to authentication state changes:

```typescript
import { useAuthState } from '@vas-dj-saas/auth';

function NavigationBar() {
  const { user, isAuthenticated } = useAuthState();
  
  // This component will re-render when auth state changes
  return (
    <nav>
      {isAuthenticated ? (
        <UserMenu user={user} />
      ) : (
        <LoginButton />
      )}
    </nav>
  );
}
```

### useAuthActions
Access authentication actions without state subscriptions:

```typescript
import { useAuthActions } from '@vas-dj-saas/auth';

function LoginForm() {
  const { login, isLoading, error } = useAuthActions();
  
  const handleSubmit = async (formData) => {
    try {
      await login(formData);
      // Navigate to dashboard
    } catch (err) {
      // Handle error (automatically set in error state)
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### useEmailVerification
Handle email verification flow:

```typescript
import { useEmailVerification } from '@vas-dj-saas/auth';

function EmailVerificationPage() {
  const {
    verifyEmail,
    resendVerification,
    isVerifying,
    isResending,
    error,
    success,
  } = useEmailVerification();

  React.useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      verifyEmail(token);
    }
  }, []);

  return (
    <div>
      {success ? (
        <div>Email verified successfully!</div>
      ) : (
        <div>
          <button 
            onClick={resendVerification}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Verification'}
          </button>
          {error && <div>{error.message}</div>}
        </div>
      )}
    </div>
  );
}
```

## 🧩 Pre-built Components

### LoginForm
Complete login form with validation:

```typescript
import { LoginForm } from '@vas-dj-saas/auth/components';

function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <LoginForm
        onSuccess={() => router.push('/dashboard')}
        onForgotPassword={() => router.push('/auth/forgot-password')}
        showRememberMe
        showSocialLogin
      />
    </div>
  );
}
```

### RegisterForm
Registration form with email verification:

```typescript
import { RegisterForm } from '@vas-dj-saas/auth/components';

function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <RegisterForm
        onSuccess={() => router.push('/auth/verify-email')}
        requireTermsAcceptance
        showNewsletterSignup
        organizationFields={['company_name', 'company_size']}
      />
    </div>
  );
}
```

### AuthGuard
Protect routes and components:

```typescript
import { AuthGuard } from '@vas-dj-saas/auth/components';

function ProtectedPage() {
  return (
    <AuthGuard
      requireAuth
      requireEmailVerified
      fallback={<LoginPage />}
      loadingComponent={<Spinner />}
    >
      <Dashboard />
    </AuthGuard>
  );
}

// With role-based access
<AuthGuard
  requireAuth
  requireRole="admin"
  fallback={<UnauthorizedPage />}
>
  <AdminPanel />
</AuthGuard>
```

## 🏢 Multi-Tenancy Support

### Organization Management
```typescript
import { useOrganization } from '@vas-dj-saas/auth';

function OrganizationSwitcher() {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    isLoading,
  } = useOrganization();

  return (
    <Select
      value={currentOrganization?.id}
      onValueChange={switchOrganization}
      disabled={isLoading}
    >
      {organizations.map(org => (
        <Select.Option key={org.id} value={org.id}>
          {org.name}
        </Select.Option>
      ))}
    </Select>
  );
}
```

### Role-Based Permissions
```typescript
import { usePermissions } from '@vas-dj-saas/auth';

function FeatureComponent() {
  const { hasPermission, hasRole, currentRole } = usePermissions();

  if (!hasPermission('users.manage')) {
    return <div>You don't have permission to manage users.</div>;
  }

  return (
    <div>
      <h2>User Management</h2>
      {hasRole('admin') && (
        <button>Delete User</button>
      )}
      {hasRole(['admin', 'manager']) && (
        <button>Edit User</button>
      )}
    </div>
  );
}
```

## 🔒 Security Features

### Secure Token Storage
```typescript
// Automatic platform-appropriate storage
const storage = createSecureStorage({
  // Web: Uses localStorage with encryption fallback
  // React Native: Uses Keychain (iOS) / Keystore (Android)
  encryptionKey: 'your-app-encryption-key',
  fallbackToMemory: true, // Fallback for unsupported environments
});
```

### Token Refresh Strategy
```typescript
import { TokenManager } from '@vas-dj-saas/auth';

const tokenManager = new TokenManager({
  refreshBuffer: 300, // Refresh 5 minutes before expiry
  maxRetries: 3,
  onRefreshFailure: () => {
    // Redirect to login
    window.location.href = '/auth/login';
  },
});

// Automatic token refresh on API calls
const apiClientWithAuth = apiClient.withInterceptors({
  request: tokenManager.attachTokenInterceptor,
  response: tokenManager.refreshTokenInterceptor,
});
```

### CSRF Protection
```typescript
// CSRF token handling for forms
import { useCSRFToken } from '@vas-dj-saas/auth';

function SecureForm() {
  const csrfToken = useCSRFToken();

  return (
    <form>
      <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
      {/* Other form fields */}
    </form>
  );
}
```

## ⚙️ Configuration

### AuthProvider Configuration
```typescript
import { AuthProvider } from '@vas-dj-saas/auth';

function App() {
  return (
    <AuthProvider
      apiClient={apiClient}
      config={{
        // Storage configuration
        storage: {
          type: 'secure', // 'secure', 'local', 'session', 'memory'
          encryptionKey: process.env.ENCRYPTION_KEY,
        },
        
        // Token configuration
        tokens: {
          refreshBuffer: 300, // 5 minutes
          autoRefresh: true,
          maxRetries: 3,
        },
        
        // Multi-tenancy configuration
        multiTenant: {
          enabled: true,
          subdomainRouting: true,
          defaultOrganization: null,
        },
        
        // Session configuration
        session: {
          persistAcrossReloads: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
        
        // Security configuration
        security: {
          enableCSRF: true,
          secureCookies: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
        
        // Redirect URLs
        redirects: {
          afterLogin: '/dashboard',
          afterLogout: '/auth/login',
          afterRegister: '/auth/verify-email',
          unauthorized: '/auth/login',
        },
      }}
    >
      <AppContent />
    </AuthProvider>
  );
}
```

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/v1/auth

# Security
AUTH_ENCRYPTION_KEY=your-32-character-encryption-key
CSRF_COOKIE_NAME=csrftoken

# Multi-tenancy
ENABLE_MULTI_TENANT=true
DEFAULT_ORGANIZATION_ID=org_default

# Session Configuration
SESSION_MAX_AGE=604800000
SESSION_PERSIST_ACROSS_RELOADS=true
```

## 🧪 Testing Utilities

### Auth Testing Provider
```typescript
import { AuthTestingProvider, mockUser } from '@vas-dj-saas/auth/testing';

function TestComponent() {
  return (
    <AuthTestingProvider
      initialState={{
        user: mockUser({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        }),
        isAuthenticated: true,
      }}
    >
      <YourComponent />
    </AuthTestingProvider>
  );
}

// Jest tests
describe('Protected Component', () => {
  test('renders for authenticated users', () => {
    render(
      <AuthTestingProvider authenticated>
        <ProtectedComponent />
      </AuthTestingProvider>
    );
    
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  test('redirects unauthenticated users', () => {
    render(
      <AuthTestingProvider unauthenticated>
        <ProtectedComponent />
      </AuthTestingProvider>
    );
    
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });
});
```

### Mock Authentication
```typescript
import { createMockAuthService } from '@vas-dj-saas/auth/testing';

const mockAuthService = createMockAuthService({
  user: mockUser(),
  isAuthenticated: true,
  loginDelay: 1000, // Simulate network delay
  shouldFailLogin: false,
});

// Use in tests
test('handles login success', async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthProvider authService={mockAuthService}>
        {children}
      </AuthProvider>
    ),
  });

  await act(async () => {
    await result.current.login({ email: 'test@example.com', password: 'password' });
  });

  expect(result.current.isAuthenticated).toBe(true);
});
```

## 🚀 Advanced Usage

### Custom Authentication Flow
```typescript
import { createAuthFlow } from '@vas-dj-saas/auth';

const customAuthFlow = createAuthFlow({
  steps: [
    'credentials',
    'two-factor',
    'organization-selection',
    'terms-acceptance',
  ],
  
  onStepComplete: (step, data) => {
    console.log(`Completed step: ${step}`, data);
  },
  
  onFlowComplete: (userData) => {
    console.log('Authentication flow complete', userData);
  },
  
  onStepError: (step, error) => {
    console.error(`Error in step ${step}:`, error);
  },
});

// Use in component
function CustomLoginFlow() {
  const { currentStep, stepData, nextStep, previousStep } = customAuthFlow;
  
  return (
    <div>
      {currentStep === 'credentials' && (
        <CredentialsStep onSubmit={nextStep} />
      )}
      {currentStep === 'two-factor' && (
        <TwoFactorStep 
          onSubmit={nextStep} 
          onBack={previousStep}
        />
      )}
      {/* Other steps */}
    </div>
  );
}
```

### SSR Integration (Next.js)
```typescript
// pages/_app.tsx or app/layout.tsx
import { AuthProvider, getServerSideAuth } from '@vas-dj-saas/auth/nextjs';

export default function App({ Component, pageProps, authState }) {
  return (
    <AuthProvider initialState={authState}>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

// Get initial auth state on server
export async function getServerSideProps(context) {
  const authState = await getServerSideAuth(context);
  
  return {
    props: {
      authState,
    },
  };
}

// Middleware for protected routes
// middleware.ts
import { withAuth } from '@vas-dj-saas/auth/nextjs';

export default withAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Custom authorization logic
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

## 📚 Related Documentation

- **[Backend Authentication](../../backend/README.md#authentication)** - Django REST API auth endpoints
- **[UI Components](../ui/README.md)** - UI components used in auth forms
- **[API Client](../api-client/README.md)** - API client integration
- **[Types](../types/README.md)** - Authentication-related TypeScript types
- **[Web App Integration](../../apps/web/README.md)** - Using auth in Next.js
- **[Mobile App Integration](../../apps/mobile/README.md)** - Using auth in React Native

## 🤝 Contributing

### Development Guidelines
1. **Security First**: Always prioritize security in authentication flows
2. **Cross-Platform**: Ensure features work on both web and mobile
3. **Type Safety**: Maintain strict TypeScript types for all auth data
4. **Testing**: Write comprehensive tests for authentication flows
5. **Documentation**: Keep security patterns well-documented

### Testing Authentication Features
1. Test all authentication flows (login, register, logout)
2. Test token refresh and expiry scenarios
3. Test multi-tenant organization switching
4. Test error handling and edge cases
5. Test platform-specific storage mechanisms
6. Test SSR and client-side hydration

## 🔐 Security Best Practices

1. **Never store sensitive data in localStorage** - Use secure storage
2. **Validate tokens on both client and server**
3. **Implement proper CSRF protection**
4. **Use HTTPS in production**
5. **Rotate encryption keys regularly**
6. **Monitor for suspicious authentication patterns**
7. **Implement rate limiting for authentication endpoints**
8. **Log authentication events for audit trails**