import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { List, ListItem } from './List';
import { List as WebList, ListItem as WebListItem } from './List.web';
import { List as NativeList, ListItem as NativeListItem } from './List.native';
import { ListProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const ListStoryComponent = React.forwardRef<any, ListProps>((props, _ref) => {
  return <List {...props} />;
});
ListStoryComponent.displayName = 'List';

const meta: Meta<ListProps> = {
  title: 'Typography/List',
  component: ListStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform List Component

A unified list component (ordered and unordered) that automatically renders the appropriate implementation based on the platform with semantic structure and accessibility.

## Features
- **Semantic HTML**: Proper ul/ol elements on web with correct list structure
- **List Types**: Unordered, ordered, or marker-free lists
- **Custom Markers**: Disc, circle, square, decimal, alphabetic, roman numerals
- **Spacing Variants**: Default, compact, and spacious layouts
- **Size Options**: Small, base, and large typography scaling
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: Semantic HTML list elements (ul/ol/li) with CSS list-style-type
- **React Native**: View/Text components with custom marker rendering and proper accessibility

## Usage Examples

### Basic Usage
\`\`\`tsx
import { List, ListItem } from '@vas-dj-saas/ui';

<List type="unordered">
  <ListItem>First item</ListItem>
  <ListItem>Second item</ListItem>
  <ListItem>Third item</ListItem>
</List>
\`\`\`

### Ordered Lists
\`\`\`tsx
<List type="ordered" marker="decimal">
  <ListItem>First step</ListItem>
  <ListItem>Second step</ListItem>
  <ListItem>Third step</ListItem>
</List>
\`\`\`

### Custom Styling
\`\`\`tsx
<List 
  type="unordered" 
  variant="spacious" 
  size="lg"
  marker="circle"
>
  <ListItem>Large spaced item</ListItem>
  <ListItem>Another large item</ListItem>
</List>
\`\`\`

## Benefits

✅ **Semantic HTML** - Proper list structure for SEO and accessibility  
✅ **Custom Markers** - Rich marker options including roman numerals  
✅ **Cross-Platform** - Consistent appearance on web and mobile  
✅ **Theme Consistency** - Unified design system  
✅ **Accessibility** - Screen reader friendly with proper list roles  
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
    type: {
      control: { type: 'select' },
      options: ['unordered', 'ordered', 'none'],
      description: 'Type of list (unordered, ordered, or no markers)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'spacious'],
      description: 'Spacing variant of the list',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'base', 'lg'],
      description: 'Typography size of the list',
    },
    marker: {
      control: { type: 'select' },
      options: ['disc', 'circle', 'square', 'decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman', 'none'],
      description: 'List marker style',
    },
    indent: {
      control: { type: 'boolean' },
      description: 'Whether to indent the list',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    type: 'unordered',
    variant: 'default',
    size: 'base',
    marker: 'disc',
    indent: true,
    children: (
      <>
        <ListItem>First list item</ListItem>
        <ListItem>Second list item</ListItem>
        <ListItem>Third list item</ListItem>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<ListProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: (
      <>
        <ListItem>Interactive list item one</ListItem>
        <ListItem>Interactive list item two</ListItem>
        <ListItem>Interactive list item three</ListItem>
        <ListItem>Try different controls below!</ListItem>
      </>
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
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '700px'
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
        maxWidth: '700px',
        alignItems: 'start'
      }}>
        {/* Web Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
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
          <WebList {...args}>
            <WebListItem>Cross-platform list item</WebListItem>
            <WebListItem>Semantic HTML structure</WebListItem>
            <WebListItem>Native CSS list styling</WebListItem>
          </WebList>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4',
            width: '100%'
          }}>
            Semantic HTML ul/ol elements<br/>
            Native CSS list-style-type
          </div>
        </div>

        {/* React Native Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
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
          <NativeList {...args}>
            <NativeListItem>Cross-platform list item</NativeListItem>
            <NativeListItem>Custom marker rendering</NativeListItem>
            <NativeListItem>Accessible View structure</NativeListItem>
          </NativeList>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4',
            width: '100%'
          }}>
            View/Text components<br/>
            Custom marker rendering
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized list structures and styling.
      </div>
    </div>
  ),
  args: {
    type: 'unordered',
    variant: 'default',
    marker: 'disc',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// List types showcase
export const ListTypes: Story = {
  name: '📝 List Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>List Types - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web List Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Unordered List</h4>
            <WebList type="unordered">
              <WebListItem>First unordered item</WebListItem>
              <WebListItem>Second unordered item</WebListItem>
              <WebListItem>Third unordered item</WebListItem>
            </WebList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Ordered List</h4>
            <WebList type="ordered">
              <WebListItem>First ordered item</WebListItem>
              <WebListItem>Second ordered item</WebListItem>
              <WebListItem>Third ordered item</WebListItem>
            </WebList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>No Markers</h4>
            <WebList type="none">
              <WebListItem>Item without marker</WebListItem>
              <WebListItem>Another item without marker</WebListItem>
              <WebListItem>Third item without marker</WebListItem>
            </WebList>
          </div>
        </div>

        {/* React Native List Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Unordered List</h4>
            <NativeList type="unordered">
              <NativeListItem>First unordered item</NativeListItem>
              <NativeListItem>Second unordered item</NativeListItem>
              <NativeListItem>Third unordered item</NativeListItem>
            </NativeList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Ordered List</h4>
            <NativeList type="ordered">
              <NativeListItem>First ordered item</NativeListItem>
              <NativeListItem>Second ordered item</NativeListItem>
              <NativeListItem>Third ordered item</NativeListItem>
            </NativeList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>No Markers</h4>
            <NativeList type="none">
              <NativeListItem>Item without marker</NativeListItem>
              <NativeListItem>Another item without marker</NativeListItem>
              <NativeListItem>Third item without marker</NativeListItem>
            </NativeList>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different list types including unordered, ordered, and marker-free lists.',
      },
    },
  },
};

// List markers showcase
export const ListMarkers: Story = {
  name: '🎯 List Markers',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>List Markers - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '1000px'
      }}>
        {/* Web Markers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600 }}>Unordered Markers</h4>
              <WebList type="unordered" marker="disc" variant="compact">
                <WebListItem>Disc marker</WebListItem>
              </WebList>
              <WebList type="unordered" marker="circle" variant="compact">
                <WebListItem>Circle marker</WebListItem>
              </WebList>
              <WebList type="unordered" marker="square" variant="compact">
                <WebListItem>Square marker</WebListItem>
              </WebList>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600 }}>Ordered Markers</h4>
              <WebList type="ordered" marker="decimal" variant="compact">
                <WebListItem>Decimal (1, 2, 3)</WebListItem>
              </WebList>
              <WebList type="ordered" marker="lower-alpha" variant="compact">
                <WebListItem>Lower alpha (a, b, c)</WebListItem>
              </WebList>
              <WebList type="ordered" marker="upper-alpha" variant="compact">
                <WebListItem>Upper alpha (A, B, C)</WebListItem>
              </WebList>
              <WebList type="ordered" marker="lower-roman" variant="compact">
                <WebListItem>Lower roman (i, ii, iii)</WebListItem>
              </WebList>
              <WebList type="ordered" marker="upper-roman" variant="compact">
                <WebListItem>Upper roman (I, II, III)</WebListItem>
              </WebList>
            </div>
          </div>
        </div>

        {/* React Native Markers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600 }}>Unordered Markers</h4>
              <NativeList type="unordered" marker="disc" variant="compact">
                <NativeListItem>Disc marker</NativeListItem>
              </NativeList>
              <NativeList type="unordered" marker="circle" variant="compact">
                <NativeListItem>Circle marker</NativeListItem>
              </NativeList>
              <NativeList type="unordered" marker="square" variant="compact">
                <NativeListItem>Square marker</NativeListItem>
              </NativeList>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600 }}>Ordered Markers</h4>
              <NativeList type="ordered" marker="decimal" variant="compact">
                <NativeListItem>Decimal (1, 2, 3)</NativeListItem>
              </NativeList>
              <NativeList type="ordered" marker="lower-alpha" variant="compact">
                <NativeListItem>Lower alpha (a, b, c)</NativeListItem>
              </NativeList>
              <NativeList type="ordered" marker="upper-alpha" variant="compact">
                <NativeListItem>Upper alpha (A, B, C)</NativeListItem>
              </NativeList>
              <NativeList type="ordered" marker="lower-roman" variant="compact">
                <NativeListItem>Lower roman (i, ii, iii)</NativeListItem>
              </NativeList>
              <NativeList type="ordered" marker="upper-roman" variant="compact">
                <NativeListItem>Upper roman (I, II, III)</NativeListItem>
              </NativeList>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available list marker styles including unordered (disc, circle, square) and ordered (decimal, alphabetic, roman numerals).',
      },
    },
  },
};

// List variants showcase
export const ListVariants: Story = {
  name: '📐 List Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>List Spacing Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Compact Variant</h4>
            <WebList variant="compact">
              <WebListItem>Compact list item one</WebListItem>
              <WebListItem>Compact list item two</WebListItem>
              <WebListItem>Compact list item three</WebListItem>
            </WebList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Default Variant</h4>
            <WebList variant="default">
              <WebListItem>Default list item one</WebListItem>
              <WebListItem>Default list item two</WebListItem>
              <WebListItem>Default list item three</WebListItem>
            </WebList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Spacious Variant</h4>
            <WebList variant="spacious">
              <WebListItem>Spacious list item one</WebListItem>
              <WebListItem>Spacious list item two</WebListItem>
              <WebListItem>Spacious list item three</WebListItem>
            </WebList>
          </div>
        </div>

        {/* React Native Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
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
          
          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Compact Variant</h4>
            <NativeList variant="compact">
              <NativeListItem>Compact list item one</NativeListItem>
              <NativeListItem>Compact list item two</NativeListItem>
              <NativeListItem>Compact list item three</NativeListItem>
            </NativeList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Default Variant</h4>
            <NativeList variant="default">
              <NativeListItem>Default list item one</NativeListItem>
              <NativeListItem>Default list item two</NativeListItem>
              <NativeListItem>Default list item three</NativeListItem>
            </NativeList>
          </div>

          <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Spacious Variant</h4>
            <NativeList variant="spacious">
              <NativeListItem>Spacious list item one</NativeListItem>
              <NativeListItem>Spacious list item two</NativeListItem>
              <NativeListItem>Spacious list item three</NativeListItem>
            </NativeList>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different spacing variants for lists: compact (tight spacing), default (normal spacing), and spacious (loose spacing).',
      },
    },
  },
};