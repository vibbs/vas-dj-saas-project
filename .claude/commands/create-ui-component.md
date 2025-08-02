# create-ui-component

Create comprehensive cross-platform UI components for both React (web) and React Native (mobile) applications with consistent styling, theming, platform detection, and professional Storybook documentation.

## Parameters

- `component_name` (required): Name of the UI component to create (e.g., button, card, input, modal, etc.)

## Supported Components

- `button` - Interactive button component
- `card` - Container card component
- `input` - Text input field
- `modal` - Modal/dialog component
- `avatar` - User avatar component
- `badge` - Status badge component
- `checkbox` - Checkbox input
- `switch` - Toggle switch
- `slider` - Range slider
- `progress` - Progress indicator
- `alert` - Alert/notification component
- `spinner` - Loading spinner
- `tabs` - Tab navigation
- `accordion` - Collapsible content

## Steps

### 1. Validate Component Name
```bash
case "{{component_name}}" in
  "button"|"card"|"input"|"modal"|"avatar"|"badge"|"checkbox"|"switch"|"slider"|"progress"|"alert"|"spinner"|"tabs"|"accordion")
    echo "Creating {{component_name}} component..."
    ;;
  *)
    echo "Error: '{{component_name}}' is not a supported component type."
    echo "Supported components: button, card, input, modal, avatar, badge, checkbox, switch, slider, progress, alert, spinner, tabs, accordion"
    exit 1
    ;;
esac
```

### 2. Create Component Directory Structure
```bash
mkdir -p packages/ui/src/components/{{component_name|title}}
```

