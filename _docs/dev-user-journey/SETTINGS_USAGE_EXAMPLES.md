# ShallowTabs & EntityDrawer Usage Examples

## 🎯 Quick Start

### Basic ShallowTabs Example

```tsx
'use client';

import { ShallowTabs } from '@vas-dj-saas/ui';
import { MyTab1, MyTab2, MyTab3 } from './tabs';

export default function MySettingsPage() {
  return (
    <ShallowTabs
      defaultTab="overview"
      tabs={[
        {
          value: 'overview',
          label: 'Overview',
          component: <MyTab1 />,
        },
        {
          value: 'details',
          label: 'Details',
          component: <MyTab2 />,
        },
        {
          value: 'advanced',
          label: 'Advanced',
          component: <MyTab3 />,
        },
      ]}
    />
  );
}
```

### ShallowTabs with Icons and Badges

```tsx
'use client';

import { ShallowTabs, Icon } from '@vas-dj-saas/ui';

export default function OrganizationPage() {
  return (
    <ShallowTabs
      defaultTab="overview"
      tabs={[
        {
          value: 'overview',
          label: 'Overview',
          icon: <Icon name="LayoutDashboard" size={16} />,
          component: <OverviewTab />,
        },
        {
          value: 'members',
          label: 'Members',
          icon: <Icon name="Users" size={16} />,
          badge: 12, // Show count
          component: <MembersTab />,
        },
        {
          value: 'pending',
          label: 'Pending',
          icon: <Icon name="Clock" size={16} />,
          badge: 3,
          component: <PendingTab />,
        },
      ]}
      onTabChange={(tab) => console.log('Switched to:', tab)}
    />
  );
}
```

---

## 🎨 EntityDrawer Examples

### Basic EntityDrawer (Drawer triggered by row click)

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Table, EntityDrawer } from '@vas-dj-saas/ui';

export function MembersTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('selected');

  const handleRowClick = (member) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('selected', member.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <Table
        data={members}
        columns={columns}
        onRowPress={handleRowClick}
      />

      <EntityDrawer title="Member Details">
        {selectedId && <MemberDetails id={selectedId} />}
      </EntityDrawer>
    </>
  );
}
```

### EntityDrawer with Header Actions

```tsx
<EntityDrawer
  title="Member Details"
  description="View and manage member information"
  headerActions={
    <>
      <Button variant="outline" size="sm" onPress={handleEdit}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onPress={handleDelete}>
        Remove
      </Button>
    </>
  }
>
  <MemberDetails id={selectedId} />
</EntityDrawer>
```

### EntityDrawer with Custom Query Param

```tsx
// Use 'memberId' instead of 'selected'
<EntityDrawer
  title="Member Details"
  queryParam="memberId"
>
  <MemberDetails id={searchParams.get('memberId')} />
</EntityDrawer>

// URL: /settings/organization?tab=members&memberId=user123
```

### EntityDrawer from Left Side

```tsx
<EntityDrawer
  title="Filters"
  side="left"
  size="sm"
>
  <FilterPanel />
</EntityDrawer>
```

---

## 🔄 Complete Example: List + Detail Pattern

```tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Table,
  EntityDrawer,
  Button,
  Heading,
  Text,
  Badge,
} from '@vas-dj-saas/ui';
import type { TableColumn } from '@vas-dj-saas/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

export function MembersTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('selected');

  // Mock data
  const members: Member[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Member', status: 'active' },
  ];

  const selectedMember = members.find(m => m.id === selectedId);

  // Handle row click
  const handleRowClick = (member: Member) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('selected', member.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Table columns
  const columns: TableColumn<Member>[] = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role', sortable: true },
    {
      key: 'status',
      title: 'Status',
      render: (value, member) => (
        <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
          {member.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      {/* List View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading level={3}>Team Members</Heading>
            <Text color="muted" size="sm">
              Manage your team members
            </Text>
          </div>
          <Button variant="primary" size="md">
            Invite Member
          </Button>
        </div>

        <Card>
          <Table
            data={members}
            columns={columns}
            onRowPress={handleRowClick}
            hoverable
          />
        </Card>
      </div>

      {/* Detail Drawer */}
      <EntityDrawer
        title={selectedMember?.name || 'Member Details'}
        description={selectedMember?.email}
        headerActions={
          selectedMember && (
            <>
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="destructive" size="sm">Remove</Button>
            </>
          )
        }
      >
        {selectedMember && (
          <div className="space-y-6">
            <div>
              <Heading level={4}>Profile Information</Heading>
              <div className="space-y-3 mt-4">
                <div>
                  <Text color="muted" size="sm">Name</Text>
                  <Text>{selectedMember.name}</Text>
                </div>
                <div>
                  <Text color="muted" size="sm">Email</Text>
                  <Text>{selectedMember.email}</Text>
                </div>
                <div>
                  <Text color="muted" size="sm">Role</Text>
                  <Text>{selectedMember.role}</Text>
                </div>
                <div>
                  <Text color="muted" size="sm">Status</Text>
                  <Badge variant={selectedMember.status === 'active' ? 'success' : 'warning'}>
                    {selectedMember.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Heading level={4}>Permissions</Heading>
              <Text color="muted" size="sm">
                Permissions are managed through assigned roles.
              </Text>
            </div>

            <div>
              <Heading level={4}>Activity Log</Heading>
              <Text color="muted" size="sm">
                Recent activity will appear here.
              </Text>
            </div>
          </div>
        )}
      </EntityDrawer>
    </>
  );
}
```

---

## 🎨 Combined: ShallowTabs + EntityDrawer

```tsx
'use client';

import { ShallowTabs } from '@vas-dj-saas/ui';
import { OverviewTab } from './OverviewTab';
import { MembersTab } from './MembersTab'; // Has EntityDrawer
import { RolesTab } from './RolesTab';

export default function OrganizationPage() {
  return (
    <div className="p-6">
      <ShallowTabs
        defaultTab="overview"
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            component: <OverviewTab />,
          },
          {
            value: 'members',
            label: 'Members',
            badge: 12,
            component: <MembersTab />, // Contains EntityDrawer
          },
          {
            value: 'roles',
            label: 'Roles',
            component: <RolesTab />,
          },
        ]}
      />
    </div>
  );
}

