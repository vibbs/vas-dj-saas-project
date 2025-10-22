# Settings Pages Revamp: Reduced Cognitive Load

## 🎯 Overview

We've revamped the web settings pages using a **hybrid pattern** that combines `ShallowTabs` and `EntityDrawer` to significantly reduce cognitive load while maintaining deep-linkability and context preservation.

## 🧩 Core Components

### 1. **ShallowTabs** (`packages/ui/src/components/ShallowTabs/`)

**Purpose:** URL-synchronized tab navigation using Next.js shallow routing

**Key Features:**
- Syncs with URL query parameter (`?tab=members`)
- Preserves page state and scroll position
- No full page reloads
- Shareable/bookmarkable URLs
- Zero unmounting of page layout

**Example:**
```tsx
<ShallowTabs
  tabs={[
    { value: "overview", label: "Overview", component: <Overview /> },
    { value: "members", label: "Members", component: <Members />, badge: 12 },
    { value: "roles", label: "Roles", component: <Roles /> },
  ]}
/>
```

**URL Examples:**
- `/settings/organization?tab=overview`
- `/settings/organization?tab=members`
- `/settings/organization?tab=roles`

---

### 2. **EntityDrawer** (`packages/ui/src/components/EntityDrawer/`)

**Purpose:** Context-preserving detail view for CRUD entities

**Key Features:**
- Opens based on `?selected=<id>` query parameter
- Slides from right on desktop
- Bottom sheet on mobile (responsive)
- Preserves list context (table remains mounted)
- Shareable deep links
- Shallow routing (no reload)

**Example:**
```tsx
// In table click handler:
const handleRowClick = (id: string) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set('selected', id);
  router.push(`?${params.toString()}`, { scroll: false });
};

// Render drawer:
<EntityDrawer title="Member Details">
  <MemberDetails id={searchParams.get('selected')} />
</EntityDrawer>
```

**URL Example:**
- `/settings/organization?tab=members&selected=user123`

---

## 📊 Settings Pages Usage Matrix

| Page/Section      | Pattern          | Tabs | EntityDrawer | Notes                                 |
| ----------------- | ---------------- | ---- | ------------ | ------------------------------------- |
| **Organization**  | Tabs + Drawer    | ✅    | ✅            | Overview, Members, Roles, Invitations |
| - Overview Tab    | Content Only     | -    | -            | Summary cards, quick actions          |
| - Members Tab     | Tabs + Drawer    | -    | ✅            | Table → Member details drawer         |
| - Invitations Tab | Tabs Only        | -    | ❌            | List view, inline actions             |
| - Roles Tab       | Tabs Only        | -    | ❌            | List view, inline actions             |
| **Personal**      | Standalone Pages | ❌    | ❌            | Profile, Security, Notifications      |
| **Developer**     | TBD              | 🔄    | 🔄            | Webhooks, OAuth, Service Accounts     |

### Legend:
- ✅ **Uses pattern**
- ❌ **Does not use**
- 🔄 **To be implemented**

---

## 🎨 Visual Hierarchy

### Organization Settings Page

```
┌────────────────────────────────────────────────────────────┐
│  [SettingsHeader]                                          │
│  Settings / Organization                                   │
│  Title: Organization Settings                              │
│  Description: Manage your organization's members...        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  [ShallowTabs]                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Overview │ Members (12) │ Invitations (3) │ Roles  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Active Tab Content]                                │  │
│  │                                                       │  │
│  │  - Overview: Cards with metrics                      │  │
│  │  - Members: Table with clickable rows                │  │
│  │  - Invitations: List with inline actions             │  │
│  │  - Roles: List with permissions                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

                    ↓ (Click member row)

┌────────────────────────────────────────────────────────────┐
│  [Background: List stays mounted]                          │
│                                                             │
│  ┌──────────────────────────┐                              │
│  │ [EntityDrawer →]         │                              │
│  │ ┌────────────────────┐   │                              │
│  │ │ Member Details     │   │                              │
│  │ │ john@example.com   │   │                              │
│  │ │ ──────────────────│   │                              │
│  │ │ Profile Info      │   │                              │
│  │ │ Permissions       │   │                              │
│  │ │ Activity Log      │   │                              │
│  │ └────────────────────┘   │                              │
│  └──────────────────────────┘                              │
└────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
apps/web/src/
├── app/(protected)/settings/
│   ├── organization/
│   │   ├── page.tsx              # Main org settings with ShallowTabs
│   │   ├── layout.tsx            # Role guard wrapper
│   │   ├── profile/page.tsx      # Standalone profile page (kept)
│   │   ├── billing/page.tsx      # Standalone billing page (kept)
│   │   └── ...other standalone pages
│   ├── profile/page.tsx
│   ├── security/page.tsx
│   └── notifications/page.tsx
│
└── components/settings/
    ├── ShallowTabs.tsx           # Temporary (until pkg rebuild)
    ├── SettingsHeader.tsx
    └── organization/
        ├── OrgOverviewTab.tsx
        ├── OrgMembersTab.tsx     # With EntityDrawer
        ├── OrgRolesTab.tsx
        ├── OrgInvitationsTab.tsx
        └── MemberDrawer.tsx      # Temporary (until pkg rebuild)

packages/ui/src/components/
├── ShallowTabs/
│   ├── ShallowTabs.web.tsx
│   ├── types.ts
│   └── index.ts
└── EntityDrawer/
    ├── EntityDrawer.web.tsx
    ├── types.ts
    └── index.ts
```

