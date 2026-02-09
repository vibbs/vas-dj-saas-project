# Hub + Secondary Sidebar Implementation Guide

## Overview

This document describes the implementation of the **Hub + Secondary Sidebar** architecture for the settings section, which replaces the previous tab-only pattern with a more scalable, discovery-focused design.

## Architecture

### Core Concepts

**Hub Page**: Landing page with metric cards, quick actions, and discovery
- URL: `/settings/organization` (hub)
- No secondary sidebar
- Card-based navigation to subsections

**Detail Page**: Individual subsection page with secondary sidebar
- URL: `/settings/organization/members` (detail)
- Secondary sidebar for in-section navigation
- "Overview" link back to hub

**Secondary Sidebar**: In-section navigation (appears on detail pages only)
- Shows all subsections within a section
- Responsive: sidebar → horizontal → dropdown
- Includes "Overview" link to hub

## Implementation

### 1. Navigation Schema Extensions

**File**: `packages/core/src/navigation/config/nav-schema.ts`

New types added:
- `QuickAction` - Quick action buttons for hub pages
- `HubCard` - Card configuration for hub pages
- `HubConfig` - Complete hub configuration
- `SecondaryNavItem` - Item in secondary sidebar
- `SecondarySidebarConfig` - Secondary sidebar configuration
- `ViewType` - View type enum (`hub`, `detail`, `tabs`, `standalone`)

**NavItem** extended with:
```typescript
viewType?: ViewType;
hubConfig?: HubConfig;
secondarySidebar?: SecondarySidebarConfig;
```

### 2. Navigation Configuration

**File**: `packages/core/src/navigation/config/nav-items.ts`

**Organization Settings Configuration**:
```typescript
{
  id: "settings-organization",
  viewType: "hub",
  hubConfig: {
    title: "Organization Settings",
    description: "...",
    cards: [
      { id: "org-members", title: "Members", href: "/settings/organization/members", ... },
      { id: "org-invitations", title: "Invitations", href: "/settings/organization/invitations", ... },
      { id: "org-roles", title: "Roles & Permissions", href: "/settings/organization/roles", ... },
      // ... more cards
    ],
    quickActions: [
      { id: "invite-member", label: "Invite Member", href: "...", variant: "primary" },
      // ... more actions
    ],
  },
  secondarySidebar: {
    showOverviewLink: true,
    overviewLabel: "Overview",
    overviewHref: "/settings/organization",
    items: [
      { id: "org-nav-members", label: "Members", href: "/settings/organization/members", ... },
      // ... more items
    ],
  },
}
```

**Developer Settings**: Same pattern applied

### 3. UI Components

**Created Components** (in `packages/ui/src/components/`):

#### HubCard
- **Path**: `HubCard/`
- **Purpose**: Clickable card for hub pages
- **Features**:
  - Title, description, icon
  - Optional metric/count
  - Optional badge
  - Cross-platform (web + native)

#### SettingsHub
- **Path**: `SettingsHub/`
- **Purpose**: Hub page layout component
- **Features**:
  - Summary metrics (optional)
  - Grid of hub cards
  - Quick actions bar
  - Filtering support for permissions/feature flags

#### SecondarySidebar
- **Path**: `SecondarySidebar/`
- **Purpose**: In-section navigation
- **Features**:
  - Responsive modes: `sidebar` | `horizontal` | `dropdown`
  - "Overview" link back to hub
  - Badge support
  - Active state highlighting

**Exported from** `packages/ui/src/index.ts`:
```typescript
export { SettingsHub } from "./components/SettingsHub";
export { HubCard } from "./components/HubCard";
export { SecondarySidebar } from "./components/SecondarySidebar";
```

### 4. Application Routes

**Organization Settings**:

**Hub Page** (`apps/web/src/app/(protected)/settings/organization/page.tsx`):
```typescript
// Loads hubConfig from navigationConfig
// Renders SettingsHub component
// URL: /settings/organization
```

**Detail Pages**:
- `members/page.tsx` - Members table + drawer + secondary sidebar
- `roles/page.tsx` - Roles management + secondary sidebar
- `invitations/page.tsx` - Invitations list + secondary sidebar

**Developer Settings**:
- Hub page updated to use `SettingsHub`
- Detail pages to be created (similar to organization)

## URL Patterns

### Organization Settings

```
/settings/organization                    → Hub
/settings/organization/members            → Detail with secondary sidebar
/settings/organization/members?selected=1 → Detail with drawer open
/settings/organization/roles              → Detail with secondary sidebar
/settings/organization/invitations        → Detail with secondary sidebar
/settings/organization/flags              → Detail with secondary sidebar (to be created)
/settings/organization/email-templates    → Detail with secondary sidebar (to be created)
/settings/organization/configurations     → Detail with secondary sidebar (to be created)
```

### Developer Settings

```
/settings/developer                       → Hub
/settings/developer/api-keys              → Detail with secondary sidebar (to be created)
/settings/developer/webhooks              → Detail with secondary sidebar (to be created)
/settings/developer/oauth                 → Detail with secondary sidebar (to be created)
/settings/developer/service-accounts      → Detail with secondary sidebar (to be created)
```

