# @vas-dj-saas/types - Shared TypeScript Types

Comprehensive TypeScript type definitions shared across the entire VAS-DJ SaaS monorepo, ensuring type safety and consistency between all applications and packages.

## 🚀 Quick Start

```bash
# Install the package
pnpm add @vas-dj-saas/types

# The package has no runtime dependencies
```

### Basic Usage
```typescript
import type { 
  User, 
  Organization, 
  LoginCredentials, 
  ApiResponse 
} from '@vas-dj-saas/types';

// Use types for function parameters
function handleLogin(credentials: LoginCredentials): Promise<User> {
  // Implementation
}

// Use types for API responses
interface UsersApiResponse extends ApiResponse<User[]> {
  data: User[];
}

// Use types for component props
interface UserProfileProps {
  user: User;
  organization: Organization;
}
```

## 🏗️ Type Categories

### Core Entity Types

#### User
Complete user entity with all properties:
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;                // Computed full name
  abbreviatedName: string;         // First name + last initial
  avatar?: string;                 // Profile picture URL
  phone?: string;
  role: UserRole;                  // USER | ADMIN | GUEST
  organizationId: string;          // Associated organization
  isActive: boolean;               // Account status
  isEmailVerified: boolean;        // Email verification status
  isAdmin: boolean;                // System admin
  isOrgAdmin: boolean;             // Organization admin
  isOrgCreator: boolean;           // Organization creator
  status: UserStatus;              // Detailed status
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
}

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
  PENDING = 'PENDING',
}
```

#### Organization
Multi-tenant organization entity:
```typescript
interface Organization {
  id: string;
  name: string;                    // Organization display name
  subdomain: string;               // Subdomain for routing
  isActive: boolean;               // Organization status
  onTrial: boolean;                // Trial status
  trialEndsOn?: string;            // Trial expiration date
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
}
```

### Authentication Types

#### Login & Registration
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;                  // JWT access token
  refresh: string;                 // JWT refresh token
  user: User;                      // User data
}

interface RegistrationData {
  email: string;
  password: string;
  passwordConfirm: string;         // Password confirmation
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string;       // For multi-tenant setup
  preferredSubdomain?: string;     // Desired subdomain
}

interface RegistrationResponse {
  access: string;
  refresh: string;
  user: User;
  organization: Organization;      // Created organization
}
```

#### Token Management
```typescript
interface AuthTokens {
  accessToken: string;             // Current access token
  refreshToken: string;            // Refresh token
}

interface AuthState {
  user: User | null;               // Current authenticated user
  organization: Organization | null; // Current organization context
  tokens: AuthTokens | null;       // Current tokens
  isAuthenticated: boolean;        // Authentication status
  isLoading: boolean;              // Loading state
  error: string | null;            // Authentication error
}

interface TokenVerificationResponse {
  valid: boolean;                  // Token validity
  user?: User;                     // User data if valid
  error?: string;                  // Error message if invalid
}
```

#### Social Authentication
```typescript
interface SocialAuthData {
  provider: SocialProvider;        // OAuth provider
  providerUserId: string;          // Provider's user ID
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;                 // Profile picture from provider
  organizationName?: string;
  preferredSubdomain?: string;
}

enum SocialProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
}

interface SocialAuthResponse {
  access: string;
  refresh: string;
  user: User;
  organization: Organization;
}
```

### Email Verification
```typescript
interface EmailVerificationData {
  token: string;                   // Verification token from email
}

interface EmailVerificationResponse {
  message: string;                 // Success message
  user: User;                      // Updated user data
}

interface ResendVerificationResponse {
  message: string;                 // Confirmation message
}
```

### API Response Types

#### Standard API Responses
```typescript
interface ApiResponse<T = any> {
  success: boolean;                // Request success status
  data?: T;                        // Response data
  message?: string;                // Success/info message
  errors?: string[];               // Error messages array
}

interface PaginatedResponse<T = any> {
  results: T[];                    // Current page results
  count: number;                   // Total count
  next: string | null;             // Next page URL
  previous: string | null;         // Previous page URL
}
```

#### Usage Examples
```typescript
// Single user response
type UserResponse = ApiResponse<User>;

// List of users response
type UsersResponse = ApiResponse<User[]>;

// Paginated users response
type PaginatedUsersResponse = PaginatedResponse<User>;

// Custom API responses
interface DashboardStatsResponse extends ApiResponse {
  data: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    growth: number;
  };
}
```

### Error Handling Types

#### Structured Errors
```typescript
interface AuthError {
  message: string;                 // Human-readable error message
  field?: string;                  // Field that caused the error
  code?: string;                   // Error code for programmatic handling
}

interface ValidationErrors {
  [field: string]: string[];       // Field-specific validation errors
}

// Usage examples
const handleApiError = (error: AuthError) => {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      showLoginError(error.message);
      break;
    case 'EMAIL_NOT_VERIFIED':
      redirectToEmailVerification();
      break;
    default:
      showGenericError(error.message);
  }
};
```

### Form and UI Types

