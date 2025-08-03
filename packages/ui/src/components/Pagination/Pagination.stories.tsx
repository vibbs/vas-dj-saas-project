import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Pagination } from './Pagination';
import { Pagination as WebPagination } from './Pagination.web';
import { Pagination as NativePagination } from './Pagination.native';
import { PaginationProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const PaginationStoryComponent = React.forwardRef<any, PaginationProps>((props, _ref) => {
  return <Pagination {...props} />;
});
PaginationStoryComponent.displayName = 'Pagination';

const meta: Meta<PaginationProps> = {
  title: 'Navigation/Pagination',
  component: PaginationStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Pagination Component

A unified pagination component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Flexible Page Display**: Configurable visible pages, ellipsis handling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Navigation Controls**: First/last, previous/next buttons with customizable labels

## Platform Implementations
- **Web**: HTML nav element with CSS-based styling and Lucide icons
- **React Native**: TouchableOpacity components with Unicode symbols

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Pagination } from '@vas-dj-saas/ui';

<Pagination 
  currentPage={5}
  totalPages={20}
  onPageChange={(page) => console.log('Page:', page)}
/>
\`\`\`

### With Custom Configuration
\`\`\`tsx
import { Pagination } from '@vas-dj-saas/ui';

<Pagination 
  currentPage={1}
  totalPages={50}
  maxVisiblePages={7}
  showFirstLast={true}
  showPrevNext={true}
  onPageChange={(page) => navigate(\`/page/\${page}\`)}
  size="lg"
  variant="outline"
/>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<Pagination 
  currentPage={3}
  totalPages={10}
  onPress={(page) => alert(\`Native page: \${page}\`)}
/>

// Web
<Pagination 
  currentPage={3}
  totalPages={10}
  onClick={(page) => alert(\`Web page: \${page}\`)}
/>
\`\`\`

## Benefits

✅ **Smart Page Display** - Intelligent ellipsis and page grouping  
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
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Current active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 100 },
      description: 'Total number of pages',
    },
    maxVisiblePages: {
      control: { type: 'number', min: 3, max: 10 },
      description: 'Maximum number of page buttons to show',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination component',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'minimal'],
      description: 'Visual style variant',
    },
    showFirstLast: {
      control: { type: 'boolean' },
      description: 'Show first and last page buttons',
    },
    showPrevNext: {
      control: { type: 'boolean' },
      description: 'Show previous and next page buttons',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all pagination interactions',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    onPageChange: {
      action: 'page-changed',
      description: 'Callback when page changes',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler',
    },
  },
  args: {
    currentPage: 5,
    totalPages: 20,
    maxVisiblePages: 5,
    size: 'md',
    variant: 'default',
    showFirstLast: true,
    showPrevNext: true,
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<PaginationProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    currentPage: 5,
    totalPages: 20,
    onPageChange: (page) => console.log('Page changed to:', page),
    onPress: (page) => console.log('Native page press:', page),
    onClick: (page) => console.log('Web page click:', page),
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
        maxWidth: '800px'
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
        maxWidth: '900px',
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
          <WebPagination {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML nav with Lucide icons<br />
            Hover effects & transitions
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
          <NativePagination {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with Unicode symbols<br />
            Platform-appropriate touch feedback
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
    currentPage: 5,
    totalPages: 15,
    maxVisiblePages: 5,
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized pagination components.',
      },
    },
  },
};

// Different page scenarios
export const PageScenarios: Story = {
  name: '📄 Page Scenarios',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Page Scenarios</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Scenarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Few Pages (5 total)</div>
              <WebPagination currentPage={2} totalPages={5} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Many Pages (50 total)</div>
              <WebPagination currentPage={25} totalPages={50} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>First Page</div>
              <WebPagination currentPage={1} totalPages={20} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Last Page</div>
              <WebPagination currentPage={20} totalPages={20} onPageChange={() => { }} />
            </div>
          </div>
        </div>

        {/* React Native Scenarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Few Pages (5 total)</div>
              <NativePagination currentPage={2} totalPages={5} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Many Pages (50 total)</div>
              <NativePagination currentPage={25} totalPages={50} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>First Page</div>
              <NativePagination currentPage={1} totalPages={20} onPageChange={() => { }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Last Page</div>
              <NativePagination currentPage={20} totalPages={20} onPageChange={() => { }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different pagination scenarios including few pages, many pages, and edge cases like first/last page navigation.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Pagination Variants - Side by Side</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
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
            <WebPagination variant="default" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <WebPagination variant="outline" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <WebPagination variant="minimal" currentPage={3} totalPages={10} onPageChange={() => { }} />
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
            <NativePagination variant="default" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <NativePagination variant="outline" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <NativePagination variant="minimal" currentPage={3} totalPages={10} onPageChange={() => { }} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available pagination variants shown side by side for web and React Native platforms using the unified theme system.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Pagination Sizes - Side by Side</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
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
            <WebPagination variant="default" size="sm" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <WebPagination variant="default" size="md" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <WebPagination variant="default" size="lg" currentPage={3} totalPages={10} onPageChange={() => { }} />
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
            <NativePagination variant="default" size="sm" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <NativePagination variant="default" size="md" currentPage={3} totalPages={10} onPageChange={() => { }} />
            <NativePagination variant="default" size="lg" currentPage={3} totalPages={10} onPageChange={() => { }} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available pagination sizes shown side by side with consistent spacing and typography across platforms.',
      },
    },
  },
};