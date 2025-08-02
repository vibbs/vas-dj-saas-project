import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Skeleton } from './Skeleton';
import { Skeleton as WebSkeleton } from './Skeleton.web';
import { Skeleton as NativeSkeleton } from './Skeleton.native';
import { SkeletonProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const SkeletonStoryComponent = React.forwardRef<any, SkeletonProps>((props, _ref) => {
  return <Skeleton {...props} />;
});
SkeletonStoryComponent.displayName = 'Skeleton';

const meta: Meta<SkeletonProps> = {
  title: 'Feedback/Skeleton',
  component: SkeletonStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Skeleton Component

A unified skeleton loading component that automatically renders the appropriate implementation based on the platform with multiple variants and smooth animations.

## Features
- **Multiple Variants**: Text, rectangular, circular, and rounded shapes
- **Text Lines**: Support for multi-line text placeholders with realistic proportions
- **Animations**: Pulse, wave, or no animation options
- **Responsive**: Flexible width and height with percentage and pixel support
- **Accessibility**: Full WCAG 2.1 AA compliance with proper ARIA attributes
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: CSS-based animations with keyframes and proper semantic markup
- **React Native**: Animated.View with native timing animations and accessibility support

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Skeleton } from '@vas-dj-saas/ui';

<Skeleton width={200} height={40} />
\`\`\`

### Text Placeholder
\`\`\`tsx
<Skeleton variant="text" lines={3} width="100%" />
\`\`\`

### Profile Card Skeleton
\`\`\`tsx
<div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
  <Skeleton variant="circular" width={50} height={50} />
  <div style={{ flex: 1 }}>
    <Skeleton variant="text" width="70%" height={16} />
    <Skeleton variant="text" width="50%" height={14} />
  </div>
</div>
\`\`\`

### Card Layout Skeleton
\`\`\`tsx
<div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
  <Skeleton variant="rectangular" width="100%" height={200} />
  <Skeleton variant="text" lines={2} style={{ marginTop: '12px' }} />
</div>
\`\`\`

## Benefits

✅ **Multiple Variants** - Text, rectangular, circular, and rounded shapes  
✅ **Realistic Loading** - Multi-line text with varied widths  
✅ **Smooth Animations** - Pulse and wave effects optimized per platform  
✅ **Accessible** - Proper ARIA attributes and screen reader support  
✅ **Theme Consistency** - Unified design system  
✅ **Performance** - Optimized animations using native drivers
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ padding: '24px', maxWidth: '600px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['text', 'rectangular', 'circular', 'rounded'],
      description: 'Shape variant of the skeleton',
    },
    width: {
      control: { type: 'text' },
      description: 'Width in pixels or percentage (e.g., "100%", 200)',
    },
    height: {
      control: { type: 'text' },
      description: 'Height in pixels or percentage (e.g., "50px", 40)',
    },
    lines: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Number of lines for text variant',
    },
    animation: {
      control: { type: 'select' },
      options: ['pulse', 'wave', 'none'],
      description: 'Animation type for the skeleton',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    variant: 'rectangular',
    width: 200,
    height: 40,
    lines: 1,
    animation: 'pulse',
  },
};

export default meta;
type Story = StoryObj<SkeletonProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <h3 style={{ margin: '0', fontSize: '16px' }}>Skeleton Playground</h3>
      <Skeleton {...args} />
      <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '400px' }}>
        Try different combinations of props using the controls below. The skeleton will update in real-time.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below to see how the skeleton adapts.',
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
          <div style={{ padding: '16px', border: '1px dashed #ccc', borderRadius: '6px', width: '100%' }}>
            <WebSkeleton {...args} width="100%" />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            CSS keyframe animations<br/>
            DOM-based rendering<br/>
            Semantic HTML structure
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
          <div style={{ padding: '16px', border: '1px dashed #ccc', borderRadius: '6px', width: '100%' }}>
            <NativeSkeleton {...args} width="100%" />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated.View component<br/>
            Native timing animations<br/>
            Performance optimized
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    variant: 'rectangular',
    width: 200,
    height: 60,
    animation: 'pulse',
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
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Skeleton Variants</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Text Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Text Variant</div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <Skeleton variant="text" lines={1} width="80%" />
            <div style={{ marginTop: '16px' }}>
              <Skeleton variant="text" lines={3} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <Skeleton variant="text" lines={2} width="60%" />
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Perfect for text content, titles, and paragraphs
          </div>
        </div>

        {/* Rectangular Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Rectangular Variant</div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="rectangular" width="60%" height={40} />
            <Skeleton variant="rectangular" width="40%" height={20} />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Great for images, cards, and block content
          </div>
        </div>

        {/* Circular Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Circular Variant</div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={30} height={30} />
            <Skeleton variant="circular" width={20} height={20} />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Perfect for avatars, profile pictures, and icons
          </div>
        </div>

        {/* Rounded Variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Rounded Variant</div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton variant="rounded" width="100%" height={80} />
            <Skeleton variant="rounded" width="70%" height={50} />
            <Skeleton variant="rounded" width="50%" height={30} />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Ideal for buttons, tags, and rounded UI elements
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available skeleton variants showcasing different use cases and visual styles.',
      },
    },
  },
};

// Animation types demo
export const AnimationTypes: Story = {
  name: '✨ Animation Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Skeleton Animations</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Pulse Animation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Pulse Animation</div>
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton variant="rectangular" width="100%" height={60} animation="pulse" />
            <Skeleton variant="text" lines={2} animation="pulse" />
            <Skeleton variant="circular" width={40} height={40} animation="pulse" />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
            Default smooth pulse effect<br/>
            Gentle opacity changes
          </div>
        </div>

        {/* Wave Animation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Wave Animation</div>
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton variant="rectangular" width="100%" height={60} animation="wave" />
            <Skeleton variant="text" lines={2} animation="wave" />
            <Skeleton variant="circular" width={40} height={40} animation="wave" />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
            Shimmer wave effect<br/>
            Moving light gradient
          </div>
        </div>

        {/* No Animation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>No Animation</div>
          <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton variant="rectangular" width="100%" height={60} animation="none" />
            <Skeleton variant="text" lines={2} animation="none" />
            <Skeleton variant="circular" width={40} height={40} animation="none" />
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
            Static placeholder<br/>
            No motion for accessibility
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different animation types available for skeleton loading states. Choose based on your design preferences and accessibility requirements.',
      },
    },
  },
};

// Real-world examples
export const RealWorldExamples: Story = {
  name: '🏗️ Real-world Examples',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Common Loading Patterns</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '1000px'
      }}>
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Profile Card</div>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <Skeleton variant="circular" width={60} height={60} />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={18} />
              <Skeleton variant="text" width="50%" height={14} style={{ marginTop: '8px' }} />
              <Skeleton variant="text" width="90%" height={12} style={{ marginTop: '12px' }} />
            </div>
          </div>
        </div>

        {/* Article Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Article Card</div>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <Skeleton variant="rectangular" width="100%" height={160} />
            <div style={{ padding: '16px' }}>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" lines={3} style={{ marginTop: '12px' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            </div>
          </div>
        </div>

        {/* List Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>List Items</div>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                paddingBottom: index < 3 ? '16px' : '0',
                marginBottom: index < 3 ? '16px' : '0',
                borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none'
              }}>
                <Skeleton variant="circular" width={40} height={40} />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} style={{ marginTop: '4px' }} />
                </div>
                <Skeleton variant="rounded" width={60} height={24} />
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Dashboard Widget</div>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="rounded" width={80} height={32} />
            </div>
            <Skeleton variant="rectangular" width="100%" height={120} />
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={14} style={{ marginTop: '4px' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={14} style={{ marginTop: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common loading patterns using skeleton components. These examples show how to compose skeletons to create realistic loading states for different UI patterns.',
      },
    },
  },
};