# create-ui-components

Create cross-platform UI components for both React (web) and React Native (mobile) applications with consistent styling and behavior.

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

1. Validate component name against supported components:
   ```bash
   # Check if component_name is in the supported list
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

2. Create component directory structure:
   ```bash
   mkdir -p packages/ui/src/components/{{component_name|title}}
   ```

3. Create the base component interface:
   ```typescript
   # Write to packages/ui/src/components/{{component_name|title}}/types.ts
   export interface {{component_name|title}}Props {
     children?: React.ReactNode;
     className?: string;
     style?: any;
     disabled?: boolean;
     testID?: string;
   }
   ```

4. Create React (web) implementation:
   ```typescript
   # Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.web.tsx
   import React from 'react';
   import { cn } from '../../utils/cn';
   import { {{component_name|title}}Props } from './types';

   export const {{component_name|title}}: React.FC<{{component_name|title}}Props> = ({
     children,
     className,
     disabled = false,
     ...props
   }) => {
     return (
       <div
         className={cn(
           "{{component_name}}-base-styles", // Add appropriate Tailwind classes based on component
           disabled && "opacity-50 cursor-not-allowed",
           className
         )}
         {...props}
       >
         {children}
       </div>
     );
   };
   ```

5. Create React Native (mobile) implementation:
   ```typescript
   # Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.native.tsx
   import React from 'react';
   import { View, StyleSheet } from 'react-native';
   import { {{component_name|title}}Props } from './types';

   export const {{component_name|title}}: React.FC<{{component_name|title}}Props> = ({
     children,
     style,
     disabled = false,
     ...props
   }) => {
     return (
       <View
         style={[
           styles.base,
           disabled && styles.disabled,
           style
         ]}
         {...props}
       >
         {children}
       </View>
     );
   };

   const styles = StyleSheet.create({
     base: {
       // Add base styles that match web Tailwind classes
     },
     disabled: {
       opacity: 0.5,
     },
   });
   ```

6. Create platform-specific index file:
   ```typescript
   # Write to packages/ui/src/components/{{component_name|title}}/index.ts
   export { {{component_name|title}} } from './{{component_name|title}}';
   export type { {{component_name|title}}Props } from './types';
   ```

7. Create platform resolver:
   ```typescript
   # Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.ts
   export { {{component_name|title}} } from './{{component_name|title}}.web';
   ```

8. Update main exports:
   ```typescript
   # Append to packages/ui/src/index.ts
   export { {{component_name|title}} } from './components/{{component_name|title}}';
   export type { {{component_name|title}}Props } from './components/{{component_name|title}}';
   ```

9. Create component-specific styles utility:
   ```typescript
   # Write to packages/ui/src/styles/{{component_name}}.ts
   export const {{component_name}}Styles = {
     // Shared style definitions that work across platforms
     base: {
       // Common styles
     },
     variants: {
       // Different style variants
     }
   };
   ```

10. Create Storybook stories for both platforms:
    ```typescript
    # Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.stories.tsx
    import type { Meta, StoryObj } from '@storybook/react';
    import { {{component_name|title}} } from './{{component_name|title}}';

    const meta: Meta<typeof {{component_name|title}}> = {
      title: 'Components/{{component_name|title}}',
      component: {{component_name|title}},
      parameters: {
        layout: 'centered',
        docs: {
          description: {
            component: 'Cross-platform {{component_name|title}} component that works on both web and React Native.',
          },
        },
      },
      tags: ['autodocs'],
      argTypes: {
        disabled: {
          control: 'boolean',
          description: 'Disable the component',
        },
        className: {
          control: 'text',
          description: 'Additional CSS classes (web only)',
        },
      },
    };

    export default meta;
    type Story = StoryObj<typeof meta>;

    export const Default: Story = {
      args: {
        children: '{{component_name|title}} Content',
        disabled: false,
      },
    };

    export const Disabled: Story = {
      args: {
        children: '{{component_name|title}} Content',
        disabled: true,
      },
    };
    ```

11. Create React Native specific Storybook story:
    ```typescript
    # Write to packages/ui/src/components/{{component_name|title}}/{{component_name|title}}.stories.native.tsx
    import type { Meta, StoryObj } from '@storybook/react-native';
    import { {{component_name|title}} } from './{{component_name|title}}.native';

    const meta: Meta<typeof {{component_name|title}}> = {
      title: 'Components/{{component_name|title}}',
      component: {{component_name|title}},
      parameters: {
        notes: 'React Native version of the {{component_name|title}} component',
      },
    };

    export default meta;
    type Story = StoryObj<typeof meta>;

    export const Default: Story = {
      args: {
        children: '{{component_name|title}} Content',
        disabled: false,
      },
    };

    export const Disabled: Story = {
      args: {
        children: '{{component_name|title}} Content',
        disabled: true,
      },
    };
    ```

12. Create comprehensive test suites:
    ```typescript
    # Write to packages/ui/src/components/{{component_name|title}}/__tests__/{{component_name|title}}.web.test.tsx
    import React from 'react';
    import { render, screen } from '@testing-library/react';
    import userEvent from '@testing-library/user-event';
    import { {{component_name|title}} } from '../{{component_name|title}}.web';

    describe('{{component_name|title}} (Web)', () => {
      it('renders correctly', () => {
        render(<{{component_name|title}}>Test Content</{{component_name|title}}>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('handles disabled state', () => {
        render(<{{component_name|title}} disabled>Test Content</{{component_name|title}}>);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveClass('opacity-50', 'cursor-not-allowed');
      });

      it('applies custom className', () => {
        render(<{{component_name|title}} className="custom-class">Test Content</{{component_name|title}}>);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveClass('custom-class');
      });

      it('meets accessibility standards', () => {
        const { container } = render(<{{component_name|title}}>Test Content</{{component_name|title}}>);
        // Add specific a11y tests based on component type
      });
    });
    ```

13. Create React Native tests:
    ```typescript
    # Write to packages/ui/src/components/{{component_name|title}}/__tests__/{{component_name|title}}.native.test.tsx
    import React from 'react';
    import { render } from '@testing-library/react-native';
    import { {{component_name|title}} } from '../{{component_name|title}}.native';

    describe('{{component_name|title}} (React Native)', () => {
      it('renders correctly', () => {
        const { getByText } = render(<{{component_name|title}}>Test Content</{{component_name|title}}>);
        expect(getByText('Test Content')).toBeTruthy();
      });

      it('handles disabled state', () => {
        const { getByText } = render(<{{component_name|title}} disabled>Test Content</{{component_name|title}}>);
        const element = getByText('Test Content').parent;
        expect(element?.props.style).toMatchObject(
          expect.objectContaining({ opacity: 0.5 })
        );
      });

      it('applies custom styles', () => {
        const customStyle = { backgroundColor: 'red' };
        const { getByText } = render(
          <{{component_name|title}} style={customStyle}>Test Content</{{component_name|title}}>
        );
        const element = getByText('Test Content').parent;
        expect(element?.props.style).toMatchObject(
          expect.objectContaining(customStyle)
        );
      });

      it('has proper testID', () => {
        const { getByTestId } = render(
          <{{component_name|title}} testID="test-{{component_name}}">Test Content</{{component_name|title}}>
        );
        expect(getByTestId('test-{{component_name}}')).toBeTruthy();
      });
    });
    ```

14. Create visual regression tests:
    ```typescript
    # Write to packages/ui/src/components/{{component_name|title}}/__tests__/{{component_name|title}}.visual.test.tsx
    import React from 'react';
    import { render } from '@testing-library/react';
    import { {{component_name|title}} } from '../{{component_name|title}}';

    describe('{{component_name|title}} Visual Tests', () => {
      it('matches snapshot - default state', () => {
        const { container } = render(<{{component_name|title}}>Default</{{component_name|title}}>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('matches snapshot - disabled state', () => {
        const { container } = render(<{{component_name|title}} disabled>Disabled</{{component_name|title}}>);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
    ```

15. Create test configuration files:
    ```json
    # Write to packages/ui/src/components/{{component_name|title}}/__tests__/jest.config.js
    module.exports = {
      preset: 'react-native',
      setupFilesAfterEnv: ['<rootDir>/../../../../jest.setup.js'],
      testMatch: ['**/__tests__/**/*.native.test.{js,ts,tsx}'],
      transform: {
        '^.+\\.(js|ts|tsx)
    ```bash
    # Update packages/ui/package.json to include new component export
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('packages/ui/package.json', 'utf8'));
    if (!pkg.exports) pkg.exports = {};
    pkg.exports['./{{component_name}}'] = {
      'react-native': './src/components/{{component_name|title}}/{{component_name|title}}.native.js',
      'default': './src/components/{{component_name|title}}/{{component_name|title}}.web.js'
    };
    fs.writeFileSync('packages/ui/package.json', JSON.stringify(pkg, null, 2));
    "
    ```

17. Generate component-specific implementation based on type:
    ```bash
    # Run component-specific setup script
    node scripts/setup-component.js {{component_name}}
    ```

## Usage

```bash
# Create a button component
claude code create-ui-components button

# Create a card component
claude code create-ui-components card

# Create an input component
claude code create-ui-components input
```

## Testing Strategy

The command creates a comprehensive testing setup:

### **Unit Tests**
- **Web tests**: Jest + React Testing Library for DOM interactions
- **Native tests**: Jest + React Native Testing Library for mobile components
- **Cross-platform**: Shared test utilities and helpers

### **Visual Tests**  
- **Snapshot testing**: Ensures UI consistency across versions
- **Visual regression**: Catches unintended styling changes
- **Platform parity**: Verifies components look similar across platforms

### **Accessibility Tests**
- **Web a11y**: ARIA attributes, keyboard navigation, screen readers
- **Mobile a11y**: React Native accessibility props, voice over support

### **Storybook Integration**
- **Dual stories**: Separate stories for web and React Native
- **Interactive docs**: Live component playground
- **Visual testing**: Chromatic integration for visual diffs
- **Device testing**: Test on actual devices via Storybook React Native

## Project Structure

## Notes

- Components are created with comprehensive TypeScript support
- Web components use Tailwind CSS with semantic class names
- React Native components use StyleSheet for optimal performance  
- Each component includes proper TypeScript interfaces and types
- **Dual Storybook stories** for both web and React Native platforms
- **Complete test coverage** with unit, visual, and accessibility tests
- Package.json is updated with proper platform-specific exports
- Components follow the compound component pattern for maximum flexibility
- **Cross-platform testing** ensures consistent behavior
- **Visual regression testing** maintains design consistency

## Testing Commands

```bash
# Run all tests
npm test

# Run web-specific tests  
npm run test:web

# Run React Native tests
npm run test:native

# Run visual regression tests
npm run test:visual

# Start Storybook (web)
npm run storybook

# Start Storybook (React Native)
npm run storybook:native
```

## Project Structure

After running the command, your component will be structured as:

```
packages/ui/src/components/ComponentName/
├── types.ts                           # TypeScript interfaces
├── ComponentName.web.tsx              # React (web) implementation
├── ComponentName.native.tsx           # React Native implementation  
├── ComponentName.ts                   # Platform resolver
├── ComponentName.stories.tsx          # Storybook (web)
├── ComponentName.stories.native.tsx   # Storybook (React Native)
├── __tests__/                         # Test directory
│   ├── ComponentName.web.test.tsx     # Web unit tests
│   ├── ComponentName.native.test.tsx  # React Native unit tests
│   ├── ComponentName.visual.test.tsx  # Visual regression tests
│   └── jest.config.js                 # Test configuration
└── index.ts                           # Exports
```: 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    };
    ```

16. Update package.json exports:
    ```bash
    # Update packages/ui/package.json to include new component export
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('packages/ui/package.json', 'utf8'));
    if (!pkg.exports) pkg.exports = {};
    pkg.exports['./{{component_name}}'] = {
      'react-native': './src/components/{{component_name|title}}/{{component_name|title}}.native.js',
      'default': './src/components/{{component_name|title}}/{{component_name|title}}.web.js'
    };
    fs.writeFileSync('packages/ui/package.json', JSON.stringify(pkg, null, 2));
    "
    ```

12. Generate component-specific implementation based on type:
    ```bash
    # Run component-specific setup script
    node scripts/setup-component.js {{component_name}}
    ```

## Usage

```bash
# Create a button component
claude code create-ui-components button

# Create a card component
claude code create-ui-components card

# Create an input component
claude code create-ui-components input
```

## Notes

- Components are created with TypeScript support
- Web components use Tailwind CSS classes
- React Native components use StyleSheet for consistent styling  
- Each component includes proper TypeScript types
- Storybook stories are generated for documentation
- Package.json is updated with proper platform-specific exports
- Components follow the compound component pattern for flexibility

## Project Structure

After running the command, your component will be structured as:

```
packages/ui/src/components/ComponentName/
├── types.ts                    # TypeScript interfaces
├── ComponentName.web.tsx       # React (web) implementation
├── ComponentName.native.tsx    # React Native implementation  
├── ComponentName.ts           # Platform resolver
├── ComponentName.stories.tsx  # Storybook documentation
└── index.ts                   # Exports
```