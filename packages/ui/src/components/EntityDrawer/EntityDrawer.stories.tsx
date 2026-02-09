import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
// Import directly from web implementation for Storybook
import { EntityDrawer as WebEntityDrawer } from './EntityDrawer.web';
import { EntityDrawer as NativeEntityDrawer } from './EntityDrawer.native';
import type { EntityDrawerProps } from './types';
import { Card, Heading, Text, Button } from '../..';

// Use Web implementation as the default for Storybook
const EntityDrawer = WebEntityDrawer;

const meta: Meta<EntityDrawerProps> = {
    title: 'Overlays/EntityDrawer',
    component: EntityDrawer as any,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
# EntityDrawer Component

A context-preserving drawer component that opens based on URL query parameters.

## Platform Support

- **Web**: ✅ Full support with Next.js shallow routing
- **React Native**: ⚠️ Shows placeholder (use React Native Bottom Sheet instead)

## Features

- ✅ URL state synchronization (\`?selected=id\`)
- ✅ Preserves list context (table remains mounted)
- ✅ Shareable deep links
- ✅ Slides from right (desktop)
- ✅ Bottom sheet (mobile)
- ✅ Keyboard navigation (ESC to close)
- ✅ Click outside to close

## Usage

\`\`\`tsx
import { EntityDrawer } from '@vas-dj-saas/ui';
import { useSearchParams } from 'next/navigation';

function MyComponent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('selected');
  
  return (
    <EntityDrawer title="Details">
      {selectedId && <DetailView id={selectedId} />}
    </EntityDrawer>
  );
}
\`\`\`

## URL Structure

- \`/page?selected=user123\` - Opens drawer with user123
- \`/page?tab=members&selected=user123\` - Works with tabs
- \`/page\` - Drawer closed
        `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        title: {
            control: { type: 'text' },
            description: 'Drawer header title',
        },
        description: {
            control: { type: 'text' },
            description: 'Drawer header description/subtitle',
        },
        side: {
            control: { type: 'select' },
            options: ['right', 'left', 'top', 'bottom'],
            description: 'Side from which drawer slides in',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'xl', 'full'],
            description: 'Drawer width/size',
        },
        showCloseButton: {
            control: { type: 'boolean' },
            description: 'Show close button in header',
        },
    },
};

export default meta;
type Story = StoryObj<EntityDrawerProps>;

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
                    EntityDrawer shows different implementations based on platform
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
                    <Card style={{ padding: 16, width: '100%' }}>
                        <Text size="sm">
                            On web, EntityDrawer uses Next.js navigation to sync with URL query params.
                            It slides in from the right and preserves the underlying page context.
                        </Text>
                        <div style={{ marginTop: 16 }}>
                            <Text size="xs" weight="medium">Example URL:</Text>
                            <code style={{
                                display: 'block',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                marginTop: '4px',
                                fontSize: '12px'
                            }}>
                                /page?selected=user123
                            </code>
                        </div>
                    </Card>
                    <Text size="xs" color="muted" style={{ textAlign: 'center' }}>
                        ✅ Full functionality with URL sync<br />
                        ✅ Keyboard navigation (ESC)<br />
                        ✅ Click outside to close
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
                        <NativeEntityDrawer {...args} />
                    </div>
                    <Text size="xs" color="muted" style={{ textAlign: 'center' }}>
                        ⚠️ Shows placeholder message<br />
                        💡 Use React Native Bottom Sheet<br />
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
                <a href="https://gorhom.github.io/react-native-bottom-sheet/" target="_blank" rel="noopener noreferrer">
                    React Native Bottom Sheet
                </a>
                {' '}which provides native drawer/modal functionality with gesture support.
            </div>
        </div>
    ),
    args: {
        title: 'Entity Details',
        description: 'View and edit entity information',
    },
};

export const WebOnly: Story = {
    name: '🌐 Web Implementation (Simulated)',
    render: () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center',
                }}>
                    <Text style={{ color: '#1976d2', fontWeight: 600 }}>
                        ⚠️ Note: This is a simulated version. In production, it opens based on URL query params.
                    </Text>
                </div>

                <Card style={{ padding: 24 }}>
                    <Heading level={3} style={{ marginBottom: 16 }}>Members List</Heading>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div
                            style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onClick={() => setIsOpen(true)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Text weight="medium">John Doe</Text>
                            <Text size="sm" color="muted">john@example.com · Admin</Text>
                        </div>
                        <div style={{
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <Text weight="medium">Jane Smith</Text>
                            <Text size="sm" color="muted">jane@example.com · Member</Text>
                        </div>
                    </div>

                    <Text size="sm" color="muted" style={{ marginTop: 16, textAlign: 'center' }}>
                        👆 Click a member to open the drawer
                    </Text>
                </Card>

                {/* Simulated Modal/Drawer */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 40,
                            }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            maxWidth: '480px',
                            backgroundColor: 'white',
                            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}>
                                <div>
                                    <Heading level={3} style={{ marginBottom: 4 }}>John Doe</Heading>
                                    <Text size="sm" color="muted">john@example.com</Text>
                                </div>
                                <Button variant="ghost" size="sm" onPress={() => setIsOpen(false)}>✕</Button>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                                <div style={{ marginBottom: 24 }}>
                                    <Heading level={4} style={{ marginBottom: 12 }}>Profile Information</Heading>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <Text size="sm" color="muted">Name</Text>
                                            <Text>John Doe</Text>
                                        </div>
                                        <div>
                                            <Text size="sm" color="muted">Email</Text>
                                            <Text>john@example.com</Text>
                                        </div>
                                        <div>
                                            <Text size="sm" color="muted">Role</Text>
                                            <Text>Admin</Text>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Heading level={4} style={{ marginBottom: 12 }}>Permissions</Heading>
                                    <Text size="sm" color="muted">
                                        Permissions are managed through assigned roles.
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Example of how EntityDrawer works on web with a members list. Click a member to open the drawer.',
            },
        },
    },
};

export const DifferentSides: Story = {
    name: '↔️ Different Sides',
    render: () => (
        <div style={{ width: '100%', maxWidth: '600px' }}>
            <Heading level={3} style={{ marginBottom: 16, textAlign: 'center' }}>
                Drawer can slide from different directions
            </Heading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Card style={{ padding: 16, textAlign: 'center' }}>
                    <Text weight="medium" style={{ marginBottom: 8 }}>From Right (default)</Text>
                    <Text size="sm" color="muted">Desktop standard</Text>
                </Card>
                <Card style={{ padding: 16, textAlign: 'center' }}>
                    <Text weight="medium" style={{ marginBottom: 8 }}>From Left</Text>
                    <Text size="sm" color="muted">Alternative layout</Text>
                </Card>
                <Card style={{ padding: 16, textAlign: 'center' }}>
                    <Text weight="medium" style={{ marginBottom: 8 }}>From Bottom</Text>
                    <Text size="sm" color="muted">Mobile/tablet</Text>
                </Card>
                <Card style={{ padding: 16, textAlign: 'center' }}>
                    <Text weight="medium" style={{ marginBottom: 8 }}>From Top</Text>
                    <Text size="sm" color="muted">Special cases</Text>
                </Card>
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'EntityDrawer supports sliding from any direction based on your layout needs.',
            },
        },
    },
};
