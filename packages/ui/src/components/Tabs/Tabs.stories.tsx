import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Tabs as WebTabs, TabsList as WebTabsList, TabsTrigger as WebTabsTrigger, TabsContent as WebTabsContent } from './Tabs.web';
import { Tabs as NativeTabs, TabsList as NativeTabsList, TabsTrigger as NativeTabsTrigger, TabsContent as NativeTabsContent } from './Tabs.native';
import { TabsProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

const TabsStoryComponent: React.FC<Partial<TabsProps>> = (props) => {
  return (
    <Tabs {...props} defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Account Settings</h3>
          <p style={{ margin: 0, color: '#666' }}>Manage your account settings and preferences.</p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Password Settings</h3>
          <p style={{ margin: 0, color: '#666' }}>Update your password and security settings.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>General Settings</h3>
          <p style={{ margin: 0, color: '#666' }}>Configure application preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const meta: Meta<TabsProps> = {
  title: 'Components/Tabs',
  component: TabsStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Tabs Component

A unified Tabs component system that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses createPlatformComponent utility
- **Controlled & Uncontrolled**: Supports both patterns
- **Theme Integration**: Uses unified design tokens
- **Accessibility**: Proper ARIA attributes and React Native accessibility
- **Composable**: Tabs, TabsList, TabsTrigger, TabsContent sub-components

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@vas-dj-saas/ui';

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account settings content
  </TabsContent>
  <TabsContent value="password">
    Password settings content
  </TabsContent>
</Tabs>
\`\`\`

### Controlled Tabs
\`\`\`tsx
const [activeTab, setActiveTab] = useState('account');

<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* ... */}
</Tabs>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere
✅ **Automatic Platform Detection** - No manual platform checks
✅ **Consistent API** - Same props work on both platforms
✅ **Theme Consistency** - Unified design system
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '20px', minWidth: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TabsProps>;

export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: () => <TabsStoryComponent defaultValue="account" />,
};

export const PlatformComparison: Story = {
  name: '📱 Platform Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', minWidth: '800px' }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
          Side-by-Side Platform Comparison
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
      }}>
        {/* Web Implementation */}
        <div>
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            🌐 Web Platform
          </div>
          <WebTabs defaultValue="account">
            <WebTabsList>
              <WebTabsTrigger value="account">Account</WebTabsTrigger>
              <WebTabsTrigger value="password">Password</WebTabsTrigger>
              <WebTabsTrigger value="settings">Settings</WebTabsTrigger>
            </WebTabsList>
            <WebTabsContent value="account">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>Account Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Manage your account</p>
              </div>
            </WebTabsContent>
            <WebTabsContent value="password">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>Password Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Update your password</p>
              </div>
            </WebTabsContent>
            <WebTabsContent value="settings">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>General Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Configure preferences</p>
              </div>
            </WebTabsContent>
          </WebTabs>
        </div>

        {/* React Native Implementation */}
        <div>
          <div style={{
            padding: '12px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            📱 React Native Platform
          </div>
          <NativeTabs defaultValue="account">
            <NativeTabsList>
              <NativeTabsTrigger value="account">Account</NativeTabsTrigger>
              <NativeTabsTrigger value="password">Password</NativeTabsTrigger>
              <NativeTabsTrigger value="settings">Settings</NativeTabsTrigger>
            </NativeTabsList>
            <NativeTabsContent value="account">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>Account Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Manage your account</p>
              </div>
            </NativeTabsContent>
            <NativeTabsContent value="password">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>Password Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Update your password</p>
              </div>
            </NativeTabsContent>
            <NativeTabsContent value="settings">
              <div style={{ padding: '16px', fontSize: '12px' }}>
                <strong>General Settings</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>Configure preferences</p>
              </div>
            </NativeTabsContent>
          </NativeTabs>
        </div>
      </div>
    </div>
  ),
};

export const DisabledTabs: Story = {
  name: '🚫 Disabled Tabs',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: '800px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
      }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2', marginBottom: '12px' }}>🌐 Web</p>
          <WebTabs defaultValue="account">
            <WebTabsList>
              <WebTabsTrigger value="account">Account</WebTabsTrigger>
              <WebTabsTrigger value="password" disabled>Password (Disabled)</WebTabsTrigger>
              <WebTabsTrigger value="settings">Settings</WebTabsTrigger>
            </WebTabsList>
            <WebTabsContent value="account">
              <div style={{ padding: '12px', fontSize: '12px' }}>Account content</div>
            </WebTabsContent>
            <WebTabsContent value="settings">
              <div style={{ padding: '12px', fontSize: '12px' }}>Settings content</div>
            </WebTabsContent>
          </WebTabs>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '12px' }}>📱 Native</p>
          <NativeTabs defaultValue="account">
            <NativeTabsList>
              <NativeTabsTrigger value="account">Account</NativeTabsTrigger>
              <NativeTabsTrigger value="password" disabled>Password (Disabled)</NativeTabsTrigger>
              <NativeTabsTrigger value="settings">Settings</NativeTabsTrigger>
            </NativeTabsList>
            <NativeTabsContent value="account">
              <div style={{ padding: '12px', fontSize: '12px' }}>Account content</div>
            </NativeTabsContent>
            <NativeTabsContent value="settings">
              <div style={{ padding: '12px', fontSize: '12px' }}>Settings content</div>
            </NativeTabsContent>
          </NativeTabs>
        </div>
      </div>
    </div>
  ),
};

export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', minWidth: '800px' }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', textAlign: 'center' }}>☀️ Default Theme</h4>
        <ThemeProvider defaultTheme="default">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>🌐 Web</p>
              <WebTabs defaultValue="tab1">
                <WebTabsList>
                  <WebTabsTrigger value="tab1">Tab 1</WebTabsTrigger>
                  <WebTabsTrigger value="tab2">Tab 2</WebTabsTrigger>
                </WebTabsList>
                <WebTabsContent value="tab1">
                  <div style={{ padding: '12px', fontSize: '11px' }}>Content 1</div>
                </WebTabsContent>
                <WebTabsContent value="tab2">
                  <div style={{ padding: '12px', fontSize: '11px' }}>Content 2</div>
                </WebTabsContent>
              </WebTabs>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '8px' }}>📱 Native</p>
              <NativeTabs defaultValue="tab1">
                <NativeTabsList>
                  <NativeTabsTrigger value="tab1">Tab 1</NativeTabsTrigger>
                  <NativeTabsTrigger value="tab2">Tab 2</NativeTabsTrigger>
                </NativeTabsList>
                <NativeTabsContent value="tab1">
                  <div style={{ padding: '12px', fontSize: '11px' }}>Content 1</div>
                </NativeTabsContent>
                <NativeTabsContent value="tab2">
                  <div style={{ padding: '12px', fontSize: '11px' }}>Content 2</div>
                </NativeTabsContent>
              </NativeTabs>
            </div>
          </div>
        </ThemeProvider>
      </div>

      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', textAlign: 'center' }}>🌙 Dark Theme</h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#bfdbfe', marginBottom: '8px' }}>🌐 Web</p>
              <WebTabs defaultValue="tab1">
                <WebTabsList>
                  <WebTabsTrigger value="tab1">Tab 1</WebTabsTrigger>
                  <WebTabsTrigger value="tab2">Tab 2</WebTabsTrigger>
                </WebTabsList>
                <WebTabsContent value="tab1">
                  <div style={{ padding: '12px', fontSize: '11px', color: '#fff' }}>Content 1</div>
                </WebTabsContent>
                <WebTabsContent value="tab2">
                  <div style={{ padding: '12px', fontSize: '11px', color: '#fff' }}>Content 2</div>
                </WebTabsContent>
              </WebTabs>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#e9d5ff', marginBottom: '8px' }}>📱 Native</p>
              <NativeTabs defaultValue="tab1">
                <NativeTabsList>
                  <NativeTabsTrigger value="tab1">Tab 1</NativeTabsTrigger>
                  <NativeTabsTrigger value="tab2">Tab 2</NativeTabsTrigger>
                </NativeTabsList>
                <NativeTabsContent value="tab1">
                  <div style={{ padding: '12px', fontSize: '11px', color: '#fff' }}>Content 1</div>
                </NativeTabsContent>
                <NativeTabsContent value="tab2">
                  <div style={{ padding: '12px', fontSize: '11px', color: '#fff' }}>Content 2</div>
                </NativeTabsContent>
              </NativeTabs>
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
};
