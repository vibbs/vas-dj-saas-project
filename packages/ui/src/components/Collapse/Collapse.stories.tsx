import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Collapse } from './Collapse';
import { Collapse as WebCollapse } from './Collapse.web';
import { Collapse as NativeCollapse } from './Collapse.native';
import { CollapseProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const CollapseStoryComponent = React.forwardRef<any, CollapseProps>((props, _ref) => {
  return <Collapse {...props} />;
});
CollapseStoryComponent.displayName = 'Collapse';

const meta: Meta<CollapseProps> = {
  title: 'Components/Collapse',
  component: CollapseStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Collapse Component

A unified collapsible content component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Smooth Animations**: CSS transitions on web, Animated API on React Native
- **Controlled & Uncontrolled**: Support for both controlled and uncontrolled state
- **Custom Triggers**: Flexible trigger content with state-based variations
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Keyboard Navigation**: Full keyboard support for trigger interactions

## Platform Implementations
- **Web**: CSS height transitions with overflow handling
- **React Native**: Animated.View with interpolated height and opacity

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Collapse } from '@vas-dj-saas/ui';

<Collapse defaultOpen={false}>
  <p>This content can be collapsed!</p>
</Collapse>
\`\`\`

### Custom Trigger
\`\`\`tsx
<Collapse 
  trigger={<div>Click to expand</div>}
  triggerWhenOpen={<div>Click to collapse</div>}
>
  <p>Custom trigger content</p>
</Collapse>
\`\`\`

### Controlled State
\`\`\`tsx
const [isOpen, setIsOpen] = useState(false);

<Collapse 
  isOpen={isOpen}
  onToggle={setIsOpen}
>
  <p>Controlled collapse content</p>
</Collapse>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Smooth Animations** - Platform-optimized animations  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'Controlled open state',
    },
    defaultOpen: {
      control: { type: 'boolean' },
      description: 'Default open state for uncontrolled usage',
    },
    animationDuration: {
      control: { type: 'number', min: 100, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable collapse interactions',
    },
    children: {
      control: { type: 'text' },
      description: 'Content to be collapsed/expanded',
    },
    onToggle: {
      action: 'toggled',
      description: 'Callback when collapse state changes',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    defaultOpen: false,
    animationDuration: 300,
    disabled: false,
    children: 'This is the collapsible content that can be hidden or shown.',
  },
};

export default meta;
type Story = StoryObj<CollapseProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: (
      <div>
        <p>This is collapsible content!</p>
        <p>It can contain multiple elements, text, and components.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
      </div>
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
          <div style={{ width: '300px' }}>
            <WebCollapse {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            CSS height transitions<br/>
            Keyboard navigation support
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
          <div style={{ width: '300px' }}>
            <NativeCollapse {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated.View with interpolation<br/>
            Native touch feedback
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
        ✨ Both implementations use the same props and provide smooth animations, but use platform-optimized techniques.
      </div>
    </div>
  ),
  args: {
    defaultOpen: false,
    children: (
      <div>
        <p>This content collapses smoothly!</p>
        <p>Each platform uses its optimal animation approach.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized animations.',
      },
    },
  },
};

// Custom triggers showcase
export const CustomTriggers: Story = {
  name: '🎯 Custom Triggers',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Custom Trigger Examples</h3>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        maxWidth: '500px'
      }}>
        {/* Default Trigger */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Default Trigger</h4>
          <WebCollapse defaultOpen={false}>
            <p>Content with the default trigger style.</p>
          </WebCollapse>
        </div>

        {/* Custom Static Trigger */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Custom Static Trigger</h4>
          <WebCollapse 
            trigger={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📄</span>
                <span>Click to view document</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>▼</span>
              </div>
            }
            defaultOpen={false}
          >
            <div>
              <h5 style={{ margin: '0 0 8px 0' }}>Document Content</h5>
              <p>This is the document content that can be expanded.</p>
            </div>
          </WebCollapse>
        </div>

        {/* State-based Triggers */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>State-based Triggers</h4>
          <WebCollapse 
            triggerWhenClosed={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>▶️</span>
                <span>Show details</span>
              </div>
            }
            triggerWhenOpen={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔽</span>
                <span>Hide details</span>
              </div>
            }
            defaultOpen={false}
          >
            <div>
              <p><strong>Advanced Details:</strong></p>
              <ul>
                <li>Feature 1: Advanced functionality</li>
                <li>Feature 2: Enhanced performance</li>
                <li>Feature 3: Better user experience</li>
              </ul>
            </div>
          </WebCollapse>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different trigger styles including default, custom static, and state-based triggers.',
      },
    },
  },
};

// Animation speeds showcase
export const AnimationSpeeds: Story = {
  name: '⚡ Animation Speeds',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Animation Speeds</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Fast Animation */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Fast (150ms)</h4>
          <WebCollapse 
            animationDuration={150}
            trigger={<span>Fast Animation ⚡</span>}
            defaultOpen={false}
          >
            <p>This collapses quickly with a 150ms animation.</p>
          </WebCollapse>
        </div>

        {/* Normal Animation */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Normal (300ms)</h4>
          <WebCollapse 
            animationDuration={300}
            trigger={<span>Normal Animation 🎯</span>}
            defaultOpen={false}
          >
            <p>This uses the default 300ms animation speed.</p>
          </WebCollapse>
        </div>

        {/* Slow Animation */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Slow (600ms)</h4>
          <WebCollapse 
            animationDuration={600}
            trigger={<span>Slow Animation 🐌</span>}
            defaultOpen={false}
          >
            <p>This collapses slowly with a 600ms animation for dramatic effect.</p>
          </WebCollapse>
        </div>

        {/* Very Slow Animation */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Very Slow (1000ms)</h4>
          <WebCollapse 
            animationDuration={1000}
            trigger={<span>Very Slow Animation 🐢</span>}
            defaultOpen={false}
          >
            <p>This uses a very slow 1000ms animation to demonstrate the flexibility.</p>
          </WebCollapse>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different animation speeds from fast (150ms) to very slow (1000ms).',
      },
    },
  },
};

// States showcase
export const States: Story = {
  name: '⚡ Collapse States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Collapse States</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Normal State */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Normal State</h4>
          <WebCollapse trigger={<span>Normal Collapse</span>} defaultOpen={false}>
            <p>This is a normal collapse component that can be toggled.</p>
          </WebCollapse>
        </div>

        {/* Disabled State */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Disabled State</h4>
          <WebCollapse 
            trigger={<span>Disabled Collapse</span>} 
            disabled={true}
            defaultOpen={false}
          >
            <p>This content cannot be accessed because the collapse is disabled.</p>
          </WebCollapse>
        </div>

        {/* Default Open */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Default Open</h4>
          <WebCollapse trigger={<span>Initially Open</span>} defaultOpen={true}>
            <p>This collapse starts in the open state by default.</p>
          </WebCollapse>
        </div>

        {/* With Complex Content */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Complex Content</h4>
          <WebCollapse trigger={<span>Rich Content</span>} defaultOpen={false}>
            <div>
              <h5 style={{ margin: '0 0 8px 0' }}>Nested Content</h5>
              <p>This collapse contains complex nested content.</p>
              <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', margin: '8px 0' }}>
                <code>Code snippet example</code>
              </div>
              <Button variant="outline" size="sm">
                Nested Button
              </Button>
            </div>
          </WebCollapse>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different collapse states including normal, disabled, default open, and complex content examples.',
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
            <WebCollapse 
              trigger={<span>Default Theme Collapse</span>}
              defaultOpen={false}
            >
              <p>This collapse uses the default light theme styling.</p>
            </WebCollapse>
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
            <WebCollapse 
              trigger={<span>Dark Theme Collapse</span>}
              defaultOpen={false}
            >
              <p>This collapse uses the dark theme with appropriate colors and contrast.</p>
            </WebCollapse>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collapse appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};