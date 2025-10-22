# Hub + Secondary Sidebar Visual Architecture

## Mental Model

```
Hub = "Table of Contents + Snapshot"
  ↓ (Click card)
Secondary Sidebar = "In-Section Navigator"
```

**Think**: Hub gets you oriented; Secondary sidebar keeps you oriented.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User lands on Organization Settings                     │
│    URL: /settings/organization                              │
│    Shows: Hub with cards                                    │
│    No secondary sidebar yet                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User clicks "Members" card                               │
│    Navigates to: /settings/organization/members             │
│    Secondary sidebar appears on left                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User navigates between subsections                       │
│    Click "Roles" in secondary sidebar                       │
│    → /settings/organization/roles                           │
│    Secondary sidebar stays visible                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User goes back to Hub                                    │
│    Click "Overview" in secondary sidebar                    │
│    → /settings/organization                                 │
│    Secondary sidebar disappears                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Desktop Wireframes (≥1280px)

### Hub View (`/settings/organization`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Primary Sidebar │ Main Content Area                                  │
├─────────────────┼──────────────────────────────────────────────────┤
│                 │ ┌──────────────────────────────────────────────┐ │
│ Home            │ │ Breadcrumbs: Settings / Organization         │ │
│ Settings ▾      │ │ Title: Organization Settings                 │ │
│  → Personal     │ │ Description: Manage your org...              │ │
│  → Organization │ └──────────────────────────────────────────────┘ │
│  → Developer    │                                                    │
│ Billing         │ ┌──────────────┬──────────────┬──────────────┐   │
│                 │ │  Members     │ Invitations  │    Roles     │   │
│                 │ │  ┌────────┐  │ ┌────────┐   │ ┌────────┐   │   │
│                 │ │  │ [Icon] │  │ │ [Icon] │   │ │ [Icon] │   │   │
│                 │ │  └────────┘  │ └────────┘   │ └────────┘   │   │
│                 │ │  Manage team │ Pending      │ Define roles │   │
│                 │ │  members     │ invites      │ & perms      │   │
│                 │ │  12 Active   │ [Badge: 3]   │ 5 Roles      │   │
│                 │ └──────────────┴──────────────┴──────────────┘   │
│                 │ ┌──────────────┬──────────────┬──────────────┐   │
│                 │ │ Feature Flags│ Email Tmpls  │ Configs      │   │
│                 │ │  ┌────────┐  │ ┌────────┐   │ ┌────────┐   │   │
│                 │ │  │ [Icon] │  │ │ [Icon] │   │ │ [Icon] │   │   │
│                 │ │  └────────┘  │ └────────┘   │ └────────┘   │   │
│                 │ │  Control     │ Customize    │ Org-wide     │   │
│                 │ │  rollouts    │ emails       │ settings     │   │
│                 │ └──────────────┴──────────────┴──────────────┘   │
│                 │                                                    │
│                 │ ┌──────────────────────────────────────────────┐ │
│                 │ │ Quick Actions                                │ │
│                 │ │ [Invite Member] [Create Role] [New Flag Set] │ │
│                 │ └──────────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────────────┘
```

### Detail View with Secondary Sidebar (`/settings/organization/members`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Primary Sidebar │ Secondary   │ Main Content Area                    │
├─────────────────┼─────────────┼──────────────────────────────────┤
│                 │             │ ┌──────────────────────────────┐ │
│ Home            │ Overview    │ │ Breadcrumbs:                 │ │
│ Settings ▾      │ Members ◀   │ │ Settings/Organization/Members│ │
│  → Personal     │ Invitations │ │ Title: Members               │ │
│  → Organization │ Roles       │ └──────────────────────────────┘ │
│  → Developer    │ Flags       │                                    │
│ Billing         │ Email Tmpls │ ┌──────────────────────────────┐ │
│                 │ Configs     │ │ Team Members         [Invite]│ │
│                 │             │ ├──────────────────────────────┤ │
│                 │             │ │ Name    Email    Role Status │ │
│                 │             │ ├──────────────────────────────┤ │
│                 │             │ │ John    john@... Admin Active│ │
│                 │             │ │ Jane    jane@... Member ✓    │ │
│                 │             │ │ Bob     bob@...  Member [!]  │ │
│                 │             │ └──────────────────────────────┘ │
│                 │             │                                    │
│                 │             │ (Click row → EntityDrawer opens→)│
└─────────────────┴─────────────┴────────────────────────────────────┘

                     ↓ (Click member row)

┌──────────────────────────────────────────────────────────────────────┐
│ Primary │ Secondary   │ Main Content (dimmed) │ Entity Drawer      │
├─────────┼─────────────┼───────────────────────┼────────────────────┤
│         │ Overview    │                       │ ┌────────────────┐ │
│ Home    │ Members ◀   │ ┌────────────────┐    │ │ John Doe    [×]│ │
│ Settings│ Invitations │ │ Team Members   │    │ │ john@email.com │ │
│  → Org  │ Roles       │ ├────────────────┤    │ ├────────────────┤ │
│         │ Flags       │ │ (Table visible │    │ │ Profile Info   │ │
│         │ Email Tmpls │ │  but dimmed)   │    │ │ Name: John Doe │ │
│         │ Configs     │ └────────────────┘    │ │ Email: john@...│ │
│         │             │                       │ │ Role: Admin    │ │
│         │             │                       │ │ Status: Active │ │
│         │             │                       │ ├────────────────┤ │
│         │             │                       │ │ Permissions    │ │
│         │             │                       │ │ Activity Log   │ │
│         │             │                       │ └────────────────┘ │
└─────────┴─────────────┴───────────────────────┴────────────────────┘
```

