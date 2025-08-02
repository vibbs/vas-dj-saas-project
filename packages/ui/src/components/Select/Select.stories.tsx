import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Select } from './Select';
import { Select as WebSelect } from './Select.web';
import { Select as NativeSelect } from './Select.native';
import { SelectProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const SelectStoryComponent = React.forwardRef<any, SelectProps>((props, _ref) => {
  return <Select {...props} />;
});
SelectStoryComponent.displayName = 'Select';

const sampleOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', description: 'Yellow tropical fruit' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date', disabled: true },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
];

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Australia', value: 'au' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Japan', value: 'jp' },
];

const meta: Meta<SelectProps> = {
  title: 'Form Components/Select',
  component: SelectStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Select Component

A unified dropdown select component with built-in FormField support for labels, help text, and error messages.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Built-in FormField**: Includes label, helpText, and errorText support following DRY principles
- **Multiple Selection**: Supports single and multi-select modes
- **Searchable**: Optional search functionality for filtering options
- **Clearable**: Optional clear button to reset selection
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: Custom dropdown with keyboard navigation and search
- **React Native**: Modal-based picker with native feel

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Select } from '@vas-dj-saas/ui';

<Select
  label="Choose a fruit"
  options={[
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
  ]}
  onChange={(value) => console.log(value)}
/>
\`\`\`

### With Form Field Features
\`\`\`tsx
<Select
  label="Country"
  helpText="Select your country of residence"
  placeholder="Choose a country..."
  searchable
  clearable
  options={countryOptions}
/>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ minWidth: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: { type: 'object' },
      description: 'Array of select options',
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default selected value',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    multiple: {
      control: { type: 'boolean' },
      description: 'Allow multiple selections',
    },
    searchable: {
      control: { type: 'boolean' },
      description: 'Enable search functionality',
    },
    clearable: {
      control: { type: 'boolean' },
      description: 'Show clear button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the select input',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'flushed'],
      description: 'Visual style variant',
    },
    label: {
      control: { type: 'text' },
      description: 'Form field label',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Helper text below the field',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark field as required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the select',
    },
  },
  args: {
    options: sampleOptions,
    placeholder: 'Select an option...',
    size: 'md',
    variant: 'default',
    multiple: false,
    searchable: false,
    clearable: false,
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<SelectProps>;

// Interactive playground story
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Choose a fruit',
    helpText: 'Select your favorite fruit from the list',
    onChange: (value) => console.log('Selected:', value),
    onValueChange: (value) => console.log('Value changed:', value),
  },
};

// Platform comparison
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
          Select components with FormField wrapper across platforms
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
          <WebSelect {...args} />
        </div>

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
          <NativeSelect {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Select a fruit',
    options: sampleOptions.slice(0, 4),
    clearable: true,
  },
};

// Size variants
export const Sizes: Story = {
  name: '📏 Size Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Small Size</h3>
        <Select
          label="Small Select"
          size="sm"
          options={sampleOptions.slice(0, 3)}
          defaultValue="apple"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Medium Size</h3>
        <Select
          label="Medium Select"
          size="md"
          options={sampleOptions.slice(0, 3)}
          defaultValue="banana"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Large Size</h3>
        <Select
          label="Large Select"
          size="lg"
          options={sampleOptions.slice(0, 3)}
          defaultValue="cherry"
        />
      </div>
    </div>
  ),
};

// Style variants
export const Variants: Story = {
  name: '🎨 Style Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Default Variant</h3>
        <Select
          label="Default Style"
          variant="default"
          options={sampleOptions.slice(0, 4)}
          placeholder="Choose an option..."
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Filled Variant</h3>
        <Select
          label="Filled Style"
          variant="filled"
          options={sampleOptions.slice(0, 4)}
          placeholder="Choose an option..."
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Flushed Variant</h3>
        <Select
          label="Flushed Style"
          variant="flushed"
          options={sampleOptions.slice(0, 4)}
          placeholder="Choose an option..."
        />
      </div>
    </div>
  ),
};

// Features showcase
export const Features: Story = {
  name: '✨ Feature Showcase',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Searchable Select</h3>
        <Select
          label="Country"
          searchable
          clearable
          options={countryOptions}
          placeholder="Search for a country..."
          helpText="Type to search for countries"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Multiple Selection</h3>
        <Select
          label="Skills"
          multiple
          clearable
          options={[
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
            { label: 'React', value: 'react' },
            { label: 'Node.js', value: 'node' },
            { label: 'Python', value: 'python' },
          ]}
          placeholder="Select skills..."
          helpText="You can select multiple skills"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>With Descriptions</h3>
        <Select
          label="Product"
          options={[
            { 
              label: 'Basic Plan', 
              value: 'basic',
              description: '$9/month - Perfect for individuals'
            },
            { 
              label: 'Pro Plan', 
              value: 'pro',
              description: '$19/month - Great for small teams'
            },
            { 
              label: 'Enterprise Plan', 
              value: 'enterprise',
              description: '$49/month - For large organizations'
            },
          ]}
          placeholder="Choose a plan..."
        />
      </div>
    </div>
  ),
};

// Form field features
export const FormFieldFeatures: Story = {
  name: '📝 Form Field Features',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>With Help Text</h3>
        <Select
          label="Time Zone"
          helpText="Select your local time zone for scheduling"
          options={[
            { label: 'Pacific Time (PST)', value: 'pst' },
            { label: 'Mountain Time (MST)', value: 'mst' },
            { label: 'Central Time (CST)', value: 'cst' },
            { label: 'Eastern Time (EST)', value: 'est' },
          ]}
          searchable
          clearable
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>With Error</h3>
        <Select
          label="Department"
          errorText="Please select a department to continue"
          required
          options={[
            { label: 'Engineering', value: 'engineering' },
            { label: 'Design', value: 'design' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Sales', value: 'sales' },
          ]}
          placeholder="Choose your department..."
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Disabled State</h3>
        <Select
          label="Status"
          helpText="This field is read-only"
          disabled
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          defaultValue="active"
        />
      </div>
    </div>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  name: '🌍 Real-World Examples',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>E-commerce Category</h3>
        <Select
          label="Product Category"
          searchable
          options={[
            { label: 'Electronics', value: 'electronics' },
            { label: 'Clothing & Accessories', value: 'clothing' },
            { label: 'Home & Garden', value: 'home' },
            { label: 'Sports & Outdoors', value: 'sports' },
            { label: 'Books & Media', value: 'books' },
            { label: 'Health & Beauty', value: 'health' },
          ]}
          placeholder="Select a category..."
          helpText="Choose the most relevant category for your product"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>User Preferences</h3>
        <Select
          label="Notification Preferences"
          multiple
          options={[
            { label: 'Email notifications', value: 'email' },
            { label: 'Push notifications', value: 'push' },
            { label: 'SMS notifications', value: 'sms' },
            { label: 'In-app notifications', value: 'inapp' },
          ]}
          defaultValue={['email', 'push']}
          helpText="Choose how you'd like to receive notifications"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Team Assignment</h3>
        <Select
          label="Assign to Team Member"
          searchable
          clearable
          options={[
            { label: 'John Doe', value: 'john', description: 'Senior Developer' },
            { label: 'Jane Smith', value: 'jane', description: 'UX Designer' },
            { label: 'Mike Johnson', value: 'mike', description: 'Product Manager' },
            { label: 'Sarah Wilson', value: 'sarah', description: 'QA Engineer' },
          ]}
          placeholder="Search team members..."
          helpText="Type to search by name or role"
        />
      </div>
    </div>
  ),
};