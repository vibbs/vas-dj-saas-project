import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Separator } from './Separator';
import { Separator as WebSeparator } from './Separator.web';
import { Separator as NativeSeparator } from './Separator.native';
import { SeparatorProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

const SeparatorStoryComponent = React.forwardRef<any, SeparatorProps>((props, _ref) => {
  return <Separator {...props} />;
});
SeparatorStoryComponent.displayName = 'Separator';

const meta: Meta<SeparatorProps> = {
  title: 'Components/Separator',
  component: SeparatorStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Separator Component

A unified Separator component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses createPlatformComponent utility
- **Horizontal & Vertical**: Supports both orientations
- **Theme Integration**: Uses unified design tokens
- **Accessibility**: Proper ARIA attributes and React Native accessibility

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Separator } from '@vas-dj-saas/ui';

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>
\`\`\`

### Vertical Separator
\`\`\`tsx
<div style={{ display: 'flex', height: '50px' }}>
  <span>Left</span>
  <Separator orientation="vertical" />
  <span>Right</span>
</div>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere
✅ **Automatic Platform Detection** - No manual platform checks
✅ **Theme Consistency** - Unified design system
✅ **Flexible Orientation** - Horizontal or vertical
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '20px', minWidth: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the separator',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'muted'],
      description: 'Color variant',
    },
    decorative: {
      control: { type: 'boolean' },
      description: 'Whether separator is decorative',
    },
    thickness: {
      control: { type: 'number' },
      description: 'Thickness in pixels',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'default',
    decorative: true,
  },
};

export default meta;
type Story = StoryObj<SeparatorProps>;

export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: (args) => (
    <div style={{ width: '300px' }}>
      <p style={{ margin: '0 0 16px 0' }}>Content above separator</p>
      <Separator {...args} />
      <p style={{ margin: '16px 0 0 0' }}>Content below separator</p>
    </div>
  ),
};

export const PlatformComparison: Story = {
  name: '📱 Platform Comparison',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            textAlign: 'center',
          }}>
            🌐 Web Platform
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Above</p>
            <WebSeparator {...args} />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Below</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            textAlign: 'center',
          }}>
            📱 React Native Platform
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Above</p>
            <NativeSeparator {...args} />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Below</p>
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    orientation: 'horizontal',
  },
};

export const Orientations: Story = {
  name: '↔️ Orientations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Horizontal</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>🌐 Web</p>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Content</p>
              <WebSeparator orientation="horizontal" />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Content</p>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '8px' }}>📱 Native</p>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Content</p>
              <NativeSeparator orientation="horizontal" />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Content</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Vertical</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>🌐 Web</p>
            <div style={{ display: 'flex', alignItems: 'center', height: '50px', gap: '12px' }}>
              <span style={{ fontSize: '12px' }}>Left</span>
              <WebSeparator orientation="vertical" />
              <span style={{ fontSize: '12px' }}>Right</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '8px' }}>📱 Native</p>
            <div style={{ display: 'flex', alignItems: 'center', height: '50px', gap: '12px' }}>
              <span style={{ fontSize: '12px' }}>Left</span>
              <NativeSeparator orientation="vertical" />
              <span style={{ fontSize: '12px' }}>Right</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  name: '🎨 Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2' }}>🌐 Web</p>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Default</p>
            <WebSeparator variant="default" />
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Muted</p>
            <WebSeparator variant="muted" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2' }}>📱 Native</p>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Default</p>
            <NativeSeparator variant="default" />
          </div>
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Muted</p>
            <NativeSeparator variant="muted" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
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
              <WebSeparator />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2', marginBottom: '8px' }}>📱 Native</p>
              <NativeSeparator />
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
              <WebSeparator />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#e9d5ff', marginBottom: '8px' }}>📱 Native</p>
              <NativeSeparator />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
};
