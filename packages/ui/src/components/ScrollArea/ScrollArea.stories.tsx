import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ScrollArea } from './ScrollArea';
import { ScrollArea as WebScrollArea } from './ScrollArea.web';
import { ScrollArea as NativeScrollArea } from './ScrollArea.native';
import { ScrollAreaProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const ScrollAreaStoryComponent = React.forwardRef<any, ScrollAreaProps>((props, _ref) => {
  return <ScrollArea {...props} />;
});
ScrollAreaStoryComponent.displayName = 'ScrollArea';

const meta: Meta<ScrollAreaProps> = {
  title: 'Components/ScrollArea',
  component: ScrollAreaStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform ScrollArea Component

A unified scrollable container component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Multi-directional Scrolling**: Support for vertical, horizontal, and bidirectional scrolling
- **Custom Scrollbars**: Styled scrollbars on web with size and fade customization
- **Keyboard Navigation**: Full keyboard support for scrolling on web
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Flexible Sizing**: Support for fixed and flexible dimensions

## Platform Implementations
- **Web**: Custom-styled scrollable div with CSS scrollbar customization
- **React Native**: ScrollView with platform-appropriate scroll indicators

## Usage Examples

### Basic Usage
\`\`\`tsx
import { ScrollArea } from '@vas-dj-saas/ui';

<ScrollArea height={200}>
  <p>Long content that will scroll...</p>
</ScrollArea>
\`\`\`

### Horizontal Scrolling
\`\`\`tsx
<ScrollArea 
  height={100}
  width={300}
  scrollDirection="horizontal"
>
  <div style={{ width: 600 }}>Wide content</div>
</ScrollArea>
\`\`\`

### Custom Scrollbars (Web)
\`\`\`tsx
<ScrollArea 
  height={200}
  showScrollbars={true}
  scrollbarSize={12}
  fadeScrollbars={true}
>
  <p>Content with custom scrollbars</p>
</ScrollArea>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Native Performance** - Platform-optimized scrolling  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '400px', height: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'text' },
      description: 'Height of the scroll area (number in px or string with units)',
    },
    maxHeight: {
      control: { type: 'text' },
      description: 'Maximum height of the scroll area',
    },
    width: {
      control: { type: 'text' },
      description: 'Width of the scroll area',
    },
    maxWidth: {
      control: { type: 'text' },
      description: 'Maximum width of the scroll area',
    },
    scrollDirection: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal', 'both'],
      description: 'Direction of scrolling',
    },
    showScrollbars: {
      control: { type: 'boolean' },
      description: 'Show or hide scrollbars',
    },
    scrollbarSize: {
      control: { type: 'number', min: 4, max: 20 },
      description: 'Size of scrollbars in pixels (web only)',
    },
    fadeScrollbars: {
      control: { type: 'boolean' },
      description: 'Fade scrollbars when not hovering (web only)',
    },
    children: {
      control: { type: 'text' },
      description: 'Content to be scrolled',
    },
    onScroll: {
      action: 'scrolled',
      description: 'Callback when content is scrolled',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    height: 200,
    scrollDirection: 'vertical',
    showScrollbars: true,
    scrollbarSize: 8,
    fadeScrollbars: true,
    children: (
      <div>
        <p>This is scrollable content that demonstrates the ScrollArea component.</p>
        <p>Add more content here to see the scrolling behavior in action.</p>
        <p>Line 3 of content...</p>
        <p>Line 4 of content...</p>
        <p>Line 5 of content...</p>
        <p>Line 6 of content...</p>
        <p>Line 7 of content...</p>
        <p>Line 8 of content...</p>
        <p>Line 9 of content...</p>
        <p>Line 10 of content...</p>
        <p>This content should require scrolling to see fully.</p>
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<ScrollAreaProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
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
          <div style={{ width: '300px', height: '200px' }}>
            <WebScrollArea {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Custom styled scrollbars<br/>
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
          <div style={{ width: '300px', height: '200px' }}>
            <NativeScrollArea {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Native ScrollView component<br/>
            Platform scroll indicators
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
        ✨ Both implementations provide smooth scrolling but use platform-optimized techniques and styling.
      </div>
    </div>
  ),
  args: {
    height: 180,
    scrollDirection: 'vertical',
    children: (
      <div>
        <p>Scrollable content example.</p>
        <p>This demonstrates platform differences.</p>
        <p>Web uses custom scrollbars.</p>
        <p>React Native uses ScrollView.</p>
        <p>Both provide smooth scrolling.</p>
        <p>Content continues here...</p>
        <p>More content to scroll through.</p>
        <p>This should require scrolling.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized scrolling experiences.',
      },
    },
  },
};

// Scroll directions showcase
export const ScrollDirections: Story = {
  name: '📐 Scroll Directions',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Scroll Directions</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Vertical Scrolling */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Vertical</h4>
          <WebScrollArea 
            height={150} 
            width={200}
            scrollDirection="vertical"
          >
            <div>
              <p>Vertical scroll content</p>
              <p>Line 2</p>
              <p>Line 3</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Line 8</p>
              <p>Scroll down to see more</p>
            </div>
          </WebScrollArea>
        </div>

        {/* Horizontal Scrolling */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Horizontal</h4>
          <WebScrollArea 
            height={100} 
            width={200}
            scrollDirection="horizontal"
          >
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              width: '500px',
              alignItems: 'center'
            }}>
              <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', minWidth: '80px' }}>Item 1</div>
              <div style={{ padding: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', minWidth: '80px' }}>Item 2</div>
              <div style={{ padding: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', minWidth: '80px' }}>Item 3</div>
              <div style={{ padding: '8px', backgroundColor: '#94a3b8', borderRadius: '4px', minWidth: '80px' }}>Item 4</div>
              <div style={{ padding: '8px', backgroundColor: '#64748b', borderRadius: '4px', minWidth: '80px', color: 'white' }}>Item 5</div>
            </div>
          </WebScrollArea>
        </div>

        {/* Both Directions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Both Directions</h4>
          <WebScrollArea 
            height={150} 
            width={200}
            scrollDirection="both"
          >
            <div style={{ width: '400px' }}>
              <p>This content scrolls in both directions</p>
              <p>Wide content that extends beyond the container width</p>
              <p>Line 3 with extra wide content that requires horizontal scrolling</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Scroll both ways to see all content</p>
            </div>
          </WebScrollArea>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different scroll directions: vertical, horizontal, and bidirectional scrolling.',
      },
    },
  },
};

// Scrollbar customization showcase
export const ScrollbarCustomization: Story = {
  name: '🎨 Scrollbar Styles',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Scrollbar Customization (Web Only)</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Default Scrollbars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Default</h4>
          <WebScrollArea 
            height={150} 
            width={200}
            showScrollbars={true}
            scrollbarSize={8}
            fadeScrollbars={true}
          >
            <div>
              <p>Default scrollbar styling</p>
              <p>8px size with fade effect</p>
              <p>Line 3</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Scroll to see scrollbar</p>
            </div>
          </WebScrollArea>
        </div>

        {/* Large Scrollbars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Large</h4>
          <WebScrollArea 
            height={150} 
            width={200}
            showScrollbars={true}
            scrollbarSize={16}
            fadeScrollbars={false}
          >
            <div>
              <p>Large scrollbar (16px)</p>
              <p>No fade effect</p>
              <p>Line 3</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Always visible scrollbar</p>
            </div>
          </WebScrollArea>
        </div>

        {/* Hidden Scrollbars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Hidden</h4>
          <WebScrollArea 
            height={150} 
            width={200}
            showScrollbars={false}
          >
            <div>
              <p>Hidden scrollbars</p>
              <p>Content still scrollable</p>
              <p>Line 3</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Use mouse or keyboard</p>
            </div>
          </WebScrollArea>
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
        💡 Scrollbar customization is web-specific. React Native uses platform-standard scroll indicators.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different scrollbar styles available on web platform, including size customization and visibility options.',
      },
    },
  },
};

// Content examples showcase
export const ContentExamples: Story = {
  name: '📄 Content Examples',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Content Types</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Text Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Text Content</h4>
          <WebScrollArea height={200} width="100%">
            <div>
              <h5 style={{ margin: '0 0 12px 0' }}>Lorem Ipsum</h5>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            </div>
          </WebScrollArea>
        </div>

        {/* Structured Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Structured Content</h4>
          <WebScrollArea height={200} width="100%">
            <div>
              <h5 style={{ margin: '0 0 8px 0' }}>Features List</h5>
              <ul>
                <li>Cross-platform compatibility</li>
                <li>Theme integration</li>
                <li>Accessibility support</li>
                <li>Custom scrollbar styling</li>
                <li>Keyboard navigation</li>
                <li>Multiple scroll directions</li>
                <li>Flexible sizing options</li>
                <li>TypeScript support</li>
              </ul>
              <h5 style={{ margin: '16px 0 8px 0' }}>Code Example</h5>
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '12px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {`<ScrollArea height={200}>
  <p>Content here</p>
</ScrollArea>`}
              </div>
            </div>
          </WebScrollArea>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different content types that can be scrolled, including text and structured content.',
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
            <WebScrollArea height={150} width="100%">
              <div>
                <h5 style={{ margin: '0 0 12px 0' }}>Default Theme Content</h5>
                <p>This ScrollArea uses the default light theme styling with appropriate border and background colors.</p>
                <p>The scrollbars also adapt to the theme colors for consistent design.</p>
                <p>Additional content to demonstrate scrolling behavior.</p>
                <p>More content that requires scrolling to view completely.</p>
                <p>Final line of themed content.</p>
              </div>
            </WebScrollArea>
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
            <WebScrollArea height={150} width="100%">
              <div>
                <h5 style={{ margin: '0 0 12px 0' }}>Dark Theme Content</h5>
                <p>This ScrollArea uses the dark theme with appropriate contrast and color scheme.</p>
                <p>The scrollbars and borders automatically adapt to maintain readability.</p>
                <p>Dark theme provides better viewing experience in low-light conditions.</p>
                <p>All theme tokens are consistently applied across the component.</p>
                <p>Final line of dark themed content.</p>
              </div>
            </WebScrollArea>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ScrollArea appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};