#### Form State Management
```typescript
interface FormState<T> {
  data: T;                         // Current form data
  errors: ValidationErrors;        // Validation errors
  touched: Record<keyof T, boolean>; // Touched field tracking
  isSubmitting: boolean;           // Submission state
  isValid: boolean;                // Overall form validity
}

// Usage example
interface LoginFormData {
  email: string;
  password: string;
}

type LoginFormState = FormState<LoginFormData>;
```

#### Component Props Types
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Extended for platform-specific props
interface WebButtonProps extends ButtonProps {
  className?: string;              // Web-specific styling
  type?: 'button' | 'submit' | 'reset';
}

interface NativeButtonProps extends ButtonProps {
  style?: any;                     // React Native StyleSheet
  onPress?: () => void;            // React Native event handler
}
```

## 🎯 Usage Patterns

### Type-Safe API Calls
```typescript
import type { User, ApiResponse, PaginatedResponse } from '@vas-dj-saas/types';
import { apiClient } from '@vas-dj-saas/api-client';

// Single user fetch
const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}/`);
  return response.data!;
};

// Paginated user list
const getUsers = async (page: number = 1): Promise<PaginatedResponse<User>> => {
  return apiClient.get<PaginatedResponse<User>>(`/users/?page=${page}`);
};

// Create user with validation
const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.post<ApiResponse<User>>('/users/', userData);
    return response.data!;
  } catch (error: AuthError) {
    if (error.field) {
      // Handle field-specific validation error
      throw new Error(`${error.field}: ${error.message}`);
    }
    throw error;
  }
};
```

### Type-Safe Form Handling
```typescript
import type { LoginCredentials, FormState, ValidationErrors } from '@vas-dj-saas/types';

const useLoginForm = () => {
  const [formState, setFormState] = useState<FormState<LoginCredentials>>({
    data: { email: '', password: '' },
    errors: {},
    touched: { email: false, password: false },
    isSubmitting: false,
    isValid: false,
  });

  const validateField = (field: keyof LoginCredentials, value: string): string[] => {
    const errors: string[] = [];
    
    if (field === 'email') {
      if (!value) errors.push('Email is required');
      if (!/\S+@\S+\.\S+/.test(value)) errors.push('Invalid email format');
    }
    
    if (field === 'password') {
      if (!value) errors.push('Password is required');
      if (value.length < 8) errors.push('Password must be at least 8 characters');
    }
    
    return errors;
  };

  const updateField = (field: keyof LoginCredentials, value: string) => {
    const fieldErrors = validateField(field, value);
    
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: fieldErrors },
      touched: { ...prev.touched, [field]: true },
      isValid: Object.keys(prev.errors).every(key => 
        prev.errors[key as keyof LoginCredentials]?.length === 0
      ),
    }));
  };

  return { formState, updateField };
};
```

### Type-Safe Component Props
```typescript
import type { User, Organization } from '@vas-dj-saas/types';

interface UserProfileCardProps {
  user: User;
  organization: Organization;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  showActions?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  organization,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <div className="user-profile-card">
      <img src={user.avatar || '/default-avatar.png'} alt={user.fullName} />
      <h3>{user.fullName}</h3>
      <p>{user.email}</p>
      <span className={`status ${user.status.toLowerCase()}`}>
        {user.status}
      </span>
      
      {showActions && (
        <div className="actions">
          {onEdit && <button onClick={() => onEdit(user)}>Edit</button>}
          {onDelete && <button onClick={() => onDelete(user.id)}>Delete</button>}
        </div>
      )}
    </div>
  );
};
```

## 🔧 Advanced Type Patterns

### Generic Response Wrappers
```typescript
// Create type-safe API response wrappers
type ApiSuccess<T> = ApiResponse<T> & { success: true; data: T };
type ApiError = ApiResponse & { success: false; errors: string[] };
type ApiResult<T> = ApiSuccess<T> | ApiError;

// Type guards for response handling
const isApiSuccess = <T>(response: ApiResult<T>): response is ApiSuccess<T> => {
  return response.success === true;
};

// Usage
const handleUserFetch = (response: ApiResult<User>) => {
  if (isApiSuccess(response)) {
    // TypeScript knows this is ApiSuccess<User>
    console.log(response.data.email);
  } else {
    // TypeScript knows this is ApiError
    console.error(response.errors);
  }
};
```

### Utility Types
```typescript
// Create partial update types
type UserUpdate = Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatar'>>;

// Create form-specific types
type UserRegistrationForm = Pick<User, 'email' | 'firstName' | 'lastName'> & {
  password: string;
  passwordConfirm: string;
};

// Create filtered types
type PublicUser = Omit<User, 'isAdmin' | 'isOrgAdmin' | 'isOrgCreator'>;

// Create extended types
interface UserWithStats extends User {
  stats: {
    loginCount: number;
    lastLoginAt: string;
    profileCompleteness: number;
  };
}
```

### Conditional Types
```typescript
// Platform-specific types
type PlatformSpecific<T, Platform extends 'web' | 'native'> = 
  Platform extends 'web' 
    ? T & { className?: string }
    : T & { style?: any };

// Component props based on platform
type ButtonProps<Platform extends 'web' | 'native'> = PlatformSpecific<{
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}, Platform>;

// Usage
const WebButton: React.FC<ButtonProps<'web'>> = ({ className, ...props }) => {
  // Web-specific implementation
};

const NativeButton: React.FC<ButtonProps<'native'>> = ({ style, ...props }) => {
  // Native-specific implementation
};
```

