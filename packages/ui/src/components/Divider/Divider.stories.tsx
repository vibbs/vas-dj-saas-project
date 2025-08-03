import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Divider } from './Divider';
import { Divider as WebDivider } from './Divider.web';
import { Divider as NativeDivider } from './Divider.native';
import { DividerProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const DividerStoryComponent = React.forwardRef<any, DividerProps>((props, _ref) => {
  return <Divider {...props} />;
});
DividerStoryComponent.displayName = 'Divider';

const meta: Meta<DividerProps> = {
  title: 'Components/Divider',
  component: DividerStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Divider Component

A unified divider component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Flexible Orientation**: Support for horizontal and vertical dividers
- **Multiple Variants**: Solid, dashed, and dotted line styles
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Customizable**: Adjustable thickness, color, length, and margins
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: CSS-based divider with border styling
- **React Native**: View component with platform-appropriate border properties

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Divider } from '@vas-dj-saas/ui';

<Divider orientation="horizontal" variant="solid" />
\`\`\`

### Custom Styling
\`\`\`tsx
<Divider 
  orientation="vertical" 
  variant="dashed" 
  thickness={2}
  color="#e11d48"
  length={100}
/>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { Divider, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <Divider orientation="horizontal" />
</ThemeProvider>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
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
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider',
    },
    variant: {
      control: { type: 'select' },
      options: ['solid', 'dashed', 'dotted'],
      description: 'Line style variant',
    },
    thickness: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Thickness of the divider line in pixels',
    },
    color: {
      control: { type: 'color' },
      description: 'Custom color for the divider (overrides theme)',
    },
    margin: {
      control: { type: 'number', min: 0, max: 50 },
      description: 'Margin around the divider in pixels',
    },
    length: {
      control: { type: 'text' },
      description: 'Length of the divider (number in pixels or string with units)',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
    margin: 16,
    length: '100%',
  },
};

export default meta;
type Story = StoryObj<DividerProps>;

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
          <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
            <WebDivider {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            CSS border-based divider<br/>
            Precise styling control
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
          <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
            <NativeDivider {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            View with border properties<br/>
            Native platform styling
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized components.
      </div>
    </div>
  ),
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// All orientations showcase
export const AllOrientations: Story = {
  name: '📐 All Orientations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Divider Orientations - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Web Orientations */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Horizontal</p>
              <WebDivider orientation="horizontal" thickness={2} />
            </div>
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px' }}>Vertical</span>
              <WebDivider orientation="vertical" thickness={2} length={60} />
              <span style={{ fontSize: '12px' }}>Divider</span>
            </div>
          </div>
        </div>

        {/* React Native Orientations */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Horizontal</p>
              <NativeDivider orientation="horizontal" thickness={2} />
            </div>
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px' }}>Vertical</span>
              <NativeDivider orientation="vertical" thickness={2} length={60} />
              <span style={{ fontSize: '12px' }}>Divider</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available divider orientations shown side by side for web and React Native platforms.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Divider Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Solid</p>
              <WebDivider variant="solid" thickness={2} />
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Dashed</p>
              <WebDivider variant="dashed" thickness={2} />
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Dotted</p>
              <WebDivider variant="dotted" thickness={2} />
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Solid</p>
              <NativeDivider variant="solid" thickness={2} />
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Dashed</p>
              <NativeDivider variant="dashed" thickness={2} />
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Dotted</p>
              <NativeDivider variant="dotted" thickness={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available divider variants shown side by side with consistent styling across platforms.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Theme Comparison - Side by Side</h3>
      
      {/* Default Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {/* Web - Default Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1976d2'
              }}>
                🌐 Web
              </div>
              <div style={{ width: '150px' }}>
                <WebDivider thickness={2} />
              </div>
            </div>

            {/* Native - Default Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#7b1fa2'
              }}>
                📱 React Native
              </div>
              <div style={{ width: '150px' }}>
                <NativeDivider thickness={2} />
              </div>
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
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px'
          }}>
            {/* Web - Dark Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#1e40af',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#bfdbfe'
              }}>
                🌐 Web
              </div>
              <div style={{ width: '150px' }}>
                <WebDivider thickness={2} />
              </div>
            </div>

            {/* Native - Dark Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#7c2d92',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#e9d5ff'
              }}>
                📱 React Native
              </div>
              <div style={{ width: '150px' }}>
                <NativeDivider thickness={2} />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Divider appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};