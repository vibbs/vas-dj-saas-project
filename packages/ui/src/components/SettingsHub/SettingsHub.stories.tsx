import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SettingsHub } from './SettingsHub.web';
import type { SettingsHubProps, HubConfig, QuickAction } from './types';
import type { HubCardProps } from '../HubCard/types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Mock data for stories
const mockOrganizationCards: HubCardProps[] = [
  {
    id: 'members',
    title: 'Members',
    description: 'Manage team members and their roles',
    icon: 'Users',
    href: '/settings/organization/members',
    metric: 12,
    metricLabel: 'Active',
    order: 1,
  },
  {
    id: 'roles',
    title: 'Roles & Permissions',
    description: 'Configure access levels and permissions',
    icon: 'Shield',
    href: '/settings/organization/roles',
    metric: 5,
    metricLabel: 'Roles',
    order: 2,
  },
  {
    id: 'teams',
    title: 'Teams',
    description: 'Organize members into teams',
    icon: 'Users2',
    href: '/settings/organization/teams',
    metric: 3,
    metricLabel: 'Teams',
    order: 3,
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Subscription and payment details',
    icon: 'CreditCard',
    href: '/settings/organization/billing',
    badge: 'Pro',
    badgeVariant: 'success',
    order: 4,
  },
];

const mockQuickActions: QuickAction[] = [
  {
    id: 'invite-member',
    label: 'Invite Member',
    icon: 'UserPlus',
    href: '/settings/organization/members/invite',
    variant: 'primary',
    order: 1,
  },
  {
    id: 'create-team',
    label: 'Create Team',
    icon: 'FolderPlus',
    href: '/settings/organization/teams/new',
    variant: 'outline',
    order: 2,
  },
  {
    id: 'export-data',
    label: 'Export Data',
    icon: 'Download',
    href: '/settings/organization/export',
    variant: 'outline',
    order: 3,
  },
];

const mockSummaryMetrics = [
  { label: 'Total Members', value: 12, icon: 'Users' },
  { label: 'Active Now', value: 5, icon: 'Activity' },
  { label: 'Storage Used', value: '2.4 GB', icon: 'HardDrive' },
  { label: 'API Calls', value: '12.5K', icon: 'Zap' },
];

const mockOrganizationConfig: HubConfig = {
  title: 'Organization Settings',
  description: 'Manage your organization settings and preferences',
  cards: mockOrganizationCards,
  quickActions: mockQuickActions,
  summaryMetrics: mockSummaryMetrics,
};

const mockDeveloperCards: HubCardProps[] = [
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Manage API keys and access tokens',
    icon: 'Key',
    href: '/settings/developer/api-keys',
    metric: 3,
    metricLabel: 'Active',
    order: 1,
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Configure webhook endpoints',
    icon: 'Webhook',
    href: '/settings/developer/webhooks',
    metric: 2,
    metricLabel: 'Endpoints',
    order: 2,
  },
  {
    id: 'oauth',
    title: 'OAuth Apps',
    description: 'Manage OAuth applications',
    icon: 'AppWindow',
    href: '/settings/developer/oauth',
    badge: 'New',
    badgeVariant: 'primary',
    order: 3,
  },
  {
    id: 'logs',
    title: 'API Logs',
    description: 'View API request logs and analytics',
    icon: 'FileText',
    href: '/settings/developer/logs',
    order: 4,
  },
];

const mockDeveloperConfig: HubConfig = {
  title: 'Developer Settings',
  description: 'API access and developer tools',
  cards: mockDeveloperCards,
  quickActions: [
    {
      id: 'create-key',
      label: 'Create API Key',
      icon: 'Plus',
      href: '/settings/developer/api-keys/new',
      variant: 'primary',
      order: 1,
    },
    {
      id: 'view-docs',
      label: 'View API Docs',
      icon: 'Book',
      href: '/docs/api',
      variant: 'outline',
      order: 2,
    },
  ],
};

