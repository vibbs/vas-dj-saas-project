import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Label } from './Label';
import { Label as WebLabel } from './Label.web';
import { Label as NativeLabel } from './Label.native';
import { LabelProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const LabelStoryComponent = React.forwardRef<any, LabelProps>((props, _ref) => {
  return <Label {...props} />;
});
LabelStoryComponent.displayName = 'Label';

const meta: Meta<LabelProps> = {
  title: 'Components/Label',
  component: LabelStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Label Component

A unified Label component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses createPlatformComponent utility for platform selection
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Required Indicator**: Built-in required asterisk with proper accessibility
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML \`<label>\` element with theme-based styling
- **React Native**: \`Text\` component with accessible labels

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Label } from '@vas-dj-saas/ui';

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
\`\`\`

### Required Field
\`\`\`tsx
<Label htmlFor="password" required>Password</Label>
<Input id="password" type="password" />
\`\`\`

### With Sizes
\`\`\`tsx
<Label size="sm">Small Label</Label>
<Label size="md">Medium Label</Label>
<Label size="lg">Large Label</Label>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere
✅ **Automatic Platform Detection** - No manual platform checks
✅ **Consistent API** - Same props work on both platforms
✅ **Theme Consistency** - Unified design system
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
    children: {
      control: { type: 'text' },
      description: 'Label text content',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the label',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Show required asterisk',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    htmlFor: {
      control: { type: 'text' },
      description: 'Associated form element ID (web only)',
    },
  },
  args: {
    children: 'Email Address',
    size: 'md',
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<LabelProps>;

// Interactive playground story
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Label',
    required: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below.',
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
          <WebLabel {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML label element<br/>
            Theme-based styling
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
          <NativeLabel {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Text component<br/>
            Native accessibility
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    children: 'Cross-Platform Label',
    required: true,
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Label Sizes - Side by Side</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Web Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLabel size="sm">Small Label</WebLabel>
            <WebLabel size="md">Medium Label</WebLabel>
            <WebLabel size="lg">Large Label</WebLabel>
          </div>
        </div>

        {/* React Native Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLabel size="sm">Small Label</NativeLabel>
            <NativeLabel size="md">Medium Label</NativeLabel>
            <NativeLabel size="lg">Large Label</NativeLabel>
          </div>
        </div>
      </div>
    </div>
  ),
};

// States showcase
export const States: Story = {
  name: '⚡ Label States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Label States - Side by Side</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '700px'
      }}>
        {/* Web States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLabel>Normal Label</WebLabel>
            <WebLabel required>Required Field</WebLabel>
            <WebLabel disabled>Disabled Label</WebLabel>
            <WebLabel required disabled>Required + Disabled</WebLabel>
          </div>
        </div>

        {/* React Native States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLabel>Normal Label</NativeLabel>
            <NativeLabel required>Required Field</NativeLabel>
            <NativeLabel disabled>Disabled Label</NativeLabel>
            <NativeLabel required disabled>Required + Disabled</NativeLabel>
          </div>
        </div>
      </div>
    </div>
  ),
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1976d2' }}>🌐 Web</div>
              <WebLabel>Email Address</WebLabel>
              <WebLabel required>Password</WebLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7b1fa2' }}>📱 React Native</div>
              <NativeLabel>Email Address</NativeLabel>
              <NativeLabel required>Password</NativeLabel>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#bfdbfe' }}>🌐 Web</div>
              <WebLabel>Email Address</WebLabel>
              <WebLabel required>Password</WebLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#e9d5ff' }}>📱 React Native</div>
              <NativeLabel>Email Address</NativeLabel>
              <NativeLabel required>Password</NativeLabel>
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
};
