import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Tooltip as WebTooltip } from './Tooltip.web';
import { Tooltip as NativeTooltip } from './Tooltip.native';
import { TooltipProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';

// Create a simple wrapper for Storybook to avoid renderer issues
const TooltipStoryComponent = React.forwardRef<any, TooltipProps>((props, _ref) => {
  return <Tooltip {...props} />;
});
TooltipStoryComponent.displayName = 'Tooltip';

const meta: Meta<TooltipProps> = {
  title: 'Feedback/Tooltip',
  component: TooltipStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Tooltip Component

A unified tooltip component that automatically renders the appropriate implementation based on the platform with smart positioning and accessibility features.

## Features
- **Smart Positioning**: Automatically adjusts position to stay within viewport bounds
- **Multiple Triggers**: Hover, focus, click, and manual control modes
- **Placement Options**: 8 different placement positions with auto-adjustment
- **Animations**: Smooth enter/exit animations optimized per platform
- **Accessibility**: Full WCAG 2.1 AA compliance with proper ARIA attributes
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: Fixed positioned div with CSS animations and hover/focus events
- **React Native**: Animated.View with native animations and touch interactions

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Tooltip } from '@vas-dj-saas/ui';

<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>
\`\`\`

### Advanced Tooltip
\`\`\`tsx
<Tooltip 
  content="Detailed information about this feature"
  placement="bottom-start"
  trigger="click"
  delay={500}
  arrow={true}
>
  <span>Click for info</span>
</Tooltip>
\`\`\`

### Controlled Tooltip
\`\`\`tsx
const [visible, setVisible] = useState(false);

<Tooltip 
  content="Controlled tooltip visibility"
  visible={visible}
  trigger="manual"
>
  <Button onClick={() => setVisible(!visible)}>
    Toggle Tooltip
  </Button>
</Tooltip>
\`\`\`

## Benefits

✅ **Smart Positioning** - Automatically stays within viewport bounds  
✅ **Multi-trigger Support** - Hover, focus, click, and manual modes  
✅ **Accessible** - Full ARIA support and keyboard navigation  
✅ **Theme Consistency** - Unified design system  
✅ **Performance** - Optimized rendering and animations  
✅ **Cross-platform** - Consistent API across web and mobile
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '100px', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      description: 'Position of the tooltip relative to the trigger element',
    },
    trigger: {
      control: { type: 'select' },
      options: ['hover', 'focus', 'click', 'manual'],
      description: 'How the tooltip is triggered',
    },
    visible: {
      control: { type: 'boolean' },
      description: 'Whether the tooltip is visible (for manual trigger)',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Delay in milliseconds before showing tooltip',
    },
    offset: {
      control: { type: 'number', min: 0, max: 50, step: 2 },
      description: 'Distance in pixels from the trigger element',
    },
    arrow: {
      control: { type: 'boolean' },
      description: 'Whether to show the tooltip arrow',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the tooltip is disabled',
    },
    content: {
      control: { type: 'text' },
      description: 'Tooltip content text',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    placement: 'top',
    trigger: 'hover',
    delay: 200,
    offset: 8,
    arrow: true,
    disabled: false,
    content: 'This is a helpful tooltip',
  },
};

export default meta;
type Story = StoryObj<TooltipProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: (args) => {
    const [visible, setVisible] = useState(args.visible);
    
    return (
      <Tooltip 
        {...args} 
        visible={args.trigger === 'manual' ? visible : args.visible}
      >
        <Button 
          onClick={() => args.trigger === 'manual' && setVisible(!visible)}
          variant="primary"
        >
          {args.trigger === 'hover' ? 'Hover me' : 
           args.trigger === 'focus' ? 'Focus me' :
           args.trigger === 'click' ? 'Click me' : 'Toggle tooltip'}
        </Button>
      </Tooltip>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below. The trigger element changes based on the selected trigger type.',
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
        alignItems: 'center'
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
          <div style={{ padding: '40px', border: '1px dashed #ccc', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <WebTooltip {...args} content="Web tooltip with hover events">
              <Button variant="primary">
                Hover me (Web)
              </Button>
            </WebTooltip>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Fixed positioned div<br/>
            Hover & focus events<br/>
            CSS animations
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
          <div style={{ padding: '40px', border: '1px dashed #ccc', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <NativeTooltip {...args} content="Native tooltip with touch events" trigger="click">
              <Button variant="secondary">
                Touch me (Native)
              </Button>
            </NativeTooltip>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated.View component<br/>
            Touch interactions<br/>
            Native animations
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    placement: 'top',
    content: 'Cross-platform tooltip',
    arrow: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// All placements showcase
export const AllPlacements: Story = {
  name: '📍 All Placements',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Tooltip Placement Options</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '600px',
        alignItems: 'center',
        justifyItems: 'center'
      }}>
        {/* Top placements */}
        <Tooltip content="Top start placement" placement="top-start">
          <Button variant="primary" size="sm">
            Top Start
          </Button>
        </Tooltip>
        
        <Tooltip content="Top center placement" placement="top">
          <Button variant="primary" size="sm">
            Top
          </Button>
        </Tooltip>
        
        <Tooltip content="Top end placement" placement="top-end">
          <Button variant="primary" size="sm">
            Top End
          </Button>
        </Tooltip>

        {/* Side placements */}
        <Tooltip content="Left placement" placement="left">
          <Button variant="secondary" size="sm">
            Left
          </Button>
        </Tooltip>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Center<br/>Reference
        </div>
        
        <Tooltip content="Right placement" placement="right">
          <Button variant="secondary" size="sm">
            Right
          </Button>
        </Tooltip>

        {/* Bottom placements */}
        <Tooltip content="Bottom start placement" placement="bottom-start">
          <Button variant="secondary" size="sm">
            Bottom Start
          </Button>
        </Tooltip>
        
        <Tooltip content="Bottom center placement" placement="bottom">
          <Button variant="secondary" size="sm">
            Bottom
          </Button>
        </Tooltip>
        
        <Tooltip content="Bottom end placement" placement="bottom-end">
          <Button variant="secondary" size="sm">
            Bottom End
          </Button>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available tooltip placement options. Each tooltip automatically adjusts if it would go outside the viewport.',
      },
    },
  },
};

// Trigger types demo
export const TriggerTypes: Story = {
  name: '🎯 Trigger Types',
  render: () => {
    const [manualVisible, setManualVisible] = useState(false);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Tooltip Trigger Types</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '24px', 
          width: '100%', 
          maxWidth: '600px'
        }}>
          {/* Hover trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Hover Trigger</div>
            <Tooltip content="Appears on mouse hover" trigger="hover" placement="top">
              <Button variant="primary">
                Hover me
              </Button>
            </Tooltip>
            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
              Default behavior<br/>Mouse enter/leave
            </div>
          </div>

          {/* Focus trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Focus Trigger</div>
            <Tooltip content="Appears on keyboard focus" trigger="focus" placement="top">
              <Button variant="secondary">
                Focus me
              </Button>
            </Tooltip>
            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
              Keyboard accessible<br/>Tab to focus
            </div>
          </div>

          {/* Click trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Click Trigger</div>
            <Tooltip content="Toggles on click" trigger="click" placement="bottom">
              <Button variant="secondary">
                Click me
              </Button>
            </Tooltip>
            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
              Toggle behavior<br/>Click to show/hide
            </div>
          </div>

          {/* Manual trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Manual Trigger</div>
            <Tooltip content="Controlled by external state" trigger="manual" visible={manualVisible} placement="bottom">
              <Button 
                onClick={() => setManualVisible(!manualVisible)}
                variant="secondary"
              >
                {manualVisible ? 'Hide' : 'Show'} tooltip
              </Button>
            </Tooltip>
            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
              Controlled visibility<br/>External state management
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different ways to trigger tooltip visibility: hover (default), focus (keyboard accessible), click (toggle), and manual (controlled).',
      },
    },
  },
};

// Accessibility demo
export const AccessibilityFeatures: Story = {
  name: '♿ Accessibility Features',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '600px',
        border: '1px solid #0ea5e9'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#0c4a6e' }}>
          WCAG 2.1 AA Compliant
        </h3>
        <p style={{ margin: '0', fontSize: '12px', color: '#0369a1' }}>
          Full accessibility support with proper ARIA attributes and keyboard navigation
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '600px'
      }}>
        {/* Keyboard Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>
            Keyboard Navigation
          </div>
          <Tooltip 
            content="This tooltip appears on focus and provides additional context for screen readers"
            trigger="focus"
            placement="top"
            aria-label="Additional information about this feature"
          >
            <Button variant="primary">
              Tab to focus
            </Button>
          </Tooltip>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4' }}>
            ✅ Focus visible<br/>
            ✅ Tab navigation<br/>
            ✅ ARIA labels
          </div>
        </div>

        {/* Screen Reader Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>
            Screen Reader Support
          </div>
          <Tooltip 
            content="Detailed description that provides context and instructions for users with visual impairments"
            trigger="hover"
            placement="top"
            accessibilityLabel="Help information"
            aria-describedby="screen-reader-description"
          >
            <Button 
              variant="secondary"
              aria-label="Settings button with additional help available"
            >
              ⚙️ Settings
            </Button>
          </Tooltip>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4' }}>
            ✅ ARIA describedby<br/>
            ✅ Role attributes<br/>
            ✅ Screen reader text
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#fffbeb', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#92400e',
        textAlign: 'center',
        border: '1px solid #fbbf24',
        maxWidth: '500px'
      }}>
        <strong>Testing tip:</strong> Use a screen reader or browser dev tools to test ARIA attributes and keyboard navigation
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive accessibility features including keyboard navigation, screen reader support, and WCAG 2.1 AA compliance.',
      },
    },
  },
};