import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Dialog as WebDialog } from './Dialog.web';
import { Dialog as NativeDialog } from './Dialog.native';
import { DialogProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const DialogStoryComponent = React.forwardRef<any, DialogProps & { trigger?: React.ReactNode }>((props, _ref) => {
  const [isOpen, setIsOpen] = useState(props.isOpen || false);
  
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div>
      <Button 
        onClick={handleOpen}
        variant="primary"
      >
        {props.trigger || 'Open Dialog'}
      </Button>
      <Dialog {...props} isOpen={isOpen} onClose={handleClose} />
    </div>
  );
});
DialogStoryComponent.displayName = 'Dialog';

const meta: Meta<DialogProps & { trigger?: React.ReactNode }> = {
  title: 'Components/Dialog',
  component: DialogStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Dialog Component

A unified modal dialog component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Modal Behavior**: Proper modal semantics with backdrop and focus management
- **Flexible Sizing**: Multiple size options from small to full-screen
- **Custom Positioning**: Center, top, or bottom positioning
- **Backdrop Options**: Blur, dark, light, or no backdrop effects
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Keyboard Navigation**: Escape key support and focus management on web

## Platform Implementations
- **Web**: Overlay div with CSS animations and focus management
- **React Native**: Modal component with Animated API for smooth transitions

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Dialog } from '@vas-dj-saas/ui';

const [isOpen, setIsOpen] = useState(false);

<Dialog 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Dialog Title"
>
  <p>Dialog content goes here.</p>
