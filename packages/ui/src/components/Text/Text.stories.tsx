import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Text } from './Text';
import { Text as WebText } from './Text.web';
import { Text as NativeText } from './Text.native';
import { TextProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const TextStoryComponent = React.forwardRef<any, TextProps>((props, _ref) => {
  return <Text {...props} />;
});
TextStoryComponent.displayName = 'Text';

const meta: Meta<TextProps> = {
  title: 'Typography/Text',
  component: TextStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Text Component

A unified text component for paragraphs and body content that automatically renders the appropriate implementation based on the platform.

## Features
- **Typography Variants**: Body, small, large, caption, and overline styles
- **Flexible Sizing**: Independent size control with xs, sm, base, lg, xl options
- **Weight Options**: Normal, medium, semibold, and bold font weights
- **Text Decoration**: Support for italic, underline, and strikethrough
- **Truncation**: Cross-platform text truncation with ellipsis
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: HTML paragraph elements with CSS styling and text decorations
- **React Native**: Text component with platform-appropriate styling and truncation

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Text } from '@vas-dj-saas/ui';

<Text variant="body">
  This is a paragraph of body text with proper line height and spacing.
</Text>
\`\`\`

### With Styling Options
\`\`\`tsx
<Text 
  variant="large" 
  weight="semibold" 
  color="primary"
  align="center"
>
  Large semibold centered text
</Text>
\`\`\`

### Text Decorations
\`\`\`tsx
<Text italic underline>Italic underlined text</Text>
<Text strikethrough color="muted">Strikethrough muted text</Text>
<Text truncate>This is a very long text that will be truncated with ellipsis</Text>
\`\`\`

## Benefits

✅ **Semantic HTML** - Proper paragraph elements for accessibility  
✅ **Flexible Typography** - Independent control of size, weight, and variant  
✅ **Text Decorations** - Rich formatting options  
✅ **Theme Consistency** - Unified design system  
✅ **Cross-Platform** - Works on both web and mobile  
✅ **Performance** - Platform-optimized rendering
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ maxWidth: '600px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['body', 'small', 'large', 'caption', 'overline'],
      description: 'Typography variant that affects base styling',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'base', 'lg', 'xl'],
      description: 'Font size (overrides variant size)',
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'muted', 'destructive', 'inherit'],
      description: 'Text color variant',
    },
    italic: {
      control: { type: 'boolean' },
      description: 'Italic text style',
    },
    underline: {
      control: { type: 'boolean' },
      description: 'Underline text decoration',
    },
    strikethrough: {
      control: { type: 'boolean' },
      description: 'Strikethrough text decoration',
    },
    truncate: {
      control: { type: 'boolean' },
      description: 'Truncate text with ellipsis',
    },
    children: {
      control: { type: 'text' },
      description: 'Text content',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: 'This is sample text content that demonstrates the Text component capabilities.',
    variant: 'body',
    weight: 'normal',
    align: 'left',
    color: 'inherit',
    italic: false,
    underline: false,
    strikethrough: false,
    truncate: false,
  },
};

export default meta;
type Story = StoryObj<TextProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Text - Try different combinations using the controls below!',
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
          <WebText {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML paragraph element<br/>
            CSS text decorations
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
          <NativeText {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Text component<br/>
            Native text decorations
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized elements and styling.
      </div>
    </div>
  ),
  args: {
    children: 'Cross-platform text that looks great everywhere!',
    variant: 'body',
    weight: 'medium',
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

// Typography variants showcase
export const TypographyVariants: Story = {
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
            <WebText variant="large">Large variant text</WebText>
            <WebText variant="body">Body variant text (default)</WebText>
            <WebText variant="small">Small variant text</WebText>
            <WebText variant="caption">Caption variant text</WebText>
            <WebText variant="overline">OVERLINE VARIANT TEXT</WebText>
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
            <NativeText variant="large">Large variant text</NativeText>
            <NativeText variant="body">Body variant text (default)</NativeText>
            <NativeText variant="small">Small variant text</NativeText>
            <NativeText variant="caption">Caption variant text</NativeText>
            <NativeText variant="overline">OVERLINE VARIANT TEXT</NativeText>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All typography variants showing different styles and use cases for various content types.',
      },
    },
  },
};

// Text decorations showcase
export const TextDecorations: Story = {
  name: '✨ Text Decorations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Text Decorations - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Web Decorations */}
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
            <WebText>Normal text</WebText>
            <WebText italic>Italic text</WebText>
            <WebText underline>Underlined text</WebText>
            <WebText strikethrough>Strikethrough text</WebText>
            <WebText italic underline weight="semibold">Combined decorations</WebText>
            <WebText truncate style={{ width: '200px' }}>This is a very long text that will be truncated with ellipsis when it exceeds the container width</WebText>
          </div>
        </div>

        {/* React Native Decorations */}
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
            <NativeText>Normal text</NativeText>
            <NativeText italic>Italic text</NativeText>
            <NativeText underline>Underlined text</NativeText>
            <NativeText strikethrough>Strikethrough text</NativeText>
            <NativeText italic underline weight="semibold">Combined decorations</NativeText>
            <NativeText truncate style={{ width: 200 }}>This is a very long text that will be truncated with ellipsis when it exceeds the container width</NativeText>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Various text decorations including italic, underline, strikethrough, and truncation.',
      },
    },
  },
};

// Font weights showcase
export const FontWeights: Story = {
  name: '💪 Font Weights',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Font Weights - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Web Weights */}
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
            <WebText weight="normal">Normal weight text (400)</WebText>
            <WebText weight="medium">Medium weight text (500)</WebText>
            <WebText weight="semibold">Semibold weight text (600)</WebText>
            <WebText weight="bold">Bold weight text (700)</WebText>
          </div>
        </div>

        {/* React Native Weights */}
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
            <NativeText weight="normal">Normal weight text (400)</NativeText>
            <NativeText weight="medium">Medium weight text (500)</NativeText>
            <NativeText weight="semibold">Semibold weight text (600)</NativeText>
            <NativeText weight="bold">Bold weight text (700)</NativeText>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available font weights showing the typography hierarchy.',
      },
    },
  },
};