const meta: Meta<SettingsHubProps> = {
  title: 'Components/Layout/SettingsHub',
  component: SettingsHub,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# SettingsHub Component

A hub page component that displays a collection of HubCards for navigation, along with optional summary metrics and quick actions.

## Features
- **Card Grid**: Responsive grid layout of HubCards
- **Summary Metrics**: Optional summary section at the top
- **Quick Actions**: Actionable buttons for common tasks
- **Filtering**: Support for permission/feature flag based filtering
- **Loading States**: Cascades loading state to child cards

## Usage

\`\`\`tsx
import { SettingsHub } from '@vas-dj-saas/ui';

const config = {
  title: 'Organization Settings',
  cards: [
    { id: 'members', title: 'Members', icon: 'Users', href: '/members' },
    { id: 'billing', title: 'Billing', icon: 'CreditCard', href: '/billing' },
  ],
  quickActions: [
    { id: 'invite', label: 'Invite Member', icon: 'UserPlus', href: '/invite' },
  ],
};

<SettingsHub
  config={config}
  onNavigate={(href) => router.push(href)}
/>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Hub configuration containing cards, quick actions, and summary metrics',
    },
    onNavigate: {
      action: 'navigated',
      description: 'Navigation handler called when a card or action is clicked',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Loading state applied to all cards',
    },
    filterCard: {
      description: 'Filter function for cards (for permission checks)',
    },
    filterAction: {
      description: 'Filter function for quick actions (for permission checks)',
    },
  },
};

export default meta;
type Story = StoryObj<SettingsHubProps>;

// Default story
export const Default: Story = {
  name: 'Default',
  args: {
    config: {
      title: 'Organization Settings',
      cards: mockOrganizationCards,
    },
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic SettingsHub with just cards, no quick actions or summary metrics.',
      },
    },
  },
};

// With Quick Actions
export const WithQuickActions: Story = {
  name: 'With Quick Actions',
  args: {
    config: {
      title: 'Organization Settings',
      cards: mockOrganizationCards,
      quickActions: mockQuickActions,
    },
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub with a quick actions bar at the bottom for common tasks.',
      },
    },
  },
};

// With Summary Metrics
export const WithSummaryMetrics: Story = {
  name: 'With Summary Metrics',
  args: {
    config: {
      title: 'Organization Settings',
      cards: mockOrganizationCards,
      summaryMetrics: mockSummaryMetrics,
    },
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub with a summary metrics section at the top displaying key statistics.',
      },
    },
  },
};

// Full Featured (Multiple Cards with all features)
export const FullFeatured: Story = {
  name: 'Full Featured',
  args: {
    config: mockOrganizationConfig,
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured SettingsHub with summary metrics, multiple cards, and quick actions.',
      },
    },
  },
};

// Developer Settings Example
export const DeveloperSettings: Story = {
  name: 'Developer Settings',
  args: {
    config: mockDeveloperConfig,
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a developer-focused settings hub with API and webhook management cards.',
      },
    },
  },
};

// Loading State
export const Loading: Story = {
  name: 'Loading',
  args: {
    config: mockOrganizationConfig,
    isLoading: true,
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub in loading state. All cards and actions are disabled.',
      },
    },
  },
};

// With Filtering
export const WithFiltering: Story = {
  name: 'With Filtering',
  args: {
    config: mockOrganizationConfig,
    onNavigate: (href) => console.log('Navigate to:', href),
    filterCard: (card: HubCardProps) => card.id !== 'billing', // Hide billing card
    filterAction: (action: QuickAction) => action.id !== 'export-data', // Hide export action
  },
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub with filtering applied. The "Billing" card and "Export Data" action are hidden based on the filter functions.',
      },
    },
  },
};

// Minimal Configuration
export const MinimalConfig: Story = {
  name: 'Minimal Configuration',
  args: {
    config: {
      title: 'Settings',
      cards: [
        {
          id: 'general',
          title: 'General',
          description: 'Basic settings',
          icon: 'Settings',
          href: '/settings/general',
        },
        {
          id: 'account',
          title: 'Account',
          description: 'Account preferences',
          icon: 'User',
          href: '/settings/account',
        },
      ],
    },
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal SettingsHub configuration with just two cards.',
      },
    },
  },
};

// Theme Comparison
export const ThemeComparison: Story = {
  name: 'Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Light Theme */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Light Theme</h3>
        <ThemeProvider defaultTheme="default">
          <div style={{
            padding: '24px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
          }}>
            <SettingsHub
              config={{
                title: 'Organization Settings',
                cards: mockOrganizationCards.slice(0, 3),
                quickActions: mockQuickActions.slice(0, 2),
              }}
              onNavigate={(href) => console.log('Navigate:', href)}
            />
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Dark Theme</h3>
        <ThemeProvider defaultTheme="dark">
          <div style={{
            padding: '24px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
          }}>
            <SettingsHub
              config={{
                title: 'Organization Settings',
                cards: mockOrganizationCards.slice(0, 3),
                quickActions: mockQuickActions.slice(0, 2),
              }}
              onNavigate={(href) => console.log('Navigate:', href)}
            />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub appearance in light and dark themes.',
      },
    },
  },
};

// Responsive Layout Demo
export const ResponsiveLayout: Story = {
  name: 'Responsive Layout',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
          Resize your browser window to see the responsive grid layout in action.
          Cards automatically adjust from 1 to 4 columns based on available space.
        </p>
      </div>

      <SettingsHub
        config={mockOrganizationConfig}
        onNavigate={(href) => console.log('Navigate:', href)}
      />
    </div>
  ),
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '24px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the responsive grid layout of SettingsHub. Resize the viewport to see cards reflow.',
      },
    },
  },
};

// Empty State
export const EmptyState: Story = {
  name: 'Empty State',
  args: {
    config: {
      title: 'Empty Hub',
      cards: [],
      quickActions: [
        {
          id: 'get-started',
          label: 'Get Started',
          icon: 'Plus',
          href: '/setup',
          variant: 'primary',
        },
      ],
    },
    onNavigate: (href) => console.log('Navigate to:', href),
  },
  parameters: {
    docs: {
      description: {
        story: 'SettingsHub with no cards, showing only the quick actions section.',
      },
    },
  },
};
