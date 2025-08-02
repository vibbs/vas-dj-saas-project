import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { Progress } from './Progress';
import { Progress as WebProgress } from './Progress.web';
import { Progress as NativeProgress } from './Progress.native';
import { ProgressProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const ProgressStoryComponent = React.forwardRef<any, ProgressProps>((props, _ref) => {
  return <Progress {...props} />;
});
ProgressStoryComponent.displayName = 'Progress';

const meta: Meta<ProgressProps> = {
  title: 'Feedback/Progress',
  component: ProgressStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Progress Component

A unified progress indicator component that automatically renders the appropriate implementation based on the platform with linear and circular variants.

## Features
- **Linear & Circular Variants**: Support for both horizontal bars and circular progress rings
- **Multiple Sizes**: Small, medium, large, and extra-large size options
- **Color Variants**: Primary, secondary, success, warning, and error color schemes
- **Customizable**: Adjustable thickness, radius, and track visibility
- **Labels**: Optional percentage display for both variants
- **Accessibility**: Full WCAG 2.1 AA compliance with proper ARIA attributes
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: CSS-based styling with SVG for circular variant and smooth transitions
- **React Native**: Native View components with border styling for circular progress

## Usage Examples

### Basic Linear Progress
\`\`\`tsx
import { Progress } from '@vas-dj-saas/ui';

<Progress value={65} />
\`\`\`

### Circular Progress with Label
\`\`\`tsx
<Progress 
  variant="circular" 
  value={75} 
  label={true}
  color="success"
  size="lg"
/>
\`\`\`

### Custom Styled Progress
\`\`\`tsx
<Progress 
  variant="circular"
  value={90}
  size="xl"
  thickness={8}
  radius={60}
  color="primary"
  label={true}
/>
\`\`\`

### Loading States
\`\`\`tsx
// Indeterminate loading (future enhancement)
<Progress value={100} color="primary" />

// Step progress
<Progress value={33} color="warning" label={true} />
\`\`\`

## Benefits

✅ **Dual Variants** - Linear bars and circular rings for different use cases  
✅ **Size Flexibility** - Multiple predefined sizes with custom override options  
✅ **Visual Hierarchy** - Color coding for different states and meanings  
✅ **Accessible** - Proper ARIA attributes and screen reader support  
✅ **Theme Consistency** - Unified design system  
✅ **Smooth Animations** - Transitions optimized for each platform
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
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value between 0 and 100',
    },
    variant: {
      control: { type: 'select' },
      options: ['linear', 'circular'],
      description: 'Visual style variant of the progress indicator',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the progress indicator',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color scheme of the progress indicator',
    },
    track: {
      control: { type: 'boolean' },
      description: 'Whether to show the background track',
    },
    label: {
      control: { type: 'boolean' },
      description: 'Whether to show percentage label',
    },
    thickness: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: 'Stroke thickness for circular variant',
    },
    radius: {
      control: { type: 'number', min: 10, max: 100, step: 5 },
      description: 'Radius for circular variant',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    value: 65,
    variant: 'linear',
    size: 'md',
    color: 'primary',
    track: true,
    label: false,
  },
};

export default meta;
type Story = StoryObj<ProgressProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '300px' }}>
      <h3 style={{ margin: '0', fontSize: '16px' }}>Progress Playground</h3>
      <Progress {...args} />
      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Try different combinations of props using the controls below.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Try different combinations of props using the controls below to see how the progress indicator adapts.',
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
          <div style={{ padding: '16px', border: '1px dashed #ccc', borderRadius: '6px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <WebProgress {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            CSS styling & transitions<br/>
            SVG for circular variant<br/>
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
          <div style={{ padding: '16px', border: '1px dashed #ccc', borderRadius: '6px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <NativeProgress {...args} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Native View components<br/>
            Border styling for circular progress<br/>
            Platform optimized
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    value: 75,
    variant: 'circular',
    size: 'lg',
    color: 'primary',
    label: true,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Progress Variants</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '48px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Linear Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Linear Progress</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Primary (65%)</div>
              <Progress variant="linear" value={65} color="primary" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Success (85%)</div>
              <Progress variant="linear" value={85} color="success" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Warning (45%)</div>
              <Progress variant="linear" value={45} color="warning" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Error (25%)</div>
              <Progress variant="linear" value={25} color="error" />
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>With Label (75%)</div>
              <Progress variant="linear" value={75} color="primary" label={true} />
            </div>
          </div>
        </div>

        {/* Circular Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Circular Progress</div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={65} color="primary" size="md" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Primary</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={85} color="success" size="md" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Success</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={45} color="warning" size="md" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Warning</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={25} color="error" size="md" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Error</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={90} color="primary" size="lg" label={true} />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Large with Label</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available progress variants showcasing different colors, sizes, and configurations.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  name: '📏 Size Variations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Progress Sizes</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '48px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Linear Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Linear Sizes</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Small</div>
              <Progress variant="linear" value={70} size="sm" color="primary" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Medium (Default)</div>
              <Progress variant="linear" value={70} size="md" color="primary" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Large</div>
              <Progress variant="linear" value={70} size="lg" color="primary" />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Extra Large</div>
              <Progress variant="linear" value={70} size="xl" color="primary" />
            </div>
          </div>
        </div>

        {/* Circular Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>Circular Sizes</div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={70} size="sm" color="primary" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Small</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={70} size="md" color="primary" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Medium</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={70} size="lg" color="primary" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Large</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Progress variant="circular" value={70} size="xl" color="primary" />
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Extra Large</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different size options available for both linear and circular progress indicators.',
      },
    },
  },
};

// Animated demo
export const AnimatedDemo: Story = {
  name: '🎬 Animated Demo',
  render: () => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 2;
          return next > 100 ? 0 : next;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Animated Progress Demo</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '32px', 
          width: '100%', 
          maxWidth: '900px',
          alignItems: 'center'
        }}>
          {/* Linear Animation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Linear Animation</div>
            <div style={{ width: '100%' }}>
              <Progress variant="linear" value={progress} color="primary" size="lg" />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Progress: {Math.round(progress)}%
            </div>
          </div>

          {/* Circular Animation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Circular Animation</div>
            <Progress variant="circular" value={progress} color="success" size="xl" label={true} />
          </div>

          {/* Multi-step Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Step Progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <Progress 
                variant="linear" 
                value={progress > 33 ? 100 : (progress / 33) * 100} 
                color={progress > 33 ? 'success' : 'primary'} 
                size="sm" 
              />
              <Progress 
                variant="linear" 
                value={progress > 66 ? 100 : progress > 33 ? ((progress - 33) / 33) * 100 : 0} 
                color={progress > 66 ? 'success' : progress > 33 ? 'primary' : 'secondary'} 
                size="sm" 
              />
              <Progress 
                variant="linear" 
                value={progress > 66 ? ((progress - 66) / 34) * 100 : 0} 
                color={progress > 66 ? 'primary' : 'secondary'} 
                size="sm" 
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Step {Math.ceil(progress / 33.33)} of 3
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Animated demonstration showing smooth progress transitions and different use cases including step-based progress.',
      },
    },
  },
};