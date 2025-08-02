import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Textarea } from './Textarea';
import { Textarea as WebTextarea } from './Textarea.web';
import { Textarea as NativeTextarea } from './Textarea.native';
import { TextareaProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const TextareaStoryComponent = React.forwardRef<any, TextareaProps>((props, _ref) => {
  return <Textarea {...props} />;
});
TextareaStoryComponent.displayName = 'Textarea';

const meta: Meta<TextareaProps> = {
  title: 'Form Components/Textarea',
  component: TextareaStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Textarea Component

A unified multiline text input component with built-in FormField support for labels, help text, and error messages.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Built-in FormField**: Includes label, helpText, and errorText support following DRY principles
- **Multiple Variants**: Default, filled, and flushed styles
- **Resizable**: Web supports different resize behaviors
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML textarea with custom styling and resize controls
- **React Native**: TextInput with multiline support

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Textarea } from '@vas-dj-saas/ui';

<Textarea
  label="Description"
  placeholder="Enter a description..."
  onChange={(value) => console.log(value)}
/>
\`\`\`

### With Form Field Features
\`\`\`tsx
<Textarea
  label="Comments"
  helpText="Share your thoughts about this product"
  placeholder="Write your comments here..."
  maxLength={500}
  rows={4}
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
    value: {
      control: { type: 'text' },
      description: 'Controlled value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default text value',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    rows: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of visible text lines',
    },
    maxLength: {
      control: { type: 'number' },
      description: 'Maximum number of characters',
    },
    resize: {
      control: { type: 'select' },
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'Resize behavior (web only)',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the textarea',
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
      description: 'Disable the textarea',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Make textarea read-only',
    },
  },
  args: {
    placeholder: 'Enter your text here...',
    rows: 3,
    size: 'md',
    variant: 'default',
    resize: 'vertical',
    required: false,
    disabled: false,
    readOnly: false,
  },
};

export default meta;
type Story = StoryObj<TextareaProps>;

// Interactive playground story
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Description',
    placeholder: 'Enter a detailed description...',
    onChange: (value) => console.log('Text changed:', value),
    onChangeText: (text) => console.log('Text value:', text),
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
          Textarea components with FormField wrapper across platforms
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
          <WebTextarea {...args} />
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
          <NativeTextarea {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
    rows: 4,
  },
};

// Size variants
export const Sizes: Story = {
  name: '📏 Size Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Small Size</h3>
        <Textarea
          label="Small Textarea"
          size="sm"
          placeholder="Small textarea..."
          rows={2}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Medium Size</h3>
        <Textarea
          label="Medium Textarea"
          size="md"
          placeholder="Medium textarea..."
          rows={3}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Large Size</h3>
        <Textarea
          label="Large Textarea"
          size="lg"
          placeholder="Large textarea..."
          rows={4}
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
        <Textarea
          label="Default Style"
          variant="default"
          placeholder="Default textarea with border..."
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Filled Variant</h3>
        <Textarea
          label="Filled Style"
          variant="filled"
          placeholder="Filled textarea with background..."
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Flushed Variant</h3>
        <Textarea
          label="Flushed Style"
          variant="flushed"
          placeholder="Flushed textarea with bottom border..."
        />
      </div>
    </div>
  ),
};

// Resize options (web only)
export const ResizeOptions: Story = {
  name: '↔️ Resize Options (Web Only)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>No Resize</h3>
        <WebTextarea
          label="Fixed Size"
          resize="none"
          placeholder="This textarea cannot be resized..."
          rows={3}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Vertical Resize</h3>
        <WebTextarea
          label="Vertical Resize"
          resize="vertical"
          placeholder="This textarea can be resized vertically..."
          rows={3}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Horizontal Resize</h3>
        <WebTextarea
          label="Horizontal Resize"
          resize="horizontal"
          placeholder="This textarea can be resized horizontally..."
          rows={3}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Both Resize</h3>
        <WebTextarea
          label="Both Directions"
          resize="both"
          placeholder="This textarea can be resized in both directions..."
          rows={3}
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
        <Textarea
          label="Product Review"
          helpText="Share your honest opinion about this product (minimum 50 characters)"
          placeholder="Write your review here..."
          rows={4}
          maxLength={500}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>With Error</h3>
        <Textarea
          label="Feedback"
          errorText="Feedback is required and must be at least 10 characters long"
          placeholder="Please provide your feedback..."
          required
          rows={3}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Disabled State</h3>
        <Textarea
          label="Disabled Textarea"
          helpText="This textarea is disabled"
          disabled
          defaultValue="This content cannot be edited"
          rows={2}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Read-Only State</h3>
        <Textarea
          label="Terms and Conditions"
          helpText="Please read the terms carefully"
          readOnly
          defaultValue="These are the terms and conditions that you need to review. This content is read-only and cannot be modified."
          rows={3}
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Contact Form</h3>
        <Textarea
          label="Message"
          helpText="Please describe your inquiry in detail"
          placeholder="How can we help you today?"
          required
          rows={5}
          maxLength={1000}
          variant="filled"
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Code Editor</h3>
        <Textarea
          label="Custom CSS"
          helpText="Add custom CSS rules for your page"
          placeholder="/* Enter your CSS here */
.custom-class {
  color: #333;
  font-size: 16px;
}"
          rows={6}
          variant="default"
          style={{ fontFamily: 'Monaco, Consolas, monospace' }}
        />
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Social Media Post</h3>
        <Textarea
          label="What's on your mind?"
          placeholder="Share your thoughts..."
          maxLength={280}
          rows={3}
          variant="flushed"
        />
      </div>
    </div>
  ),
};