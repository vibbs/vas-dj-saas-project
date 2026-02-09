# Adapter Pattern - Quick Start Guide

A quick reference for using the router adapters in the VAS-DJ SaaS monorepo.

## TL;DR

```tsx
// 1. Import the adapter for your platform
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';

// 2. Import UI components
import { ShallowTabs, EntityDrawer } from '@vas-dj-saas/ui';

// 3. Use in your component
function MyPage() {
  const router = useNextTabRouter();

  return (
    <ShallowTabs
      router={router}
      tabs={[...]}
    />
  );
}
```

## Platform-Specific Imports

### Web (Next.js)
```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
```

### Mobile (React Navigation)
```tsx
import { useReactNavTabRouter } from '@vas-dj-saas/adapters/react-navigation-router';
```

### Testing/Storybook
```tsx
import { createMockRouter } from '@vas-dj-saas/ui/.storybook/mockRouterAdapter';
```

## Common Patterns

### Pattern 1: Tabs with URL Sync

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';

export default function SettingsPage() {
  const router = useNextTabRouter();

  return (
    <ShallowTabs
      router={router}
      defaultTab="profile"
      tabs={[
        { value: 'profile', label: 'Profile', component: <ProfileTab /> },
        { value: 'security', label: 'Security', component: <SecurityTab /> },
      ]}
    />
  );
}

// URL: /settings?tab=profile
```

### Pattern 2: Entity Selection Drawer

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { EntityDrawer } from '@vas-dj-saas/ui';

export default function MembersPage() {
  const router = useNextTabRouter();
  const selectedId = router.getValue('selected');

  function handleRowClick(id: string) {
    router.setValue('selected', id);
  }

  return (
    <>
      <MembersTable onRowClick={handleRowClick} />
      <EntityDrawer router={router} title="Details">
        {selectedId && <MemberDetails id={selectedId} />}
      </EntityDrawer>
    </>
  );
}

// URL: /members?selected=user123
```

### Pattern 3: Multiple Query Parameters

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';

export default function FilteredListPage() {
  const router = useNextTabRouter();

  const tab = router.getValue('tab') ?? 'all';
  const filter = router.getValue('filter') ?? '';
  const sort = router.getValue('sort') ?? 'name';

  function updateFilter(newFilter: string) {
    router.setValue('filter', newFilter);
  }

  function updateSort(newSort: string) {
    router.setValue('sort', newSort);
  }

  // URL: /list?tab=all&filter=active&sort=name
}
```

### Pattern 4: Using Helper Hooks

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { useTabRouter, useDrawerRouter } from '@vas-dj-saas/ui';

// Simple tab management
function TabsExample() {
  const port = useNextTabRouter();
  const { value, setValue } = useTabRouter(port);

  return <button onClick={() => setValue('profile')}>Go to Profile</button>;
}

// Tab + drawer management
function DrawerExample() {
  const port = useNextTabRouter();
  const { tab, selected, setTab, setSelected } = useDrawerRouter(port);

  return (
    <>
      <button onClick={() => setTab('members')}>Members Tab</button>
      <button onClick={() => setSelected('user123')}>Select User</button>
    </>
  );
}
```

## API Reference Cheat Sheet

### TabRouterPort Interface

```typescript
interface TabRouterPort {
  // Get a query parameter
  getValue(key: string): string | null;

  // Set a query parameter
  setValue(key: string, value: string, options?: {
    scroll?: boolean;    // default: false
    shallow?: boolean;   // default: true
  }): void;

  // Get current pathname
  getPathname(): string;

  // Get all query params as string
  getSearchParams(): string;
}
```

### Helper Hooks

```typescript
// Simple tab hook
const { value, setValue } = useTabRouter(port, 'tab');

// Drawer + tabs hook
const { tab, selected, setTab, setSelected } = useDrawerRouter(
  port,
  'tab',      // tab param key (default)
  'selected'  // selected param key (default)
);
```

## Testing Examples

### Unit Test with Mock Router

```tsx
import { createMockRouter } from '@vas-dj-saas/ui/.storybook/mockRouterAdapter';
import { render, fireEvent } from '@testing-library/react';

test('tab changes update router', () => {
  const mockRouter = createMockRouter({ tab: 'profile' });

  const { getByText } = render(
    <ShallowTabs router={mockRouter} tabs={tabs} />
  );

  fireEvent.click(getByText('Security'));

  // Check that router was updated
  expect(mockRouter.getValue('tab')).toBe('security');
});
```

### Spy on Router Calls

```tsx
import { vi } from 'vitest';

test('clicking item opens drawer', () => {
  const mockRouter = {
    getValue: vi.fn(() => null),
    setValue: vi.fn(),
    getPathname: vi.fn(() => '/members'),
    getSearchParams: vi.fn(() => ''),
  };

  render(<MembersList router={mockRouter} />);
  fireEvent.click(screen.getByText('John Doe'));

  expect(mockRouter.setValue).toHaveBeenCalledWith('selected', 'user-123');
});
```

## Common Mistakes to Avoid

### ❌ DON'T: Create router in child components

```tsx
function ChildComponent() {
  const router = useNextTabRouter(); // ❌ Creates new instance
  // ...
}
```

### ✅ DO: Pass router from parent

```tsx
function ParentPage() {
  const router = useNextTabRouter(); // ✅ Create once at page level
  return <ChildComponent router={router} />;
}
```

### ❌ DON'T: Import from wrong package

```tsx
import { useRouter } from 'next/navigation'; // ❌ Bypasses adapter
```

### ✅ DO: Use adapter

```tsx
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router'; // ✅
```

### ❌ DON'T: Forget to pass router

```tsx
<ShallowTabs tabs={tabs} /> // ❌ Missing router prop
```

### ✅ DO: Always provide router

```tsx
<ShallowTabs router={router} tabs={tabs} /> // ✅
```

## Migration Checklist

When migrating existing components:

1. [ ] Import adapter at page level
2. [ ] Instantiate router with `useNextTabRouter()`
3. [ ] Pass `router` prop to `<ShallowTabs>` or `<EntityDrawer>`
4. [ ] Remove direct imports from `next/navigation`
5. [ ] Update tests to use `createMockRouter`
6. [ ] Build and verify no TypeScript errors

## Need Help?

- **Full Documentation**: See [ADAPTER_PATTERN_REFACTOR.md](./ADAPTER_PATTERN_REFACTOR.md)
- **Adapter Package**: See [packages/adapters/README.md](../packages/adapters/README.md)
- **UI Package**: See [packages/ui/README.md](../packages/ui/README.md)

## Example: Complete Settings Page

```tsx
'use client';

import React from 'react';
import { useNextTabRouter } from '@vas-dj-saas/adapters/next-router';
import { ShallowTabs } from '@vas-dj-saas/ui';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SecurityTab } from '@/components/settings/SecurityTab';

export default function SettingsPage() {
  const router = useNextTabRouter();

  return (
    <div className="container">
      <h1>Settings</h1>
      <ShallowTabs
        router={router}
        defaultTab="profile"
        tabs={[
          {
            value: 'profile',
            label: 'Profile',
            component: <ProfileTab />,
          },
          {
            value: 'security',
            label: 'Security',
            component: <SecurityTab />,
          },
        ]}
      />
    </div>
  );
}
```

---

**Last Updated:** 2025-10-22
