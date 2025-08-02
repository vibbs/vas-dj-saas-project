import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Modal } from './Modal';
import { Modal as WebModal } from './Modal.web';
import { Modal as NativeModal } from './Modal.native';
import { ModalProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const ModalStoryComponent = React.forwardRef<any, ModalProps & { triggerText?: string }>((props, _ref) => {
  const [isOpen, setIsOpen] = React.useState(props.isOpen || false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {props.triggerText || 'Open Modal'}
      </Button>
      <Modal 
        {...props} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </>
  );
});
ModalStoryComponent.displayName = 'Modal';

const meta: Meta<ModalProps & { triggerText?: string }> = {
  title: 'Components/Modal',
  component: ModalStoryComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Cross-Platform Modal Component

A unified Modal component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Focus Management**: Proper focus trapping and restoration on web
- **Accessibility**: Full WCAG 2.1 AA compliance with ARIA attributes
- **Multiple Variants**: Default, fullscreen, bottom-sheet, and dialog styles
- **Flexible Sizing**: Small to extra-large size options
- **Animation Support**: Fade, slide, or no animation options

## Platform Implementations
- **Web**: Portal-based modal with focus management and backdrop handling
- **React Native**: Native Modal component with platform-appropriate styling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Modal, Button } from '@vas-dj-saas/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
\`\`\`

### Bottom Sheet (Mobile-friendly)
\`\`\`tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  variant="bottom-sheet"
>
  <h3>Bottom Sheet</h3>
  <p>Great for mobile interfaces</p>
</Modal>
\`\`\`

### Fullscreen Modal
\`\`\`tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  variant="fullscreen"
  showCloseButton={true}
>
  <h1>Fullscreen Content</h1>
  <p>Takes up the entire screen</p>
</Modal>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering
✅ **Accessible** - WCAG 2.1 AA compliant
✅ **Focus Management** - Proper keyboard navigation
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '20px', minHeight: '200px', textAlign: 'left' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'fullscreen', 'bottom-sheet', 'dialog'],
      description: 'Visual style variant of the modal',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the modal',
    },
    animationType: {
      control: { type: 'select' },
      options: ['fade', 'slide', 'none'],
      description: 'Animation type for modal appearance',
    },
    closeOnBackdropClick: {
      control: { type: 'boolean' },
      description: 'Close modal when clicking backdrop',
    },
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Close modal when pressing Escape key (web only)',
    },
    showCloseButton: {
      control: { type: 'boolean' },
      description: 'Show close button in top-right corner',
    },
    showDivider: {
      control: { type: 'boolean' },
      description: 'Show divider line above footer actions',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading spinner overlay',
    },
    triggerText: {
      control: { type: 'text' },
      description: 'Text for the trigger button (Storybook only)',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, textAlign: 'left' }}>Modal Title</h2>
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', textAlign: 'left' }}>
            This is a sample modal with some content to demonstrate the component functionality.
            You can include any React content here. Notice how the action buttons are now positioned at the bottom.
          </p>
        </div>
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '16px', 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end' 
        }}>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    ),
    variant: 'default',
    size: 'md',
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showCloseButton: true,
    showDivider: false,
    loading: false,
    triggerText: 'Open Modal',
  },
};

export default meta;
type Story = StoryObj<ModalProps & { triggerText?: string }>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    triggerText: 'Open Interactive Modal',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, textAlign: 'left' }}>Interactive Modal</h2>
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', textAlign: 'left' }}>
            Try different combinations of props using the controls below. This modal demonstrates
            platform-optimized behavior and accessibility features.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Sample Input:
            </label>
            <input
              type="text"
              placeholder="Focus management demo"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '16px', 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end' 
        }}>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    ),
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
  render: (args) => {
    const [webOpen, setWebOpen] = React.useState(false);
    const [nativeOpen, setNativeOpen] = React.useState(false);

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
            Same props, different platform implementations
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
            <Button onClick={() => setWebOpen(true)}>Open Web Modal</Button>
            <WebModal
              {...args}
              isOpen={webOpen}
              onClose={() => setWebOpen(false)}
            >
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Web Modal</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.4' }}>
                  Portal-based modal with focus management and backdrop handling.
                </p>
                <Button onClick={() => setWebOpen(false)}>Close</Button>
              </div>
            </WebModal>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Portal rendering with focus trap<br/>
              Backdrop click & Escape key support
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
            <Button onClick={() => setNativeOpen(true)}>Open Native Modal</Button>
            <NativeModal
              {...args}
              isOpen={nativeOpen}
              onClose={() => setNativeOpen(false)}
            >
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Native Modal</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.4' }}>
                  React Native Modal with platform-native behavior and animations.
                </p>
                <Button onClick={() => setNativeOpen(false)}>Close</Button>
              </div>
            </NativeModal>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Native Modal component<br/>
              Platform-appropriate animations
            </div>
          </div>
        </div>
      </div>
    );
  },
  args: {
    children: (
      <div>
        <h3>Platform Modal</h3>
        <p>This modal uses platform-optimized implementation.</p>
      </div>
    ),
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating platform-optimized modal behavior.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => {
    const [openModal, setOpenModal] = React.useState<string | null>(null);

    const variants = [
      { key: 'default', label: 'Default', description: 'Standard centered modal' },
      { key: 'dialog', label: 'Dialog', description: 'Enhanced dialog with shadow' },
      { key: 'bottom-sheet', label: 'Bottom Sheet', description: 'Mobile-friendly bottom sheet' },
      { key: 'fullscreen', label: 'Fullscreen', description: 'Full viewport coverage' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Modal Variants</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          width: '100%', 
          maxWidth: '800px'
        }}>
          {variants.map((variant) => (
            <div key={variant.key} style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                {variant.label}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                {variant.description}
              </p>
              <Button 
                size="sm" 
                onClick={() => setOpenModal(variant.key)}
              >
                Open {variant.label}
              </Button>
            </div>
          ))}
        </div>

        {variants.map((variant) => (
          <Modal
            key={variant.key}
            isOpen={openModal === variant.key}
            onClose={() => setOpenModal(null)}
            variant={variant.key as any}
            size="md"
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, textAlign: 'left' }}>
                {variant.label} Modal
              </h3>
              <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', textAlign: 'left' }}>
                {variant.description}. This demonstrates the {variant.key} variant styling and behavior.
              </p>
              {variant.key === 'fullscreen' ? (
                <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
                    Welcome to Our Platform
                  </h3>
                  <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                    This fullscreen modal centers its content container vertically and horizontally, but keeps text 
                    left-aligned for optimal readability. Perfect for welcome screens, onboarding flows, or important 
                    announcements that need full attention.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                    <Button variant="primary">
                      Get Started
                    </Button>
                    <Button variant="outline" onClick={() => setOpenModal(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', textAlign: 'left' }}>
                      {variant.description}. This demonstrates the {variant.key} variant styling and behavior.
                    </p>
                  </div>
                  <div style={{ 
                    marginTop: 'auto', 
                    paddingTop: '16px', 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'flex-end' 
                  }}>
                    <Button variant="outline" onClick={() => setOpenModal(null)}>
                      Close
                    </Button>
                    <Button variant="primary">
                      Action
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All available modal variants with their unique styling and behavior patterns.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => {
    const [openModal, setOpenModal] = React.useState<string | null>(null);

    const sizes = [
      { key: 'sm', label: 'Small', width: '400px' },
      { key: 'md', label: 'Medium', width: '500px' },
      { key: 'lg', label: 'Large', width: '700px' },
      { key: 'xl', label: 'Extra Large', width: '900px' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Modal Sizes</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {sizes.map((size) => (
            <div key={size.key} style={{ 
              padding: '12px 16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              textAlign: 'center',
              minWidth: '120px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                {size.label}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                {size.width}
              </div>
              <Button 
                size="sm" 
                onClick={() => setOpenModal(size.key)}
              >
                Open
              </Button>
            </div>
          ))}
        </div>

        {sizes.map((size) => (
          <Modal
            key={size.key}
            isOpen={openModal === size.key}
            onClose={() => setOpenModal(null)}
            variant="default"
            size={size.key as any}
          >
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
                {size.label} Modal
              </h3>
              <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
                This modal is sized as "{size.key}" with a maximum width of {size.width} on web.
                On mobile, it adapts responsively to the screen size.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => setOpenModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All available modal sizes with responsive behavior across devices.',
      },
    },
  },
};

// Loading state showcase
// Divider showcase
export const WithDivider: Story = {
  name: '➖ With Footer Divider',
  args: {
    triggerText: 'Open Modal with Divider',
    showDivider: true,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600, textAlign: 'left' }}>Modal with Divider</h2>
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', textAlign: 'left' }}>
            This modal demonstrates the footer divider functionality. The divider automatically appears
            above the footer actions when <code>showDivider=true</code> is set.
          </p>
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5', color: '#6b7280', textAlign: 'left' }}>
            The divider provides visual separation between the main content and the action buttons,
            making the modal footer more prominent and organized.
          </p>
        </div>
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '16px', 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'flex-end' 
        }}>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with footer divider enabled showing visual separation between content and actions.',
      },
    },
  },
};

export const LoadingState: Story = {
  name: '⏳ Loading State',
  args: {
    triggerText: 'Open Loading Modal',
    loading: true,
    children: (
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>Processing...</h2>
        <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
          This modal shows a loading state with a spinner overlay. The content is still visible
          but the modal is in a loading state to prevent interaction.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="outline" disabled>Cancel</Button>
          <Button variant="primary" disabled>Processing...</Button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with loading state showing spinner overlay and disabled interactions.',
      },
    },
  },
};

// Accessibility showcase
export const AccessibilityFeatures: Story = {
  name: '♿ Accessibility Features',
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const firstInputRef = React.useRef<HTMLInputElement>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Accessibility Features Demo</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5', color: '#6b7280' }}>
            This modal demonstrates WCAG 2.1 AA compliance with proper focus management, 
            keyboard navigation, and ARIA attributes.
          </p>
        </div>

        <Button 
          ref={triggerRef}
          onClick={() => setIsOpen(true)}
        >
          Open Accessible Modal
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant="dialog"
          size="md"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          initialFocusRef={firstInputRef}
          finalFocusRef={triggerRef}
        >
          <div>
            <h2 id="modal-title" style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600 }}>
              Accessible Form Modal
            </h2>
            <p id="modal-description" style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
              Focus automatically moves to the first input. Try using Tab, Shift+Tab, and Escape keys.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                  First Name (auto-focused):
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
                  Last Name:
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary">
                Save
              </Button>
            </div>
          </div>
        </Modal>

        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <strong>Accessibility Features:</strong><br/>
          ✅ Focus trap & restoration • ✅ Keyboard navigation • ✅ ARIA attributes • ✅ Screen reader support
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates comprehensive accessibility features including focus management, keyboard navigation, and ARIA attributes.',
      },
    },
  },
};