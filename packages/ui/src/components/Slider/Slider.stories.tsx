import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Slider } from './Slider';
import { Slider as WebSlider } from './Slider.web';
import { Slider as NativeSlider } from './Slider.native';
import { SliderProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const SliderStoryComponent = React.forwardRef<any, SliderProps>((props, _ref) => {
  return <Slider {...props} />;
});
SliderStoryComponent.displayName = 'Slider';

const meta: Meta<SliderProps> = {
  title: 'Form/Slider',
  component: SliderStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Slider Component

A unified range slider component that automatically renders the appropriate implementation based on the platform with built-in support for labels, help text, and error states.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Form Field Support**: Built-in label, help text, and error text with proper accessibility
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Customizable Range**: Support for min, max, step, and default values
- **Value Display**: Optional value display with custom formatting
- **Smooth Interactions**: Platform-appropriate drag and touch handling
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **DRY Principles**: Label, helpText, and errorText are built-in to avoid repetition

## Platform Implementations
- **Web**: HTML range input with custom styling and mouse interactions
- **React Native**: Animated View with PanResponder for touch handling

## Usage Examples

### Basic Slider
\`\`\`tsx
import { Slider } from '@vas-dj-saas/ui';

<Slider 
  label="Volume"
  min={0}
  max={100}
  defaultValue={50}
  helpText="Adjust the volume level"
/>
\`\`\`

### Controlled Slider with Value Display
\`\`\`tsx
const [value, setValue] = useState(25);

<Slider 
  label="Progress"
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  showValue
  formatValue={(val) => \`\${val}%\`}
/>
\`\`\`

### Custom Range and Step
\`\`\`tsx
<Slider 
  label="Price Range"
  min={0}
  max={1000}
  step={50}
  defaultValue={200}
  showValue
  formatValue={(val) => \`$\${val}\`}
  helpText="Select your budget range"
/>
\`\`\`

### Slider with Validation
\`\`\`tsx
<Slider 
  label="Required Setting"
  min={1}
  max={10}
  required
  errorText="Value must be between 1 and 10"
  onValueChange={(value) => console.log(value)}
/>
\`\`\`

## Benefits

✅ **Built-in Form Structure** - No need to wrap in separate field components  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Smooth Interactions** - Platform-optimized drag and touch handling  
✅ **Value Formatting** - Custom value display and formatting  
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
        <div style={{ minWidth: '400px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text displayed above the slider',
    },
    helpText: {
      control: { type: 'text' },
      description: 'Helper text displayed below the slider',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error text displayed below the slider (overrides helpText)',
    },
    value: {
      control: { type: 'number' },
      description: 'Controlled value',
    },
    defaultValue: {
      control: { type: 'number' },
      description: 'Default value for uncontrolled usage',
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
    },
    step: {
      control: { type: 'number' },
      description: 'Step increment',
    },
    showValue: {
      control: { type: 'boolean' },
      description: 'Show current value next to label',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark field as required',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable slider interactions',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Callback when value changes',
    },
  },
  args: {
    label: 'Slider Label',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    showValue: false,
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<SliderProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    label: 'Interactive Slider',
    helpText: 'Drag to adjust the value',
    showValue: true,
    onValueChange: (value) => console.log('Slider value:', value),
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
          <WebSlider {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML range input with custom styling<br/>
            Mouse drag interactions
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
          <NativeSlider {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Animated View with PanResponder<br/>
            Touch gesture handling
          </div>
        </div>
      </div>
    </div>
  ),
  args: {
    label: 'Cross-Platform Slider',
    helpText: 'This slider works on both platforms',
    defaultValue: 70,
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// Different ranges and configurations
export const SliderConfigurations: Story = {
  name: '⚙️ Slider Configurations',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Slider Configurations</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Slider 
          label="Volume (0-100)" 
          min={0}
          max={100}
          defaultValue={75}
          showValue
          formatValue={(val) => `${val}%`}
          helpText="Audio volume level"
        />
        
        <Slider 
          label="Price Range ($0-$1000)" 
          min={0}
          max={1000}
          step={50}
          defaultValue={200}
          showValue
          formatValue={(val) => `$${val}`}
          helpText="Select your budget"
        />
        
        <Slider 
          label="Temperature (-20°C to 50°C)" 
          min={-20}
          max={50}
          step={5}
          defaultValue={20}
          showValue
          formatValue={(val) => `${val}°C`}
          helpText="Set the temperature"
        />
        
        <Slider 
          label="Rating (1-5 stars)" 
          min={1}
          max={5}
          step={0.5}
          defaultValue={3.5}
          showValue
          formatValue={(val) => `${val} ⭐`}
          helpText="Rate your experience"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different slider configurations with custom ranges, steps, and value formatting.',
      },
    },
  },
};

// Slider states
export const SliderStates: Story = {
  name: '🎛️ Slider States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Slider States</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Slider 
          label="Normal slider" 
          defaultValue={30}
          helpText="This is a normal slider"
          showValue
        />
        
        <Slider 
          label="Required slider" 
          defaultValue={50}
          required
          helpText="Required fields are marked with an asterisk"
          showValue
        />
        
        <Slider 
          label="Slider with error" 
          defaultValue={25}
          errorText="Value is too low"
          showValue
        />
        
        <Slider 
          label="Disabled slider" 
          defaultValue={75}
          disabled
          helpText="This slider is disabled"
          showValue
        />
        
        <Slider 
          label="Without value display" 
          defaultValue={60}
          helpText="Value is hidden"
        />
        
        <Slider 
          label="Custom formatting" 
          min={0}
          max={10}
          step={1}
          defaultValue={7}
          showValue
          formatValue={(val) => `Level ${val}`}
          helpText="Custom value formatting"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different slider states including normal, required, error, disabled, and custom formatting.',
      },
    },
  },
};

// Settings panel example
export const SettingsPanel: Story = {
  name: '🎚️ Settings Panel',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '500px' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', textAlign: 'center' }}>Audio Settings Panel</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Volume Controls
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Slider 
              label="Master Volume" 
              min={0}
              max={100}
              defaultValue={80}
              showValue
              formatValue={(val) => `${val}%`}
              helpText="Overall system volume"
            />
            <Slider 
              label="Music Volume" 
              min={0}
              max={100}
              defaultValue={70}
              showValue
              formatValue={(val) => `${val}%`}
              helpText="Music and audio playback"
            />
            <Slider 
              label="Effects Volume" 
              min={0}
              max={100}
              defaultValue={60}
              showValue
              formatValue={(val) => `${val}%`}
              helpText="Sound effects and notifications"
            />
          </div>
        </div>
        
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Audio Quality
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Slider 
              label="Sample Rate" 
              min={44100}
              max={192000}
              step={1}
              defaultValue={48000}
              showValue
              formatValue={(val) => `${(val / 1000).toFixed(1)}kHz`}
              helpText="Audio sampling frequency"
            />
            <Slider 
              label="Bit Depth" 
              min={16}
              max={32}
              step={8}
              defaultValue={24}
              showValue
              formatValue={(val) => `${val}-bit`}
              helpText="Audio bit depth"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using multiple sliders in a settings panel with different ranges and value formatting.',
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
            <Slider label="Volume" defaultValue={60} showValue helpText="Adjust the volume level" />
            <Slider label="Brightness" defaultValue={80} showValue helpText="Screen brightness" />
            <Slider label="Invalid setting" defaultValue={30} showValue errorText="Value is out of range" />
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
            <Slider label="Volume" defaultValue={60} showValue helpText="Adjust the volume level" />
            <Slider label="Brightness" defaultValue={80} showValue helpText="Screen brightness" />
            <Slider label="Invalid setting" defaultValue={30} showValue errorText="Value is out of range" />
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Slider appearance in different themes. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};