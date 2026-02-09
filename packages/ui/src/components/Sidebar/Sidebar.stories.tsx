import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Sidebar } from './Sidebar';
import { Sidebar as WebSidebar } from './Sidebar.web';
import { Sidebar as NativeSidebar } from './Sidebar.native';
import { SidebarProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Home, Users, Settings, FileText, BarChart3, Mail, Calendar, Search, Bell, User } from 'lucide-react';

// Create a simple wrapper for Storybook to avoid renderer issues
const SidebarStoryComponent = React.forwardRef<any, SidebarProps>((props, _ref) => {
  return <Sidebar {...props} />;
});
SidebarStoryComponent.displayName = 'Sidebar';

const basicItems = [
  { id: 'home', label: 'Home', icon: <Home size={18} />, active: true },
  { id: 'users', label: 'Users', icon: <Users size={18} />, badge: '5' },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const nestedItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, active: true },
  {
    id: 'content',
    label: 'Content',
    icon: <FileText size={18} />,
    children: [
      { id: 'posts', label: 'Posts', href: '/posts' },
      { id: 'pages', label: 'Pages', href: '/pages' },
      { id: 'media', label: 'Media Library', href: '/media' },
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users size={18} />,
    badge: '12',
    children: [
      { id: 'all-users', label: 'All Users', href: '/users' },
      { id: 'roles', label: 'Roles & Permissions', href: '/users/roles' },
      { id: 'profile', label: 'Profile Settings', href: '/users/profile' },
    ]
  },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const itemsWithStates = [
  { id: 'home', label: 'Home', icon: <Home size={18} />, active: true },
  { id: 'mail', label: 'Mail', icon: <Mail size={18} />, badge: '3' },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { id: 'search', label: 'Search', icon: <Search size={18} />, disabled: true },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: '99+' },
];

const meta: Meta<SidebarProps> = {
  title: 'Navigation/Sidebar',
  component: SidebarStoryComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Cross-Platform Sidebar Component

A unified sidebar navigation component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Collapsible**: Support for collapsed/expanded states with smooth transitions
- **Nested Navigation**: Support for hierarchical menu structures
- **Badges & Icons**: Built-in support for badges and custom icons
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML nav element with CSS-based styling and Lucide icons
- **React Native**: ScrollView with TouchableOpacity components

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Sidebar } from '@vas-dj-saas/ui';

