import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Radio } from './Radio';
import { Radio as WebRadio } from './Radio.web';
import { Radio as NativeRadio } from './Radio.native';
import { RadioProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const RadioStoryComponent = React.forwardRef<any, RadioProps>((props, _ref) => {
  return <Radio {...props} />;
});
RadioStoryComponent.displayName = 'Radio';

const sampleOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2', description: 'This is a description for option 2' },
  { label: 'Option 3', value: 'option3', disabled: true },
  { label: 'Option 4', value: 'option4' },
];

const meta: Meta<RadioProps> = {
  title: 'Form/Radio',
  component: RadioStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Radio Component

A unified Radio component with built-in FormField support for labels, help text, and error messages.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Built-in FormField**: Includes label, helpText, and errorText support following DRY principles
- **Multiple Layouts**: Vertical and horizontal arrangements
- **Multiple Variants**: Default and card styles
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML radio inputs with custom styling and keyboard navigation
- **React Native**: TouchableOpacity with custom radio indicators

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Radio } from '@vas-dj-saas/ui';

<Radio
  label="Choose an option"
  options={[
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ]}
  onChange={(value) => console.log(value)}
/>
\`\`\`

### With Form Field Features
\`\`\`tsx
<Radio
  label="Payment Method"
  helpText="Choose your preferred payment method"
  errorText="Please select a payment method"
  required
  options={paymentOptions}
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
      description: 'Array of radio options',
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled value',
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Default selected value',
    },
    layout: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of radio options',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the radio inputs',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'card'],
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
      description: 'Disable the entire radio group',
    },
  },
  args: {
    options: sampleOptions,
    layout: 'vertical',
    size: 'md',
    variant: 'default',
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<RadioProps>;

// Interactive playground story
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Choose an option',
    helpText: 'Select one of the available options',
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
          Radio components with FormField wrapper across platforms
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
          <WebRadio {...args} />
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
          <NativeRadio {...args} />
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Select an option',
    helpText: 'Choose from the options below',
    options: sampleOptions.slice(0, 3),
  },
};

// Layout variants
export const Layouts: Story = {
  name: '📐 Layout Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Vertical Layout</h3>
        <Radio
          label="Vertical Options"
          layout="vertical"
          options={sampleOptions.slice(0, 3)}
          defaultValue="option1"
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Horizontal Layout</h3>
        <Radio
          label="Horizontal Options"
          layout="horizontal"
          options={sampleOptions.slice(0, 3)}
          defaultValue="option2"
        />
      </div>
    </div>
  ),
};

// Size variants
export const Sizes: Story = {
  name: '📏 Size Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Small Size</h3>
        <Radio
          label="Small Radio"
          size="sm"
          options={sampleOptions.slice(0, 2)}
          defaultValue="option1"
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Medium Size</h3>
        <Radio
          label="Medium Radio"
          size="md"
          options={sampleOptions.slice(0, 2)}
          defaultValue="option1"
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Large Size</h3>
        <Radio
          label="Large Radio"
          size="lg"
          options={sampleOptions.slice(0, 2)}
          defaultValue="option1"
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
        <Radio
          label="Default Style"
          variant="default"
          options={sampleOptions.slice(0, 3)}
          defaultValue="option1"
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Card Variant</h3>
        <Radio
          label="Card Style"
          variant="card"
          options={sampleOptions.slice(0, 3)}
          defaultValue="option2"
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
        <Radio
          label="Payment Method"
          helpText="Choose your preferred payment method for this transaction"
          options={[
            { label: 'Credit Card', value: 'credit' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank' },
          ]}
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>With Error</h3>
        <Radio
          label="Subscription Plan"
          errorText="Please select a subscription plan to continue"
          required
          options={[
            { label: 'Basic Plan - $9/month', value: 'basic' },
            { label: 'Pro Plan - $19/month', value: 'pro' },
            { label: 'Enterprise Plan - $49/month', value: 'enterprise' },
          ]}
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Disabled State</h3>
        <Radio
          label="Disabled Options"
          helpText="This radio group is disabled"
          disabled
          options={sampleOptions.slice(0, 3)}
          defaultValue="option1"
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Shipping Method</h3>
        <Radio
          label="Shipping Method"
          helpText="Select your preferred shipping option"
          variant="card"
          options={[
            {
              label: 'Standard Shipping',
              value: 'standard',
              description: '5-7 business days • Free'
            },
            {
              label: 'Express Shipping',
              value: 'express',
              description: '2-3 business days • $9.99'
            },
            {
              label: 'Overnight Shipping',
              value: 'overnight',
              description: 'Next business day • $24.99'
            },
          ]}
        />
      </div>

      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Account Type</h3>
        <Radio
          label="Account Type"
          helpText="Choose the type of account you want to create"
          required
          layout="horizontal"
          options={[
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' },
            { label: 'Organization', value: 'organization' },
          ]}
        />
      </div>
    </div>
  ),
};