---

## 🚀 Implementation Status

### ✅ Completed

1. **ShallowTabs Component**
   - ✅ Created in `packages/ui/src/components/ShallowTabs/`
   - ✅ Exported from `@vas-dj-saas/ui`
   - ✅ Temporary version in web app
   - ✅ Full TypeScript types

2. **EntityDrawer Component**
   - ✅ Created in `packages/ui/src/components/EntityDrawer/`
   - ✅ Exported from `@vas-dj-saas/ui`
   - ✅ Temporary version in web app (MemberDrawer)
   - ✅ Responsive (drawer on desktop, sheet on mobile)

3. **Organization Settings**
   - ✅ New `/settings/organization/page.tsx` with ShallowTabs
   - ✅ OrgOverviewTab - summary cards
   - ✅ OrgMembersTab - table with EntityDrawer
   - ✅ OrgRolesTab - list view
   - ✅ OrgInvitationsTab - list view with inline actions

### 🔄 Next Steps

1. **Package Rebuild**
   ```bash
   cd packages/ui
   pnpm build
   ```
   Then replace temporary components in web app with proper imports.

2. **Apply Pattern to Developer Settings**
   - Create `/settings/developer/page.tsx` with ShallowTabs
   - Tabs: Webhooks, OAuth, Service Accounts
   - Use EntityDrawer for webhook/OAuth app details

3. **Mobile Optimization**
   - Test EntityDrawer bottom sheet behavior
   - Ensure tabs collapse into segmented control on small screens

4. **Data Integration**
   - Replace mock data with API calls
   - Add loading states
   - Implement actual CRUD operations

5. **Accessibility Audit**
   - Test keyboard navigation
   - Verify screen reader support
   - Ensure focus management

---

## 🎓 Design Principles

### Why This Pattern?

#### 1. **Reduced Cognitive Load**
- ✅ Single page context (no full page changes)
- ✅ Minimal navigation hierarchy
- ✅ Clear visual hierarchy
- ✅ Contextual information always visible

#### 2. **Context Preservation**
- ✅ List state maintained when viewing details
- ✅ Scroll position preserved
- ✅ Filters/search state persisted
- ✅ No data re-fetching on drawer open/close

#### 3. **Progressive Disclosure**
- ✅ Overview → Details drill-down
- ✅ Details revealed in context (drawer)
- ✅ No context switching
- ✅ Clear path back (close drawer)

#### 4. **Deep Linkability**
- ✅ Every state is shareable
- ✅ Bookmarkable URLs
- ✅ Browser back/forward works correctly
- ✅ Direct navigation to any state

---

## 📝 Best Practices

### When to Use ShallowTabs

Use ShallowTabs when:
- ✅ You have 2-6 related sub-sections
- ✅ Each section is conceptually at the same level
- ✅ Users frequently switch between sections
- ✅ You want to avoid nested routes
- ✅ Content is mostly read/browse (not complex forms)

**Examples:**
- Organization (Overview, Members, Roles)
- Developer (Webhooks, OAuth, Service Accounts)
- Analytics (Traffic, Users, Revenue)

### When to Use EntityDrawer

Use EntityDrawer when:
- ✅ Viewing/editing individual entities from a list
- ✅ Details are secondary to the list view
- ✅ Users need to quickly view multiple entities
- ✅ You want to preserve list context
- ✅ Mobile experience matters

**Examples:**
- Member details from members table
- Webhook configuration from webhooks list
- Invoice details from billing list

### When to Use Standalone Pages

Use standalone pages when:
- ✅ Complex multi-step forms (billing setup)
- ✅ Completely separate concerns (profile vs org)
- ✅ Heavy data entry or configuration
- ✅ Requires full screen attention
- ✅ Infrequent access

**Examples:**
- Billing setup and payment
- Organization profile editing
- API key generation
- Import/Export tools

---

## 🧪 Testing Checklist

- [ ] ShallowTabs URL updates on tab change
- [ ] Browser back/forward navigates tabs correctly
- [ ] Direct URL access to specific tab works
- [ ] EntityDrawer opens on row click
- [ ] EntityDrawer closes on backdrop click
- [ ] EntityDrawer closes on ESC key
- [ ] EntityDrawer removes query param on close
- [ ] Focus returns to triggering element on drawer close
- [ ] Deep link with tab + selected works
- [ ] Mobile: drawer becomes bottom sheet
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces tab changes
- [ ] Screen reader announces drawer open/close

---

## 🔗 Related Files

- `/packages/ui/src/components/ShallowTabs/` - Component implementation
- `/packages/ui/src/components/EntityDrawer/` - Component implementation
- `/apps/web/src/app/(protected)/settings/organization/page.tsx` - Usage example
- `/packages/core/src/navigation/config/nav-items.ts` - Navigation config

---

## 📚 References

- [Next.js Shallow Routing](https://nextjs.org/docs/routing/shallow-routing)
- [WCAG 2.1 Navigation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/multiple-ways)
- [Modal Design Best Practices](https://www.nngroup.com/articles/modal-nonmodal-dialog/)
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
