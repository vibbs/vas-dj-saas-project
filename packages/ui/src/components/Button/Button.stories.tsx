import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button as WebButton } from './Button.web';
import { Button as NativeButton } from './Button.native';
import { ButtonProps } from './types';

// Platform selector component
const PlatformButton: React.FC<ButtonProps & { platform?: 'web' | 'native' }> = ({
  platform = 'web',
  ...props
}) => {
  const ButtonComponent = platform === 'web' ? WebButton : NativeButton;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        marginBottom: '12px',
        padding: '8px 12px',
        backgroundColor: platform === 'web' ? '#e3f2fd' : '#f3e5f5',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '600',
        color: platform === 'web' ? '#1976d2' : '#7b1fa2'
      }}>
        {platform === 'web' ? '🌐 Web Platform' : '📱 React Native Platform'}
      </div>
      <ButtonComponent {...props} />
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        {platform === 'web'
          ? 'Rendered using: React + Tailwind CSS + DOM button'
          : 'Rendered using: React Native + StyleSheet + TouchableOpacity (via react-native-web)'
        }
      </div>
    </div>
  );
};

const meta: Meta<typeof PlatformButton> = {
  title: 'Components/Button',
  component: PlatformButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toggle between Web and React Native implementations of the same Button component using the platform control.',
      },
    },
  },
  argTypes: {
    platform: {
      control: 'select',
      options: ['web', 'native'],
      description: 'Choose which platform implementation to render',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Button visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PlatformToggle: Story = {
  args: {
    children: 'Platform Button',
    variant: 'primary',
    size: 'md',
    platform: 'web',
    disabled: false,
    loading: false,
  },
};

export const WebImplementation: Story = {
  args: {
    children: 'Web Button',
    variant: 'primary',
    size: 'md',
    platform: 'web',
  },
};

export const NativeImplementation: Story = {
  args: {
    children: 'Native Button',
    variant: 'primary',
    size: 'md',
    platform: 'native',
  },
};

// All Variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
    platform: 'web',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
    platform: 'web',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
    platform: 'web',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
    platform: 'web',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
    size: 'md',
    platform: 'web',
  },
};

// All Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
    platform: 'web',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    variant: 'primary',
    size: 'md',
    platform: 'web',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
    platform: 'web',
  },
};

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    size: 'md',
    disabled: true,
    platform: 'web',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    variant: 'primary',
    size: 'md',
    loading: true,
    platform: 'web',
  },
};

// Comprehensive comparisons
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      <PlatformButton variant="primary" platform="web">Primary</PlatformButton>
      <PlatformButton variant="secondary" platform="web">Secondary</PlatformButton>
      <PlatformButton variant="outline" platform="web">Outline</PlatformButton>
      <PlatformButton variant="ghost" platform="web">Ghost</PlatformButton>
      <PlatformButton variant="destructive" platform="web">Destructive</PlatformButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', alignItems: 'flex-start' }}>
      <PlatformButton size="sm" platform="web">Small Button</PlatformButton>
      <PlatformButton size="md" platform="web">Medium Button</PlatformButton>
      <PlatformButton size="lg" platform="web">Large Button</PlatformButton>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      <PlatformButton platform="web">Normal</PlatformButton>
      <PlatformButton disabled platform="web">Disabled</PlatformButton>
      <PlatformButton loading platform="web">Loading</PlatformButton>
    </div>
  ),
};

// Cross-platform comparisons
export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>🌐 Web Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PlatformButton variant="primary" platform="web">Primary</PlatformButton>
          <PlatformButton variant="secondary" platform="web">Secondary</PlatformButton>
          <PlatformButton variant="outline" platform="web">Outline</PlatformButton>
          <PlatformButton variant="ghost" platform="web">Ghost</PlatformButton>
          <PlatformButton variant="destructive" platform="web">Destructive</PlatformButton>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>📱 React Native Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PlatformButton variant="primary" platform="native">Primary</PlatformButton>
          <PlatformButton variant="secondary" platform="native">Secondary</PlatformButton>
          <PlatformButton variant="outline" platform="native">Outline</PlatformButton>
          <PlatformButton variant="ghost" platform="native">Ghost</PlatformButton>
          <PlatformButton variant="destructive" platform="native">Destructive</PlatformButton>
        </div>
      </div>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>🌐 Web Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <PlatformButton size="sm" platform="web">Small</PlatformButton>
          <PlatformButton size="md" platform="web">Medium</PlatformButton>
          <PlatformButton size="lg" platform="web">Large</PlatformButton>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>📱 React Native Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <PlatformButton size="sm" platform="native">Small</PlatformButton>
          <PlatformButton size="md" platform="native">Medium</PlatformButton>
          <PlatformButton size="lg" platform="native">Large</PlatformButton>
        </div>
      </div>
    </div>
  ),
};

export const StateComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>🌐 Web Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PlatformButton platform="web">Normal</PlatformButton>
          <PlatformButton disabled platform="web">Disabled</PlatformButton>
          <PlatformButton loading platform="web">Loading</PlatformButton>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>📱 React Native Platform</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PlatformButton platform="native">Normal</PlatformButton>
          <PlatformButton disabled platform="native">Disabled</PlatformButton>
          <PlatformButton loading platform="native">Loading</PlatformButton>
        </div>
      </div>
    </div>
  ),
};