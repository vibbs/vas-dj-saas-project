# Modern Tech Stack Implementation Guide

This guide documents the modern tech stack implementation for the VAS-DJ SaaS monorepo, covering all the best practices and patterns we've established.

## 🏗️ Architecture Overview

### Tech Stack Components

- **Server State Management**: TanStack Query v5
- **UI/Global State**: Zustand v5
- **Forms & Validation**: React Hook Form v7 + Zod v4
- **HTTP Client**: Axios with modern interceptors
- **Authentication**: JWT with secure storage (HttpOnly cookies for web, SecureStore for mobile)
- **UI Components**: Shared cross-platform components with Tailwind CSS

### Package Structure

```
packages/
├── api-client/     # HTTP client with interceptors and typed endpoints
├── auth/           # Zustand-based session management
├── types/          # Zod schemas and TypeScript types  
├── ui/             # Cross-platform components + UI state stores
└── utils/          # Shared utilities
```

## 🔐 Authentication System

### Modern Auth Store (Zustand)

```tsx
import { useAuth, useAuthActions, useAuthUser } from '@vas-dj-saas/auth';

function MyComponent() {
  const user = useAuthUser();
  const { login, logout } = useAuthActions();
  const status = useAuth((state) => state.status);
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Automatically redirects on success
    } catch (error) {
      // Error handling is built into the store
    }
  };
}
```

### Route Guards

```tsx
import { RouteGuard } from '../components/RouteGuard';

// Protected route
export default function DashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardContent />
    </RouteGuard>
  );
}

// Public route (redirects if already authenticated)
export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <LoginContent />
    </RouteGuard>
  );
}
```

### Token Management

- **Web**: HttpOnly cookies for refresh tokens, access tokens in memory
- **Mobile**: SecureStore for both tokens
- **Automatic refresh**: Handled transparently by interceptors

## 🌐 API Client & Data Fetching

### HTTP Client with Interceptors

```tsx
import { wireAuth } from '@vas-dj-saas/api-client';
import { useAuth } from '@vas-dj-saas/auth';

// Wire auth system (done automatically in auth store)
wireAuth({
  getAccessToken: () => authStore.getState().accessToken,
  onAuthError: async () => {
    // Attempt token refresh
  },
});
```

### Typed Endpoints

```tsx
import { login, me, getOrganizationUsers } from '@vas-dj-saas/api-client';

// All endpoints are typed with Zod validation
const session = await login({ email, password });
const user = await me();
const users = await getOrganizationUsers(orgId);
```

### TanStack Query Patterns

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Data fetching
function useUsers() {
  return useQuery({
    queryKey: ['users', orgId],
    queryFn: () => getOrganizationUsers(orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations with optimistic updates
function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onMutate: async ({ userId, updates }) => {
      // Cancel queries and snapshot previous value
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Optimistically update
      queryClient.setQueryData(['users'], old => 
        old.map(u => u.id === userId ? { ...u, ...updates } : u)
      );
      
      return { previousUsers };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['users'], context.previousUsers);
    },
    onSettled: () => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## 📝 Forms & Validation

### Zod Schemas

```tsx
// In packages/types/src/schemas.ts
export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN', 'GUEST']),
});

export type InviteUser = z.infer<typeof InviteUserSchema>;
```

### React Hook Form Integration

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InviteUserSchema, type InviteUser } from '@vas-dj-saas/types';

function InviteUserForm() {
  const form = useForm<InviteUser>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: {
      email: '',
      role: 'USER',
    },
  });

  const onSubmit = (data: InviteUser) => {
    // Data is fully typed and validated
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
    </form>
  );
}
```

## 🎨 UI State Management

### Layout Store (Sidebar, Mobile Menu, Theme)

```tsx
import { useLayoutStore, useSidebarState, useThemeState } from '@vas-dj-saas/ui';

function Header() {
  const { toggleSidebar } = useSidebarState();
  const { isDarkMode, toggleDarkMode } = useThemeState();
  
  return (
    <header>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </header>
  );
}
```

### Toast Notifications

```tsx
import { useToastActions } from '@vas-dj-saas/ui';

function MyComponent() {
  const { success, error, warning, info } = useToastActions();
  
  const handleAction = async () => {
    try {
      await someAction();
      success('Success!', 'Action completed successfully');
    } catch (err) {
      error('Error!', 'Something went wrong');
    }
  };
}
```

### Modal Management

```tsx
import { useModalActions } from '@vas-dj-saas/ui';

function MyComponent() {
  const { openModal, closeModal } = useModalActions();
  
  const handleOpenModal = () => {
    const modalId = openModal({
      component: <MyModalContent />,
      options: { 
        size: 'lg',
        closeOnOverlayClick: true 
      }
    });
  };
}
```

## 🏃‍♂️ Getting Started

### 1. Install Dependencies

Dependencies are already installed at the monorepo root and in individual packages.

### 2. Set Up Providers

#### Web App
```tsx
// apps/web/src/app/layout.tsx
import { Providers } from '../providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
```

#### Mobile App
```tsx
// apps/mobile/app/_layout.tsx
import { Providers } from '../providers';

export default function RootLayout() {
  return (
    <Providers>
      <ThemeProvider>
        {/* Your navigation */}
      </ThemeProvider>
    </Providers>
  );
}
```

### 3. Create Your First Query Hook

```tsx
// hooks/useMyData.ts
import { useQuery } from '@tanstack/react-query';
import { myApiEndpoint } from '@vas-dj-saas/api-client';

export function useMyData(id: string) {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => myApiEndpoint(id),
    enabled: !!id,
  });
}
```

### 4. Create a Form Component

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MySchema } from '@vas-dj-saas/types';

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(MySchema),
  });
  
  // Your form implementation
}
```

## 🔄 Best Practices

### Query Key Conventions
- Use arrays: `['users', orgId]`
- Include all variables that affect the data
- Be specific: `['user', userId, 'profile']`

### Error Handling
- API errors are handled by interceptors
- Form validation errors are handled by Zod + RHF
- Toast notifications for user feedback
- Optimistic updates with rollback

### State Management Guidelines
- **Server state**: Always use TanStack Query
- **UI state**: Use Zustand stores in packages/ui
- **Form state**: Use React Hook Form
- **Component state**: Use useState/useReducer

### Security
- Tokens are stored securely (HttpOnly cookies on web, SecureStore on mobile)
- All API requests include automatic token refresh
- No sensitive data in localStorage
- CSRF protection not needed with Bearer tokens

## 📱 Platform Differences

### Web Specific
- HttpOnly cookies for refresh tokens
- React Query DevTools available
- Next.js SSR considerations

### Mobile Specific
- SecureStore for token storage
- Platform-specific UI components
- Network state handling

## 🚀 Advanced Patterns

### Background Sync
```tsx
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchIntervalInBackground: false,
});
```

### Infinite Queries
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
```

### Dependent Queries
```tsx
function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId, // Only run when userId is available
  });
}
```

## 🎯 Examples

See the complete working examples in:
- `/apps/web/src/app/dashboard/users/page.tsx` - Complete CRUD with all patterns
- `/apps/web/src/hooks/useUsers.ts` - Query hooks with mutations
- `/apps/web/src/components/InviteUserForm.tsx` - Form with validation

This modern stack provides type safety, great DX, and follows industry best practices for scalable React applications.