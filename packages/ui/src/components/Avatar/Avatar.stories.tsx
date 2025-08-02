import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Avatar } from './Avatar';
import { Avatar as WebAvatar } from './Avatar.web';
import { Avatar as NativeAvatar } from './Avatar.native';
import { AvatarProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const AvatarStoryComponent = React.forwardRef<any, AvatarProps>((props, _ref) => {
  return <Avatar {...props} />;
});
AvatarStoryComponent.displayName = 'Avatar';

const meta: Meta<AvatarProps> = {
  title: 'Components/Avatar',
  component: AvatarStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Avatar Component

A unified Avatar component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Multiple Content Types**: Supports images, initials, and custom fallback content
- **Smart Fallbacks**: Automatically falls back to initials or default icon if image fails
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Generated Colors**: Automatically generates consistent colors based on name/initials
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Interactive Support**: Click/press handlers with proper accessibility

## Platform Implementations
- **Web**: HTML elements with CSS styling, image loading states, and hover effects
- **React Native**: Image and Text components with native touch feedback

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Avatar } from '@vas-dj-saas/ui';

<Avatar name="John Doe" size="md" />
\`\`\`

### With Image
\`\`\`tsx
<Avatar 
  src="https://example.com/avatar.jpg" 
  name="John Doe" 
  alt="John's avatar"
  size="lg" 
/>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { Avatar, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <Avatar name="Jane Smith" variant="rounded" />
</ThemeProvider>
\`\`\`

### Interactive Avatar
\`\`\`tsx
// React Native
<Avatar name="John" onPress={() => openProfile()} />

// Web
<Avatar name="John" onClick={() => openProfile()} />
\`\`\`

## Benefits

✅ **Smart Fallbacks** - Image → initials → default icon  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Generated Colors** - Consistent colors based on name  
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
    src: {
      control: { type: 'text' },
      description: 'Image URL for the avatar',
    },
    name: {
      control: { type: 'text' },
      description: 'User name for generating initials and accessibility',
    },
    initials: {
      control: { type: 'text' },
      description: 'Custom initials override',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    variant: {
      control: { type: 'select' },
      options: ['circular', 'rounded', 'square'],
      description: 'Shape variant of the avatar',
    },
    color: {
      control: { type: 'color' },
      description: 'Background color (overrides generated color)',
    },
    textColor: {
      control: { type: 'color' },
      description: 'Text color for initials',
    },
    alt: {
      control: { type: 'text' },
      description: 'Alt text for the image',
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
    name: 'John Doe',
    size: 'md',
    variant: 'circular',
  },
};

export default meta;
type Story = StoryObj<AvatarProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    name: 'John Doe',
    onPress: () => console.log('Avatar pressed!'),
    onClick: () => console.log('Avatar clicked!'),
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
          <WebAvatar {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML img/div with CSS styling<br/>
            Image loading states & hover effects
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
          <NativeAvatar {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Image and Text components<br/>
            Native touch feedback & accessibility
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
    name: 'Alice Johnson',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized avatars.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Avatar Sizes - Side by Side</h3>
      
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="JS" size="xs" />
              <span style={{ fontSize: '10px' }}>XS (24px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="MD" size="sm" />
              <span style={{ fontSize: '10px' }}>SM (32px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="LG" size="md" />
              <span style={{ fontSize: '10px' }}>MD (40px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="XL" size="lg" />
              <span style={{ fontSize: '10px' }}>LG (48px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="XX" size="xl" />
              <span style={{ fontSize: '10px' }}>XL (64px)</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="JS" size="xs" />
              <span style={{ fontSize: '10px' }}>XS (24px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="MD" size="sm" />
              <span style={{ fontSize: '10px' }}>SM (32px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="LG" size="md" />
              <span style={{ fontSize: '10px' }}>MD (40px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="XL" size="lg" />
              <span style={{ fontSize: '10px' }}>LG (48px)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="XX" size="xl" />
              <span style={{ fontSize: '10px' }}>XL (64px)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available avatar sizes shown side by side with consistent scaling across platforms.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Avatar Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '600px'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="John Doe" variant="circular" size="lg" />
              <span style={{ fontSize: '10px' }}>Circular</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="Jane Smith" variant="rounded" size="lg" />
              <span style={{ fontSize: '10px' }}>Rounded</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <WebAvatar name="Bob Wilson" variant="square" size="lg" />
              <span style={{ fontSize: '10px' }}>Square</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="John Doe" variant="circular" size="lg" />
              <span style={{ fontSize: '10px' }}>Circular</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="Jane Smith" variant="rounded" size="lg" />
              <span style={{ fontSize: '10px' }}>Rounded</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <NativeAvatar name="Bob Wilson" variant="square" size="lg" />
              <span style={{ fontSize: '10px' }}>Square</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available avatar variants shown side by side with consistent theming across platforms.',
      },
    },
  },
};

// Fallback examples
export const FallbackExamples: Story = {
  name: '🔄 Fallback Examples',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Avatar Fallback Examples - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Web Fallbacks */}
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
              <WebAvatar name="John Doe" size="md" />
              <span style={{ fontSize: '12px' }}>Name → Initials (JD)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WebAvatar initials="AB" size="md" />
              <span style={{ fontSize: '12px' }}>Custom Initials (AB)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WebAvatar size="md" />
              <span style={{ fontSize: '12px' }}>Default Icon</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WebAvatar src="invalid-url" name="Failed Load" size="md" />
              <span style={{ fontSize: '12px' }}>Failed Image → Initials</span>
            </div>
          </div>
        </div>

        {/* React Native Fallbacks */}
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
              <NativeAvatar name="John Doe" size="md" />
              <span style={{ fontSize: '12px' }}>Name → Initials (JD)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NativeAvatar initials="AB" size="md" />
              <span style={{ fontSize: '12px' }}>Custom Initials (AB)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NativeAvatar size="md" />
              <span style={{ fontSize: '12px' }}>Default Emoji (👤)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NativeAvatar src="invalid-url" name="Failed Load" size="md" />
              <span style={{ fontSize: '12px' }}>Failed Image → Initials</span>
            </div>
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
        ✨ Avatars intelligently fall back from image → initials → default icon/emoji, ensuring something meaningful is always displayed.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of avatar fallback behavior when images fail to load or no content is provided.',
      },
    },
  },
};

// Color generation examples
export const ColorGeneration: Story = {
  name: '🌈 Generated Colors',
  render: () => {
    const names = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank Castle'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Consistent Color Generation - Side by Side</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '32px', 
          width: '100%', 
          maxWidth: '800px'
        }}>
          {/* Web Colors */}
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px', 
              width: '100%'
            }}>
              {names.map((name) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <WebAvatar name={name} size="md" />
                  <span style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* React Native Colors */}
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px', 
              width: '100%'
            }}>
              {names.map((name) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <NativeAvatar name={name} size="md" />
                  <span style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>{name}</span>
                </div>
              ))}
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
          🎨 Colors are generated consistently based on the name hash, ensuring the same person always gets the same color across sessions.
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of consistent color generation based on user names. Each name always generates the same color.',
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
                <WebAvatar name="John Doe" size="md" />
                <WebAvatar name="Jane Smith" variant="rounded" size="md" />
                <WebAvatar name="Bob Johnson" variant="square" size="md" />
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
                <NativeAvatar name="John Doe" size="md" />
                <NativeAvatar name="Jane Smith" variant="rounded" size="md" />
                <NativeAvatar name="Bob Johnson" variant="square" size="md" />
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
                <WebAvatar name="John Doe" size="md" />
                <WebAvatar name="Jane Smith" variant="rounded" size="md" />
                <WebAvatar name="Bob Johnson" variant="square" size="md" />
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
                <NativeAvatar name="John Doe" size="md" />
                <NativeAvatar name="Jane Smith" variant="rounded" size="md" />
                <NativeAvatar name="Bob Johnson" variant="square" size="md" />
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
        story: 'Avatar appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent typography and spacing.',
      },
    },
  },
};