import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox } from './Checkbox';
import { Checkbox as WebCheckbox } from './Checkbox.web';
import { Checkbox as NativeCheckbox } from './Checkbox.native';
import { CheckboxProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const CheckboxStoryComponent = React.forwardRef<any, CheckboxProps>((props, _ref) => {
  return <Checkbox {...props} />;
});
CheckboxStoryComponent.displayName = 'Checkbox';

const meta: Meta<CheckboxProps> = {
  title: 'Form/Checkbox',
  component: CheckboxStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Checkbox Component

A unified checkbox component that automatically renders the appropriate implementation based on the platform with built-in support for labels, help text, and error states.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Form Field Support**: Built-in label, help text, and error text with proper accessibility
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Controlled & Uncontrolled**: Support for both controlled and uncontrolled usage
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Indeterminate State**: Support for indeterminate state (web only)
- **DRY Principles**: Label, helpText, and errorText are built-in to avoid repetition

## Platform Implementations
- **Web**: HTML checkbox input with custom styling and indeterminate support
- **React Native**: TouchableOpacity with custom checkbox visual and proper accessibility

## Usage Examples

### Basic Checkbox
\`\`\`tsx
import { Checkbox } from '@vas-dj-saas/ui';

<Checkbox 
  label="I agree to the terms and conditions"
  helpText="You must accept to continue"
/>
\`\`\`

### Controlled Checkbox
\`\`\`tsx
const [checked, setChecked] = useState(false);

<Checkbox 
  label="Newsletter subscription"
  checked={checked}
  onCheckedChange={setChecked}
  helpText="Receive updates about new features"
/>
\`\`\`

### Checkbox with Validation
\`\`\`tsx
<Checkbox 
  label="Required field"
  required
  errorText="This field is required"
  onCheckedChange={(checked) => console.log(checked)}
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
      description: 'Label text displayed next to the checkbox',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Helper text displayed below the checkbox',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error text displayed below the checkbox (overrides helpText)',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Controlled checked state',
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'Default checked state for uncontrolled usage',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark field as required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable checkbox interactions',
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Show indeterminate state (web only)',
    },
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback when checked state changes',
    },
  },
  args: {
    label: 'Checkbox Label',
    required: false,
    disabled: false,
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<CheckboxProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Interactive Checkbox',
    helpText: 'This is a help text example',
    onCheckedChange: (checked) => console.log('Checkbox changed:', checked),
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
          <WebCheckbox {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML checkbox with custom styling<br/>
            Indeterminate state support
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
          <NativeCheckbox {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with custom checkmark<br/>
            Native accessibility support
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Cross-Platform Checkbox',
    helpText: 'This help text appears on both platforms',
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// Checkbox states
export const CheckboxStates: Story = {
  name: '☑️ Checkbox States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Checkbox States</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Checkbox 
          label="Unchecked state" 
          helpText="This checkbox is unchecked"
        />
        
        <Checkbox 
          label="Checked state" 
          defaultChecked
          helpText="This checkbox is checked"
        />
        
        <Checkbox 
          label="Required checkbox" 
          required
          helpText="Required fields are marked with an asterisk"
        />
        
        <Checkbox 
          label="Checkbox with error" 
          errorText="This field contains an error"
        />
        
        <Checkbox 
          label="Disabled unchecked" 
          disabled
          helpText="This checkbox is disabled"
        />
        
        <Checkbox 
          label="Disabled checked" 
          disabled
          defaultChecked
          helpText="This checkbox is disabled and checked"
        />
        
        <Checkbox 
          label="Indeterminate state (web only)" 
          indeterminate
          helpText="This shows indeterminate state on web"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different checkbox states including checked, unchecked, required, error, disabled, and indeterminate.',
      },
    },
  },
};

// Form group example
export const FormGroup: Story = {
  name: '📋 Form Group',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Form Group Example</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Newsletter Preferences
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox 
              label="Product updates" 
              helpText="Get notified about new features and releases"
            />
            <Checkbox 
              label="Marketing emails" 
              helpText="Receive promotional content and special offers"
            />
            <Checkbox 
              label="Security alerts" 
              defaultChecked
              helpText="Important security notifications (recommended)"
            />
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Terms and Conditions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox 
              label="I agree to the Terms of Service" 
              required
              helpText="You must accept the terms to continue"
            />
            <Checkbox 
              label="I agree to the Privacy Policy" 
              required
              helpText="You must accept the privacy policy to continue"
            />
            <Checkbox 
              label="I want to receive the newsletter" 
              helpText="Optional: Get updates via email"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using multiple checkboxes in a form group with different states and requirements.',
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
            <Checkbox label="Accept terms" helpText="You must accept to continue" defaultChecked />
            <Checkbox label="Newsletter" helpText="Get updates via email" />
            <Checkbox label="Required field" required errorText="This field is required" />
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
            <Checkbox label="Accept terms" helpText="You must accept to continue" defaultChecked />
            <Checkbox label="Newsletter" helpText="Get updates via email" />
            <Checkbox label="Required field" required errorText="This field is required" />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};