</Dialog>
\`\`\`

### With Description
\`\`\`tsx
<Dialog 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <button onClick={handleConfirm}>Confirm</button>
  <button onClick={() => setIsOpen(false)}>Cancel</button>
</Dialog>
\`\`\`

### Custom Size and Position
\`\`\`tsx
<Dialog 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  size="lg"
  position="top"
  backdrop="blur"
>
  <p>Large dialog positioned at the top</p>
</Dialog>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Modal Semantics** - Proper accessibility and behavior  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized animations
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
    title: {
      control: { type: 'text' },
      description: 'Dialog title displayed in header',
    },
    description: {
      control: { type: 'text' },
      description: 'Dialog description displayed below title',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the dialog',
    },
    position: {
      control: { type: 'select' },
      options: ['center', 'top', 'bottom'],
      description: 'Position of the dialog',
    },
    backdrop: {
      control: { type: 'select' },
      options: ['blur', 'dark', 'light', 'none'],
      description: 'Backdrop style',
    },
    showCloseButton: {
      control: { type: 'boolean' },
      description: 'Show the close button in top-right corner',
    },
    closeOnBackdropClick: {
      control: { type: 'boolean' },
      description: 'Close dialog when clicking backdrop',
    },
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Close dialog when pressing Escape key (web only)',
    },
    animationDuration: {
      control: { type: 'number', min: 100, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds',
    },
    children: {
      control: { type: 'text' },
      description: 'Dialog content',
    },
    trigger: {
      control: { type: 'text' },
      description: 'Button text to open dialog',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    title: 'Dialog Title',
    description: 'This is a description of the dialog content.',
    size: 'md',
    position: 'center',
    backdrop: 'blur',
    showCloseButton: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
    animationDuration: 300,
    trigger: 'Open Dialog',
    children: (
      <div>
        <p>This is the main content of the dialog.</p>
        <p>You can put any content here including forms, text, images, and other components.</p>
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<DialogProps & { trigger?: React.ReactNode }>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below. Click the button to open the dialog and test the current platform implementation.',
      },
    },
  },
};

// Platform comparison stories
export const PlatformComparison: Story = {
  name: '📱 Platform Comparison',
  render: (args) => {
    const [webOpen, setWebOpen] = useState(false);
    const [nativeOpen, setNativeOpen] = useState(false);

    return (
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
            <Button 
              onClick={() => setWebOpen(true)}
              variant="primary"
            >
              Open Web Dialog
            </Button>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              CSS animations & backdrop<br/>
              Focus management & Escape key
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
            <Button 
              onClick={() => setNativeOpen(true)}
              variant="primary"
            >
              Open Native Dialog
            </Button>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Modal component with Animated<br/>
              Native touch & gesture handling
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
          ✨ Both implementations provide modal behavior but use platform-optimized techniques and interactions.
        </div>

        <WebDialog 
          {...args} 
          isOpen={webOpen} 
          onClose={() => setWebOpen(false)}
          title="Web Dialog"
          children={
            <div>
              <p>This is the web implementation using CSS animations and DOM manipulation.</p>
              <p>Features include focus management, backdrop blur, and Escape key support.</p>
            </div>
          }
        />
        
        <NativeDialog 
          {...args} 
          isOpen={nativeOpen} 
          onClose={() => setNativeOpen(false)}
          title="Native Dialog"
          children={
            <div>
              <p>This is the React Native implementation using the Modal component.</p>
              <p>Features include native animations and touch gesture handling.</p>
            </div>
          }
        />
      </div>
    );
  },
  args: {
    size: 'md',
    position: 'center',
    backdrop: 'blur',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized modal dialogs.',
      },
    },
  },
};

// Size variations showcase
export const Sizes: Story = {
  name: '📏 Different Sizes',
  render: () => {
    const [openSizes, setOpenSizes] = useState<Record<string, boolean>>({});

    const toggleSize = (size: string) => {
      setOpenSizes(prev => ({ ...prev, [size]: !prev[size] }));
    };

    const sizes = [
      { key: 'sm', label: 'Small', color: '#10b981' },
      { key: 'md', label: 'Medium', color: '#3b82f6' },
      { key: 'lg', label: 'Large', color: '#8b5cf6' },
      { key: 'xl', label: 'Extra Large', color: '#f59e0b' },
      { key: 'full', label: 'Full Screen', color: '#ef4444' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Dialog Size Options</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '16px', 
          width: '100%', 
          maxWidth: '600px'
        }}>
          {sizes.map(({ key, label, color }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Button 
                onClick={() => toggleSize(key)}
                variant="primary"
                size="sm"
                style={{ backgroundColor: color, width: '100%' }}
              >
                {label}
              </Button>
              <WebDialog
                isOpen={openSizes[key] || false}
                onClose={() => toggleSize(key)}
                title={`${label} Dialog`}
                size={key as any}
                children={
                  <div>
                    <p>This is a {label.toLowerCase()} sized dialog.</p>
                    <p>Content scales appropriately to the dialog size.</p>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of different dialog sizes from small to full-screen.',
      },
    },
  },
};

// Position variations showcase
export const Positions: Story = {
  name: '📐 Different Positions',
  render: () => {
    const [openPositions, setOpenPositions] = useState<Record<string, boolean>>({});

    const togglePosition = (position: string) => {
      setOpenPositions(prev => ({ ...prev, [position]: !prev[position] }));
    };

    const positions = [
      { key: 'center', label: 'Center', color: '#3b82f6' },
      { key: 'top', label: 'Top', color: '#10b981' },
      { key: 'bottom', label: 'Bottom', color: '#f59e0b' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Dialog Position Options</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center'
        }}>
          {positions.map(({ key, label, color }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Button 
                onClick={() => togglePosition(key)}
                variant="primary"
                style={{ backgroundColor: color }}
              >
                {label}
              </Button>
              <WebDialog
                isOpen={openPositions[key] || false}
                onClose={() => togglePosition(key)}
                title={`${label} Positioned Dialog`}
                position={key as any}
                children={
                  <div>
                    <p>This dialog is positioned at the {key}.</p>
                    <p>Notice how the dialog appears in different locations on the screen.</p>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of different dialog positioning options: center, top, and bottom.',
      },
    },
  },
};

// Backdrop variations showcase
export const Backdrops: Story = {
  name: '🎨 Backdrop Styles',
  render: () => {
    const [openBackdrops, setOpenBackdrops] = useState<Record<string, boolean>>({});

    const toggleBackdrop = (backdrop: string) => {
      setOpenBackdrops(prev => ({ ...prev, [backdrop]: !prev[backdrop] }));
    };

    const backdrops = [
      { key: 'blur', label: 'Blur', color: '#3b82f6' },
      { key: 'dark', label: 'Dark', color: '#1f2937' },
      { key: 'light', label: 'Light', color: '#94a3b8' },
      { key: 'none', label: 'None', color: '#64748b' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Backdrop Style Options</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: '16px', 
          width: '100%', 
          maxWidth: '500px'
        }}>
          {backdrops.map(({ key, label, color }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <Button 
                onClick={() => toggleBackdrop(key)}
                variant="primary"
                size="sm"
                style={{ backgroundColor: color, width: '100%' }}
              >
                {label}
              </Button>
              <WebDialog
                isOpen={openBackdrops[key] || false}
                onClose={() => toggleBackdrop(key)}
                title={`${label} Backdrop`}
                backdrop={key as any}
                children={
                  <div>
                    <p>This dialog uses a {label.toLowerCase()} backdrop style.</p>
                    <p>Notice the different visual effects behind the dialog.</p>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of different backdrop styles: blur, dark, light, and none.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => {
    const [defaultOpen, setDefaultOpen] = useState(false);
    const [darkOpen, setDarkOpen] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Theme Comparison</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '32px', 
          width: '100%', 
          maxWidth: '600px'
        }}>
          {/* Default Theme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
              ☀️ Default Theme
            </h4>
            <ThemeProvider defaultTheme="default">
              <div style={{ 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Button 
                  onClick={() => setDefaultOpen(true)}
                  variant="primary"
                >
                  Open Default Dialog
                </Button>
                <WebDialog
                  isOpen={defaultOpen}
                  onClose={() => setDefaultOpen(false)}
                  title="Default Theme Dialog"
                  description="This dialog uses the default light theme."
                  children={
                    <div>
                      <p>The dialog automatically adapts to the theme colors and styling.</p>
                      <p>Notice the light background and appropriate contrast ratios.</p>
                    </div>
                  }
                />
              </div>
            </ThemeProvider>
          </div>

          {/* Dark Theme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
              🌙 Dark Theme
            </h4>
            <ThemeProvider defaultTheme="dark">
              <div style={{ 
                padding: '20px',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Button 
                  onClick={() => setDarkOpen(true)}
                  variant="primary"
                >
                  Open Dark Dialog
                </Button>
                <WebDialog
                  isOpen={darkOpen}
                  onClose={() => setDarkOpen(false)}
                  title="Dark Theme Dialog"
                  description="This dialog uses the dark theme with appropriate colors."
                  children={
                    <div>
                      <p>The dialog seamlessly integrates with the dark theme.</p>
                      <p>All colors and contrast ratios are optimized for dark mode viewing.</p>
                    </div>
                  }
                />
              </div>
            </ThemeProvider>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};