# UI Information Architecture (IA) + Navigation Rendering Strategy

, i.e., how the sidebar, pages, and in-page sub-navigation (tabs, drawers) all interplay in rendering.

Below is a **step-by-step mental model + rendering breakdown** — think of it like a wireframe-in-text that explains *exactly* what lives where, and how it’s rendered and routed.

---

## 🧭 1. Top-Level Layout Structure (applies to all pages)

```
<RootLayout>
  ├── <SidebarNavigation />   ← persistent left nav (Home, Settings, etc.)
  ├── <AppHeader />           ← optional top header or breadcrumb
  └── <PageContainer />       ← renders content area based on route
</RootLayout>
```

### Sidebar items (constant across app)

* **Home** → `/`
* **Settings** → expandable section with items below
* **Billing**
* **Developer**
* **Integrations**
* **Help / Support**

---

## ⚙️ 2. Settings Section — Render Strategy

### Sidebar Behavior

`Settings` is not a single page; it’s a **nav group label**
→ clicking expands sub-items.

**Under “Settings”:**

| Sidebar Item | Path                     | Renders              | Notes                      |
| ------------ | ------------------------ | -------------------- | -------------------------- |
| Personal     | `/settings/personal`     | Tabs page            | Your personal account info |
| Organization | `/settings/organization` | Tabs + Drawer hybrid | Org-level admin stuff      |
| Developer    | `/settings/developer`    | Tabs page            | API Keys, Webhooks, OAuth  |
| Billing      | `/settings/billing`      | Full page            | Payment details            |
| Integrations | `/settings/integrations` | Full page            | 3rd-party integrations     |

---

## 👤 3. Settings → Personal

* **Sidebar:** collapsible or single entry
* **Rendering:** page with tabs

  * Route: `/settings/personal?tab=profile` or `/settings/personal?tab=security`
  * Tabs:

    * **Profile**
    * **Security**
    * **Notifications**
  * Implementation: `ShallowTabs`
    Each tab lazy-loads its component; state is in URL (`?tab=`).
  * Example:

    ```
    /settings/personal?tab=security
    ```

✅  **Pattern:** *ShallowTabs only (no drawers needed)*

---

## 🏢 4. Settings → Organization (your main area)

* **Sidebar:** collapsible group
* **Rendering:** Tabs + optional Drawer

  * Route: `/settings/organization?tab=members`
  * Tabs (via `ShallowTabs`):

    * Overview
    * Members
    * Invitations
    * Roles
  * Within Members tab:

    * Main list table (kept mounted)
    * On row click → `EntityDrawer` opens with member details.
    * Drawer state tied to URL param: `?tab=members&selected=<memberId>`

✅  **Pattern:** *ShallowTabs + EntityDrawer hybrid*

---

## 🧑‍💻 5. Settings → Developer

* **Sidebar:** collapsible group
* **Rendering:** Tabs only

  * Route: `/settings/developer?tab=api-keys`
  * Tabs:

    * API Keys
    * Webhooks
    * OAuth
    * Service Accounts

✅  **Pattern:** *ShallowTabs only*

* Within each tab → table-based CRUD.
* Future: could add `EntityDrawer` for editing specific API key details.

---

## 💳 6. Settings → Billing

* **Sidebar:** direct link
* **Rendering:** standalone page (no tabs)

  * Route: `/settings/billing`
  * Content: subscription details, payment methods, invoices

✅  **Pattern:** *Simple Page*

---

## 🔌 7. Settings → Integrations

* **Sidebar:** direct link
* **Rendering:** standalone page with optional Drawer

  * Route: `/settings/integrations`
  * Shows grid of connected services
  * Clicking integration → Drawer or deep page (`/integrations/[slug]`)

✅  **Pattern:** *Simple Page or optional EntityDrawer*

---

## 📋 8. Example Hierarchical View (full IA summary)

```
Home (/)
Settings
 ├── Personal (/settings/personal)
 │     ├── Profile     (?tab=profile)
 │     ├── Security    (?tab=security)
 │     └── Notifications (?tab=notifications)
 │
 ├── Organization (/settings/organization)
 │     ├── Overview    (?tab=overview)
 │     ├── Members     (?tab=members)
 │     │       └── Drawer: Member Details (?selected=uid123)
 │     ├── Invitations (?tab=invitations)
 │     └── Roles       (?tab=roles)
 │
 ├── Developer (/settings/developer)
 │     ├── API Keys    (?tab=api-keys)
 │     ├── Webhooks    (?tab=webhooks)
 │     ├── OAuth       (?tab=oauth)
 │     └── Service Accounts (?tab=service-accounts)
 │
 ├── Billing (/settings/billing)
 │
 └── Integrations (/settings/integrations)
```

---

## 🧩 9. Rendering Pattern per Level

| Level          | Component Pattern | URL Format      | Keeps Mounted?                  |
| -------------- | ----------------- | --------------- | ------------------------------- |
| Sidebar → Page | Page Layout       | `/settings/...` | Persistent                      |
| In-page Tabs   | `ShallowTabs`     | `?tab=`         | Yes (no remount, shallow route) |
| Drawer         | `EntityDrawer`    | `?selected=`    | Parent stays mounted            |

---

## ⚙️ 10. Data Fetching Strategy

* Each **page route** owns its data scope (e.g., `/settings/organization` prefetches org info).
* Each **tab** lazy-fetches data only when first opened (React Query caching).
* **Drawer** prefetches the detail query on row hover or click.

---

## 🧠 Summary: Design Principles

| Goal                    | Pattern                                                |
| ----------------------- | ------------------------------------------------------ |
| Reduce deep hierarchy   | Tabs instead of nested pages                           |
| Preserve mental context | Drawer for quick details instead of full navigation    |
| Keep URLs shareable     | Shallow routing for `?tab` and `?selected`             |
| Optimize SSR & refresh  | Tabs are SSR-aware via query parsing                   |
| Improve UX speed        | Parent stays mounted, drawers animate, no page reloads |

---

## ✅ Example User Flow (visualizing rendering behavior)

**Path:** `/settings/organization?tab=members`

1. Sidebar highlights **Organization**.
2. Page header shows breadcrumb + title.
3. `ShallowTabs` highlights “Members”.
4. MembersTable fetches and displays.
5. User clicks a row → `router.push("?tab=members&selected=uid123", { shallow: true })`.
6. Drawer slides in with details.
7. User hits ESC → Drawer closes, removes `selected` param.
8. User clicks “Roles” tab → `router.push("?tab=roles", { shallow: true })`.

   * Layout persists, only content switches.