---

## Tablet Wireframes (768-1279px)

### Hub View

```
┌──────────────────────────────────────────────────────────┐
│ [☰] Breadcrumbs: Settings / Organization                 │
│ Organization Settings                                     │
├──────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┐                                  │
│ │ Members  │ Invites  │  (2 columns on tablet)           │
│ │ [Icon]   │ [Icon]   │                                  │
│ │ 12 Active│ [Badge 3]│                                  │
│ └──────────┴──────────┘                                  │
│ ┌──────────┬──────────┐                                  │
│ │  Roles   │  Flags   │                                  │
│ │ [Icon]   │ [Icon]   │                                  │
│ └──────────┴──────────┘                                  │
│                                                           │
│ Quick Actions: [Invite] [Create Role] [New Flag]         │
└──────────────────────────────────────────────────────────┘
```

### Detail View (Horizontal Secondary Nav)

```
┌──────────────────────────────────────────────────────────┐
│ [☰] Settings / Organization / Members                     │
├──────────────────────────────────────────────────────────┤
│ Overview │ Members │ Invitations │ Roles │ Flags │ ... ▸ │
├──────────────────────────────────────────────────────────┤
│ Members                                          [Invite] │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Name          Email           Role       Status      │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ John Doe      john@...        Admin     Active       │ │
│ │ Jane Smith    jane@...        Member    Active       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Mobile Wireframes (<768px)

### Hub View

```
┌────────────────────────────┐
│ [☰] Organization Settings  │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Members                │ │
│ │ [Icon]                 │ │
│ │ Manage team members    │ │
│ │ 12 Active              │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Invitations  [Badge 3] │ │
│ │ [Icon]                 │ │
│ │ Pending invites        │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Roles                  │ │
│ │ [Icon]                 │ │
│ │ 5 Roles                │ │
│ └────────────────────────┘ │
│ (scroll for more cards)    │
├────────────────────────────┤
│ Quick Actions              │
│ [Invite Member]            │
│ [Create Role]              │
└────────────────────────────┘
```

### Detail View (Dropdown Secondary Nav)

```
┌────────────────────────────┐
│ [☰] Members                 │
├────────────────────────────┤
│ [Members ▾]  (Dropdown)     │
│  ├─ Overview               │
│  ├─ Members ◀ (current)    │
│  ├─ Invitations [3]        │
│  ├─ Roles                  │
│  └─ ...                    │
├────────────────────────────┤
│ Team Members       [Invite]│
├────────────────────────────┤
│ John Doe                   │
│ john@email.com             │
│ Admin • Active             │
├────────────────────────────┤
│ Jane Smith                 │
│ jane@email.com             │
│ Member • Active            │
└────────────────────────────┘

      ↓ (Tap member)

