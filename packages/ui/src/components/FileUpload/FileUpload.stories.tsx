import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FileUpload } from './FileUpload';
import { FileUpload as WebFileUpload } from './FileUpload.web';
import { FileUpload as NativeFileUpload } from './FileUpload.native';
import { FileUploadProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const FileUploadStoryComponent = React.forwardRef<any, FileUploadProps>((props, _ref) => {
    return <FileUpload {...props} />;
});
FileUploadStoryComponent.displayName = 'FileUpload';

const meta: Meta<FileUploadProps> = {
    title: 'Components/FileUpload',
    component: FileUploadStoryComponent,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# Cross-Platform FileUpload Component

A unified FileUpload component that automatically renders the appropriate implementation based on the platform.

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
import { FileUpload } from '@vas-dj-saas/ui';

<FileUpload variant="primary" size="md">
  Upload Files
</FileUpload>
\`\`\`

### With Theme Provider
\`\`\`tsx
import { FileUpload, ThemeProvider } from '@vas-dj-saas/ui';

<ThemeProvider defaultTheme="dark">
  <FileUpload variant="primary">Themed FileUpload</FileUpload>
</ThemeProvider>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<FileUpload onPress={() => alert('Native press')}>
  Native FileUpload
</FileUpload>

// Web
<FileUpload onClick={() => alert('Web click')}>
  Web FileUpload
</FileUpload>
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
            description: 'Visual style variant of the FileUpload',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg'],
            description: 'Size of the FileUpload',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'Disable FileUpload interactions',
        },
        loading: {
            control: { type: 'boolean' },
            description: 'Show loading spinner and disable interactions',
        },
        children: {
            control: { type: 'text' },
            description: 'FileUpload content (text or React nodes)',
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
        accept: {
            control: { type: 'text' },
            description: 'MIME types or file extensions to accept',
        },
        multiple: {
            control: { type: 'boolean' },
            description: 'Allow multiple file selection',
        },
    },
    args: {
        children: 'Upload Files',
        variant: 'primary',
        size: 'md',
        disabled: false,
        loading: false,
        accept: '*',
        multiple: false,
    },
};

export default meta;
type Story = StoryObj<FileUploadProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
    name: '🎮 Interactive Playground',
    args: {
        children: 'Interactive FileUpload',
        onPress: () => console.log('FileUpload pressed!'),
        onClick: () => console.log('FileUpload clicked!'),
    },
    parameters: {
        docs: {
            description: {
                story: 'Try different combinations of props using the controls below. This story shows the current platform implementation in action.',
            },
        },
    },
};

// Story to explicitly render the Native implementation
export const NativeImplementation: Story = {
    name: '📱 Native Implementation',
    render: (args) => <NativeFileUpload {...args} />,
    args: {
        children: 'Native FileUpload',
        onPress: () => console.log('Native FileUpload pressed!'),
    },
    parameters: {
        docs: {
            description: {
                story: 'This story explicitly renders the `FileUpload.native` component to isolate and test its behavior.',
            },
        },
    },
};

// Story to explicitly render the Web implementation
export const WebImplementation: Story = {
    name: '🌐 Web Implementation',
    render: (args) => <WebFileUpload {...args} />,
    args: {
        children: 'Web FileUpload',
        onClick: () => console.log('Web FileUpload clicked!'),
    },
    parameters: {
        docs: {
            description: {
                story: 'This story explicitly renders the `FileUpload.web` component to isolate and test its behavior.',
            },
        },
    },
};

// Story to showcase the loading state
export const Loading: Story = {
    name: '⏳ Loading State',
    args: {
        children: 'Loading...',
        loading: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'The FileUpload in a loading state. Interactions are disabled and a spinner is shown.',
            },
        },
    },
};

// Story to showcase the disabled state
export const Disabled: Story = {
    name: '🚫 Disabled State',
    args: {
        children: 'Disabled FileUpload',
        disabled: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'The FileUpload in a disabled state. Interactions are disabled.',
            },
        },
    },
};

// Story to showcase all variants
export const Variants: Story = {
    name: '🎨 Variants',
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FileUpload {...args} variant="primary">Primary</FileUpload>
            <FileUpload {...args} variant="secondary">Secondary</FileUpload>
            <FileUpload {...args} variant="outline">Outline</FileUpload>
            <FileUpload {...args} variant="ghost">Ghost</FileUpload>
            <FileUpload {...args} variant="destructive">Destructive</FileUpload>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available style variants of the FileUpload component.',
            },
        },
    },
};

// Story to showcase all sizes
export const Sizes: Story = {
    name: '📏 Sizes',
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <FileUpload {...args} size="sm">Small</FileUpload>
            <FileUpload {...args} size="md">Medium</FileUpload>
            <FileUpload {...args} size="lg">Large</FileUpload>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available sizes of the FileUpload component.',
            },
        },
    },
};
