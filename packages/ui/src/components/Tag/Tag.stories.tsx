import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tag } from './Tag';
import { Tag as WebTag } from './Tag.web';
import { Tag as NativeTag } from './Tag.native';
import { TagProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const TagStoryComponent = React.forwardRef<any, TagProps>((props, _ref) => {
  return <Tag {...props} />;
});
TagStoryComponent.displayName = 'Tag';

const meta: Meta<TagProps> = {
  title: 'Components/Data Display/Tag',
  component: TagStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Tag Component

A unified tag/chip component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Multiple Variants**: Support for different semantic variants (primary, secondary, success, warning, danger, info)
- **Flexible Sizing**: Small, medium, and large size options
- **Interactive Elements**: Closable tags with remove functionality
- **Custom Icons**: Support for leading icons
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Visual Options**: Outlined and rounded styles

## Platform Implementations
- **Web**: Inline span with CSS styling and hover effects
- **React Native**: View-based layout with TouchableOpacity for interactions

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Tag } from '@vas-dj-saas/ui';

<Tag variant="primary">Primary Tag</Tag>
<Tag variant="success">Success Tag</Tag>
<Tag variant="warning">Warning Tag</Tag>
\`\`\`

### Closable Tags
\`\`\`tsx
<Tag 
  variant="primary" 
  closable 
  onClose={() => console.log('Tag closed')}
>
  Closable Tag
</Tag>
\`\`\`

### With Icons
\`\`\`tsx
<Tag 
  variant="info" 
  icon={<InfoIcon />}
>
  Tag with Icon
</Tag>
\`\`\`

### Interactive Tags
\`\`\`tsx
<Tag 
  variant="secondary" 
  onClick={() => console.log('Tag clicked')}
>
  Clickable Tag
</Tag>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Rich Variants** - Multiple semantic and visual options  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
      description: 'Visual style variant of the tag',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tag',
    },
    closable: {
      control: { type: 'boolean' },
      description: 'Show close button for removing the tag',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable tag interactions',
    },
    outlined: {
      control: { type: 'boolean' },
      description: 'Use outlined style instead of filled',
    },
    rounded: {
      control: { type: 'boolean' },
      description: 'Use fully rounded corners',
    },
    children: {
      control: { type: 'text' },
      description: 'Tag content (text or React nodes)',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when close button is pressed',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: 'Sample Tag',
    variant: 'default',
    size: 'md',
    closable: false,
    disabled: false,
    outlined: false,
    rounded: false,
  },
};

export default meta;
type Story = StoryObj<TagProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Tag',
    onClick: () => console.log('Tag clicked!'),
    onPress: () => console.log('Tag pressed!'),
    onClose: () => console.log('Tag closed!'),
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
        maxWidth: '600px'
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
        maxWidth: '600px',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <WebTag {...args} />
            <WebTag {...args} variant="primary" children="Primary" />
            <WebTag {...args} variant="success" children="Success" />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Inline span with CSS styling<br />
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <NativeTag {...args} />
            <NativeTag {...args} variant="primary" children="Primary" />
            <NativeTag {...args} variant="success" children="Success" />
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
        maxWidth: '500px',
        lineHeight: '1.5',
        fontStyle: 'italic'
      }}>
        ✨ Both implementations use the same props and theme system, but render with platform-optimized components and interactions.
      </div>
    </div>
  ),
  args: {
    children: 'Platform Tag',
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized tags.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Tag Variants</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Filled Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Filled Variants</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <WebTag variant="default">Default</WebTag>
            <WebTag variant="primary">Primary</WebTag>
            <WebTag variant="secondary">Secondary</WebTag>
            <WebTag variant="success">Success</WebTag>
            <WebTag variant="warning">Warning</WebTag>
            <WebTag variant="danger">Danger</WebTag>
            <WebTag variant="info">Info</WebTag>
          </div>
        </div>

        {/* Outlined Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Outlined Variants</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <WebTag variant="default" outlined>Default</WebTag>
            <WebTag variant="primary" outlined>Primary</WebTag>
            <WebTag variant="secondary" outlined>Secondary</WebTag>
            <WebTag variant="success" outlined>Success</WebTag>
            <WebTag variant="warning" outlined>Warning</WebTag>
            <WebTag variant="danger" outlined>Danger</WebTag>
            <WebTag variant="info" outlined>Info</WebTag>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available tag variants in both filled and outlined styles.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Tag Sizes</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Web Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Web Platform</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <WebTag variant="primary" size="sm">Small</WebTag>
            <WebTag variant="primary" size="md">Medium</WebTag>
            <WebTag variant="primary" size="lg">Large</WebTag>
          </div>
        </div>

        {/* React Native Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>React Native Platform</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <NativeTag variant="primary" size="sm">Small</NativeTag>
            <NativeTag variant="primary" size="md">Medium</NativeTag>
            <NativeTag variant="primary" size="lg">Large</NativeTag>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available tag sizes shown side by side with consistent scaling across platforms.',
      },
    },
  },
};

// Interactive features showcase
export const InteractiveFeatures: Story = {
  name: '⚡ Interactive Features',
  render: () => {
    const [tags, setTags] = React.useState([
      { id: 1, text: 'React', variant: 'primary' as const },
      { id: 2, text: 'TypeScript', variant: 'info' as const },
      { id: 3, text: 'JavaScript', variant: 'warning' as const },
      { id: 4, text: 'CSS', variant: 'success' as const },
    ]);

    const removeTag = (id: number) => {
      setTags(tags.filter(tag => tag.id !== id));
    };

    const addTag = () => {
      const newId = Math.max(...tags.map(t => t.id), 0) + 1;
      setTags([...tags, {
        id: newId,
        text: `Tag ${newId}`,
        variant: 'default' as const
      }]);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Interactive Tag Features</h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          width: '100%',
          maxWidth: '600px'
        }}>
          {/* Closable Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px' }}>Closable Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {tags.map(tag => (
                <WebTag
                  key={tag.id}
                  variant={tag.variant}
                  closable
                  onClose={() => removeTag(tag.id)}
                >
                  {tag.text}
                </WebTag>
              ))}
            </div>
            <button
              onClick={addTag}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Add Tag
            </button>
          </div>

          {/* Clickable Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px' }}>Clickable Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <WebTag
                variant="primary"
                onClick={() => alert('Primary tag clicked!')}
              >
                Click me
              </WebTag>
              <WebTag
                variant="success"
                onClick={() => alert('Success tag clicked!')}
              >
                Interactive
              </WebTag>
              <WebTag
                variant="info"
                onClick={() => alert('Info tag clicked!')}
              >
                Clickable
              </WebTag>
            </div>
          </div>

          {/* Style Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px' }}>Style Options</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <WebTag variant="primary">Normal</WebTag>
              <WebTag variant="primary" outlined>Outlined</WebTag>
              <WebTag variant="primary" rounded>Rounded</WebTag>
              <WebTag variant="primary" outlined rounded>Outlined + Rounded</WebTag>
            </div>
          </div>

          {/* States */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px' }}>States</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <WebTag variant="primary">Normal</WebTag>
              <WebTag variant="primary" disabled>Disabled</WebTag>
              <WebTag variant="primary" closable disabled>Disabled + Closable</WebTag>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive tag features including closable tags, clickable tags, style options, and different states.',
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
            borderRadius: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <WebTag variant="default">Default</WebTag>
            <WebTag variant="primary">Primary</WebTag>
            <WebTag variant="secondary">Secondary</WebTag>
            <WebTag variant="success">Success</WebTag>
            <WebTag variant="warning">Warning</WebTag>
            <WebTag variant="danger">Danger</WebTag>
            <WebTag variant="info">Info</WebTag>
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
            borderRadius: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <WebTag variant="default">Default</WebTag>
            <WebTag variant="primary">Primary</WebTag>
            <WebTag variant="secondary">Secondary</WebTag>
            <WebTag variant="success">Success</WebTag>
            <WebTag variant="warning">Warning</WebTag>
            <WebTag variant="danger">Danger</WebTag>
            <WebTag variant="info">Info</WebTag>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tag appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};