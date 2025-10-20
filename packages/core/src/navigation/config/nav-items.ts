import type { NavConfig } from './nav-schema';

/**
 * Main navigation configuration
 * This is the single source of truth for app navigation
 */
export const navigationConfig: NavConfig = {
  version: '1.0.0',
  metadata: {
    description: 'VAS-DJ SaaS application navigation structure',
    lastUpdated: '2025-01-20',
  },
  sections: [
    // Main navigation section
    {
      id: 'main',
      order: 1,
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: '🏠',
          href: '/home',
          platforms: ['web', 'mobile'],
          order: 1,
        },
      ],
    },

    // Settings section
    {
      id: 'settings',
      title: 'Settings',
      order: 100,
      items: [
        // Personal Settings (Level 1 - expandable)
        {
          id: 'settings-personal',
          label: 'Personal',
          icon: '👤',
          expandable: true,
          platforms: ['web', 'mobile'],
          order: 1,
          children: [
            {
              id: 'settings-profile',
              label: 'Profile',
              icon: '👤',
              href: '/settings/profile',
              description: 'Manage your personal information',
              platforms: ['web', 'mobile'],
            },
            {
              id: 'settings-security',
              label: 'Security',
              icon: '🔒',
              href: '/settings/security',
              description: 'Password, 2FA, and security settings',
              platforms: ['web', 'mobile'],
            },
            {
              id: 'settings-notifications',
              label: 'Notifications',
              icon: '🔔',
              href: '/settings/notifications',
              description: 'Email and push notification preferences',
              platforms: ['web', 'mobile'],
            },
          ],
        },

        // Organization Settings (Level 1 - expandable)
        {
          id: 'settings-organization',
          label: 'Organization',
          icon: '🏢',
          expandable: true,
          platforms: ['web'], // Complex forms - web only
          order: 2,
          permission: {
            type: 'role',
            roles: ['admin', 'orgAdmin', 'orgCreator'],
          },
          children: [
            {
              id: 'settings-org-profile',
              label: 'Profile',
              icon: '🏢',
              href: '/settings/organization/profile',
              description: 'Organization name, subdomain, and branding',
            },
            {
              id: 'settings-org-members',
              label: 'Members',
              icon: '👥',
              href: '/settings/organization/members',
              description: 'Manage team members and roles',
            },
            {
              id: 'settings-org-api-keys',
              label: 'API Keys',
              icon: '🔑',
              href: '/settings/organization/api-keys',
              description: 'Generate and manage API keys',
            },
            {
              id: 'settings-org-integrations',
              label: 'Integrations',
              icon: '🔌',
              href: '/settings/organization/integrations',
              description: 'Connect third-party services',
            },
            {
              id: 'settings-org-billing',
              label: 'Billing',
              icon: '💳',
              href: '/settings/organization/billing',
              description: 'Subscription and payment settings',
              permission: {
                type: 'custom',
                customCheck: (account) =>
                  (account.canManageBilling ?? false) ||
                  (account.isOrgCreator ?? false) ||
                  (account.isAdmin ?? false),
              },
            },
            {
              id: 'settings-org-import-export',
              label: 'Import / Export',
              icon: '📦',
              href: '/settings/organization/import-export',
              description: 'Data migration tools',
            },
          ],
        },

        // Developer Settings (Level 1 - expandable)
        {
          id: 'settings-developer',
          label: 'Developer',
          icon: '⚙️',
          expandable: true,
          platforms: ['web'], // Complex forms - web only
          order: 3,
          permission: {
            type: 'role',
            roles: ['admin', 'orgAdmin', 'orgCreator'],
          },
          children: [
            {
              id: 'settings-dev-webhooks',
              label: 'Webhooks',
              icon: '🪝',
              href: '/settings/developer/webhooks',
              description: 'Configure webhook endpoints',
            },
            {
              id: 'settings-dev-oauth',
              label: 'OAuth',
              icon: '🔐',
              href: '/settings/developer/oauth',
              description: 'Manage OAuth applications',
            },
            {
              id: 'settings-dev-service-accounts',
              label: 'Service Accounts',
              icon: '🤖',
              href: '/settings/developer/service-accounts',
              description: 'Automated workflow accounts',
            },
          ],
        },
      ],
    },
  ],
};
