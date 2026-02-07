import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { HubCard } from './HubCard.web';
import type { HubCardProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

const meta: Meta<HubCardProps> = {
  title: 'Components/Layout/HubCard',
  component: HubCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# HubCard Component

A navigation card component for hub/dashboard pages. Used to display settings categories, feature sections, or navigation options with optional metrics and badges.

## Features
- **Fixed Height**: Consistent 220px height for grid layouts
- **Interactive**: Click/tap support with keyboard navigation
- **Accessible**: Proper ARIA attributes and focus states
- **Theme Integration**: Uses unified design tokens
- **Loading & Disabled States**: Built-in state handling
- **Metrics Display**: Show counts, values, or statistics
- **Badge Support**: Highlight status or labels

## Usage

\`\`\`tsx
import { HubCard } from '@vas-dj-saas/ui';

<HubCard
  id="members"
  title="Members"
  description="Manage team members and permissions"
  icon="Users"
  href="/settings/organization/members"
  metric={12}
  metricLabel="Active"
  onPress={() => router.push('/settings/organization/members')}
/>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Card title',
    },
    description: {
      control: { type: 'text' },
      description: 'Card description',
    },
    icon: {
      control: { type: 'text' },
      description: 'Icon name from Lucide icons',
    },
    metric: {
      control: { type: 'text' },
      description: 'Metric value to display',
    },
    metricLabel: {
      control: { type: 'text' },
      description: 'Label for the metric',
    },
    badge: {
      control: { type: 'text' },
      description: 'Badge text or count',
    },
    badgeVariant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning'],
      description: 'Badge visual variant',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Loading state',
    },
    isDisabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    onPress: {
      action: 'pressed',
      description: 'Click/press handler',
    },
  },
  args: {
    id: 'default-card',
    title: 'Members',
    description: 'Manage team members and permissions',
    icon: 'Users',
    href: '/settings/organization/members',
    isLoading: false,
    isDisabled: false,
  },
};

export default meta;
type Story = StoryObj<HubCardProps>;

// Default story
export const Default: Story = {
  name: 'Default',
  args: {
    id: 'members',
    title: 'Members',
    description: 'Manage team members and permissions',
    icon: 'Users',
    href: '/settings/organization/members',
    onPress: () => console.log('Card pressed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic HubCard with title, description, and icon.',
      },
    },
  },
};

// With Metrics
export const WithMetrics: Story = {
  name: 'With Metrics',
  args: {
    id: 'members-with-metrics',
    title: 'Members',
    description: 'Manage team members and permissions',
    icon: 'Users',
    href: '/settings/organization/members',
    metric: 12,
    metricLabel: 'Active',
    onPress: () => console.log('Card pressed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'HubCard displaying a metric value with label, useful for showing counts or statistics.',
      },
    },
  },
};

// With Badge
export const WithBadge: Story = {
  name: 'With Badge',
  args: {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Manage your API keys and access tokens',
    icon: 'Key',
    href: '/settings/developer/api-keys',
    badge: 'New',
    badgeVariant: 'primary',
    onPress: () => console.log('Card pressed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'HubCard with a badge indicator, useful for highlighting new or important items.',
      },
    },
  },
};

// With Action (clickable)
export const WithAction: Story = {
  name: 'With Action',
  args: {
    id: 'billing',
    title: 'Billing',
    description: 'Manage subscription and payment methods',
    icon: 'CreditCard',
    href: '/settings/billing',
    metric: '$99',
    metricLabel: '/month',
    badge: 'Pro',
    badgeVariant: 'success',
    onPress: () => alert('Navigating to billing settings'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive HubCard with click handler. Try clicking to see the action.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  name: 'Disabled',
  args: {
    id: 'disabled-feature',
    title: 'Advanced Analytics',
    description: 'Upgrade to access advanced analytics features',
    icon: 'BarChart3',
    href: '/settings/analytics',
    badge: 'Pro',
    badgeVariant: 'secondary',
    isDisabled: true,
    onPress: () => console.log('This should not fire'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled HubCard with reduced opacity and disabled interactions.',
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  name: 'Loading',
  args: {
    id: 'loading-card',
    title: 'Integrations',
    description: 'Connect external services and tools',
    icon: 'Plug',
    href: '/settings/integrations',
    metric: 5,
    metricLabel: 'Connected',
    isLoading: true,
    onPress: () => console.log('This should not fire'),
  },
  parameters: {
    docs: {
      description: {
        story: 'HubCard in loading state, disabling interactions.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '900px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>HubCard Variants</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {/* Basic */}
        <HubCard
          id="basic"
          title="Basic Card"
          description="Simple card with title and description"
          icon="File"
          href="/basic"
          onPress={() => console.log('Basic clicked')}
        />

        {/* With Metric */}
        <HubCard
          id="with-metric"
          title="With Metric"
          description="Card displaying a count"
          icon="Users"
          href="/users"
          metric={24}
          metricLabel="Total"
          onPress={() => console.log('Metric clicked')}
        />

        {/* With Badge */}
        <HubCard
          id="with-badge"
          title="With Badge"
          description="Card with status badge"
          icon="Bell"
          href="/notifications"
          badge="5 new"
          badgeVariant="warning"
          onPress={() => console.log('Badge clicked')}
        />

        {/* Full Featured */}
        <HubCard
          id="full-featured"
          title="Full Featured"
          description="Card with all features enabled"
          icon="Star"
          href="/premium"
          metric="$199"
          metricLabel="/year"
          badge="Best Value"
          badgeVariant="success"
          onPress={() => console.log('Full clicked')}
        />

        {/* Disabled */}
        <HubCard
          id="disabled"
          title="Disabled Card"
          description="This card is not interactive"
          icon="Lock"
          href="/locked"
          badge="Locked"
          badgeVariant="secondary"
          isDisabled={true}
        />

        {/* Loading */}
        <HubCard
          id="loading"
          title="Loading Card"
          description="Data is being fetched"
          icon="Loader"
          href="/loading"
          isLoading={true}
        />
      </div>
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
        story: 'Showcase of all HubCard variants including basic, with metrics, with badge, full featured, disabled, and loading states.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: 'Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      {/* Light Theme */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>Light Theme</h4>
        <ThemeProvider defaultTheme="default">
          <div style={{
            padding: '24px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            <HubCard
              id="light-1"
              title="Team Members"
              description="Manage your team"
              icon="Users"
              href="/members"
              metric={8}
              metricLabel="Active"
              onPress={() => {}}
            />
            <HubCard
              id="light-2"
              title="Billing"
              description="Subscription details"
              icon="CreditCard"
              href="/billing"
              badge="Pro"
              badgeVariant="success"
              onPress={() => {}}
            />
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>Dark Theme</h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{
            padding: '24px',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            <HubCard
              id="dark-1"
              title="Team Members"
              description="Manage your team"
              icon="Users"
              href="/members"
              metric={8}
              metricLabel="Active"
              onPress={() => {}}
            />
            <HubCard
              id="dark-2"
              title="Billing"
              description="Subscription details"
              icon="CreditCard"
              href="/billing"
              badge="Pro"
              badgeVariant="success"
              onPress={() => {}}
            />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ padding: '24px', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'HubCard appearance in light and dark themes.',
      },
    },
  },
};

// Grid layout example
export const GridLayout: Story = {
  name: 'Grid Layout',
  render: () => (
    <div style={{ width: '100%', maxWidth: '900px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Settings Hub Grid</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        <HubCard
          id="profile"
          title="Profile"
          description="Manage your personal information"
          icon="User"
          href="/settings/profile"
          onPress={() => {}}
        />
        <HubCard
          id="security"
          title="Security"
          description="Password and two-factor authentication"
          icon="Shield"
          href="/settings/security"
          badge="2FA On"
          badgeVariant="success"
          onPress={() => {}}
        />
        <HubCard
          id="notifications"
          title="Notifications"
          description="Configure notification preferences"
          icon="Bell"
          href="/settings/notifications"
          metric={3}
          metricLabel="Enabled"
          onPress={() => {}}
        />
        <HubCard
          id="integrations"
          title="Integrations"
          description="Connect third-party services"
          icon="Plug"
          href="/settings/integrations"
          metric={5}
          metricLabel="Connected"
          onPress={() => {}}
        />
        <HubCard
          id="api-keys"
          title="API Keys"
          description="Manage API access tokens"
          icon="Key"
          href="/settings/api-keys"
          metric={2}
          metricLabel="Active"
          badge="Dev"
          badgeVariant="outline"
          onPress={() => {}}
        />
        <HubCard
          id="billing"
          title="Billing"
          description="Subscription and payment methods"
          icon="CreditCard"
          href="/settings/billing"
          metric="$49"
          metricLabel="/month"
          badge="Pro"
          badgeVariant="primary"
          onPress={() => {}}
        />
      </div>
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
        story: 'Example of HubCards arranged in a responsive grid layout, typical for settings or dashboard hub pages.',
      },
    },
  },
};