┌────────────────────────────┐
│ [←] John Doe          [×]  │
├────────────────────────────┤
│ john@email.com             │
├────────────────────────────┤
│ Profile Information        │
│ Name: John Doe             │
│ Email: john@email.com      │
│ Role: Admin                │
│ Status: Active             │
├────────────────────────────┤
│ Permissions                │
│ Activity Log               │
│ (Full-screen drawer)       │
└────────────────────────────┘
```

---

## Component Breakdown

### SettingsHub Component

**Renders**:
- Summary metrics (optional top section)
- Grid of HubCard components
- Quick actions bar (at bottom)

**Props**:
```typescript
{
  config: HubConfig,
  onNavigate: (href: string) => void,
  filterCard?: (card) => boolean,  // Permission filtering
  filterAction?: (action) => boolean
}
```

### HubCard Component

**Displays**:
- Icon (in colored background circle)
- Title + description
- Metric (large number + label)
- Badge (top-right corner)

**Interactive**:
- Entire card clickable
- Hover state
- Keyboard accessible

### SecondarySidebar Component

**Modes**:
- `sidebar` (desktop): Vertical list, 240px wide
- `horizontal` (tablet): Horizontal scrollable nav bar
- `dropdown` (mobile): Select dropdown

**Features**:
- Active state highlighting
- Badge support
- "Overview" link (back to hub)
- Icons (optional)

---

## When Each Appears

| Surface               | When                                    | Purpose                        |
| --------------------- | --------------------------------------- | ------------------------------ |
| **Hub page**          | `/settings/organization`                | Discovery + summary            |
| **Secondary sidebar** | Any route **under** org (except hub)    | In-section navigation          |
| **Tabs (optional)**   | Inside a page (2-4 related views)       | Lightweight in-page grouping   |
| **Entity drawer**     | For quick details from a list (Members) | Preserve context, reduce hops  |

---

## Rules of Thumb

1. **Hub is card-first, not nav-first**
   → Show metrics, provide quick actions

2. **Secondary sidebar is context-only**
   → Only shows when inside a section

3. **Tabs are local, not global**
   → Use for 2-4 related sub-views inside a page

4. **Drawers for quick edit/view**
   → Deep workflows get a full page

5. **Breadcrumbs are smart**
   → "Organization" breadcrumb → hub
   → Last crumb has dropdown to jump across sibling pages

---

## URL Scheme Examples

### Organization Settings

```
/settings/organization                           → Hub
/settings/organization/members                   → Detail + Secondary Sidebar
/settings/organization/members?selected=user123  → Detail + Drawer
/settings/organization/roles                     → Detail + Secondary Sidebar
/settings/organization/invitations               → Detail + Secondary Sidebar
```

### Developer Settings

```
/settings/developer                              → Hub
/settings/developer/api-keys                     → Detail + Secondary Sidebar
/settings/developer/webhooks                     → Detail + Secondary Sidebar
/settings/developer/oauth                        → Detail + Secondary Sidebar
```

---

## Cognitive Load Reduction

**Before** (Tab-only pattern):
```
User sees: [Overview | Members | Invitations | Roles | ...]
Cognitive load: "Which tab has what I need?"
```

**After** (Hub + Secondary Sidebar):
```
User sees: Hub with cards showing metrics
Cognitive load: "I see 12 members, 3 pending invites, 5 roles"
User clicks: "Members" card → Opens Members page with sidebar
Sidebar shows: All org sections for easy navigation
Cognitive load: "I'm in Members, I can easily go to Roles via sidebar"
```

**Result**: Discovery-first, context-aware navigation

---

## Benefits Summary

✅ **Hub** removes "wall of links" anxiety
✅ **Secondary sidebar** gives stable mental map
✅ **Tabs** keep only tightly related views together
✅ **Drawers** avoid context loss for micro-tasks

This trio keeps cognition low at each step: **discover → dive → operate**
