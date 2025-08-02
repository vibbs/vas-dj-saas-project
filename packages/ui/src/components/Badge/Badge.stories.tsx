import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from './Badge';
import { Badge as WebBadge } from './Badge.web';
import { Badge as NativeBadge } from './Badge.native';
import { BadgeProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const BadgeStoryComponent = React.forwardRef<any, BadgeProps>((props, _ref) => {
  return <Badge {...props} />;
});
BadgeStoryComponent.displayName = 'Badge';

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  component: BadgeStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Badge Component

A unified badge component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Interactive & Static Modes**: Supports both clickable badges and status indicators
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Multiple Variants**: Primary, secondary, outline, ghost, destructive, success, and warning styles

## Platform Implementations
- **Web**: HTML span/button element with CSS-based styling and hover effects
- **React Native**: View/TouchableOpacity with platform-appropriate styling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Badge } from '@vas-dj-saas/ui';

<Badge variant="primary" size="md">
  Status
</Badge>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { Badge, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <Badge variant="success">Online</Badge>
</ThemeProvider>
\`\`\`

### Interactive Badge
\`\`\`tsx
// React Native
<Badge variant="primary" onPress={() => alert('Badge pressed')}>
  Clickable
</Badge>

// Web
<Badge variant="primary" onClick={() => alert('Badge clicked')}>
  Clickable
</Badge>
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
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning'],
      description: 'Visual style variant of the badge',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable badge interactions (only applies to interactive badges)',
    },
    children: {
      control: { type: 'text' },
      description: 'Badge content (text or React nodes)',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler (makes badge interactive)',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler (makes badge interactive)',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: 'Badge',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<BadgeProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Badge',
    onPress: () => console.log('Badge pressed!'),
    onClick: () => console.log('Badge clicked!'),
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
          <WebBadge {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML span/button element<br/>
            CSS styling & hover effects
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
          <NativeBadge {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            View/TouchableOpacity<br/>
            Platform-appropriate styling
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
    children: 'Cross-Platform Badge',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Badge Variants - Side by Side</h3>
      
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <WebBadge variant="primary">Primary</WebBadge>
            <WebBadge variant="secondary">Secondary</WebBadge>
            <WebBadge variant="outline">Outline</WebBadge>
            <WebBadge variant="ghost">Ghost</WebBadge>
            <WebBadge variant="destructive">Destructive</WebBadge>
            <WebBadge variant="success">Success</WebBadge>
            <WebBadge variant="warning">Warning</WebBadge>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <NativeBadge variant="primary">Primary</NativeBadge>
            <NativeBadge variant="secondary">Secondary</NativeBadge>
            <NativeBadge variant="outline">Outline</NativeBadge>
            <NativeBadge variant="ghost">Ghost</NativeBadge>
            <NativeBadge variant="destructive">Destructive</NativeBadge>
            <NativeBadge variant="success">Success</NativeBadge>
            <NativeBadge variant="warning">Warning</NativeBadge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants shown side by side for web and React Native platforms using the unified theme system.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Badge Sizes - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '600px'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <WebBadge variant="primary" size="sm">Small</WebBadge>
            <WebBadge variant="primary" size="md">Medium</WebBadge>
            <WebBadge variant="primary" size="lg">Large</WebBadge>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <NativeBadge variant="primary" size="sm">Small</NativeBadge>
            <NativeBadge variant="primary" size="md">Medium</NativeBadge>
            <NativeBadge variant="primary" size="lg">Large</NativeBadge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge sizes shown side by side with consistent spacing and typography across platforms.',
      },
    },
  },
};

// Interactive vs Static badges
export const InteractiveVsStatic: Story = {
  name: '⚡ Interactive vs Static',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Interactive vs Static Badges</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Web Implementation */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Static Badges (span)</div>
            <WebBadge variant="success">Online</WebBadge>
            <WebBadge variant="warning">Pending</WebBadge>
            <WebBadge variant="destructive">Offline</WebBadge>
            
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginTop: '8px' }}>Interactive Badges (button)</div>
            <WebBadge variant="primary" onClick={() => alert('Filter applied!')}>Filter</WebBadge>
            <WebBadge variant="outline" onClick={() => alert('Tag clicked!')}>Tag</WebBadge>
            <WebBadge variant="secondary" onClick={() => alert('Category selected!')} disabled>Disabled</WebBadge>
          </div>
        </div>

        {/* React Native Implementation */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Static Badges (View)</div>
            <NativeBadge variant="success">Online</NativeBadge>
            <NativeBadge variant="warning">Pending</NativeBadge>
            <NativeBadge variant="destructive">Offline</NativeBadge>
            
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginTop: '8px' }}>Interactive Badges (TouchableOpacity)</div>
            <NativeBadge variant="primary" onPress={() => alert('Filter applied!')}>Filter</NativeBadge>
            <NativeBadge variant="outline" onPress={() => alert('Tag pressed!')}>Tag</NativeBadge>
            <NativeBadge variant="secondary" onPress={() => alert('Category selected!')} disabled>Disabled</NativeBadge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges can be either static status indicators or interactive elements. The component automatically chooses the appropriate HTML element (span vs button) or React Native component (View vs TouchableOpacity) based on the presence of click/press handlers.',
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <WebBadge variant="primary">Primary</WebBadge>
                <WebBadge variant="success">Success</WebBadge>
                <WebBadge variant="warning">Warning</WebBadge>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <NativeBadge variant="primary">Primary</NativeBadge>
                <NativeBadge variant="success">Success</NativeBadge>
                <NativeBadge variant="warning">Warning</NativeBadge>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <WebBadge variant="primary">Primary</WebBadge>
                <WebBadge variant="success">Success</WebBadge>
                <WebBadge variant="warning">Warning</WebBadge>
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <NativeBadge variant="primary">Primary</NativeBadge>
                <NativeBadge variant="success">Success</NativeBadge>
                <NativeBadge variant="warning">Warning</NativeBadge>
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
        story: 'Badge appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};