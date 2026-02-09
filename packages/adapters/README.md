# @vas-dj-saas/adapters

Framework adapters implementing ports defined in `@vas-dj-saas/ui`.

## Overview

This package provides concrete implementations of the router abstraction layer, following the **Hexagonal Architecture (Ports & Adapters)** pattern. It allows UI components to remain framework-agnostic while working seamlessly with different routing solutions.

## Architecture

```
┌─────────────────────────────────────────────┐
│          @vas-dj-saas/ui (Port Layer)       │
│  ┌────────────────────────────────────────┐ │
│  │    TabRouterPort Interface             │ │
│  │  - getValue(key): string | null        │ │
│  │  - setValue(key, value): void          │ │
│  │  - getPathname(): string               │ │
│  │  - getSearchParams(): string           │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ▲
                    │ implements
                    │
┌───────────────────┴─────────────────────────┐
│    @vas-dj-saas/adapters (Adapter Layer)    │
│  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Next.js Router  │  │ React Navigation │ │
│  │  useNextTabRouter│  │useReactNavRouter │ │
│  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
                    ▲
                    │ uses
                    │
┌───────────────────┴─────────────────────────┐
│      apps/* (Composition Layer)             │
│  Wires UI components + framework adapters   │
└─────────────────────────────────────────────┘
```

## Benefits

- **Framework Independence**: UI components don't depend on specific routing frameworks
- **Testability**: Easy to mock router behavior for unit tests
- **Portability**: Same UI components work across web and mobile
- **Extensibility**: Support any router by implementing the `TabRouterPort` interface
- **Type Safety**: Full TypeScript support with proper typing

## Installation

This package is part of the VAS-DJ SaaS monorepo and is consumed as a workspace dependency:

```json
{
  "dependencies": {
    "@vas-dj-saas/adapters": "workspace:*"
  }
}
```

## Available Adapters

### Next.js Router Adapter

For Next.js applications using the App Router.

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';

export default function SettingsPage() {
  const router = useNextTabRouter();

  return (
    <ShallowTabs
      router={router}
      tabs={[
        { value: 'profile', label: 'Profile', component: <ProfileTab /> },
        { value: 'security', label: 'Security', component: <SecurityTab /> },
      ]}
    />
  );
}
```

**Features:**
- Shallow routing (no page reload)
- Preserves scroll position
- Maintains other query parameters
- SSR-safe

### React Navigation Router Adapter

For React Native applications using React Navigation.

```tsx
import { useReactNavTabRouter } from '@vas-dj-saas/adapters/react-navigation-router';
import { ShallowTabs } from '@vas-dj-saas/ui';

export default function SettingsScreen() {
  const router = useReactNavTabRouter();

  return (
    <ShallowTabs
      router={router}
      tabs={[
        { value: 'profile', label: 'Profile', component: <ProfileTab /> },
        { value: 'security', label: 'Security', component: <SecurityTab /> },
      ]}
    />
  );
}
```

**Features:**
- Native navigation integration
- Route parameter management
- Deep linking support
- Screen state preservation

## Usage Examples

### Basic Tab Navigation

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';

function MyPage() {
  const router = useNextTabRouter();

  return (
    <ShallowTabs
      router={router}
      defaultTab="overview"
      tabs={[
        { value: 'overview', label: 'Overview', component: <Overview /> },
        { value: 'details', label: 'Details', component: <Details /> },
      ]}
    />
  );
}
```

### Entity Drawer with Selection

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { EntityDrawer } from '@vas-dj-saas/ui';

function MembersPage() {
  const router = useNextTabRouter();
  const selectedId = router.getValue('selected');

  function handleRowClick(id: string) {
    router.setValue('selected', id);
  }

  return (
    <>
      <MembersTable onRowClick={handleRowClick} />
      <EntityDrawer router={router} title="Member Details">
        {selectedId && <MemberDetails id={selectedId} />}
      </EntityDrawer>
    </>
  );
}
```

### Multi-Parameter Management

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';

function SettingsPage() {
  const router = useNextTabRouter();

  const tab = router.getValue('tab');
  const filter = router.getValue('filter');
  const sort = router.getValue('sort');

  function updateFilters(newFilter: string) {
    router.setValue('filter', newFilter);
  }

  // Result: /settings?tab=members&filter=active&sort=name
}
```

### Using Helper Hooks

The UI package provides convenience hooks for common patterns:

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { useTabRouter, useDrawerRouter } from '@vas-dj-saas/ui';

function MyPage() {
  const port = useNextTabRouter();

  // Simplified tab API
  const { value, setValue } = useTabRouter(port);

  // Or for drawer + tabs
  const { tab, selected, setTab, setSelected } = useDrawerRouter(port);
}
```

## Creating Custom Adapters

You can create your own adapter for any routing solution:

```tsx
import type { TabRouterPort } from '@vas-dj-saas/ui';

