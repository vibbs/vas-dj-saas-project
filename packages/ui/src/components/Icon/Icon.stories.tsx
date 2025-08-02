import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Icon } from './Icon';
import { Icon as WebIcon } from './Icon.web';
import { Icon as NativeIcon } from './Icon.native';
import { IconProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const IconStoryComponent = React.forwardRef<any, IconProps>((props, _ref) => {
  return <Icon {...props} />;
});
IconStoryComponent.displayName = 'Icon';

const meta: Meta<IconProps> = {
  title: 'Components/Icon',
  component: IconStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Icon Component

A unified Icon component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **SVG Support**: Full SVG support on web with customizable stroke, fill, and paths
- **Vector Icons**: Emoji-based icons for React Native with consistent sizing
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Interactive Icons**: Support for click/press handlers with proper accessibility

## Platform Implementations
- **Web**: SVG element with full vector graphics support and customizable paths
- **React Native**: Text-based emoji icons with consistent sizing and touch support

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Icon } from '@vas-dj-saas/ui';

<Icon name="home" size="md" />
\`\`\`

### Custom SVG Icon (Web)
\`\`\`tsx
<Icon size="lg" color="#3b82f6">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</Icon>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { Icon, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <Icon name="star" size="lg" />
</ThemeProvider>
\`\`\`

### Interactive Icon
\`\`\`tsx
// React Native
<Icon name="settings" onPress={() => openSettings()} />

// Web
<Icon name="settings" onClick={() => openSettings()} />
\`\`\`

## Benefits

✅ **Platform Optimized** - SVG on web, emoji on mobile  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Integration** - Unified color system  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant
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
    name: {
      control: { type: 'select' },
      options: ['Home', 'User', 'Settings', 'Search', 'Bell', 'Heart', 'Star', 'Plus', 'Minus', 'Check', 'X', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown'],
      description: 'Lucide icon name (PascalCase)',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
    color: {
      control: { type: 'color' },
      description: 'Icon color (overrides theme color)',
    },
    fill: {
      control: { type: 'color' },
      description: 'SVG fill color (web only)',
    },
    stroke: {
      control: { type: 'color' },
      description: 'SVG stroke color (web only)',
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'SVG stroke width (web only)',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    name: 'Home',
    size: 'md',
    strokeWidth: 1.5,
  },
};

export default meta;
type Story = StoryObj<IconProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    name: 'Star',
    onPress: () => console.log('Icon pressed!'),
    onClick: () => console.log('Icon clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Try different icon names, sizes, and colors using the controls below. This story shows the current platform implementation in action.',
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
          <WebIcon {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            SVG element with vector graphics<br />
            Scalable and customizable paths
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
          <NativeIcon {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Text-based emoji icons<br />
            Consistent cross-platform rendering
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized graphics and interactions.
      </div>
    </div>
  ),
  args: {
    name: 'Heart',
    size: 'lg',
    color: '#ef4444',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized icons.',
      },
    },
  },
};

// All icons showcase
export const AllIcons: Story = {
  name: '🎨 All Available Icons',
  render: () => {
    const iconNames = ['Home', 'User', 'Settings', 'Search', 'Bell', 'Heart', 'Star', 'Plus', 'Minus', 'Check', 'X', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>All Available Icons - Side by Side</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          width: '100%',
          maxWidth: '900px'
        }}>
          {/* Web Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#e3f2fd',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1976d2'
            }}>
              🌐 Web Platform (SVG)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              width: '100%',
              justifyItems: 'center'
            }}>
              {iconNames.map((iconName) => (
                <div key={iconName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <WebIcon name={iconName} size="lg" />
                  <span style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>{iconName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* React Native Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f3e5f5',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#7b1fa2'
            }}>
              📱 React Native Platform (Emoji)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              width: '100%',
              justifyItems: 'center'
            }}>
              {iconNames.map((iconName) => (
                <div key={iconName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <NativeIcon name={iconName} size="lg" />
                  <span style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>{iconName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All available predefined icons shown side by side for web and React Native platforms. Web uses SVG paths while React Native uses emoji representations.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => {
    const iconName = 'Star';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Icon Sizes - Side by Side</h3>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WebIcon name={iconName} size="xs" />
                <span style={{ fontSize: '12px' }}>XS (12px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WebIcon name={iconName} size="sm" />
                <span style={{ fontSize: '12px' }}>SM (16px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WebIcon name={iconName} size="md" />
                <span style={{ fontSize: '12px' }}>MD (20px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WebIcon name={iconName} size="lg" />
                <span style={{ fontSize: '12px' }}>LG (24px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WebIcon name={iconName} size="xl" />
                <span style={{ fontSize: '12px' }}>XL (32px)</span>
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NativeIcon name={iconName} size="xs" />
                <span style={{ fontSize: '12px' }}>XS (12px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NativeIcon name={iconName} size="sm" />
                <span style={{ fontSize: '12px' }}>SM (16px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NativeIcon name={iconName} size="md" />
                <span style={{ fontSize: '12px' }}>MD (20px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NativeIcon name={iconName} size="lg" />
                <span style={{ fontSize: '12px' }}>LG (24px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NativeIcon name={iconName} size="xl" />
                <span style={{ fontSize: '12px' }}>XL (32px)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'All available icon sizes shown side by side with consistent scaling across platforms.',
      },
    },
  },
};

// Custom SVG showcase (web only)
export const CustomSVG: Story = {
  name: '🎨 Custom SVG Icons',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Custom SVG Icons (Web Only)</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '600px',
        justifyItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <WebIcon size="xl" color="#3b82f6">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </WebIcon>
          <span style={{ fontSize: '10px', color: '#666' }}>Custom Star</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <WebIcon size="xl" color="#ef4444" fill="#ef4444">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </WebIcon>
          <span style={{ fontSize: '10px', color: '#666' }}>Custom Heart</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <WebIcon size="xl" color="#10b981">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </WebIcon>
          <span style={{ fontSize: '10px', color: '#666' }}>Custom Check</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <WebIcon size="xl" color="#f59e0b">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </WebIcon>
          <span style={{ fontSize: '10px', color: '#666' }}>Custom Warning</span>
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
        Web platform supports custom SVG paths as children, allowing for unlimited icon designs with full vector graphics capabilities.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom SVG icons using children props (web only). You can pass any SVG path elements as children to create custom icons.',
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
                <WebIcon name="home" size="lg" />
                <WebIcon name="user" size="lg" />
                <WebIcon name="settings" size="lg" />
                <WebIcon name="star" size="lg" />
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
                <NativeIcon name="Home" size="lg" />
                <NativeIcon name="User" size="lg" />
                <NativeIcon name="Settings" size="lg" />
                <NativeIcon name="Star" size="lg" />
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
                <WebIcon name="home" size="lg" />
                <WebIcon name="user" size="lg" />
                <WebIcon name="settings" size="lg" />
                <WebIcon name="star" size="lg" />
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
                <NativeIcon name="Home" size="lg" />
                <NativeIcon name="User" size="lg" />
                <NativeIcon name="Settings" size="lg" />
                <NativeIcon name="Star" size="lg" />
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
        story: 'Icon appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent colors across web and React Native.',
      },
    },
  },
};