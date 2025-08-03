import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Toast } from './Toast';
import { Toast as WebToast } from './Toast.web';
import { Toast as NativeToast } from './Toast.native';
import { ToastProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button/Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const ToastStoryComponent = React.forwardRef<any, ToastProps>((props, _ref) => {
  return <Toast {...props} />;
});
ToastStoryComponent.displayName = 'Toast';

const meta: Meta<ToastProps> = {
  title: 'Feedback/Toast',
  component: ToastStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Toast Component

A unified toast notification component that automatically renders the appropriate implementation based on the platform with animations and auto-dismiss functionality.

## Features
- **Auto-dismiss**: Configurable duration with automatic hiding
- **Multiple Variants**: Default, success, warning, error, and info styles
- **Positioning**: Flexible positioning options for different use cases
- **Animations**: Smooth enter/exit animations optimized per platform
- **Closable**: Optional close button with proper accessibility
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: Fixed positioned div with CSS animations and transitions
- **React Native**: Animated.View with native animations and proper safe area handling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Toast } from '@vas-dj-saas/ui';

<Toast variant="success" title="Success!" description="Your action was completed successfully." />
\`\`\`

### Auto-dismiss Toast
\`\`\`tsx
<Toast 
  variant="info" 
  duration={3000}
  onClose={() => console.log('Toast closed')}
>
  This toast will auto-dismiss in 3 seconds
</Toast>
\`\`\`

### Persistent Toast
\`\`\`tsx
<Toast 
  variant="error" 
  duration={0} 
  title="Error occurred"
  description="Please check your connection and try again."
/>
\`\`\`

## Benefits

✅ **Auto-dismiss** - Configurable timing with manual override  
✅ **Smooth Animations** - Platform-optimized enter/exit animations  
✅ **Accessible** - Proper ARIA live regions and roles  
✅ **Theme Consistency** - Unified design system  
✅ **Position Flexible** - Multiple positioning options  
✅ **Performance** - Optimized rendering and animations
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual style variant of the toast',
    },
    position: {
      control: { type: 'select' },
      options: ['top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right'],
      description: 'Position of the toast on screen',
    },
    duration: {
      control: { type: 'number', min: 0, max: 10000, step: 500 },
      description: 'Auto-dismiss duration in milliseconds (0 = persistent)',
    },
    visible: {
      control: { type: 'boolean' },
      description: 'Whether the toast is visible',
    },
    closable: {
      control: { type: 'boolean' },
      description: 'Whether the toast can be manually closed',
    },
    title: {
      control: { type: 'text' },
      description: 'Toast title text',
    },
    description: {
      control: { type: 'text' },
      description: 'Toast description text',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    variant: 'default',
    position: 'top-right',
    duration: 5000,
    visible: true,
    closable: true,
    title: 'Notification',
    description: 'This is a toast notification message.',
  },
};

export default meta;
type Story = StoryObj<ToastProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: (args) => {
    const [visible, setVisible] = useState(args.visible);
    
    return (
      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        <Button 
          onClick={() => setVisible(true)}
          variant="primary"
          style={{ marginBottom: '16px' }}
        >
          Show Toast
        </Button>
        <Toast 
          {...args} 
          visible={visible}
          onClose={() => setVisible(false)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below. Click "Show Toast" to trigger the notification.',
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
        maxWidth: '800px',
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
          <div style={{ position: 'relative', height: '150px', width: '100%', border: '1px dashed #ccc', borderRadius: '6px', overflow: 'hidden' }}>
            <WebToast {...args} style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', maxWidth: 'none', zIndex: 1 }} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Fixed positioned div<br/>
            CSS animations & transitions
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
          <div style={{ position: 'relative', height: '150px', width: '100%', border: '1px dashed #ccc', borderRadius: '6px', overflow: 'hidden' }}>
            <NativeToast {...args} style={{ position: 'absolute', top: 16, left: 16, right: 16, maxWidth: 'none' }} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated.View component<br/>
            Native animations & safe areas
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    variant: 'success',
    title: 'Success!',
    description: 'Cross-platform toast notification',
    closable: true,
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
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Toast Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '1000px'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <WebToast variant="default" title="Default" description="Default notification style" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto', transform: 'none', opacity: 1, maxWidth: '100%' }} />
            <WebToast variant="success" title="Success" description="Operation completed successfully" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto', transform: 'none', opacity: 1, maxWidth: '100%' }} />
            <WebToast variant="info" title="Information" description="Here's some useful information" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto', transform: 'none', opacity: 1, maxWidth: '100%' }} />
            <WebToast variant="warning" title="Warning" description="Please review this action" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto', transform: 'none', opacity: 1, maxWidth: '100%' }} />
            <WebToast variant="error" title="Error" description="Something went wrong" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 'auto', bottom: 'auto', transform: 'none', opacity: 1, maxWidth: '100%' }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <NativeToast variant="default" title="Default" description="Default notification style" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 0, bottom: 'auto' }} />
            <NativeToast variant="success" title="Success" description="Operation completed successfully" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 0, bottom: 'auto' }} />
            <NativeToast variant="info" title="Information" description="Here's some useful information" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 0, bottom: 'auto' }} />
            <NativeToast variant="warning" title="Warning" description="Please review this action" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 0, bottom: 'auto' }} />
            <NativeToast variant="error" title="Error" description="Something went wrong" 
              duration={0}
              style={{ position: 'relative', top: 0, left: 0, right: 0, bottom: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available toast variants with different styling and semantic meaning. These toasts are persistent (duration={0}) so they remain visible for comparison.',
      },
    },
  },
};

// Auto-dismiss demo
export const AutoDismissDemo: Story = {
  name: '⏱️ Auto-dismiss Demo',
  render: () => {
    const [toasts, setToasts] = useState<Array<{id: number, variant: ToastProps['variant'], title: string, duration: number}>>([]);
    
    const addToast = (variant: ToastProps['variant'], title: string, duration: number) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, variant, title, duration }]);
    };
    
    const removeToast = (id: number) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Auto-dismiss Timing Demo</h3>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            onClick={() => addToast('success', '2s Auto-dismiss', 2000)}
            variant="primary"
            size="sm"
          >
            2s Toast
          </Button>
          <Button 
            onClick={() => addToast('info', '5s Auto-dismiss', 5000)}
            variant="primary"
            size="sm"
          >
            5s Toast
          </Button>
          <Button 
            onClick={() => addToast('warning', 'Persistent Toast', 0)}
            variant="primary"
            size="sm"
          >
            Persistent
          </Button>
        </div>
        
        <div style={{ position: 'relative', height: '300px', width: '100%' }}>
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              variant={toast.variant}
              title={toast.title}
              description={`Duration: ${toast.duration === 0 ? 'Persistent' : `${toast.duration / 1000}s`}`}
              duration={toast.duration}
              position="top-right"
              style={{ top: (index * 80) + 16 }}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing different auto-dismiss durations. Try the buttons to see toasts with different timing behaviors.',
      },
    },
  },
};