// URL Examples:
// /settings/organization?tab=overview
// /settings/organization?tab=members
// /settings/organization?tab=members&selected=user123  ← Member drawer open
```

---

## 🔧 Programmatic Control

### Opening Drawer Programmatically

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openMemberDrawer = (memberId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('selected', memberId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeMemberDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('selected');
    const newUrl = params.toString() 
      ? `?${params.toString()}` 
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  return (
    <Button onPress={() => openMemberDrawer('user123')}>
      View Member
    </Button>
  );
}
```

### Changing Tabs Programmatically

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchToTab = (tabValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabValue);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Button onPress={() => switchToTab('members')}>
      Go to Members
    </Button>
  );
}
```

---

## 🎯 Best Practices

### ✅ DO

- Use ShallowTabs for 2-6 related sections
- Use EntityDrawer for viewing/editing entities from lists
- Keep drawer content focused and scannable
- Provide clear close affordances
- Test keyboard navigation
- Use meaningful query parameter names
- Preserve other query params when updating

### ❌ DON'T

- Don't use tabs for unrelated content
- Don't nest drawers (use single level)
- Don't put complex forms in drawers
- Don't auto-open drawers on page load
- Don't use drawers for critical actions
- Don't forget mobile responsiveness
- Don't override browser back button behavior

---

## 🧪 Testing Examples

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ShallowTabs', () => {
  it('should change tab on click', async () => {
    const user = userEvent.setup();
    render(<OrganizationPage />);
    
    const membersTab = screen.getByRole('tab', { name: /members/i });
    await user.click(membersTab);
    
    expect(window.location.search).toContain('tab=members');
  });

  it('should open drawer on row click', async () => {
    const user = userEvent.setup();
    render(<MembersTab />);
    
    const row = screen.getByText('John Doe');
    await user.click(row);
    
    expect(window.location.search).toContain('selected=');
    expect(screen.getByText('Member Details')).toBeInTheDocument();
  });
});
```

---

## 📚 API Reference

### ShallowTabs Props

| Prop          | Type                      | Default   | Description                 |
| ------------- | ------------------------- | --------- | --------------------------- |
| `tabs`        | `ShallowTab[]`            | Required  | Array of tab configurations |
| `defaultTab`  | `string`                  | First tab | Default tab if none in URL  |
| `className`   | `string`                  | -         | CSS class name              |
| `onTabChange` | `(value: string) => void` | -         | Callback when tab changes   |

### ShallowTab Object

| Property    | Type               | Required | Description       |
| ----------- | ------------------ | -------- | ----------------- |
| `value`     | `string`           | Yes      | URL query value   |
| `label`     | `string`           | Yes      | Display label     |
| `component` | `ReactNode`        | Yes      | Content to render |
| `icon`      | `ReactNode`        | No       | Icon component    |
| `badge`     | `string \| number` | No       | Badge content     |
| `disabled`  | `boolean`          | No       | Disable tab       |

### EntityDrawer Props

| Prop              | Type                                     | Default      | Description       |
| ----------------- | ---------------------------------------- | ------------ | ----------------- |
| `children`        | `ReactNode`                              | -            | Drawer content    |
| `title`           | `string`                                 | -            | Drawer title      |
| `description`     | `string`                                 | -            | Subtitle          |
| `queryParam`      | `string`                                 | `'selected'` | Query param name  |
| `side`            | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'`    | Slide direction   |
| `size`            | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`       | Drawer width      |
| `showCloseButton` | `boolean`                                | `true`       | Show close button |
| `headerActions`   | `ReactNode`                              | -            | Action buttons    |
| `onOpen`          | `(id: string) => void`                   | -            | Open callback     |
| `onClose`         | `() => void`                             | -            | Close callback    |

---

## 🔗 Related Docs

- [Settings Revamp Guide](./_docs/dev-user-journey/SETTINGS_REVAMP_GUIDE.md)
- [Migration Guide](./_docs/dev-user-journey/SETTINGS_MIGRATION_GUIDE.md)
- [Navigation Config](/packages/core/src/navigation/config/nav-items.ts)
