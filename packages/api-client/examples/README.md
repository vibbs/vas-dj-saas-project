# API Client Examples

This directory contains practical examples demonstrating how to use the `@vas-dj-saas/api-client` package.

## Examples

### 1. [Basic Usage](./basic-usage.ts)

Learn the fundamentals:
- Initial configuration and setup
- Authentication (login/logout)
- User operations (get current user, update profile)
- Organization operations (list, retrieve)
- Complete usage flow

**Key concepts:**
- `wireAuth()` - Configure authentication
- `setBaseUrl()` - Set API endpoint
- Service methods - `AuthService`, `UsersService`, `OrganizationsService`
- Response structure - `response.data.data`

### 2. [Error Handling](./error-handling.ts)

Master error handling:
- Basic error handling with `formatApiError()`
- Detailed error inspection with `ApiError`
- Validation error handling
- Error handling by status code
- React hook integration
- Retry logic
- Error monitoring/logging

**Key concepts:**
- `ApiError` class with helper methods
- `formatApiError()` utility
- `getValidationErrors()` for form errors
- Error type checking (`isAuthError()`, `isServerError()`, etc.)

### 3. [Pagination](./pagination.ts)

Work with paginated data:
- Basic pagination (page/pageSize)
- Navigate through pages
- Pagination helper utilities
- Async iteration over all pages
- Collect all results at once
- React component examples (standard & infinite scroll)
- Search with pagination

**Key concepts:**
- `hasNextPage()`, `hasPreviousPage()` helpers
- `extractPageNumber()` utility
- `iterateAll()` async iterator
- `collectAll()` for fetching everything
- Response structure: `{ results, count, next, previous }`

### 4. [Advanced Features](./advanced-features.ts)

Advanced patterns:
- Request logging (debugging)
- Multi-tenancy (organization scoping)
- Custom error handlers
- Request interceptors
- Type-safe request/response handling
- Zod schema validation

**Key concepts:**
- `enableLogging()` for debugging
- `setDefaultOrg()` for multi-tenancy
- Custom `ApiClient` instances
- Schema validation with Zod

## Quick Start

```typescript
import { wireAuth, setBaseUrl, AuthService } from '@vas-dj-saas/api-client';

// 1. Configure
setBaseUrl('https://api.example.com/api/v1');

wireAuth({
  getAccessToken: () => localStorage.getItem('token'),
  refreshToken: async () => {
    // Your refresh logic
  }
});

// 2. Use services
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (response.status === 200 && response.data.data) {
  const { access, user } = response.data.data;
  console.log('Logged in:', user.email);
}
```

## Response Structure

All API responses follow this structure:

```typescript
{
  status: 200,
  data: {
    status: 'success',
    code: 'OK',
    i18n_key: 'success',
    data: {
      // Actual response data here
    }
  }
}
```

Access the actual data with: `response.data.data`

## Error Handling Pattern

```typescript
try {
  const response = await SomeService.someMethod();
  const data = response.data.data;
  // Use data
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      // Handle validation errors
      const errors = error.getValidationErrors();
    } else if (error.isAuthError()) {
      // Redirect to login
    }
  }
}
```

## Pagination Pattern

```typescript
// Simple pagination
const response = await OrganizationsService.list({ page: 1, pageSize: 10 });

// Fetch all pages
const allOrgs = await collectAll(
  (page) => OrganizationsService.list({ page, pageSize: 20 })
);

// Iterate through pages
for await (const org of iterateAll(fetcher)) {
  console.log(org.name);
}
```

## TypeScript Support

All services and types are fully typed:

```typescript
import type { Account, Organization, LoginCredentials } from '@vas-dj-saas/api-client';

const credentials: LoginCredentials = {
  email: 'user@example.com',
  password: 'password123'
};

const user: Account = response.data.data.user;
```

## Additional Resources

- [API Client README](../README.md) - Package overview
- [Django API Documentation](http://localhost:8000/api/docs/) - Backend API reference
- [Type Definitions](../src/types/index.ts) - All available types
- [Services](../src/services/) - Service implementations

## Running Examples

These examples are TypeScript files for reference. To run them:

1. Install the package in your project
2. Copy the relevant code
3. Adapt to your environment (React, Node, etc.)

For a working implementation, see:
- Web app: `apps/web/`
- Mobile app: `apps/mobile/`
- Auth package: `packages/auth/src/stores/session.ts`