const items = [
  { id: 'home', label: 'Home', icon: <Home size={18} />, active: true },
  { id: 'users', label: 'Users', icon: <Users size={18} />, badge: '5' },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

<Sidebar 
  items={items}
  onItemClick={(item) => navigate(item.href)}
/>
\`\`\`

### With Nested Items and Collapse
\`\`\`tsx
import { Sidebar } from '@vas-dj-saas/ui';

const nestedItems = [
  { 
    id: 'content', 
    label: 'Content', 
    icon: <FileText size={18} />,
    children: [
      { id: 'posts', label: 'Posts', href: '/posts' },
      { id: 'pages', label: 'Pages', href: '/pages' },
    ]
  },
];

<Sidebar 
  items={nestedItems}
  collapsed={isCollapsed}
  collapsible={true}
  onToggle={setIsCollapsed}
  width={300}
  variant="floating"
/>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<Sidebar 
  items={items}
  onItemPress={(item) => navigation.navigate(item.href)}
/>

// Web
<Sidebar 
  items={items}
  onItemClick={(item) => router.push(item.href)}
/>
\`\`\`

## Benefits

✅ **Collapsible Navigation** - Space-efficient collapsed states  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ height: '600px', display: 'flex' }}>
          <Story />
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
            <h3>Main Content Area</h3>
            <p>This is where your main application content would go.</p>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: 'Array of sidebar items with id, label, icon, and optional properties',
    },
    collapsed: {
      control: { type: 'boolean' },
      description: 'Whether the sidebar is in collapsed state',
    },
    collapsible: {
      control: { type: 'boolean' },
      description: 'Whether the sidebar can be collapsed',
    },
    position: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the sidebar',
    },
    overlay: {
      control: { type: 'boolean' },
      description: 'Whether sidebar should overlay content (mobile-style)',
    },
    width: {
      control: { type: 'number', min: 200, max: 400 },
      description: 'Width of the expanded sidebar',
    },
    collapsedWidth: {
      control: { type: 'number', min: 40, max: 100 },
      description: 'Width of the collapsed sidebar',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal', 'floating'],
      description: 'Visual style variant',
    },
    onItemClick: {
      action: 'item-clicked (web)',
      description: 'Web click handler for sidebar items',
    },
    onItemPress: {
      action: 'item-pressed (native)',
      description: 'React Native press handler for sidebar items',
    },
    onToggle: {
      action: 'toggled',
      description: 'Handler for collapse/expand toggle',
    },
  },
  args: {
    items: basicItems,
    collapsed: false,
    collapsible: true,
    position: 'left',
    overlay: false,
    width: 280,
    collapsedWidth: 64,
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<SidebarProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    items: basicItems,
    onItemClick: (item) => console.log('Web item clicked:', item),
    onItemPress: (item) => console.log('Native item pressed:', item),
    onToggle: (collapsed) => console.log('Sidebar toggled:', collapsed),
  },
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below. This story shows the current platform implementation in action.',
      },
    },
  },
};

// Platform comparison stories
export const PlatformComparison: Story = {
  name: '📱 Platform Comparison',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '800px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
          Side-by-Side Platform Comparison
        </h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
          The same component props render different platform implementations
        </p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
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
            🌐 Web Platform
          </div>
          <div style={{ height: '400px', display: 'flex' }}>
            <WebSidebar {...args} />
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
              Content area
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML nav with Lucide icons<br />
            Hover effects & smooth transitions
          </div>
        </div>

        {/* React Native Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            textAlign: 'center',
            width: '100%'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ height: '400px', display: 'flex' }}>
            <NativeSidebar {...args} />
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
              Content area
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            ScrollView with TouchableOpacity<br />
            Platform-appropriate touch feedback
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: '1.5',
        fontStyle: 'italic'
      }}>
        ✨ Both implementations use the same props and theme system, but render with platform-optimized components and interactions.
      </div>
    </div>
  ),
  args: {
    items: basicItems,
    width: 240,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized sidebar components.',
      },
    },
  },
};

// Nested navigation showcase
export const NestedNavigation: Story = {
  name: '🗂️ Nested Navigation',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Hierarchical Menu Structure</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Nested */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ height: '450px', display: 'flex' }}>
            <WebSidebar
              items={nestedItems}
              width={280}
              header={<div style={{ fontWeight: 600, fontSize: 16 }}>Admin Panel</div>}
            />
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
              Main content with nested sidebar navigation
            </div>
          </div>
        </div>

        {/* React Native Nested */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ height: '450px', display: 'flex' }}>
            <NativeSidebar
              items={nestedItems}
              width={280}
              header={<span style={{ fontWeight: '600', fontSize: 16 }}>Admin Panel</span>}
            />
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
              Main content with nested sidebar navigation
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of hierarchical navigation with expandable/collapsible menu items and sub-menus.',
      },
    },
  },
};

// Collapsed state showcase
export const CollapsedState: Story = {
  name: '🔄 Collapsed State',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Expanded vs Collapsed States</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2'
          }}>
            🌐 Web Platform
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Expanded</div>
              <WebSidebar
                items={basicItems}
                collapsed={false}
                width={200}
                style={{ height: '300px' }}
                header={<div style={{ fontSize: 14, fontWeight: 600 }}>Menu</div>}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Collapsed</div>
              <WebSidebar
                items={basicItems}
                collapsed={true}
                collapsedWidth={60}
                style={{ height: '300px' }}
                header={<div style={{ fontSize: 14, fontWeight: 600 }}>Menu</div>}
              />
            </div>
          </div>
        </div>

        {/* React Native States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2'
          }}>
            📱 React Native Platform
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Expanded</div>
              <NativeSidebar
                items={basicItems}
                collapsed={false}
                width={200}
                style={{ height: 300 }}
                header={<span style={{ fontSize: 14, fontWeight: '600' }}>Menu</span>}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Collapsed</div>
              <NativeSidebar
                items={basicItems}
                collapsed={true}
                collapsedWidth={60}
                style={{ height: 300 }}
                header={<span style={{ fontSize: 14, fontWeight: '600' }}>Menu</span>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of expanded and collapsed sidebar states showing how the component adapts to save space while maintaining functionality.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Sidebar Variants</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Default</div>
              <WebSidebar variant="default" items={basicItems} width={180} style={{ height: '200px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Minimal</div>
              <WebSidebar variant="minimal" items={basicItems} width={180} style={{ height: '200px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Floating</div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
                <WebSidebar variant="floating" items={basicItems} width={180} style={{ height: '200px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* React Native Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Default</div>
              <NativeSidebar variant="default" items={basicItems} width={180} style={{ height: 200 }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Minimal</div>
              <NativeSidebar variant="minimal" items={basicItems} width={180} style={{ height: 200 }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Floating</div>
              <div style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
                <NativeSidebar variant="floating" items={basicItems} width={180} style={{ height: 200 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available sidebar variants (default, minimal, floating) shown side by side for web and React Native platforms.',
      },
    },
  },
};