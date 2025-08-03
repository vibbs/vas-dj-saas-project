import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ListItem } from './ListItem';
import { ListItem as WebListItem } from './ListItem.web';
import { ListItem as NativeListItem } from './ListItem.native';
import { ListItemProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const ListItemStoryComponent = React.forwardRef<any, ListItemProps>((props, _ref) => {
  return <ListItem {...props} />;
});
ListItemStoryComponent.displayName = 'ListItem';

const meta: Meta<ListItemProps> = {
  title: 'Components/Data Display/ListItem',
  component: ListItemStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform ListItem Component

A unified list item component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Structured Content**: Support for title, subtitle, description, and custom content
- **Leading & Trailing Elements**: Flexible placement of avatars, icons, and actions
- **Interactive States**: Support for selection, hover, and press interactions
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Visual Options**: Dense layout, dividers, multiline text support
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: Div-based layout with CSS hover effects and semantic structure
- **React Native**: View-based layout with TouchableOpacity for interactions

## Usage Examples

### Basic Usage
\`\`\`tsx
import { ListItem } from '@vas-dj-saas/ui';

<ListItem
  title="John Doe"
  subtitle="Software Engineer"
  description="Passionate about creating great user experiences"
/>
\`\`\`

### With Avatar and Actions
\`\`\`tsx
<ListItem
  avatar={<Avatar src="/user.jpg" />}
  title="Jane Smith"
  subtitle="Product Manager"
  trailing={<Button variant="outline">Contact</Button>}
  onClick={() => console.log('Selected user')}
/>
\`\`\`

### Custom Content
\`\`\`tsx
<ListItem onClick={() => console.log('Clicked')}>
  <div>
    <h3>Custom Content</h3>
    <p>You can provide any custom content here</p>
  </div>
</ListItem>
\`\`\`

### Dense Layout
\`\`\`tsx
<ListItem
  title="Dense Item"
  subtitle="Compact layout"
  dense={true}
  divider={true}
/>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Rich Content** - Support for structured and custom content  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '400px', maxWidth: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Primary title text',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Secondary subtitle text',
    },
    description: {
      control: { type: 'text' },
      description: 'Additional description text',
    },
    selected: {
      control: { type: 'boolean' },
      description: 'Selection state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable interactions',
    },
    divider: {
      control: { type: 'boolean' },
      description: 'Show bottom divider line',
    },
    dense: {
      control: { type: 'boolean' },
      description: 'Use compact layout',
    },
    multiline: {
      control: { type: 'boolean' },
      description: 'Allow text to wrap to multiple lines',
    },
    children: {
      control: { type: 'text' },
      description: 'Custom content (overrides title/subtitle/description)',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler',
    },
    onLongPress: {
      action: 'long pressed',
      description: 'Long press handler',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    title: 'List Item Title',
    subtitle: 'Secondary text information',
    description: 'Additional descriptive text that provides more context about this item',
    selected: false,
    disabled: false,
    divider: false,
    dense: false,
    multiline: false,
  },
};

export default meta;
type Story = StoryObj<ListItemProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    onClick: () => console.log('List item clicked!'),
    onPress: () => console.log('List item pressed!'),
    onLongPress: () => console.log('List item long pressed!'),
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
        maxWidth: '800px',
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
          <div style={{ width: '100%', maxWidth: '300px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem {...args} divider />
            <WebListItem
              title="Jane Smith"
              subtitle="Designer"
              description="Creative professional"
              divider
            />
            <WebListItem
              title="Bob Johnson"
              subtitle="Developer"
              description="Full-stack engineer"
            />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Div-based layout with CSS<br />
            Hover effects & semantic HTML
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
          <div style={{ width: '100%', maxWidth: '300px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <NativeListItem {...args} divider />
            <NativeListItem
              title="Jane Smith"
              subtitle="Designer"
              description="Creative professional"
              divider
            />
            <NativeListItem
              title="Bob Johnson"
              subtitle="Developer"
              description="Full-stack engineer"
            />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            View-based layout<br />
            TouchableOpacity interactions
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
        ✨ Both implementations provide structured list items but use platform-optimized layouts and interactions.
      </div>
    </div>
  ),
  args: {
    title: 'John Doe',
    subtitle: 'Software Engineer',
    description: 'Building amazing user experiences',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized list items.',
      },
    },
  },
};

// Content variations showcase
export const ContentVariations: Story = {
  name: '📄 Content Variations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Content Configurations</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Basic Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Basic Content</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem title="Title Only" divider />
            <WebListItem title="With Subtitle" subtitle="Secondary text" divider />
            <WebListItem
              title="Full Content"
              subtitle="With subtitle"
              description="And additional description text"
            />
          </div>
        </div>

        {/* With Leading Elements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>With Leading Elements</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              avatar={
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  JD
                </div>
              }
              title="John Doe"
              subtitle="With Avatar"
              divider
            />
            <WebListItem
              leading={
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  ✓
                </div>
              }
              title="With Icon"
              subtitle="Leading icon element"
              divider
            />
            <WebListItem
              title="No Leading"
              subtitle="Standard item"
            />
          </div>
        </div>

        {/* With Trailing Elements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>With Trailing Elements</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              title="With Button"
              subtitle="Trailing action"
              trailing={
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              }
              divider
            />
            <WebListItem
              title="With Badge"
              subtitle="Status indicator"
              trailing={
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  3
                </span>
              }
              divider
            />
            <WebListItem
              title="With Text"
              subtitle="Right-aligned info"
              trailing={
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  2 hours ago
                </span>
              }
            />
          </div>
        </div>

        {/* Custom Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Custom Content</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem divider>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  📁
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '14px' }}>Project Files</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    Last modified: Today at 3:42 PM
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: '10px'
                    }}>
                      TypeScript
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      fontSize: '10px'
                    }}>
                      React
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                  <div>1.2 MB</div>
                  <div>42 files</div>
                </div>
              </div>
            </WebListItem>
            <WebListItem>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Completely Custom</h3>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                  You can put any content here including complex layouts, forms, or interactive elements.
                </p>
              </div>
            </WebListItem>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different content configurations including basic text, leading/trailing elements, and completely custom content.',
      },
    },
  },
};

// States and options showcase
export const StatesAndOptions: Story = {
  name: '⚡ States & Options',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different States and Layout Options</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Interactive States</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              title="Normal State"
              subtitle="Default appearance"
              onClick={() => alert('Clicked!')}
              divider
            />
            <WebListItem
              title="Selected State"
              subtitle="Currently selected"
              selected={true}
              divider
            />
            <WebListItem
              title="Disabled State"
              subtitle="Cannot be interacted with"
              disabled={true}
            />
          </div>
        </div>

        {/* Layout Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Layout Options</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              title="Normal Spacing"
              subtitle="Standard padding and height"
              divider
            />
            <WebListItem
              title="Dense Layout"
              subtitle="Compact spacing"
              dense={true}
              divider
            />
            <WebListItem
              title="Multiline Text Support"
              subtitle="This subtitle can wrap to multiple lines when the multiline prop is enabled, allowing for longer content"
              description="And the description can also wrap to show more detailed information about the item without truncation"
              multiline={true}
            />
          </div>
        </div>

        {/* With Dividers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>With Dividers</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              title="First Item"
              subtitle="With bottom divider"
              divider
            />
            <WebListItem
              title="Middle Item"
              subtitle="Also with divider"
              divider
            />
            <WebListItem
              title="Last Item"
              subtitle="No divider needed"
            />
          </div>
        </div>

        {/* Interactive Example */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Interactive Example</h4>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <WebListItem
              avatar={
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  🎵
                </div>
              }
              title="Bohemian Rhapsody"
              subtitle="Queen • A Night at the Opera"
              trailing={
                <Button
                  variant="primary"
                  size="sm"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    minWidth: '32px'
                  }}
                >
                  ▶
                </Button>
              }
              onClick={() => alert('Playing song!')}
              onLongPress={() => alert('Long pressed for options!')}
              divider
            />
            <WebListItem
              avatar={
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  🎸
                </div>
              }
              title="Hotel California"
              subtitle="Eagles • Hotel California"
              trailing={
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  6:30
                </span>
              }
              onClick={() => alert('Playing song!')}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different states (normal, selected, disabled) and layout options (dense, multiline, dividers) with interactive examples.',
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
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
              <WebListItem
                avatar={
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    JD
                  </div>
                }
                title="John Doe"
                subtitle="Software Engineer"
                description="Building amazing user experiences with modern technology"
                trailing={
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Online
                  </span>
                }
                divider
              />
              <WebListItem
                title="Settings"
                subtitle="Configure your preferences"
                leading={
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    ⚙
                  </div>
                }
                selected={true}
              />
            </div>
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          🌙 Dark Theme
        </h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px'
          }}>
            <div style={{ border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
              <WebListItem
                avatar={
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    JD
                  </div>
                }
                title="John Doe"
                subtitle="Software Engineer"
                description="Building amazing user experiences with modern technology"
                trailing={
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Online
                  </span>
                }
                divider
              />
              <WebListItem
                title="Settings"
                subtitle="Configure your preferences"
                leading={
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    ⚙
                  </div>
                }
                selected={true}
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
        story: 'ListItem appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};