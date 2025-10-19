# @vas-dj-saas/api-client

> Type-safe API client for VAS-DJ SaaS Platform (v1 API)

## Features

- ✅ **Fetch-first** - Modern, platform-agnostic HTTP client
- ✅ **Type-safe** - Full TypeScript support with types generated from OpenAPI schema
- ✅ **JWT Authentication** - Automatic token refresh with single-flight pattern
- ✅ **Multi-tenant** - Built-in organization scoping via `X-Org-Id` header
- ✅ **Resilient** - Exponential backoff retry for network errors
- ✅ **Observable** - Request tracing with `X-Request-Id`
- ✅ **Tree-shakeable** - Only bundle what you use
- ✅ **Cross-platform** - Works in Node.js, Next.js, and React Native

## Installation

```bash
pnpm add @vas-dj-saas/api-client
```

## Quick Start

### 1. Configure Authentication

```typescript
import { wireAuth } from '@vas-dj-saas/api-client';

// Wire up your token management
wireAuth({
  getAccessToken: () => localStorage.getItem('accessToken') ?? undefined,
  refreshToken: async () => {
    const refresh = localStorage.getItem('refreshToken');
    const response = await fetch('/api/v1/auth/refresh/', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ refresh }),
    });
    const data = await response.json();
    localStorage.setItem('accessToken', data.access);
  },
});
```

### 2. Use Services

```typescript
import { AuthService, UsersService } from '@vas-dj-saas/api-client';

// Login
const loginResponse = await AuthService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const currentUser = await UsersService.me();

// List users
const users = await UsersService.list({ page: 1, pageSize: 20 });
```

## API Reference

See full documentation: http://localhost:8000/api/docs/

## Development

```bash
# Generate types from OpenAPI schema
pnpm codegen

# Type check
pnpm type-check

# Build
pnpm build
```

## Version

- **Package**: 1.0.0 (tracks API v1.x)
- **API**: v1.0.0
