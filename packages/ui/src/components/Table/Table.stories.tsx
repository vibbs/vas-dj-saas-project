import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Table } from './Table';
import { Table as WebTable } from './Table.web';
import { Table as NativeTable } from './Table.native';
import { TableProps, TableColumn } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Sample data for stories
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 42, status: 'Pending' },
];

const sampleColumns: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    width: 150,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    width: 200,
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    align: 'center',
    width: 80,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    align: 'center',
    render: (value) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: value === 'Active' ? '#10b981' : value === 'Inactive' ? '#ef4444' : '#f59e0b',
        color: 'white',
      }}>
        {value}
      </span>
    ),
  },
];

// Create a simple wrapper for Storybook to avoid renderer issues
const TableStoryComponent = React.forwardRef<any, TableProps>((props, _ref) => {
  return <Table {...props} />;
});
TableStoryComponent.displayName = 'Table';

const meta: Meta<TableProps> = {
  title: 'Components/Table',
  component: TableStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Table Component

A unified data table component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Data Display**: Structured display of tabular data with custom rendering
- **Sorting Support**: Built-in sorting indicators and handlers
- **Row Interactions**: Support for row selection and long press
- **Responsive Design**: Horizontal scrolling on mobile, flexible layouts
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper table semantics and React Native accessibility props
- **Customizable Styling**: Striped rows, borders, hover effects, and sizing

## Platform Implementations
- **Web**: HTML table with proper semantic structure and hover effects
- **React Native**: ScrollView-based layout with touchable rows and horizontal scrolling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Table } from '@vas-dj-saas/ui';

const columns = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'email', title: 'Email', dataIndex: 'email' },
];

const data = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

<Table data={data} columns={columns} />
\`\`\`

### With Custom Rendering
\`\`\`tsx
const columns = [
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value) => (
      <Badge variant={value === 'active' ? 'success' : 'danger'}>
        {value}
      </Badge>
    ),
  },
];
\`\`\`

### With Row Interactions
\`\`\`tsx
<Table 
  data={data} 
  columns={columns}
  onRowPress={(record) => console.log('Selected:', record)}
  hoverable={true}
/>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Rich Features** - Sorting, custom rendering, interactions  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - Proper table semantics and ARIA support
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ width: '800px', maxWidth: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: false,
      description: 'Array of data objects to display',
    },
    columns: {
      control: false,
      description: 'Column configuration array',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    emptyText: {
      control: { type: 'text' },
      description: 'Text to display when no data',
    },
    showHeader: {
      control: { type: 'boolean' },
      description: 'Show table header',
    },
    striped: {
      control: { type: 'boolean' },
      description: 'Alternate row background colors',
    },
    bordered: {
      control: { type: 'boolean' },
      description: 'Show table borders',
    },
    hoverable: {
      control: { type: 'boolean' },
      description: 'Enable hover effects on rows',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Table size',
    },
    maxHeight: {
      control: { type: 'text' },
      description: 'Maximum height with scrolling',
    },
    onRowPress: {
      action: 'row pressed',
      description: 'Callback when row is pressed',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    data: sampleData,
    columns: sampleColumns,
    loading: false,
    emptyText: 'No data available',
    showHeader: true,
    striped: false,
    bordered: true,
    hoverable: true,
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<TableProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    onRowPress: (record) => console.log('Row pressed:', record),
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
        maxWidth: '1200px',
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
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <WebTable {...args} maxHeight={300} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML table with semantic structure<br/>
            Hover effects & proper accessibility
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
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <NativeTable {...args} maxHeight={300} />
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            ScrollView-based layout<br/>
            Touch interactions & native scrolling
          </div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280', 
        textAlign: 'center', 
        maxWidth: '600px',
        lineHeight: '1.5',
        fontStyle: 'italic'
      }}>
        ✨ Both implementations provide rich table functionality but use platform-optimized approaches for layout and interactions.
      </div>
    </div>
  ),
  args: {
    data: sampleData.slice(0, 4),
    columns: sampleColumns,
    striped: true,
    hoverable: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized tables.',
      },
    },
  },
};

// Different states showcase
export const TableStates: Story = {
  name: '⚡ Table States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Table States</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '1000px'
      }}>
        {/* Loading State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Loading State</h4>
          <WebTable
            data={[]}
            columns={sampleColumns}
            loading={true}
          />
        </div>

        {/* Empty State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Empty State</h4>
          <WebTable
            data={[]}
            columns={sampleColumns}
            emptyText="No users found"
          />
        </div>

        {/* Striped Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Striped Rows</h4>
          <WebTable
            data={sampleData.slice(0, 3)}
            columns={sampleColumns}
            striped={true}
          />
        </div>

        {/* No Borders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>No Borders</h4>
          <WebTable
            data={sampleData.slice(0, 3)}
            columns={sampleColumns}
            bordered={false}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different table states including loading, empty, striped rows, and borderless tables.',
      },
    },
  },
};

// Different sizes showcase
export const TableSizes: Story = {
  name: '📏 Table Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Table Size Options</h3>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Small Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Small Size</h4>
          <WebTable
            data={sampleData.slice(0, 3)}
            columns={sampleColumns}
            size="sm"
          />
        </div>

        {/* Medium Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Medium Size (Default)</h4>
          <WebTable
            data={sampleData.slice(0, 3)}
            columns={sampleColumns}
            size="md"
          />
        </div>

        {/* Large Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0', fontSize: '14px' }}>Large Size</h4>
          <WebTable
            data={sampleData.slice(0, 3)}
            columns={sampleColumns}
            size="lg"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different table sizes from small to large with appropriate spacing and typography.',
      },
    },
  },
};

// Custom rendering showcase
export const CustomRendering: Story = {
  name: '🎨 Custom Rendering',
  render: () => {
    const customColumns: TableColumn[] = [
      {
        key: 'avatar',
        title: 'User',
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {record.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>{record.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        align: 'center',
        render: (value) => (
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            {value} years
          </div>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        render: (value) => {
          const colors = {
            Active: { bg: '#dcfce7', text: '#166534' },
            Inactive: { bg: '#fee2e2', text: '#991b1b' },
            Pending: { bg: '#fef3c7', text: '#92400e' },
          };
          const color = colors[value as keyof typeof colors] || colors.Pending;
          
          return (
            <span style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: color.bg,
              color: color.text,
            }}>
              {value}
            </span>
          );
        },
      },
      {
        key: 'actions',
        title: 'Actions',
        align: 'center',
        render: () => (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              Edit
            </button>
            <button style={{
              padding: '4px 8px',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              Delete
            </button>
          </div>
        ),
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Custom Cell Rendering</h3>
        
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <WebTable
            data={sampleData}
            columns={customColumns}
            hoverable={true}
          />
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          textAlign: 'center', 
          maxWidth: '600px',
          lineHeight: '1.5',
          fontStyle: 'italic'
        }}>
          💡 Custom rendering allows for complex cell content including avatars, styled badges, and action buttons.
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of custom cell rendering with avatars, styled status badges, and action buttons.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Theme Comparison</h3>
      
      {/* Default Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <WebTable
              data={sampleData.slice(0, 3)}
              columns={sampleColumns}
              striped={true}
            />
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          🌙 Dark Theme
        </h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px'
          }}>
            <WebTable
              data={sampleData.slice(0, 3)}
              columns={sampleColumns}
              striped={true}
            />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};