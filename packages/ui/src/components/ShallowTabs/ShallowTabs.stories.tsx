import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
// Import directly from web implementation for Storybook
import { ShallowTabs as WebShallowTabs } from './ShallowTabs.web';
import { ShallowTabs as NativeShallowTabs } from './ShallowTabs.native';
import type { ShallowTabsProps } from './types';
import { Card, Heading, Text } from '../..';

// Use Web implementation as the default for Storybook
const ShallowTabs = WebShallowTabs;

// Mock tab content components
const OverviewTab = () => (
    <Card style={{ padding: 24 }}>
        <Heading level={3}>Overview Content</Heading>
        <Text>This is the overview tab content.</Text>
    </Card>
);

const MembersTab = () => (
    <Card style={{ padding: 24 }}>
        <Heading level={3}>Members Content</Heading>
        <Text>List of team members would appear here.</Text>
    </Card>
);

const SettingsTab = () => (
    <Card style={{ padding: 24 }}>
        <Heading level={3}>Settings Content</Heading>
        <Text>Configuration options would appear here.</Text>
    </Card>
);

const meta: Meta<ShallowTabsProps> = {
    title: 'Navigation/ShallowTabs',
    component: ShallowTabs as any,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
# ShallowTabs Component

A URL-synchronized tab navigation component using Next.js shallow routing.

## Platform Support

- **Web**: ✅ Full support with Next.js shallow routing
- **React Native**: ⚠️ Shows placeholder (use React Navigation Tab Navigator instead)

## Features

- ✅ URL state synchronization (\`?tab=value\`)
- ✅ No full page reloads
- ✅ Shareable/bookmarkable URLs
- ✅ Browser back/forward support
- ✅ Icons and badges support
- ✅ Preserves page state and scroll position

## Usage

\`\`\`tsx
import { ShallowTabs } from '@vas-dj-saas/ui';

<ShallowTabs
  defaultTab="overview"
  tabs={[
    { value: 'overview', label: 'Overview', component: <Overview /> },
    { value: 'members', label: 'Members', component: <Members />, badge: 12 },
  ]}
/>
\`\`\`

## URL Structure

- \`/settings/organization?tab=overview\`
- \`/settings/organization?tab=members\`
- \`/settings/organization?tab=settings\`
        `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        tabs: {
            description: 'Array of tab configurations',
            control: { type: 'object' },
        },
        defaultTab: {
            control: { type: 'text' },
            description: 'Default tab value if none in URL',
        },
        onTabChange: {
            action: 'tab changed',
            description: 'Callback when tab changes',
        },
    },
};

export default meta;
type Story = StoryObj<ShallowTabsProps>;

export const Interactive: Story = {
    name: '🎮 Interactive Playground (Web Only)',
    render: (args) => (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{
                padding: '16px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center',
            }}>
                <Text style={{ color: '#1976d2', fontWeight: 600 }}>
                    ⚠️ Note: This component requires Next.js and will show a placeholder on React Native
                </Text>
            </div>
            <WebShallowTabs
                {...args}
                tabs={[
                    {
                        value: 'overview',
                        label: 'Overview',
                        component: <OverviewTab />,
                    },
                    {
                        value: 'members',
                        label: 'Members',
                        badge: 12,
                        component: <MembersTab />,
                    },
                    {
                        value: 'settings',
                        label: 'Settings',
                        component: <SettingsTab />,
                    },
                ]}
            />
        </div>
    ),
    args: {
        defaultTab: 'overview',
    },
};

export const PlatformComparison: Story = {
    name: '📱 Platform Comparison',
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
            <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '800px'
            }}>
                <Heading level={3} style={{ marginBottom: '8px' }}>
                    Platform-Specific Behavior
                </Heading>
                <Text color="muted" size="sm">
                    ShallowTabs shows different implementations based on platform
                </Text>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                width: '100%',
                maxWidth: '900px',
                alignItems: 'start'
            }}>
                {/* Web Implementation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1976d2',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        🌐 Web Platform (Next.js)
                    </div>
                    <div style={{ width: '100%' }}>
                        <WebShallowTabs
                            {...args}
                            tabs={[
                                { value: 'tab1', label: 'Tab 1', component: <Card style={{ padding: 16 }}><Text>Tab 1 Content</Text></Card> },
                                { value: 'tab2', label: 'Tab 2', badge: 5, component: <Card style={{ padding: 16 }}><Text>Tab 2 Content</Text></Card> },
                            ]}
                        />
                    </div>
                    <Text size="xs" color="muted" style={{ textAlign: 'center' }}>
                        ✅ Full functionality with URL sync<br />
                        ✅ Browser back/forward support<br />
                        ✅ Shareable deep links
                    </Text>
                </div>

                {/* React Native Implementation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#856404',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        📱 React Native Platform
                    </div>
                    <div style={{ width: '100%' }}>
                        <NativeShallowTabs {...args} />
                    </div>
                    <Text size="xs" color="muted" style={{ textAlign: 'center' }}>
                        ⚠️ Shows placeholder message<br />
                        💡 Use React Navigation instead<br />
                        📚 See documentation for alternatives
                    </Text>
                </div>
            </div>

            <div style={{
                fontSize: '13px',
                color: '#6b7280',
                textAlign: 'center',
                maxWidth: '600px',
                lineHeight: '1.6',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <strong>💡 Pro Tip:</strong> For React Native apps, use{' '}
                <a href="https://reactnavigation.org/docs/tab-based-navigation" target="_blank" rel="noopener noreferrer">
                    React Navigation&apos;s Tab Navigator
                </a>
                {' '}which provides native tab functionality with similar API patterns.
            </div>
        </div>
    ),
    args: {
        defaultTab: 'tab1',
    },
};

export const WithIcons: Story = {
    name: '🎨 With Icons & Badges',
    render: () => (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <WebShallowTabs
                defaultTab="overview"
                tabs={[
                    {
                        value: 'overview',
                        label: 'Overview',
                        icon: <span style={{ marginRight: '4px' }}>📊</span>,
                        component: <OverviewTab />,
                    },
                    {
                        value: 'members',
                        label: 'Members',
                        icon: <span style={{ marginRight: '4px' }}>👥</span>,
                        badge: 12,
                        component: <MembersTab />,
                    },
                    {
                        value: 'settings',
                        label: 'Settings',
                        icon: <span style={{ marginRight: '4px' }}>⚙️</span>,
                        component: <SettingsTab />,
                    },
                ]}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Tabs can display icons and badges for better visual hierarchy and status indicators.',
            },
        },
    },
};

export const DisabledState: Story = {
    name: '⛔ Disabled Tabs',
    render: () => (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <WebShallowTabs
                defaultTab="overview"
                tabs={[
                    {
                        value: 'overview',
                        label: 'Overview',
                        component: <OverviewTab />,
                    },
                    {
                        value: 'members',
                        label: 'Members',
                        component: <MembersTab />,
                    },
                    {
                        value: 'settings',
                        label: 'Settings (Disabled)',
                        disabled: true,
                        component: <SettingsTab />,
                    },
                ]}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Tabs can be disabled to prevent navigation to certain sections.',
            },
        },
    },
};
