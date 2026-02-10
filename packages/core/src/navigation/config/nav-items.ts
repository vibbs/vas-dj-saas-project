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

        // Organization Settings - Hub with secondary sidebar
        {
          id: "settings-organization",
          label: "Organization",
          icon: "Building2",
          href: "/settings/organization",
          description: "Manage your organization",
          order: 2,
          viewType: "hub",
          permission: {
            type: "role",
            roles: ["admin", "orgAdmin", "orgCreator"],
          },
          hubConfig: {
            title: "Organization Settings",
            description: "Manage your organization's members, roles, and configuration",
            cards: [
              {
                id: "org-members",
                title: "Members",
                description: "Manage team members and their permissions",
                icon: "Users",
                href: "/settings/organization/members",
                metric: 12,
                metricLabel: "Active",
                order: 1,
              },
              {
                id: "org-invitations",
                title: "Invitations",
                description: "Pending invitations to join your organization",
                icon: "UserPlus",
                href: "/settings/organization/invitations",
                badge: 3,
                badgeVariant: "warning",
                order: 2,
              },
              {
                id: "org-roles",
                title: "Roles & Permissions",
                description: "Define roles and permission sets",
                icon: "Shield",
                href: "/settings/organization/roles",
                metric: 5,
                metricLabel: "Roles",
                order: 3,
              },
              {
                id: "org-flags",
                title: "Feature Flags",
                description: "Control feature rollouts and experiments",
                icon: "Flag",
                href: "/settings/organization/flags",
                order: 4,
              },
              {
                id: "org-email-templates",
                title: "Email Templates",
                description: "Customize email notifications",
                icon: "Mail",
                href: "/settings/organization/email-templates",
                order: 5,
              },
              {
                id: "org-configurations",
                title: "Configurations",
                description: "Organization-wide settings and branding",
                icon: "Settings",
                href: "/settings/organization/configurations",
                order: 6,
              },
            ],
            quickActions: [
              {
                id: "invite-member",
                label: "Invite Member",
                icon: "UserPlus",
                href: "/settings/organization/members?action=invite",
                variant: "primary",
                order: 1,
              },
              {
                id: "create-role",
                label: "Create Role",
                icon: "Shield",
                href: "/settings/organization/roles?action=create",
                variant: "outline",
                order: 2,
              },
              {
                id: "new-flag-set",
                label: "New Flag Set",
                icon: "Flag",
                href: "/settings/organization/flags?action=create",
                variant: "outline",
                order: 3,
              },
            ],
          },
          secondarySidebar: {
            showOverviewLink: true,
            overviewLabel: "Overview",
            overviewHref: "/settings/organization",
            items: [
              {
                id: "org-nav-members",
                label: "Members",
                icon: "Users",
                href: "/settings/organization/members",
                order: 1,
              },
              {
                id: "org-nav-invitations",
                label: "Invitations",
                icon: "UserPlus",
                href: "/settings/organization/invitations",
                badge: 3,
                order: 2,
              },
              {
                id: "org-nav-roles",
                label: "Roles",
                icon: "Shield",
                href: "/settings/organization/roles",
                order: 3,
              },
              {
                id: "org-nav-flags",
                label: "Feature Flags",
                icon: "Flag",
                href: "/settings/organization/flags",
                order: 4,
              },
              {
                id: "org-nav-email-templates",
                label: "Email Templates",
                icon: "Mail",
                href: "/settings/organization/email-templates",
                order: 5,
              },
              {
                id: "org-nav-configurations",
                label: "Configurations",
                icon: "Settings",
                href: "/settings/organization/configurations",
                order: 6,
              },
            ],
          },
        },

        // Developer Settings - Hub with secondary sidebar
        {
          id: "settings-developer",
          label: "Developer",
          icon: "Code",
          href: "/settings/developer",
          description: "API keys, webhooks, and integrations",
          order: 3,
          viewType: "hub",
          permission: {
            type: "role",
            roles: ["admin", "orgAdmin", "orgCreator"],
          },
          hubConfig: {
            title: "Developer Settings",
            description: "Manage API keys, webhooks, OAuth applications, and service accounts",
            cards: [
              {
                id: "dev-api-keys",
                title: "API Keys",
                description: "Generate and manage API keys for programmatic access",
                icon: "Key",
                href: "/settings/developer/api-keys",
                order: 1,
              },
              {
                id: "dev-webhooks",
                title: "Webhooks",
                description: "Configure webhook endpoints for event notifications",
                icon: "Webhook",
                href: "/settings/developer/webhooks",
                order: 2,
              },
              {
                id: "dev-oauth",
                title: "OAuth Applications",
                description: "Manage OAuth apps and authentication flows",
                icon: "Lock",
                href: "/settings/developer/oauth",
                order: 3,
              },
              {
                id: "dev-service-accounts",
                title: "Service Accounts",
                description: "Automated workflow accounts for integrations",
                icon: "Bot",
                href: "/settings/developer/service-accounts",
                badge: "Soon",
                badgeVariant: "default",
                order: 4,
              },
              {
                id: "dev-docs",
                title: "API Documentation",
                description: "Interactive API reference and code examples",
                icon: "BookOpen",
                href: "/settings/developer/docs",
                order: 5,
              },
            ],
            quickActions: [
              {
                id: "create-api-key",
                label: "Create API Key",
                icon: "Key",
                href: "/settings/developer/api-keys?action=create",
                variant: "primary",
                order: 1,
              },
              {
                id: "add-webhook",
                label: "Add Webhook",
                icon: "Webhook",
                href: "/settings/developer/webhooks?action=create",
                variant: "outline",
                order: 2,
              },
              {
                id: "view-docs",
                label: "View API Docs",
                icon: "ExternalLink",
                href: "/settings/developer/docs",
                variant: "outline",
                order: 3,
              },
            ],
          },
          secondarySidebar: {
            showOverviewLink: true,
            overviewLabel: "Overview",
            overviewHref: "/settings/developer",
            items: [
              {
                id: "dev-nav-api-keys",
                label: "API Keys",
                icon: "Key",
                href: "/settings/developer/api-keys",
                order: 1,
              },
              {
                id: "dev-nav-webhooks",
                label: "Webhooks",
                icon: "Webhook",
                href: "/settings/developer/webhooks",
                badge: "Soon",
                order: 2,
              },
              {
                id: "dev-nav-oauth",
                label: "OAuth",
                icon: "Lock",
                href: "/settings/developer/oauth",
                badge: "Soon",
                order: 3,
              },
              {
                id: "dev-nav-service-accounts",
                label: "Service Accounts",
                icon: "Bot",
                href: "/settings/developer/service-accounts",
                badge: "Soon",
                order: 4,
              },
              {
                id: "dev-nav-docs",
                label: "API Documentation",
                icon: "BookOpen",
                href: "/settings/developer/docs",
                order: 5,
              },
            ],
          },
        },

        // Billing Settings - Hub with secondary sidebar
        {
          id: "settings-billing",
          label: "Billing",
          icon: "CreditCard",
          href: "/settings/billing",
          description: "Subscription and payment settings",
          order: 4,
          viewType: "hub",
          permission: {
            type: "custom",
            customCheck: (account) =>
              (account.canManageBilling ?? false) ||
              (account.isOrgCreator ?? false) ||
              (account.isAdmin ?? false),
          },
          hubConfig: {
            title: "Billing & Subscription",
            description: "Manage your subscription plan, payment methods, and billing history",
            cards: [
              {
                id: "billing-subscription",
                title: "Subscription",
                description: "View and manage your current subscription plan",
                icon: "Sparkles",
                href: "/settings/billing/subscription",
                metric: "Pro",
                metricLabel: "Current Plan",
                order: 1,
              },
              {
                id: "billing-invoices",
                title: "Invoices",
                description: "View and download your billing history and invoices",
                icon: "FileText",
                href: "/settings/billing/invoices",
                metric: 12,
                metricLabel: "This Year",
                order: 2,
              },
              {
                id: "billing-payment-methods",
                title: "Payment Methods",
                description: "Manage credit cards and payment options",
                icon: "CreditCard",
                href: "/settings/billing/payment-methods",
                metric: 2,
                metricLabel: "Cards",
                order: 3,
              },
            ],
            quickActions: [
              {
                id: "upgrade-plan",
                label: "Upgrade Plan",
                icon: "Sparkles",
                href: "/settings/billing/subscription?action=upgrade",
                variant: "primary",
                order: 1,
              },
              {
                id: "add-payment-method",
                label: "Add Payment Method",
                icon: "Plus",
                href: "/settings/billing/payment-methods?action=add",
                variant: "outline",
                order: 2,
              },
            ],
          },
          secondarySidebar: {
            showOverviewLink: true,
            overviewLabel: "Overview",
            overviewHref: "/settings/billing",
            items: [
              {
                id: "billing-nav-subscription",
                label: "Subscription",
                icon: "Sparkles",
                href: "/settings/billing/subscription",
                order: 1,
              },
              {
                id: "billing-nav-invoices",
                label: "Invoices",
                icon: "FileText",
                href: "/settings/billing/invoices",
                order: 2,
              },
              {
                id: "billing-nav-payment-methods",
                label: "Payment Methods",
                icon: "CreditCard",
                href: "/settings/billing/payment-methods",
                order: 3,
              },
            ],
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
