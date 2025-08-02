import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Switch } from './Switch';
import { Switch as WebSwitch } from './Switch.web';
import { Switch as NativeSwitch } from './Switch.native';
import { SwitchProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const SwitchStoryComponent = React.forwardRef<any, SwitchProps>((props, _ref) => {
  return <Switch {...props} />;
});
SwitchStoryComponent.displayName = 'Switch';

const meta: Meta<SwitchProps> = {
  title: 'Form/Switch',
  component: SwitchStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Switch Component

A unified switch (toggle) component that automatically renders the appropriate implementation based on the platform with built-in support for labels, help text, and error states.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Form Field Support**: Built-in label, help text, and error text with proper accessibility
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Multiple Sizes**: Support for small, medium, and large sizes
- **Smooth Animations**: Platform-appropriate animations and transitions
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **DRY Principles**: Label, helpText, and errorText are built-in to avoid repetition

## Platform Implementations
- **Web**: Custom styled checkbox with switch appearance and CSS transitions
- **React Native**: Animated TouchableOpacity with smooth thumb movement

## Usage Examples

### Basic Switch
\`\`\`tsx
import { Switch } from '@vas-dj-saas/ui';

<Switch 
  label="Enable notifications"
  helpText="Receive push notifications on your device"
/>
\`\`\`

### Controlled Switch
\`\`\`tsx
const [enabled, setEnabled] = useState(false);

<Switch 
  label="Dark mode"
  checked={enabled}
  onCheckedChange={setEnabled}
  helpText="Switch between light and dark themes"
/>
\`\`\`

### Switch with Validation
\`\`\`tsx
<Switch 
  label="Terms and Conditions"
  required
  errorText="You must accept the terms to continue"
  onCheckedChange={(checked) => console.log(checked)}
/>
\`\`\`

### Different Sizes
\`\`\`tsx
<Switch label="Small switch" size="sm" />
<Switch label="Medium switch" size="md" />
<Switch label="Large switch" size="lg" />
\`\`\`

## Benefits

✅ **Built-in Form Structure** - No need to wrap in separate field components  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Smooth Animations** - Platform-optimized transitions  
✅ **Multiple Sizes** - Flexible sizing options  
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
      description: 'Label text displayed next to the switch',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Helper text displayed below the switch',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error text displayed below the switch (overrides helpText)',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Controlled checked state',
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'Default checked state for uncontrolled usage',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the switch',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark field as required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable switch interactions',
    },
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback when checked state changes',
    },
  },
  args: {
    label: 'Switch Label',
    size: 'md',
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<SwitchProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Interactive Switch',
    helpText: 'This is a help text example',
    onCheckedChange: (checked) => console.log('Switch changed:', checked),
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
          <WebSwitch {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Custom styled checkbox with CSS transitions<br/>
            Smooth hover and focus effects
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
          <NativeSwitch {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated TouchableOpacity<br/>
            Native spring animations
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Cross-Platform Switch',
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

// Switch sizes
export const SwitchSizes: Story = {
  name: '📏 Switch Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Switch Sizes</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch 
          label="Small switch" 
          size="sm"
          helpText="Compact size for dense layouts"
          defaultChecked
        />
        
        <Switch 
          label="Medium switch (default)" 
          size="md"
          helpText="Standard size for most use cases"
          defaultChecked
        />
        
        <Switch 
          label="Large switch" 
          size="lg"
          helpText="Larger size for better accessibility"
          defaultChecked
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different switch sizes with consistent proportions and accessibility guidelines.',
      },
    },
  },
};

// Switch states
export const SwitchStates: Story = {
  name: '🔘 Switch States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Switch States</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch 
          label="Off state" 
          helpText="This switch is currently off"
        />
        
        <Switch 
          label="On state" 
          defaultChecked
          helpText="This switch is currently on"
        />
        
        <Switch 
          label="Required switch" 
          required
          helpText="Required fields are marked with an asterisk"
        />
        
        <Switch 
          label="Switch with error" 
          errorText="This field contains an error"
        />
        
        <Switch 
          label="Disabled off" 
          disabled
          helpText="This switch is disabled"
        />
        
        <Switch 
          label="Disabled on" 
          disabled
          defaultChecked
          helpText="This switch is disabled and on"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different switch states including on, off, required, error, and disabled states.',
      },
    },
  },
};

// Settings form example
export const SettingsForm: Story = {
  name: '⚙️ Settings Form',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Settings Form Example</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Notification Settings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Switch 
              label="Push notifications" 
              defaultChecked
              helpText="Receive notifications on your mobile device"
            />
            <Switch 
              label="Email notifications" 
              defaultChecked
              helpText="Get updates via email"
            />
            <Switch 
              label="SMS notifications" 
              helpText="Receive text message alerts"
            />
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Privacy Settings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Switch 
              label="Public profile" 
              helpText="Make your profile visible to others"
            />
            <Switch 
              label="Show online status" 
              defaultChecked
              helpText="Let others see when you're online"
            />
            <Switch 
              label="Allow friend requests" 
              defaultChecked
              helpText="Enable others to send you friend requests"
            />
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Accessibility
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Switch 
              label="High contrast mode" 
              helpText="Increase contrast for better visibility"
            />
            <Switch 
              label="Reduce motion" 
              helpText="Minimize animations and transitions"
            />
            <Switch 
              label="Large text" 
              helpText="Increase font size throughout the app"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using multiple switches in a settings form with different categories and states.',
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
            <Switch label="Enable feature" helpText="Turn this feature on or off" defaultChecked />
            <Switch label="Notifications" helpText="Receive push notifications" />
            <Switch label="Required setting" required errorText="This setting is required" />
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
            <Switch label="Enable feature" helpText="Turn this feature on or off" defaultChecked />
            <Switch label="Notifications" helpText="Receive push notifications" />
            <Switch label="Required setting" required errorText="This setting is required" />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Switch appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};