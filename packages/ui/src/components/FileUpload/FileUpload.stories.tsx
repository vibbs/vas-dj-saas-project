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
                    <WebFileUpload {...args} />
                    <div style={{
                        fontSize: '11px',
                        color: '#666',
                        textAlign: 'center',
                        lineHeight: '1.4'
                    }}>
                        HTML element with CSS styling<br />
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
                    <NativeFileUpload {...args} />
                    <div style={{
                        fontSize: '11px',
                        color: '#666',
                        textAlign: 'center',
                        lineHeight: '1.4'
                    }}>
                        TouchableOpacity with native styling<br />
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
        children: 'Cross-Platform FileUpload',
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
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>FileUpload Variants - Side by Side</h3>

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
                        <WebFileUpload variant="primary">Primary</WebFileUpload>
                        <WebFileUpload variant="secondary">Secondary</WebFileUpload>
                        <WebFileUpload variant="outline">Outline</WebFileUpload>
                        <WebFileUpload variant="ghost">Ghost</WebFileUpload>
                        <WebFileUpload variant="destructive">Destructive</WebFileUpload>
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
                        <NativeFileUpload variant="primary">Primary</NativeFileUpload>
                        <NativeFileUpload variant="secondary">Secondary</NativeFileUpload>
                        <NativeFileUpload variant="outline">Outline</NativeFileUpload>
                        <NativeFileUpload variant="ghost">Ghost</NativeFileUpload>
                        <NativeFileUpload variant="destructive">Destructive</NativeFileUpload>
                    </div>
                </div>
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available FileUpload variants shown side by side for web and React Native platforms using the unified theme system.',
            },
        },
    },
};

// All sizes showcase
export const AllSizes: Story = {
    name: '📏 All Sizes',
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