export function useMyCustomRouter(): TabRouterPort {
  // Your router hooks here
  const router = useYourRouter();

  return {
    getValue: (key: string) => {
      // Implement: Get query param value
      return router.query[key] ?? null;
    },

    setValue: (key: string, value: string) => {
      // Implement: Set query param value
      router.push({ query: { ...router.query, [key]: value } });
    },

    getPathname: () => {
      // Implement: Get current pathname
      return router.pathname;
    },

    getSearchParams: () => {
      // Implement: Get all query params as string
      return new URLSearchParams(router.query).toString();
    },
  };
}
```

### Adapter for TanStack Router

Example implementation for TanStack Router:

```tsx
import { useRouter, useSearch } from '@tanstack/react-router';
import type { TabRouterPort } from '@vas-dj-saas/ui';

export function useTanStackTabRouter(): TabRouterPort {
  const router = useRouter();
  const search = useSearch({ strict: false });

  return {
    getValue: (key: string) => search[key] ?? null,
    setValue: (key: string, value: string) => {
      router.navigate({
        search: (prev) => ({ ...prev, [key]: value }),
        replace: true,
      });
    },
    getPathname: () => router.state.location.pathname,
    getSearchParams: () => new URLSearchParams(search as any).toString(),
  };
}
```

## Testing

### Mock Router for Unit Tests

```tsx
import { createMockRouter } from '@vas-dj-saas/ui/.storybook/mockRouterAdapter';
import { render } from '@testing-library/react';
import { ShallowTabs } from '@vas-dj-saas/ui';

test('renders tabs correctly', () => {
  const mockRouter = createMockRouter({ tab: 'profile' });

  render(
    <ShallowTabs
      router={mockRouter}
      tabs={[
        { value: 'profile', label: 'Profile', component: <div>Profile</div> },
      ]}
    />
  );

  // Assertions...
});
```

### Spy on Router Calls

```tsx
import { vi } from 'vitest';
import type { TabRouterPort } from '@vas-dj-saas/ui';

test('updates URL on tab change', () => {
  const mockRouter: TabRouterPort = {
    getValue: vi.fn(() => 'profile'),
    setValue: vi.fn(),
    getPathname: vi.fn(() => '/settings'),
    getSearchParams: vi.fn(() => 'tab=profile'),
  };

  // Test component...

  expect(mockRouter.setValue).toHaveBeenCalledWith('tab', 'security');
});
```

## API Reference

### TabRouterPort Interface

```typescript
interface TabRouterPort {
  getValue(key: string): string | null;
  setValue(key: string, value: string, options?: RouterNavigationOptions): void;
  getPathname(): string;
  getSearchParams(): string;
}

interface RouterNavigationOptions {
  scroll?: boolean;    // Whether to scroll to top (default: false)
  shallow?: boolean;   // Use shallow routing (default: true)
}
```

### Next.js Adapter

```typescript
function useNextTabRouter(): TabRouterPort;
function useNextQueryState(): TabRouterPort; // Alias
```

### React Navigation Adapter

```typescript
function useReactNavTabRouter(): TabRouterPort;
function useReactNavQueryState(navigatorKey?: string): TabRouterPort;
```

## Best Practices

### 1. Use at the Page/Screen Level

```tsx
// ✅ Good: Instantiate adapter at page level
function SettingsPage() {
  const router = useNextTabRouter();
  return <ShallowTabs router={router} tabs={tabs} />;
}

// ❌ Bad: Don't instantiate in child components
function TabsWrapper({ tabs }) {
  const router = useNextTabRouter(); // Creates new instance unnecessarily
  return <ShallowTabs router={router} tabs={tabs} />;
}
```

### 2. Pass Down the Router Instance

```tsx
// ✅ Good: Pass router to child components
function ParentPage() {
  const router = useNextTabRouter();
  return (
    <>
      <ShallowTabs router={router} tabs={tabs} />
      <EntityDrawer router={router} title="Details">...</EntityDrawer>
    </>
  );
}
```

### 3. Use Helper Hooks for Simplification

```tsx
import { useTabRouter } from '@vas-dj-saas/ui';

// ✅ Good: Use helper hook for common patterns
const { value, setValue } = useTabRouter(router);

// Instead of:
const value = router.getValue('tab');
const setValue = (v) => router.setValue('tab', v);
```

## Troubleshooting

### "router is undefined" error

Make sure you're importing the adapter and passing it to components:

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';

function MyPage() {
  const router = useNextTabRouter(); // ✅
  return <ShallowTabs router={router} tabs={tabs} />;
}
```

### SSR/Hydration Issues (Next.js)

The Next.js adapter handles SSR gracefully with fallbacks:

```tsx
// Built-in fallbacks for SSR
const safePathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
```

### Query Params Not Persisting

Ensure you're using shallow routing (default behavior):

```tsx
router.setValue('tab', 'profile', { shallow: true });
```

## Contributing

To add a new adapter:

1. Create adapter file in `packages/adapters/src/your-router/`
2. Implement `TabRouterPort` interface
3. Add export to `packages/adapters/package.json`
4. Write tests
5. Update this README

## Related Packages

- [`@vas-dj-saas/ui`](../ui/README.md) - UI components using these adapters
- [`@vas-dj-saas/core`](../core/README.md) - Core business logic

## License

Private - Part of VAS-DJ SaaS Monorepo