### 3. Create TypeScript Interface with Accessibility Support
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/types.ts
export interface {{component_name|title}}Props {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  // Platform-specific handlers
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'button' | 'link' | 'none' | 'menuitem'; // React Native: Element role
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-pressed'?: boolean;        // Web: Toggle button state
  role?: string;                   // Web: Element role
  type?: 'button' | 'submit' | 'reset'; // Web: Button type
}
```

### 4. Create Web Implementation with Theme Integration and Accessibility
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.web.tsx
import React from 'react';
import { {{component_name|title}}Props } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const {{component_name|title}}: React.FC<{{component_name|title}}Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  role = 'button',
  type = 'button',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.primaryForeground,
      border: `1px solid ${theme.colors.primary}`,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.secondaryForeground,
      border: `1px solid ${theme.colors.border}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.foreground,
      border: '1px solid transparent',
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
      color: theme.colors.destructiveForeground,
      border: `1px solid ${theme.colors.destructive}`,
    },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borders.radius.sm,
    },
    md: {
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borders.radius.md,
    },
    lg: {
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borders.radius.lg,
    },
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease-in-out',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const hoverStyles = !disabled ? {
    ':hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.sm,
    },
  } : {};

  // Add CSS animations for loading states
  React.useEffect(() => {
    const styleId = '{{component_name}}-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <button
      style={{...baseStyles, ...style}}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      data-testid={testID}
      className={className}
      // Accessibility attributes (WCAG 2.1 AA compliant)
      type={type}
      role={role}
      aria-label={ariaLabel || accessibilityLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      tabIndex={disabled ? -1 : 0}
      // Keyboard navigation support
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: theme.spacing.xs,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
```

### 5. Create React Native Implementation with Theme Integration and Accessibility
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.native.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { {{component_name|title}}Props } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const {{component_name|title}}: React.FC<{{component_name|title}}Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button' as const,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  role,
  type,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
  };

  const variantTextStyles = {
    primary: { color: theme.colors.primaryForeground },
    secondary: { color: theme.colors.secondaryForeground },
    outline: { color: theme.colors.primary },
    ghost: { color: theme.colors.foreground },
    destructive: { color: theme.colors.destructiveForeground },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borders.radius.sm,
    },
    md: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
    },
    lg: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borders.radius.lg,
    },
  };

  const sizeTextStyles = {
    sm: { fontSize: theme.typography.fontSize.sm },
    md: { fontSize: theme.typography.fontSize.base },
    lg: { fontSize: theme.typography.fontSize.lg },
  };

  const baseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    ...sizeTextStyles[size],
    ...variantTextStyles[variant],
  };

  return (
    <TouchableOpacity
      style={[baseStyles, style]}
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : '{{component_name|title}}')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variantTextStyles[variant].color}
          style={{ marginRight: theme.spacing.xs }}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};
```

### 6. Create Platform-Aware Export with Platform Detection
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.ts
// Platform-aware {{component_name|title}} export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { {{component_name|title}} as Web{{component_name|title}} } from './{{component_name|title}}.web';
import { {{component_name|title}} as Native{{component_name|title}} } from './{{component_name|title}}.native';

// Export the platform-aware {{component_name|title}} component
export const {{component_name|title}} = createPlatformComponent(
  Native{{component_name|title}},
  Web{{component_name|title}}
);

// Re-export types
export type { {{component_name|title}}Props } from './types';
```

### 7. Create Component Index
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/index.ts
export { {{component_name|title}} } from './{{component_name|title}}';
export type { {{component_name|title}}Props } from './types';
```

### 8. Create Comprehensive Storybook Stories with Side-by-Side Comparisons
```typescript
# Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { {{component_name|title}} } from './{{component_name|title}}';
import { {{component_name|title}} as Web{{component_name|title}} } from './{{component_name|title}}.web';
import { {{component_name|title}} as Native{{component_name|title}} } from './{{component_name|title}}.native';
import { {{component_name|title}}Props } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const {{component_name|title}}StoryComponent = React.forwardRef<any, {{component_name|title}}Props>((props, _ref) => {
  return <{{component_name|title}} {...props} />;
});
{{component_name|title}}StoryComponent.displayName = '{{component_name|title}}';

const meta: Meta<{{component_name|title}}Props> = {
  title: 'Components/{{component_name|title}}',
  component: {{component_name|title}}StoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform {{component_name|title}} Component

A unified {{component_name|title}} component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Loading States**: Built-in loading spinner with platform-appropriate animations
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML element with CSS-based styling and hover effects
- **React Native**: TouchableOpacity with ActivityIndicator for loading states

## Usage Examples

### Basic Usage
\`\`\`tsx
import { {{component_name|title}} } from '@vas-dj-saas/ui';

<{{component_name|title}} variant="primary" size="md">
  {{component_name|title}} Content
</{{component_name|title}}>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { {{component_name|title}}, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <{{component_name|title}} variant="primary">Themed {{component_name|title}}</{{component_name|title}}>
</ThemeProvider>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<{{component_name|title}} onPress={() => alert('Native press')}>
  Native {{component_name|title}}
</{{component_name|title}}>

// Web
<{{component_name|title}} onClick={() => alert('Web click')}>
  Web {{component_name|title}}
</{{component_name|title}}>
\`\`\`

## Benefits

✅ **Single Import** - One import works everywhere  
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
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Visual style variant of the {{component_name}}',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the {{component_name}}',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable {{component_name}} interactions',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading spinner and disable interactions',
    },
    children: {
      control: { type: 'text' },
      description: '{{component_name|title}} content (text or React nodes)',
    },
    onPress: {
      action: 'pressed (native)',
      description: 'React Native press handler',
    },
    onClick: {
      action: 'clicked (web)',
      description: 'Web click handler',
    },
    testID: {
      control: { type: 'text' },
      description: 'Test identifier for automated testing',
    },
  },
  args: {
    children: '{{component_name|title}}',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<{{component_name|title}}Props>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive {{component_name|title}}',
    onPress: () => console.log('{{component_name|title}} pressed!'),
    onClick: () => console.log('{{component_name|title}} clicked!'),
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
        maxWidth: '600px',
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
          <Web{{component_name|title}} {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML element with CSS styling<br/>
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
          <Native{{component_name|title}} {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with native styling<br/>
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
    children: 'Cross-Platform {{component_name|title}}',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{{component_name|title}} Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
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
            <Web{{component_name|title}} variant="primary">Primary</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="secondary">Secondary</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="outline">Outline</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="ghost">Ghost</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="destructive">Destructive</Web{{component_name|title}}>
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
            <Native{{component_name|title}} variant="primary">Primary</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="secondary">Secondary</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="outline">Outline</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="ghost">Ghost</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="destructive">Destructive</Native{{component_name|title}}>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available {{component_name}} variants shown side by side for web and React Native platforms using the unified theme system.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  name: '📏 All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{{component_name|title}} Sizes - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '600px'
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
            <Web{{component_name|title}} variant="primary" size="sm">Small</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="primary" size="md">Medium</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="primary" size="lg">Large</Web{{component_name|title}}>
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
            <Native{{component_name|title}} variant="primary" size="sm">Small</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="primary" size="md">Medium</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="primary" size="lg">Large</Native{{component_name|title}}>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available {{component_name}} sizes shown side by side with consistent spacing and typography across platforms.',
      },
    },
  },
};

// States showcase
export const States: Story = {
  name: '⚡ {{component_name|title}} States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{{component_name|title}} States - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <Web{{component_name|title}} variant="primary">Normal</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="primary" loading>Loading</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="primary" disabled>Disabled</Web{{component_name|title}}>
            <Web{{component_name|title}} variant="primary" disabled loading>Disabled + Loading</Web{{component_name|title}}>
          </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            <Native{{component_name|title}} variant="primary">Normal</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="primary" loading>Loading</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="primary" disabled>Disabled</Native{{component_name|title}}>
            <Native{{component_name|title}} variant="primary" disabled loading>Disabled + Loading</Native{{component_name|title}}>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different {{component_name}} states including loading and disabled states shown side by side across platforms.',
      },
    },
  },
};

// Theme comparison
export const ThemeComparison: Story = {
  name: '🌓 Theme Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Theme Comparison - Side by Side</h3>
      
      {/* Default Theme */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          ☀️ Default Theme
        </h4>
        <ThemeProvider defaultTheme="default">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {/* Web - Default Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1976d2'
              }}>
                🌐 Web
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Web{{component_name|title}} variant="primary">Primary</Web{{component_name|title}}>
                <Web{{component_name|title}} variant="secondary">Secondary</Web{{component_name|title}}>
                <Web{{component_name|title}} variant="outline">Outline</Web{{component_name|title}}>
              </div>
            </div>

            {/* Native - Default Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#f3e5f5',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#7b1fa2'
              }}>
                📱 React Native
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Native{{component_name|title}} variant="primary">Primary</Native{{component_name|title}}>
                <Native{{component_name|title}} variant="secondary">Secondary</Native{{component_name|title}}>
                <Native{{component_name|title}} variant="outline">Outline</Native{{component_name|title}}>
              </div>
            </div>
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
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '8px'
          }}>
            {/* Web - Dark Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#1e40af',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#bfdbfe'
              }}>
                🌐 Web
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Web{{component_name|title}} variant="primary">Primary</Web{{component_name|title}}>
                <Web{{component_name|title}} variant="secondary">Secondary</Web{{component_name|title}}>
                <Web{{component_name|title}} variant="outline">Outline</Web{{component_name|title}}>
              </div>
            </div>

            {/* Native - Dark Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#7c2d92',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#e9d5ff'
              }}>
                📱 React Native
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Native{{component_name|title}} variant="primary">Primary</Native{{component_name|title}}>
                <Native{{component_name|title}} variant="secondary">Secondary</Native{{component_name|title}}>
                <Native{{component_name|title}} variant="outline">Outline</Native{{component_name|title}}>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '{{component_name|title}} appearance in different themes shown side by side for both platforms. The unified theme system ensures consistent styling across web and React Native.',
      },
    },
  },
};
```

### 9. Update Main Package Exports
```typescript
# Append to packages/ui/src/index.ts
export { {{component_name|title}} } from './components/{{component_name|title}}';
export type { {{component_name|title}}Props } from './components/{{component_name|title}}';
```

### 10. Create Component Documentation
```markdown
# Write to packages/ui/src/components/{{component_name|title}}/README.md
# Cross-Platform {{component_name|title}} Component

A unified {{component_name|title}} component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The {{component_name|title}} component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `{{component_name|title}}.native.tsx` (React Native TouchableOpacity)
- **Web** → `{{component_name|title}}.web.tsx` (HTML element with theme styles)
- **Web + react-native-web** → `{{component_name|title}}.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { {{component_name|title}} } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <{{component_name|title}} variant="primary" size="md">
      Click me
    </{{component_name|title}}>
  );
}
```

### With Theme Provider

```tsx
import { {{component_name|title}}, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <{{component_name|title}} variant="primary">Themed {{component_name|title}}</{{component_name|title}}>
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface {{component_name|title}}Props {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
}
```

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { {{component_name|title}} } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <{{component_name|title}} 
      variant="primary" 
      onPress={() => console.log('Native press')}
    >
      Native {{component_name|title}}
    </{{component_name|title}}>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/MyComponent.tsx
import { {{component_name|title}} } from '@vas-dj-saas/ui';

export default function MyComponent() {
  return (
    <{{component_name|title}} 
      variant="primary" 
      onClick={() => console.log('Web click')}
      className="custom-class"
    >
      Web {{component_name|title}}
    </{{component_name|title}}>
  );
}
```

## Theme System

The {{component_name|title}} component uses a unified theme system that works across platforms:

```tsx
// Both platforms use the same theme tokens
const theme = {
  colors: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    // ... more colors
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  // ... more tokens
};
```

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  

## File Structure

```
{{component_name|title}}/
├── {{component_name|title}}.ts              # Platform-aware export
├── {{component_name|title}}.web.tsx         # Web implementation  
├── {{component_name|title}}.native.tsx      # React Native implementation
├── types.ts              # Shared TypeScript types
├── index.ts              # Public exports
├── {{component_name|title}}.stories.tsx    # Storybook stories
└── README.md             # Documentation
```
```

## Usage

```bash
# Create a button component
claude code create-ui-component button

# Create a card component
claude code create-ui-component card

# Create an input component
claude code create-ui-component input
```

## Accessibility Requirements (WCAG 2.1 AA Compliant)

All UI components created with this template must include comprehensive accessibility support:

### ✅ **Web Accessibility (WCAG 2.1 AA)**
- **Semantic HTML**: Use proper HTML elements and roles
- **ARIA Labels**: Provide accessible names and descriptions
- **Keyboard Navigation**: Support Enter and Spacebar activation
- **Focus Management**: Proper tab order and focus indicators  
- **Screen Reader Support**: Descriptive labels and state information
- **Color Contrast**: Ensure 4.5:1 minimum contrast ratio
- **Touch Targets**: Minimum 44px touch target size

### ✅ **React Native Accessibility**
- **Accessibility Props**: accessibilityLabel, accessibilityHint, accessibilityRole
- **State Information**: accessibilityState for disabled/loading states
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Touch Accessibility**: Proper touch target sizes and feedback
- **Focus Management**: Accessible navigation patterns

### ✅ **Cross-Platform Consistency**
- **Unified API**: Same accessibility props work on both platforms
- **Consistent Behavior**: Similar user experience across web and mobile
- **Testing Support**: testID for automated accessibility testing
- **Documentation**: Clear accessibility guidelines and examples

## Key Improvements from Button Component Implementation

### ✅ **Comprehensive Theme Integration**
- Uses `useTheme()` hook for accessing design tokens
- Consistent styling across platforms using theme tokens
- Support for multiple themes (default, dark)
- Platform-optimized styling while maintaining visual consistency

### ✅ **Advanced Platform Detection**
- Uses `createPlatformComponent` utility for automatic platform selection
- HOC pattern for clean component exports
- Centralized platform detection logic

### ✅ **Professional Storybook Documentation**
- **Side-by-Side Comparisons**: Shows both web and React Native implementations simultaneously
- **Interactive Playground**: Full controls for testing all props
- **Comprehensive Examples**: Variants, sizes, states, and themes
- **Proper TypeScript Integration**: Fixed renderer issues with wrapper components
- **Rich Documentation**: Inline markdown with usage examples and benefits

### ✅ **Enhanced Component Architecture**
- **Loading States**: Built-in loading spinners with platform-appropriate animations
- **Accessibility**: Proper ARIA attributes and React Native accessibility props
- **Type Safety**: Full TypeScript interfaces with platform-specific props
- **Error Handling**: Graceful handling of disabled and loading states

### ✅ **Production-Ready Features**
- **CSS-in-JS for Web**: No Tailwind dependency, using theme-based inline styles
- **React Native Optimizations**: StyleSheet usage and TouchableOpacity
- **Consistent API**: Same props work across platforms with platform-specific handlers
- **Performance**: Platform-optimized rendering and animations

### ✅ **Developer Experience**
- **Version Alignment**: Consistent Storybook versions to prevent renderer errors
- **Clean Documentation**: Comprehensive README with usage examples
- **Testing Ready**: TestID support for automated testing
- **Theme Switching**: Easy theme integration and switching

This template now incorporates all the learnings from building the Button component and will create professional, production-ready cross-platform components with comprehensive documentation and testing support.