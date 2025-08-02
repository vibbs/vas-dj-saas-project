import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from './Input';
import { Input as WebInput } from './Input.web';
import { Input as NativeInput } from './Input.native';
import { InputProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const InputStoryComponent = React.forwardRef<any, InputProps>((props, _ref) => {
  return <Input {...props} />;
});
InputStoryComponent.displayName = 'Input';

const meta: Meta<InputProps> = {
  title: 'Form/Input',
  component: InputStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Input Component

A unified input component that automatically renders the appropriate implementation based on the platform with built-in support for labels, help text, and error states.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Form Field Support**: Built-in label, help text, and error text with proper accessibility
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Input Types**: Support for text, email, password, number, tel, url, and search
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **DRY Principles**: Label, helpText, and errorText are built-in to avoid repetition

## Platform Implementations
- **Web**: HTML input/textarea elements with proper form semantics
- **React Native**: TextInput with platform-appropriate keyboard types

## Usage Examples

### Basic Input
\`\`\`tsx
import { Input } from '@vas-dj-saas/ui';

<Input 
  label="Full Name"
  placeholder="Enter your full name"
  helpText="This will be displayed publicly"
/>
\`\`\`

### Input with Validation
\`\`\`tsx
<Input 
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  errorText="Please enter a valid email address"
  required
/>
\`\`\`

### Multiline Input
\`\`\`tsx
<Input 
  label="Description"
  multiline
  placeholder="Tell us about yourself..."
  helpText="Maximum 500 characters"
  maxLength={500}
/>
\`\`\`

## Benefits

✅ **Built-in Form Structure** - No need to wrap in separate field components  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility Ready** - WCAG 2.1 AA compliant
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ minWidth: '300px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text displayed above the input',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown in the input',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Helper text displayed below the input',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error text displayed below the input (overrides helpText)',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type for validation and keyboard optimization',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark field as required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable input interactions',
    },
    multiline: {
      control: { type: 'boolean' },
      description: 'Enable multiline input (textarea)',
    },
    value: {
      control: { type: 'text' },
      description: 'Controlled input value',
    },
    onChangeText: {
      action: 'changed (native)',
      description: 'React Native text change handler',
    },
    onChange: {
      action: 'changed (web)',
      description: 'Web change handler',
    },
  },
  args: {
    label: 'Input Label',
    placeholder: 'Enter text...',
    type: 'text',
    required: false,
    disabled: false,
    multiline: false,
  },
};

export default meta;
type Story = StoryObj<InputProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Interactive Input',
    placeholder: 'Type something...',
    helpText: 'This is a help text example',
    onChangeText: (text) => console.log('Text changed:', text),
    onChange: (e) => console.log('Change event:', e.target?.value),
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
        maxWidth: '700px',
        alignItems: 'start'
      }}>
        {/* Web Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            textAlign: 'center'
          }}>
            🌐 Web Platform
          </div>
          <WebInput {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML input/textarea elements<br/>
            Proper form semantics & validation
          </div>
        </div>

        {/* React Native Implementation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            textAlign: 'center'
          }}>
            📱 React Native Platform
          </div>
          <NativeInput {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TextInput with native styling<br/>
            Platform-appropriate keyboard types
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Cross-Platform Input',
    placeholder: 'Enter text here...',
    helpText: 'This help text appears on both platforms',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// All input types showcase
export const InputTypes: Story = {
  name: '📝 Input Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Input Types</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Text Input" type="text" placeholder="Enter any text" />
        <Input label="Email Input" type="email" placeholder="you@example.com" />
        <Input label="Password Input" type="password" placeholder="Enter password" />
        <Input label="Number Input" type="number" placeholder="Enter a number" />
        <Input label="Phone Input" type="tel" placeholder="+1 (555) 123-4567" />
        <Input label="URL Input" type="url" placeholder="https://example.com" />
        <Input label="Search Input" type="search" placeholder="Search..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types with appropriate keyboard optimizations for mobile platforms.',
      },
    },
  },
};

// Form field states
export const FormStates: Story = {
  name: '📋 Form States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Form Field States</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Normal Input" 
          placeholder="Normal state"
          helpText="This is helper text"
        />
        
        <Input 
          label="Required Input" 
          placeholder="This field is required"
          required
          helpText="Required fields are marked with an asterisk"
        />
        
        <Input 
          label="Input with Error" 
          placeholder="Invalid input"
          errorText="This field contains an error"
          value="invalid-email"
        />
        
        <Input 
          label="Disabled Input" 
          placeholder="This input is disabled"
          disabled
          value="Disabled value"
        />
        
        <Input 
          label="Read-only Input" 
          placeholder="This input is read-only"
          readOnly
          value="Read-only value"
          helpText="This field cannot be edited"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input states including normal, required, error, disabled, and read-only.',
      },
    },
  },
};

// Multiline inputs
export const MultilineInputs: Story = {
  name: '📄 Multiline Inputs',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Multiline Inputs</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Short Description" 
          multiline
          placeholder="Enter a brief description..."
          helpText="Keep it concise and clear"
        />
        
        <Input 
          label="Long Description" 
          multiline
          numberOfLines={6}
          placeholder="Enter a detailed description..."
          maxLength={500}
          helpText="Maximum 500 characters"
        />
        
        <Input 
          label="Comments" 
          multiline
          placeholder="Add your comments here..."
          errorText="Comments cannot be empty"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiline text inputs (textarea) with different configurations and states.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Theme Comparison</h3>
      
      {/* Default Theme */}
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Input label="Name" placeholder="Enter your name" helpText="This will be visible to others" />
            <Input label="Email" type="email" placeholder="you@example.com" required />
            <Input label="Invalid Field" placeholder="Error state" errorText="This field has an error" />
          </div>
        </ThemeProvider>
      </div>

      {/* Dark Theme */}
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          🌙 Dark Theme
        </h4>
        <ThemeProvider defaultTheme="dark">
          <div style={{ 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Input label="Name" placeholder="Enter your name" helpText="This will be visible to others" />
            <Input label="Email" type="email" placeholder="you@example.com" required />
            <Input label="Invalid Field" placeholder="Error state" errorText="This field has an error" />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};