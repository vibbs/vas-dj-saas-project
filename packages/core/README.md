# @vas-dj-saas/core

Core business logic and shared utilities for VAS-DJ SaaS application.

## Overview

This package houses business logic that doesn't fit neatly into other specialized packages (ui, auth, api-client). It's the home for:

- **Navigation configuration** - Centralized, permission-based navigation
- **Constants** - App-wide constants (future)
- **Validators** - Business rule validators (future)
- **Formatters** - Data formatters (future)
- **Calculations** - Business calculations (future)

## Installation

```bash
pnpm add @vas-dj-saas/core
```

## Navigation System

### Configuration-Driven Navigation

The navigation system provides a single source of truth for app navigation with built-in support for:

- ✅ Role-based permissions
- ✅ Feature flags
- ✅ Platform targeting (web/mobile)
- ✅ Hierarchical structure (expandable sections)
- ✅ Custom permission checks

### Usage

#### Basic Usage

```typescript
import { useNavigation } from '@vas-dj-saas/core/navigation';
import { useAuthAccount } from '@vas-dj-saas/auth';

function MySidebar() {
  const account = useAuthAccount();

  const { sections } = useNavigation({
    platform: 'web',
    account,
  });

  return (
    <nav>
      {sections.map(section => (
        <div key={section.id}>
          {section.items.map(item => (
            <a href={item.href}>{item.label}</a>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

#### With Feature Flags

```typescript
const { sections } = useNavigation({
  platform: 'web',
  account,
  featureFlags: {
    flags: {
      newDashboard: true,
      betaFeatures: false,
    },
  },
});
```

### Configuration

Navigation is configured in `src/navigation/config/nav-items.ts`. Add new items by editing the configuration:

```typescript
{
  id: 'my-new-page',
  label: 'My Page',
  icon: '📄',
  href: '/my-page',
  platforms: ['web', 'mobile'],
  permission: {
    type: 'role',
    roles: ['admin'],
  },
}
```

### Permission Types

**Role-based:**
```typescript
permission: {
  type: 'role',
  roles: ['admin', 'orgAdmin', 'orgCreator'],
}
```

**Custom check:**
```typescript
permission: {
  type: 'custom',
  customCheck: (account) => account.canManageBilling || account.isAdmin,
}
```

### Feature Flags

```typescript
featureFlags: {
  flags: ['newUI', 'betaFeature'],
  requiresAll: true, // AND logic (all flags must be enabled)
}
```

## Future Features

- Constants management
- Business rule validators
- Data formatters (currency, dates, etc.)
- Calculation helpers
- Type utilities

## Development

```bash
# Build package
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check
```

## License

Private - Internal use only
