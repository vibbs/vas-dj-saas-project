import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Breadcrumbs as WebBreadcrumbs } from './Breadcrumbs.web';
import { Breadcrumbs as NativeBreadcrumbs } from './Breadcrumbs.native';
import { BreadcrumbsProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Home, Folder, File, Settings, User } from 'lucide-react';

// Create a simple wrapper for Storybook to avoid renderer issues
const BreadcrumbsStoryComponent = React.forwardRef<any, BreadcrumbsProps>((props, _ref) => {
  return <Breadcrumbs {...props} />;
});
BreadcrumbsStoryComponent.displayName = 'Breadcrumbs';

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Smartphones', href: '/products/electronics/smartphones' },
  { label: 'iPhone 15 Pro', href: '/products/electronics/smartphones/iphone-15-pro' },
];

const sampleItemsWithIcons = [
  { label: 'Home', href: '/', icon: <Home size={14} /> },
  { label: 'Documents', href: '/documents', icon: <Folder size={14} /> },
  { label: 'Projects', href: '/documents/projects', icon: <Folder size={14} /> },
  { label: 'Report.pdf', href: '/documents/projects/report.pdf', icon: <File size={14} /> },
];

const meta: Meta<BreadcrumbsProps> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: BreadcrumbsStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Breadcrumbs Component

A unified breadcrumbs navigation component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Smart Truncation**: Automatically handles long breadcrumb trails with ellipsis
- **Icon Support**: Built-in support for icons in breadcrumb items
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML nav element with semantic structure and Lucide icons
- **React Native**: TouchableOpacity components with Unicode separators

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Breadcrumbs } from '@vas-dj-saas/ui';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
];

<Breadcrumbs 
  items={items}
  onItemClick={(item, index) => navigate(item.href)}
/>
\`\`\`

### With Icons and Custom Configuration
\`\`\`tsx
import { Breadcrumbs } from '@vas-dj-saas/ui';
import { Home, Folder } from 'lucide-react';

const items = [
  { label: 'Home', href: '/', icon: <Home size={14} /> },
  { label: 'Documents', href: '/documents', icon: <Folder size={14} /> },
  { label: 'Current File' },
];

<Breadcrumbs 
  items={items}
  showHomeIcon={true}
  maxItems={4}
  size="lg"
  variant="minimal"
  onItemClick={(item) => router.push(item.href)}
/>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<Breadcrumbs 
  items={items}
  onItemPress={(item) => navigation.navigate(item.href)}
/>

// Web
<Breadcrumbs 
  items={items}
  onItemClick={(item) => window.location.href = item.href}
/>
\`\`\`

## Benefits

✅ **Smart Truncation** - Intelligent ellipsis for long paths  
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
        <div style={{ maxWidth: '800px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: 'Array of breadcrumb items with label, href, and optional icon',
    },
    separator: {
      control: { type: 'text' },
      description: 'Custom separator between breadcrumb items',
    },
    showHomeIcon: {
      control: { type: 'boolean' },
      description: 'Show home icon for the first item',
    },
    maxItems: {
      control: { type: 'number', min: 3, max: 10 },
      description: 'Maximum number of items to show before truncating',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the breadcrumbs component',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal'],
      description: 'Visual style variant',
    },
    onItemClick: {
      action: 'item-clicked (web)',
      description: 'Web click handler for breadcrumb items',
    },
    onItemPress: {
      action: 'item-pressed (native)',
      description: 'React Native press handler for breadcrumb items',
    },
  },
  args: {
    items: sampleItems,
    size: 'md',
    variant: 'default',
    showHomeIcon: false,
    maxItems: undefined,
  },
};

export default meta;
type Story = StoryObj<BreadcrumbsProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    items: sampleItems,
    onItemClick: (item, index) => console.log('Web item clicked:', item, index),
    onItemPress: (item, index) => console.log('Native item pressed:', item, index),
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
          <WebBreadcrumbs {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML nav with semantic structure<br/>
            Lucide icons & hover effects
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
          <NativeBreadcrumbs {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with Unicode separators<br/>
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
    items: sampleItems.slice(0, 4),
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized breadcrumb components.',
      },
    },
  },
};

// Different scenarios
export const BreadcrumbScenarios: Story = {
  name: '📄 Breadcrumb Scenarios',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Breadcrumb Scenarios</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Scenarios */}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Simple Path</div>
              <WebBreadcrumbs 
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Current Page' },
                ]}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Icons</div>
              <WebBreadcrumbs items={sampleItemsWithIcons} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Long Path (Truncated)</div>
              <WebBreadcrumbs items={sampleItems} maxItems={4} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Home Icon</div>
              <WebBreadcrumbs 
                items={sampleItems.slice(0, 3)}
                showHomeIcon={true}
              />
            </div>
          </div>
        </div>

        {/* React Native Scenarios */}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Simple Path</div>
              <NativeBreadcrumbs 
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Current Page' },
                ]}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Icons</div>
              <NativeBreadcrumbs items={sampleItemsWithIcons} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Long Path (Truncated)</div>
              <NativeBreadcrumbs items={sampleItems} maxItems={4} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Home Icon</div>
              <NativeBreadcrumbs 
                items={sampleItems.slice(0, 3)}
                showHomeIcon={true}
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
        story: 'Different breadcrumb scenarios including simple paths, icons, truncation, and home icon display.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Breadcrumbs Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Variants */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebBreadcrumbs variant="default" items={sampleItems.slice(0, 3)} />
            <WebBreadcrumbs variant="minimal" items={sampleItems.slice(0, 3)} />
          </div>
        </div>

        {/* React Native Variants */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeBreadcrumbs variant="default" items={sampleItems.slice(0, 3)} />
            <NativeBreadcrumbs variant="minimal" items={sampleItems.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available breadcrumbs variants shown side by side for web and React Native platforms using the unified theme system.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Breadcrumbs Sizes - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Sizes */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebBreadcrumbs size="sm" items={sampleItems.slice(0, 3)} />
            <WebBreadcrumbs size="md" items={sampleItems.slice(0, 3)} />
            <WebBreadcrumbs size="lg" items={sampleItems.slice(0, 3)} />
          </div>
        </div>

        {/* React Native Sizes */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeBreadcrumbs size="sm" items={sampleItems.slice(0, 3)} />
            <NativeBreadcrumbs size="md" items={sampleItems.slice(0, 3)} />
            <NativeBreadcrumbs size="lg" items={sampleItems.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available breadcrumbs sizes shown side by side with consistent spacing and typography across platforms.',
      },
    },
  },
};