## Responsive Behavior

### Desktop (≥1280px)
- Hub: Grid of cards (auto-fill, minmax(280px, 1fr))
- Detail: Secondary sidebar (240px width) + content area

### Tablet (768-1279px)
- Hub: Grid of cards (responsive)
- Detail: Secondary sidebar becomes horizontal nav bar

### Mobile (<768px)
- Hub: Single column cards
- Detail: Secondary sidebar becomes dropdown menu

## Usage Example

### Creating a New Hub Section

1. **Update Navigation Config** (`nav-items.ts`):
```typescript
{
  id: "settings-new-section",
  label: "New Section",
  viewType: "hub",
  hubConfig: {
    cards: [...],
    quickActions: [...],
  },
  secondarySidebar: {
    showOverviewLink: true,
    items: [...],
  },
}
```

2. **Create Hub Page**:
```typescript
// apps/web/src/app/(protected)/settings/new-section/page.tsx
import { SettingsHub } from '@vas-dj-saas/ui';
import { navigationConfig } from '@vas-dj-saas/core/navigation';

export default function NewSectionPage() {
  const config = /* get from navigationConfig */;
  return <SettingsHub config={config.hubConfig} onNavigate={...} />;
}
```

3. **Create Detail Pages**:
```typescript
// apps/web/src/app/(protected)/settings/new-section/subsection/page.tsx
import { SecondarySidebar } from '@vas-dj-saas/ui';

export default function SubsectionPage() {
  return (
    <div className="flex flex-1">
      <SecondarySidebar config={...} activePath={...} />
      <div className="flex-1 p-6">
        {/* Content */}
      </div>
    </div>
  );
}
```

## Benefits

✅ **Config-Driven**: All navigation, hubs, and sidebars defined in single config
✅ **Scalable**: Easy to add new sections without structural changes
✅ **Reduced Cognitive Load**: Hub → dive → navigate pattern
✅ **Deep Linking**: Every state is shareable/bookmarkable
✅ **Responsive**: Out-of-the-box responsive behavior
✅ **Permission-Aware**: Built-in filtering for permissions/feature flags
✅ **Cross-Platform**: Works on web and mobile (React Native)

## Design Principles

### When to Use Hub Pattern

Use Hub + Secondary Sidebar when:
- Section has 4+ subsections
- Discovery is important
- Subsections are conceptually at same level
- Users need quick overview of section

### When to Use Tabs Pattern

Use ShallowTabs when:
- Section has 2-4 subsections
- Frequent switching between subsections
- Content is mostly read/browse
- No deep hierarchy needed

**Example**: Personal Settings (Profile, Security, Notifications) - kept as tabs

## Next Steps

1. **Create remaining organization detail pages**:
   - Feature Flags
   - Email Templates
   - Configurations

2. **Create developer detail pages**:
   - API Keys
   - Webhooks
   - OAuth
   - Service Accounts

3. **Add permission filtering**:
   - Implement `filterCard` and `filterAction` props
   - Hook up to account permissions

4. **Connect to API**:
   - Replace mock data with real API calls
   - Dynamic metrics and badges

5. **Accessibility audit**:
   - Keyboard navigation
   - Screen reader support
   - Focus management

## Files Changed/Created

### Created
- `packages/core/src/navigation/config/nav-schema.ts` (extended)
- `packages/ui/src/components/HubCard/`
- `packages/ui/src/components/SettingsHub/`
- `packages/ui/src/components/SecondarySidebar/`
- `apps/web/src/app/(protected)/settings/organization/members/page.tsx`
- `apps/web/src/app/(protected)/settings/organization/roles/page.tsx`
- `apps/web/src/app/(protected)/settings/organization/invitations/page.tsx`

### Modified
- `packages/core/src/navigation/config/nav-items.ts`
- `packages/ui/src/index.ts`
- `apps/web/src/app/(protected)/settings/organization/page.tsx`
- `apps/web/src/app/(protected)/settings/developer/page.tsx`

## Testing Checklist

- [ ] Hub page loads correctly
- [ ] Hub cards navigate to correct routes
- [ ] Quick actions work as expected
- [ ] Secondary sidebar shows on detail pages
- [ ] Secondary sidebar highlights active page
- [ ] "Overview" link navigates back to hub
- [ ] Responsive modes work (sidebar → horizontal → dropdown)
- [ ] EntityDrawer still works on members page
- [ ] Deep links work (direct URL access)
- [ ] Breadcrumbs update correctly
- [ ] Permission filtering works
- [ ] Keyboard navigation works
- [ ] Screen reader announces navigation changes

## References

- [SETTINGS_REVAMP_GUIDE.md](./_docs/dev-user-journey/SETTINGS_REVAMP_GUIDE.md)
- [Navigation Config Schema](./packages/core/src/navigation/config/nav-schema.ts)
- [Navigation Items Config](./packages/core/src/navigation/config/nav-items.ts)
