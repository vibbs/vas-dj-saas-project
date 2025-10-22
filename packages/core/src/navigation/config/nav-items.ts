import type { NavConfig } from "./nav-schema";

/**
 * Main navigation configuration
 * This is the single source of truth for app navigation
 */
export const navigationConfig: NavConfig = {
  version: "1.0.0",
  metadata: {
    description: "VAS-DJ SaaS application navigation structure",
    lastUpdated: "2025-01-20",
  },
  sections: [
    // Main navigation section
    {
      id: "main",
      order: 1,
      items: [
        {
          id: "home",
          label: "Home",
          icon: "Home",
          href: "/home",
          platforms: ["web", "mobile"],
          order: 1,
        },
      ],
    },

    // Settings section - Flat structure with ShallowTabs pattern
    {
      id: "settings",
      title: "Settings",
      order: 100,
      items: [
        // Personal Settings - Direct link to page with tabs (accessible to all authenticated users)
        {
          id: "settings-personal",
          label: "Personal",
          icon: "User",
          href: "/settings/personal",
          description: "Your personal account settings",
          order: 1,
          permission: {
            type: "role",
            roles: ["user"], // All authenticated users
          },
        },

        // Organization Settings - Direct link to page with tabs + drawers
        {
          id: "settings-organization",
          label: "Organization",
          icon: "Building2",
          href: "/settings/organization",
          description: "Manage your organization",
          order: 2,
          permission: {
            type: "role",
            roles: ["admin", "orgAdmin", "orgCreator"],
          },
        },

        // Developer Settings - Direct link to page with tabs
        {
          id: "settings-developer",
          label: "Developer",
          icon: "Code",
          href: "/settings/developer",
          description: "API keys, webhooks, and integrations",
          order: 3,
          permission: {
            type: "role",
            roles: ["admin", "orgAdmin", "orgCreator"],
          },
        },

        // Billing Settings - Standalone page
        {
          id: "settings-billing",
          label: "Billing",
          icon: "CreditCard",
          href: "/settings/billing",
          description: "Subscription and payment settings",
          order: 4,
          permission: {
            type: "custom",
            customCheck: (account) =>
              (account.canManageBilling ?? false) ||
              (account.isOrgCreator ?? false) ||
              (account.isAdmin ?? false),
          },
        },

        // Integrations Settings - Standalone page with optional drawer
        {
          id: "settings-integrations",
          label: "Integrations",
          icon: "Plug",
          href: "/settings/integrations",
          description: "Connect third-party services",
          order: 5,
          permission: {
            type: "role",
            roles: ["admin", "orgAdmin", "orgCreator"],
          },
        },
      ],
    },
  ],
};
