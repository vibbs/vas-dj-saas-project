import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Heading } from './Heading';
import { Heading as WebHeading } from './Heading.web';
import { Heading as NativeHeading } from './Heading.native';
import { HeadingProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const HeadingStoryComponent = React.forwardRef<any, HeadingProps>((props, _ref) => {
  return <Heading {...props} />;
});
HeadingStoryComponent.displayName = 'Heading';

const meta: Meta<HeadingProps> = {
  title: 'Typography/Heading',
  component: HeadingStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Heading Component

A unified heading component (H1-H6) that automatically renders the appropriate implementation based on the platform with semantic HTML structure and consistent typography.

## Features
- **Semantic HTML**: Proper H1-H6 elements on web with correct heading hierarchy
- **Typography Variants**: Display, title, subtitle, and body variants for different contexts
- **Responsive Sizing**: Font sizes automatically scale based on heading level
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper heading structure and ARIA attributes
- **Color Options**: Primary, secondary, muted, destructive, and inherit colors

## Platform Implementations
- **Web**: Semantic HTML heading elements (h1-h6) with CSS styling
- **React Native**: Text component with appropriate font styling and accessibility

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Heading } from '@vas-dj-saas/ui';

<Heading level={1} variant="title">
  Page Title
</Heading>
\`\`\`

### With Color and Alignment
\`\`\`tsx
<Heading 
  level={2} 
  variant="subtitle" 
  color="primary" 
  align="center"
>
  Section Subtitle
</Heading>
\`\`\`

### Semantic Heading Hierarchy
\`\`\`tsx
<Heading level={1} variant="display">Main Title</Heading>
<Heading level={2} variant="title">Section Title</Heading>
<Heading level={3} variant="subtitle">Subsection</Heading>
\`\`\`

## Benefits

✅ **Semantic HTML** - Proper heading structure for SEO and accessibility  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Typography Scale** - Consistent sizing based on heading level  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - Screen reader friendly with proper heading structure
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ maxWidth: '800px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'Semantic heading level (H1-H6)',
    },
    variant: {
      control: { type: 'select' },
      options: ['display', 'title', 'subtitle', 'body'],
      description: 'Typography variant that affects size and weight',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'muted', 'destructive', 'inherit'],
      description: 'Text color variant',
    },
    children: {
      control: { type: 'text' },
      description: 'Heading text content',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: 'This is a heading',
    level: 1,
    variant: 'title',
    align: 'left',
    color: 'inherit',
  },
};

export default meta;
type Story = StoryObj<HeadingProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Heading',
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
          <WebHeading {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Semantic HTML heading element<br/>
            Proper document structure
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
          <NativeHeading {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Text component with accessibility<br/>
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized elements and accessibility features.
      </div>
    </div>
  ),
  args: {
    children: 'Cross-Platform Heading',
    level: 2,
    variant: 'title',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// Heading hierarchy showcase
export const HeadingHierarchy: Story = {
  name: '📋 Heading Hierarchy',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Semantic Heading Hierarchy - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebHeading level={1} variant="title">H1 Main Title</WebHeading>
            <WebHeading level={2} variant="title">H2 Section Title</WebHeading>
            <WebHeading level={3} variant="title">H3 Subsection</WebHeading>
            <WebHeading level={4} variant="title">H4 Sub-subsection</WebHeading>
            <WebHeading level={5} variant="title">H5 Minor Heading</WebHeading>
            <WebHeading level={6} variant="title">H6 Smallest Heading</WebHeading>
          </div>
        </div>

        {/* React Native Hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeHeading level={1} variant="title">H1 Main Title</NativeHeading>
            <NativeHeading level={2} variant="title">H2 Section Title</NativeHeading>
            <NativeHeading level={3} variant="title">H3 Subsection</NativeHeading>
            <NativeHeading level={4} variant="title">H4 Sub-subsection</NativeHeading>
            <NativeHeading level={5} variant="title">H5 Minor Heading</NativeHeading>
            <NativeHeading level={6} variant="title">H6 Smallest Heading</NativeHeading>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete heading hierarchy (H1-H6) shown side by side with automatic font size scaling based on heading level.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 Typography Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Typography Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <WebHeading level={1} variant="display">Display Variant</WebHeading>
            <WebHeading level={1} variant="title">Title Variant</WebHeading>
            <WebHeading level={2} variant="subtitle">Subtitle Variant</WebHeading>
            <WebHeading level={3} variant="body">Body Variant</WebHeading>
          </div>
        </div>

        {/* React Native Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <NativeHeading level={1} variant="display">Display Variant</NativeHeading>
            <NativeHeading level={1} variant="title">Title Variant</NativeHeading>
            <NativeHeading level={2} variant="subtitle">Subtitle Variant</NativeHeading>
            <NativeHeading level={3} variant="body">Body Variant</NativeHeading>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All typography variants showing different styles and weights for various use cases.',
      },
    },
  },
};

// Color variants
export const ColorVariants: Story = {
  name: '🎨 Color Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Color Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Web Colors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebHeading level={2} color="inherit">Default Color</WebHeading>
            <WebHeading level={2} color="primary">Primary Color</WebHeading>
            <WebHeading level={2} color="secondary">Secondary Color</WebHeading>
            <WebHeading level={2} color="muted">Muted Color</WebHeading>
            <WebHeading level={2} color="destructive">Destructive Color</WebHeading>
          </div>
        </div>

        {/* React Native Colors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeHeading level={2} color="inherit">Default Color</NativeHeading>
            <NativeHeading level={2} color="primary">Primary Color</NativeHeading>
            <NativeHeading level={2} color="secondary">Secondary Color</NativeHeading>
            <NativeHeading level={2} color="muted">Muted Color</NativeHeading>
            <NativeHeading level={2} color="destructive">Destructive Color</NativeHeading>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available color variants for headings using the unified theme system.',
      },
    },
  },
};