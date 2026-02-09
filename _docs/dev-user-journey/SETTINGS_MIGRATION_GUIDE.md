# Settings Routes Migration Guide

## 🔄 Route Changes

### Organization Settings

#### Before (Multiple Routes)
```
/settings/organization/profile
/settings/organization/members
/settings/organization/api-keys
/settings/organization/integrations
/settings/organization/billing
/settings/organization/import-export
```

#### After (Single Route with Tabs)
```
/settings/organization?tab=overview
/settings/organization?tab=members
/settings/organization?tab=invitations
/settings/organization?tab=roles

# Standalone pages (complex forms/billing)
/settings/organization/profile        # Still exists
/settings/organization/billing        # Still exists
/settings/organization/api-keys       # Still exists
/settings/organization/integrations   # Still exists
/settings/organization/import-export  # Still exists
```

### What Changed?

**Moved to Tabs:**
- Members → `/settings/organization?tab=members`
- Roles → `/settings/organization?tab=roles`
- Invitations → `/settings/organization?tab=invitations`
- Overview (new) → `/settings/organization?tab=overview`

**Kept as Standalone:**
- Profile (complex form)
- Billing (sensitive, complex)
- API Keys (security-sensitive)
- Integrations (complex configuration)
- Import/Export (complex workflows)

## 🚀 Migration Strategy

### Phase 1: Core Navigation (Completed)
- ✅ Create ShallowTabs component
- ✅ Create EntityDrawer component
- ✅ Implement organization tabs (Overview, Members, Roles, Invitations)
- ✅ Add member details drawer

### Phase 2: Navigation Updates (Next)
- [ ] Update nav-items.ts to point to new routes
- [ ] Add redirects for old routes
- [ ] Update breadcrumbs

### Phase 3: Developer Settings (Future)
- [ ] Apply same pattern to developer settings
- [ ] Webhooks, OAuth, Service Accounts tabs
- [ ] Entity drawers for configuration details

### Phase 4: Cleanup (Future)
- [ ] Remove old member/role standalone pages if not needed
- [ ] Update documentation
- [ ] Update tests

## 📋 Navigation Config Updates

Update `packages/core/src/navigation/config/nav-items.ts`:

```typescript
{
  id: "settings-organization",
  label: "Organization",
  icon: "Building2",
  expandable: true,
  platforms: ["web"],
  order: 2,
  permission: {
    type: "role",
    roles: ["admin", "orgAdmin", "orgCreator"],
  },
  children: [
    {
      id: "settings-org-overview",
      label: "Overview",
      icon: "LayoutDashboard",
      href: "/settings/organization?tab=overview",
      description: "Organization overview and quick actions",
    },
    {
      id: "settings-org-members",
      label: "Members",
      icon: "Users",
      href: "/settings/organization?tab=members",
      description: "Manage team members",
    },
    {
      id: "settings-org-invitations",
      label: "Invitations",
      icon: "Mail",
      href: "/settings/organization?tab=invitations",
      description: "Manage pending invitations",
    },
    {
      id: "settings-org-roles",
      label: "Roles",
      icon: "Shield",
      href: "/settings/organization?tab=roles",
      description: "Configure roles and permissions",
    },
    // Divider or section
    {
      id: "settings-org-profile",
      label: "Profile",
      icon: "Building",
      href: "/settings/organization/profile",
      description: "Organization name, subdomain, and branding",
    },
    {
      id: "settings-org-api-keys",
      label: "API Keys",
      icon: "Key",
      href: "/settings/organization/api-keys",
      description: "Generate and manage API keys",
    },
    // ... rest of standalone pages
  ],
},
```

## 🔗 Redirects

Add to `next.config.ts`:

```typescript
async redirects() {
  return [
    {
      source: '/settings/organization',
      destination: '/settings/organization?tab=overview',
      permanent: false,
    },
  ];
}
```

## ✅ Backwards Compatibility

The old routes still work! We're keeping:
- `/settings/organization/profile`
- `/settings/organization/billing`
- `/settings/organization/api-keys`
- `/settings/organization/integrations`
- `/settings/organization/import-export`

Only the simple list/table views moved to tabs.

## 🎯 Decision Matrix

### Should this be a tab or standalone page?

| Criteria       | Tab                 | Standalone               |
| -------------- | ------------------- | ------------------------ |
| **Complexity** | Simple list/view    | Complex form/workflow    |
| **Navigation** | Frequent switching  | Infrequent access        |
| **Data Entry** | Minimal             | Extensive                |
| **Security**   | Standard            | High (billing, API keys) |
| **Mobile**     | Must work well      | Can be web-only          |
| **Context**    | Related to siblings | Standalone concern       |

### Examples

**Tabs:**
- ✅ Members list → Simple table, frequent access
- ✅ Roles list → Simple list, related to members
- ✅ Invitations → Simple list, related to members
- ✅ Overview → Dashboard/summary

**Standalone:**
- ✅ Billing → Complex forms, sensitive, infrequent
- ✅ Organization profile → Complex form, infrequent
- ✅ API keys → Security-sensitive, specialized
- ✅ Integrations → Complex configuration
- ✅ Import/Export → Multi-step workflow

## 🐛 Known Issues & Solutions

### Issue: Component not exported from @vas-dj-saas/ui
**Solution:** Using temporary components until package rebuild
```bash
cd packages/ui
pnpm build
```

### Issue: Next navigation types in UI package
**Solution:** ShallowTabs and EntityDrawer are web-only components, properly typed and exported

### Issue: Old links still point to removed routes
**Solution:** Update nav-items.ts and add redirects

## 📝 Testing Checklist

- [ ] `/settings/organization` redirects to `?tab=overview`
- [ ] All tabs accessible via direct URL
- [ ] Member details drawer works
- [ ] Browser back/forward navigation works
- [ ] Breadcrumbs update correctly
- [ ] Mobile: tabs are responsive
- [ ] Mobile: drawer becomes bottom sheet
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Standalone pages still accessible