## 🧪 Testing Types

### Mock Type Utilities
```typescript
// Create mock data factories
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  abbreviatedName: 'Test U.',
  role: UserRole.USER,
  organizationId: 'org_456',
  isActive: true,
  isEmailVerified: true,
  isAdmin: false,
  isOrgAdmin: false,
  isOrgCreator: false,
  status: UserStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockOrganization = (overrides: Partial<Organization> = {}): Organization => ({
  id: 'org_456',
  name: 'Test Organization',
  subdomain: 'test-org',
  isActive: true,
  onTrial: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Type-safe test data
const testUser = createMockUser({
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  isAdmin: true,
});
```

## 📦 Export Structure

### Main Exports
```typescript
// Core entities
export type { User, Organization };
export { UserRole, UserStatus, SocialProvider };

// Authentication
export type {
  LoginCredentials,
  LoginResponse,
  AuthTokens,
  AuthState,
  RegistrationData,
  RegistrationResponse,
  SocialAuthData,
  SocialAuthResponse,
  EmailVerificationData,
  EmailVerificationResponse,
  ResendVerificationResponse,
  TokenVerificationResponse,
};

// API responses
export type {
  ApiResponse,
  PaginatedResponse,
};

// Errors
export type {
  AuthError,
  ValidationErrors,
};

// Forms and UI
export type {
  FormState,
  ButtonProps,
};
```

### Organized Type Groups
```typescript
// Import specific type groups
import type {
  // User-related types
  User,
  UserRole,
  UserStatus,
  
  // Organization-related types
  Organization,
  
  // Authentication types
  AuthState,
  LoginCredentials,
  RegistrationData,
} from '@vas-dj-saas/types';

// Or import everything
import * as Types from '@vas-dj-saas/types';

type MyUser = Types.User;
```

## 🔄 Version Compatibility

### Backward Compatibility
```typescript
// Deprecated types (kept for backward compatibility)
/** @deprecated Use RegistrationData instead */
export type RegisterCredentials = RegistrationData;

/** @deprecated Use AuthError instead */
export type ApiError = AuthError;
```

### Migration Helpers
```typescript
// Helper types for migrations
export type LegacyUser = Omit<User, 'abbreviatedName' | 'isOrgCreator'>;

// Conversion utilities
export const migrateLegacyUser = (legacyUser: LegacyUser): User => ({
  ...legacyUser,
  abbreviatedName: `${legacyUser.firstName} ${legacyUser.lastName[0]}.`,
  isOrgCreator: false,
});
```

## 📚 Related Documentation

- **[API Client](../api-client/README.md)** - Using types with API client
- **[Authentication](../auth/README.md)** - Auth-specific type usage
- **[UI Components](../ui/README.md)** - Component prop types
- **[Web App](../../apps/web/README.md)** - Web-specific type usage
- **[Mobile App](../../apps/mobile/README.md)** - Mobile-specific type usage
- **[Backend API](../../backend/README.md)** - Backend type alignment

## 🤝 Contributing

### Adding New Types
1. **Define Interface**: Create clear, well-documented interfaces
2. **Add Exports**: Update main export file
3. **Write Tests**: Add type tests for complex types
4. **Document Usage**: Include usage examples in this README
5. **Update Dependents**: Update packages that use the new types

### Type Design Guidelines
1. **Consistency**: Follow established naming conventions
2. **Immutability**: Prefer readonly properties where appropriate
3. **Null Safety**: Use optional properties and null unions appropriately
4. **Extensibility**: Design types to be easily extended
5. **Documentation**: Include JSDoc comments for complex types

### Testing Types
```typescript
// Type tests to ensure type safety
import type { User, UserRole } from '@vas-dj-saas/types';

// Test type assignments
const validUser: User = createMockUser();
const userRole: UserRole = UserRole.ADMIN;

// Test type constraints
type EmailField = User['email']; // Should be string
type RoleField = User['role'];   // Should be UserRole

// Test utility types
type UserUpdate = Partial<Pick<User, 'firstName' | 'lastName'>>;
const update: UserUpdate = { firstName: 'New Name' }; // Valid
```

## 🔍 Type Checking Best Practices

1. **Strict Mode**: Enable strict TypeScript compilation
2. **No Any**: Avoid `any` type, use `unknown` when necessary
3. **Type Guards**: Use type guards for runtime type checking
4. **Exhaustive Checks**: Use exhaustive checking for enums
5. **Branded Types**: Use branded types for ID fields when needed

```typescript
// Example: Branded types for IDs
type UserId = string & { readonly brand: unique symbol };
type OrganizationId = string & { readonly brand: unique symbol };

// This prevents accidentally mixing ID types
const createUser = (orgId: OrganizationId) => { /* ... */ };
const userId: UserId = 'user_123' as UserId;
// createUser(userId); // TypeScript error - correct!
```