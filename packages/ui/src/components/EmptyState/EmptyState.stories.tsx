import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EmptyState } from './EmptyState';
import { EmptyState as WebEmptyState } from './EmptyState.web';
import { EmptyState as NativeEmptyState } from './EmptyState.native';
import { EmptyStateProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const EmptyStateStoryComponent = React.forwardRef<any, EmptyStateProps>((props, _ref) => {
  return <EmptyState {...props} />;
});
EmptyStateStoryComponent.displayName = 'EmptyState';

const meta: Meta<EmptyStateProps> = {
  title: 'Components/EmptyState',
  component: EmptyStateStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform EmptyState Component

A unified empty state component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Flexible Content**: Support for title, description, icons, images, and actions
- **Multiple Variants**: Default, minimal, and illustration styles
- **Flexible Sizing**: Small, medium, and large size options
- **Custom Actions**: Support for call-to-action buttons and links
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Custom Content**: Full customization with children prop

## Platform Implementations
- **Web**: Div-based layout with CSS flexbox and semantic structure
- **React Native**: View-based layout with Text components and proper accessibility

## Usage Examples

### Basic Usage
\`\`\`tsx
import { EmptyState } from '@vas-dj-saas/ui';

<EmptyState
  title="No items found"
  description="Try adjusting your search criteria"
/>
\`\`\`

### With Custom Icon
\`\`\`tsx
<EmptyState
  icon={<SearchIcon />}
  title="No search results"
  description="We couldn't find anything matching your search"
  action={<Button>Clear Search</Button>}
/>
\`\`\`

### With Custom Image
\`\`\`tsx
<EmptyState
  image={<img src="/empty-inbox.svg" alt="Empty inbox" />}
  title="Your inbox is empty"
  description="When you receive messages, they'll appear here"
  action={<Button variant="primary">Compose Message</Button>}
/>
\`\`\`

### Minimal Variant
\`\`\`tsx
<EmptyState
  variant="minimal"
  title="No data"
  description="Add some items to get started"
/>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Rich Content** - Icons, images, actions, and custom content  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '600px', maxWidth: '100%', minHeight: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Main title text',
    },
    description: {
      control: { type: 'text' },
      description: 'Descriptive text below the title',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the empty state',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal', 'illustration'],
      description: 'Visual variant style',
    },
    children: {
      control: { type: 'text' },
      description: 'Custom content (overrides title/description/icon)',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    title: 'No data available',
    description: 'There are no items to display at the moment. Try adding some content or adjusting your filters.',
    size: 'md',
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<EmptyStateProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    action: (
      <Button variant="primary">
        Add Item
      </Button>
    ),
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
        maxWidth: '1000px',
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
          <div style={{ width: '100%', maxWidth: '400px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Div-based layout with CSS<br/>
            Semantic HTML structure
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
          <div style={{ width: '100%', maxWidth: '400px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <NativeEmptyState {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            View-based layout<br/>
            Native Text components
          </div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center', 
        maxWidth: '600px',
        lineHeight: '1.5',
        fontStyle: 'italic'
      }}>
        ✨ Both implementations provide clear empty states but use platform-optimized layouts and components.
      </div>
    </div>
  ),
  args: {
    title: 'No notifications',
    description: 'When you have new notifications, they will appear here',
    action: (
      <Button variant="primary" size="sm">
        Enable Notifications
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized empty states.',
      },
    },
  },
};

// Different variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>EmptyState Variants</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '1200px'
      }}>
        {/* Default Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Default</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              variant="default"
              title="No items found"
              description="Your list is currently empty"
              action={
                <Button variant="primary" size="sm">
                  Add Item
                </Button>
              }
            />
          </div>
        </div>

        {/* Minimal Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Minimal</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              variant="minimal"
              title="No data"
              description="Add some content to get started"
            />
          </div>
        </div>

        {/* Illustration Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Illustration</h4>
          <div style={{ width: '100%' }}>
            <WebEmptyState
              variant="illustration"
              title="Welcome!"
              description="This is your dashboard. Add content to see it here."
              action={
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available EmptyState variants: default (with icon), minimal (text only), and illustration (with background).',
      },
    },
  },
};

// Different sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>EmptyState Sizes</h3>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Small Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Small Size</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              size="sm"
              title="No results"
              description="Try a different search term"
              action={
                <Button variant="secondary" size="sm">
                  Clear
                </Button>
              }
            />
          </div>
        </div>

        {/* Medium Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Medium Size (Default)</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              size="md"
              title="No messages"
              description="Your inbox is empty. New messages will appear here when they arrive."
              action={
                <Button variant="primary" size="sm">
                  Compose
                </Button>
              }
            />
          </div>
        </div>

        {/* Large Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Large Size</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              size="lg"
              title="Welcome to Your Dashboard"
              description="This is where you'll manage all your projects and see important updates. Get started by creating your first project or importing existing data."
              action={
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="primary" size="lg">
                    Create Project
                  </Button>
                  <Button variant="outline" size="lg">
                    Import Data
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different EmptyState sizes from small to large with appropriate scaling of icons, text, and spacing.',
      },
    },
  },
};

// Custom content showcase
export const CustomContent: Story = {
  name: '🎯 Custom Content',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Custom Content Examples</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '1000px'
      }}>
        {/* Custom Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Custom Icon</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              icon={
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px'
                }}>
                  🔍
                </div>
              }
              title="No search results"
              description="Try adjusting your search criteria"
              action={
                <Button variant="destructive" size="sm">
                  Clear Search
                </Button>
              }
            />
          </div>
        </div>

        {/* Custom Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Custom Image</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              image={
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  📊
                </div>
              }
              title="No analytics data"
              description="Connect your accounts to start seeing analytics"
              action={
                <Button variant="primary" size="sm">
                  Connect Account
                </Button>
              }
            />
          </div>
        </div>

        {/* Multiple Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Multiple Actions</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              title="No projects yet"
              description="Get started by creating a new project or importing from another platform"
              action={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <Button variant="primary" size="sm">
                    New Project
                  </Button>
                  <Button variant="outline" size="sm">
                    Import Project
                  </Button>
                </div>
              }
            />
          </div>
        </div>

        {/* Completely Custom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Completely Custom</h4>
          <div style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState>
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  Ready to Launch?
                </h2>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.9 }}>
                  Your project is configured and ready to go!
                </p>
                <Button variant="secondary">
                  Deploy Now
                </Button>
              </div>
            </WebEmptyState>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of custom content including custom icons, images, multiple actions, and completely custom layouts.',
      },
    },
  },
};

// Use cases showcase
export const UseCases: Story = {
  name: '💼 Common Use Cases',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Common EmptyState Use Cases</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '1000px'
      }}>
        {/* Empty List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Empty List/Table</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              size="sm"
              variant="minimal"
              title="No items found"
              description="Add your first item to get started"
              action={
                <Button variant="primary" size="sm">
                  Add Item
                </Button>
              }
            />
          </div>
        </div>

        {/* Search Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Search Results</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              size="sm"
              icon={
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px'
                }}>
                  🔍
                </div>
              }
              title="No results found"
              description="Try different keywords or filters"
              action={
                <Button variant="outline" size="sm">
                  Clear Search
                </Button>
              }
            />
          </div>
        </div>

        {/* Error State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Error State</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              icon={
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px'
                }}>
                  ⚠️
                </div>
              }
              title="Something went wrong"
              description="We couldn't load your data. Please try again."
              action={
                <Button variant="destructive" size="sm">
                  Try Again
                </Button>
              }
            />
          </div>
        </div>

        {/* Onboarding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Onboarding</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebEmptyState
              variant="illustration"
              title="Welcome!"
              description="Let's set up your account and get you started"
              action={
                <Button variant="primary">
                  Get Started
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common use cases for EmptyState including empty lists, search results, error states, and onboarding.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Theme Comparison</h3>
      
      {/* Default Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <WebEmptyState
                title="Your dashboard awaits"
                description="Start by adding your first project or connecting your existing tools to see insights and analytics here."
                action={
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="primary" size="sm">
                      Add Project
                    </Button>
                    <Button variant="outline" size="sm">
                      Connect Tools
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          🌙 Dark Theme
        </h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px'
          }}>
            <div style={{ borderRadius: '8px', border: '1px solid #374151' }}>
              <WebEmptyState
                title="Your dashboard awaits"
                description="Start by adding your first project or connecting your existing tools to see insights and analytics here."
                action={
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="primary" size="sm">
                      Add Project
                    </Button>
                    <Button variant="outline" size="sm">
                      Connect Tools
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'EmptyState appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};