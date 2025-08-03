import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Stepper } from './Stepper';
import { Stepper as WebStepper } from './Stepper.web';
import { Stepper as NativeStepper } from './Stepper.native';
import { StepperProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { User, CreditCard, Check, Settings, FileText, ShoppingCart } from 'lucide-react';

// Create a simple wrapper for Storybook to avoid renderer issues
const StepperStoryComponent = React.forwardRef<any, StepperProps>((props, _ref) => {
  return <Stepper {...props} />;
});
StepperStoryComponent.displayName = 'Stepper';

const basicSteps = [
  { label: 'Personal Info', description: 'Enter your details' },
  { label: 'Payment', description: 'Choose payment method' },
  { label: 'Confirmation', description: 'Review and confirm' },
];

const stepsWithIcons = [
  { label: 'Account', description: 'Create your account', icon: <User size={16} /> },
  { label: 'Payment', description: 'Add payment details', icon: <CreditCard size={16} /> },
  { label: 'Complete', description: 'Setup complete', icon: <Check size={16} /> },
];

const longSteps = [
  { label: 'Start', description: 'Begin the process' },
  { label: 'Configuration', description: 'Set up your preferences' },
  { label: 'Integration', description: 'Connect your services' },
  { label: 'Testing', description: 'Verify everything works' },
  { label: 'Deployment', description: 'Go live with your setup' },
  { label: 'Complete', description: 'Process finished' },
];

const stepsWithStates = [
  { label: 'Account Setup', description: 'Create your account' },
  { label: 'Verification', description: 'Verify your email', optional: true },
  { label: 'Payment Info', description: 'Add payment method', error: true },
  { label: 'Review', description: 'Review and submit', disabled: true },
];

const meta: Meta<StepperProps> = {
  title: 'Components/Navigation/Stepper',
  component: StepperStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Stepper Component

A unified stepper component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Multiple Orientations**: Support for horizontal and vertical layouts
- **Step States**: Active, completed, error, and disabled states
- **Icon Support**: Built-in support for custom icons in steps
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML elements with CSS-based styling and Lucide icons
- **React Native**: TouchableOpacity components with Unicode symbols

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Stepper } from '@vas-dj-saas/ui';

const steps = [
  { label: 'Personal Info', description: 'Enter your details' },
  { label: 'Payment', description: 'Choose payment method' },
  { label: 'Confirmation', description: 'Review and confirm' },
];

<Stepper 
  steps={steps}
  activeStep={1}
  onStepClick={(stepIndex) => setActiveStep(stepIndex)}
/>
\`\`\`

### With Icons and Custom Configuration
\`\`\`tsx
import { Stepper } from '@vas-dj-saas/ui';
import { User, CreditCard, Check } from 'lucide-react';

const steps = [
  { label: 'Account', icon: <User size={16} />, description: 'Create account' },
  { label: 'Payment', icon: <CreditCard size={16} />, description: 'Add payment' },
  { label: 'Complete', icon: <Check size={16} />, description: 'Setup complete' },
];

<Stepper 
  steps={steps}
  activeStep={1}
  orientation="vertical"
  allowClickableSteps={true}
  completedSteps={[0]}
  size="lg"
  variant="circle"
/>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<Stepper 
  steps={steps}
  activeStep={1}
  onStepPress={(stepIndex) => navigation.navigate(\`Step\${stepIndex}\`)}
/>

// Web
<Stepper 
  steps={steps}
  activeStep={1}
  onStepClick={(stepIndex) => router.push(\`/step/\${stepIndex}\`)}
/>
\`\`\`

## Benefits

✅ **Flexible Layouts** - Horizontal and vertical orientations  
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
        <div style={{ maxWidth: '800px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    steps: {
      control: { type: 'object' },
      description: 'Array of step objects with label, description, and optional properties',
    },
    activeStep: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Currently active step index (0-based)',
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the stepper',
    },
    showStepNumbers: {
      control: { type: 'boolean' },
      description: 'Show step numbers in the step indicators',
    },
    showConnectors: {
      control: { type: 'boolean' },
      description: 'Show connecting lines between steps',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the stepper component',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal', 'circle'],
      description: 'Visual style variant',
    },
    allowClickableSteps: {
      control: { type: 'boolean' },
      description: 'Allow clicking on steps to navigate',
    },
    completedSteps: {
      control: { type: 'object' },
      description: 'Array of completed step indices',
    },
    onStepClick: {
      action: 'step-clicked (web)',
      description: 'Web click handler for steps',
    },
    onStepPress: {
      action: 'step-pressed (native)',
      description: 'React Native press handler for steps',
    },
  },
  args: {
    steps: basicSteps,
    activeStep: 1,
    orientation: 'horizontal',
    showStepNumbers: true,
    showConnectors: true,
    size: 'md',
    variant: 'default',
    allowClickableSteps: false,
    completedSteps: [],
  },
};

export default meta;
type Story = StoryObj<StepperProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    steps: basicSteps,
    activeStep: 1,
    onStepClick: (stepIndex) => console.log('Web step clicked:', stepIndex),
    onStepPress: (stepIndex) => console.log('Native step pressed:', stepIndex),
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
          <WebStepper {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML elements with Lucide icons<br/>
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
          <NativeStepper {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with Unicode symbols<br/>
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
    steps: basicSteps,
    activeStep: 1,
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized stepper components.',
      },
    },
  },
};

// Orientation comparison
export const OrientationComparison: Story = {
  name: '🔄 Orientation Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Horizontal vs Vertical Orientations</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Orientations */}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Horizontal</div>
              <WebStepper 
                steps={basicSteps}
                activeStep={1}
                orientation="horizontal"
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Vertical</div>
              <WebStepper 
                steps={basicSteps}
                activeStep={1}
                orientation="vertical"
              />
            </div>
          </div>
        </div>

        {/* React Native Orientations */}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Horizontal</div>
              <NativeStepper 
                steps={basicSteps}
                activeStep={1}
                orientation="horizontal"
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Vertical</div>
              <NativeStepper 
                steps={basicSteps}
                activeStep={1}
                orientation="vertical"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of horizontal and vertical orientations showing how the stepper adapts to different layout needs.',
      },
    },
  },
};

// Step states showcase
export const StepStates: Story = {
  name: '⚡ Step States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Step States</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web States */}
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
          <WebStepper 
            steps={stepsWithStates}
            activeStep={2}
            completedSteps={[0]}
            orientation="vertical"
          />
        </div>

        {/* React Native States */}
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
          <NativeStepper 
            steps={stepsWithStates}
            activeStep={2}
            completedSteps={[0]}
            orientation="vertical"
          />
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', maxWidth: '500px' }}>
        Shows completed (✓), active, error (!), optional, and disabled step states
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different step states including completed, active, error, optional, and disabled states.',
      },
    },
  },
};

// With icons showcase
export const WithIcons: Story = {
  name: '🎨 With Icons',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Steps with Custom Icons</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web with Icons */}
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
          <WebStepper 
            steps={stepsWithIcons}
            activeStep={1}
            completedSteps={[0]}
            variant="circle"
            size="lg"
          />
        </div>

        {/* React Native with Icons */}
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
          <NativeStepper 
            steps={stepsWithIcons}
            activeStep={1}
            completedSteps={[0]}
            variant="circle"
            size="lg"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Stepper with custom icons for each step, showing how icons enhance the visual hierarchy and meaning.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Stepper Sizes - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Sizes */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Small</div>
              <WebStepper size="sm" steps={basicSteps} activeStep={1} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Medium</div>
              <WebStepper size="md" steps={basicSteps} activeStep={1} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Large</div>
              <WebStepper size="lg" steps={basicSteps} activeStep={1} />
            </div>
          </div>
        </div>

        {/* React Native Sizes */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Small</div>
              <NativeStepper size="sm" steps={basicSteps} activeStep={1} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Medium</div>
              <NativeStepper size="md" steps={basicSteps} activeStep={1} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Large</div>
              <NativeStepper size="lg" steps={basicSteps} activeStep={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available stepper sizes shown side by side with consistent spacing and typography across platforms.',
      },
    },
  },
};