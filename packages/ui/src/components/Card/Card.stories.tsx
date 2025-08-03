import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card } from './Card';
import { Card as WebCard } from './Card.web';
import { Card as NativeCard } from './Card.native';
import { CardProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const CardStoryComponent = React.forwardRef<any, CardProps>((props, _ref) => {
  return <Card {...props} />;
});
CardStoryComponent.displayName = 'Card';

const meta: Meta<CardProps> = {
  title: 'Components/Data Display/Card',
  component: CardStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Card Component

A unified Card component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Loading States**: Built-in loading spinner with platform-appropriate animations
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Interactive & Static**: Can be used as both clickable and static container

## Platform Implementations
- **Web**: HTML div/button element with CSS-based styling and hover effects
- **React Native**: View/TouchableOpacity with platform-native styling and shadows

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Card } from '@vas-dj-saas/ui';

<Card variant="default" size="md">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
\`\`\`

### Interactive Card
\`\`\`tsx
import { Card } from '@vas-dj-saas/ui';

<Card 
  variant="elevated" 
  onClick={() => console.log('Card clicked')}
  onPress={() => console.log('Card pressed')}
>
  <h3>Clickable Card</h3>
  <p>This card responds to user interaction</p>
</Card>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { Card, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <Card variant="elevated">Themed Card</Card>
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
        <div style={{ width: '300px', height: '200px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'filled'],
      description: 'Visual style variant of the card',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the card',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable card interactions',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading spinner',
    },
    children: {
      control: { type: 'text' },
      description: 'Card content (text or React nodes)',
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
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Card Title</h3>
        <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
          This is a sample card with some content to demonstrate the component.
        </p>
      </div>
    ),
    variant: 'default',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<CardProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Interactive Card</h3>
        <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
          Click or tap this card to see the interaction in action.
        </p>
      </div>
    ),
    onPress: () => console.log('Card pressed!'),
    onClick: () => console.log('Card clicked!'),
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
          <div style={{ width: '250px', height: '150px' }}>
            <WebCard {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML div/button with CSS styling<br />
            Hover effects & box shadows
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
          <div style={{ width: '250px', height: '150px' }}>
            <NativeCard {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            View/TouchableOpacity with native styling<br />
            Platform-appropriate shadows & elevation
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
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Cross-Platform Card</h3>
        <p style={{ margin: '0', fontSize: '12px', lineHeight: '1.4' }}>
          Same props, different platforms
        </p>
      </div>
    ),
    variant: 'elevated',
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
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card Variants - Side by Side</h3>

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
            <div style={{ width: '200px', height: '100px' }}>
              <WebCard variant="default">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Default</div>
              </WebCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <WebCard variant="elevated">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Elevated</div>
              </WebCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <WebCard variant="outlined">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Outlined</div>
              </WebCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <WebCard variant="filled">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Filled</div>
              </WebCard>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '200px', height: '100px' }}>
              <NativeCard variant="default">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Default</div>
              </NativeCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <NativeCard variant="elevated">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Elevated</div>
              </NativeCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <NativeCard variant="outlined">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Outlined</div>
              </NativeCard>
            </div>
            <div style={{ width: '200px', height: '100px' }}>
              <NativeCard variant="filled">
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Filled</div>
              </NativeCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available card variants shown side by side for web and React Native platforms using the unified theme system.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card Sizes - Side by Side</h3>

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
            <WebCard variant="elevated" size="sm">
              <div style={{ fontSize: '10px', fontWeight: 600 }}>Small</div>
            </WebCard>
            <WebCard variant="elevated" size="md">
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Medium</div>
            </WebCard>
            <WebCard variant="elevated" size="lg">
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Large</div>
            </WebCard>
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
            <NativeCard variant="elevated" size="sm">
              <div style={{ fontSize: '10px', fontWeight: 600 }}>Small</div>
            </NativeCard>
            <NativeCard variant="elevated" size="md">
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Medium</div>
            </NativeCard>
            <NativeCard variant="elevated" size="lg">
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Large</div>
            </NativeCard>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available card sizes shown side by side with consistent spacing and proportions across platforms.',
      },
    },
  },
};

// States showcase
export const States: Story = {
  name: '⚡ Card States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card States - Side by Side</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '700px'
      }}>
        {/* Web States */}
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
            <div style={{ width: '180px', height: '80px' }}>
              <WebCard variant="elevated">
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Normal</div>
              </WebCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <WebCard variant="elevated" loading>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Loading</div>
              </WebCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <WebCard variant="elevated" disabled>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Disabled</div>
              </WebCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <WebCard variant="elevated" disabled loading>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Disabled + Loading</div>
              </WebCard>
            </div>
          </div>
        </div>

        {/* React Native States */}
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
            <div style={{ width: '180px', height: '80px' }}>
              <NativeCard variant="elevated">
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Normal</div>
              </NativeCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <NativeCard variant="elevated" loading>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Loading</div>
              </NativeCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <NativeCard variant="elevated" disabled>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Disabled</div>
              </NativeCard>
            </div>
            <div style={{ width: '180px', height: '80px' }}>
              <NativeCard variant="elevated" disabled loading>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Disabled + Loading</div>
              </NativeCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different card states including loading and disabled states shown side by side across platforms.',
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
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="default" size="sm">
                    <div style={{ fontSize: '8px' }}>Default</div>
                  </WebCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="elevated" size="sm">
                    <div style={{ fontSize: '8px' }}>Elevated</div>
                  </WebCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="outlined" size="sm">
                    <div style={{ fontSize: '8px' }}>Outlined</div>
                  </WebCard>
                </div>
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
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="default" size="sm">
                    <div style={{ fontSize: '8px' }}>Default</div>
                  </NativeCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="elevated" size="sm">
                    <div style={{ fontSize: '8px' }}>Elevated</div>
                  </NativeCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="outlined" size="sm">
                    <div style={{ fontSize: '8px' }}>Outlined</div>
                  </NativeCard>
                </div>
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
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="default" size="sm">
                    <div style={{ fontSize: '8px' }}>Default</div>
                  </WebCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="elevated" size="sm">
                    <div style={{ fontSize: '8px' }}>Elevated</div>
                  </WebCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <WebCard variant="outlined" size="sm">
                    <div style={{ fontSize: '8px' }}>Outlined</div>
                  </WebCard>
                </div>
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
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="default" size="sm">
                    <div style={{ fontSize: '8px' }}>Default</div>
                  </NativeCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="elevated" size="sm">
                    <div style={{ fontSize: '8px' }}>Elevated</div>
                  </NativeCard>
                </div>
                <div style={{ width: '80px', height: '60px' }}>
                  <NativeCard variant="outlined" size="sm">
                    <div style={{ fontSize: '8px' }}>Outlined</div>
                  </NativeCard>
                </div>
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
        story: 'Card appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};