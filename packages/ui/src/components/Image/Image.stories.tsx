import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Image } from './Image';
import { Image as WebImage } from './Image.web';
import { Image as NativeImage } from './Image.native';
import { ImageProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { createBlurDataURL, createPlaceholderSource } from './imageUtils';

// Create a simple wrapper for Storybook to avoid renderer issues
const ImageStoryComponent = React.forwardRef<any, ImageProps>((props, _ref) => {
  return <Image {...props} />;
});
ImageStoryComponent.displayName = 'Image';

// Sample images for testing
const sampleImages = {
  landscape: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  portrait: 'https://images.unsplash.com/photo-1494790108755-2616c7e26e36?w=400&h=600&fit=crop',
  square: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  svg: 'https://raw.githubusercontent.com/feathericons/feather/master/icons/image.svg',
  placeholder: createPlaceholderSource(400, 300, 'Sample Image'),
  blurData: createBlurDataURL('#e5e7eb'),
};

const meta: Meta<ImageProps> = {
  title: 'Media/Image',
  component: ImageStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Image Component

A unified image component that automatically renders the appropriate implementation based on the platform with comprehensive format support and performance optimizations.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Multi-Format Support**: PNG, JPEG, WebP, SVG, GIF with automatic format detection
- **Smart Sizing**: Aspect ratio preservation, auto-sizing, and responsive behavior
- **Performance**: Lazy loading, blur-up technique, error handling, and fallbacks
- **Accessibility**: Proper alt text, ARIA attributes, and screen reader support
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: HTML img/object elements with CSS optimizations and SVG support
- **React Native**: Native Image component with ActivityIndicator and error handling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Image } from '@vas-dj-saas/ui';

<Image 
  source="https://example.com/image.jpg"
  alt="Sample image"
  width={400}
  height={300}
/>
\`\`\`

### Responsive with Aspect Ratio
\`\`\`tsx
import { Image } from '@vas-dj-saas/ui';

<Image 
  source="https://example.com/image.jpg"
  alt="Responsive image"
  aspectRatio={16/9}
  width="100%"
  resizeMode="cover"
/>
\`\`\`

### Avatar with Fallback
\`\`\`tsx
import { Image } from '@vas-dj-saas/ui';

<Image 
  source="https://example.com/avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
  aspectRatio={1}
  borderRadius={32}
  fallback={<div>👤</div>}
  errorImage="https://example.com/default-avatar.png"
/>
\`\`\`

### SVG Support
\`\`\`tsx
import { Image } from '@vas-dj-saas/ui';

<Image 
  source="https://example.com/icon.svg"
  alt="SVG icon"
  width={32}
  height={32}
  svg={true}
/>
\`\`\`

### Blur-up Loading
\`\`\`tsx
import { Image } from '@vas-dj-saas/ui';

<Image 
  source="https://example.com/large-image.jpg"
  alt="High quality image"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  loading="lazy"
/>
\`\`\`

## Benefits

✅ **Universal Format Support** - PNG, JPEG, WebP, SVG, GIF  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Smart Performance** - Lazy loading, blur-up, error handling  
✅ **Responsive Design** - Aspect ratios and flexible sizing  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility First** - WCAG 2.1 AA compliant
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
    source: {
      control: { type: 'text' },
      description: 'Image source URL, local asset, or object with uri',
    },
    alt: {
      control: { type: 'text' },
      description: 'Alternative text for accessibility',
    },
    width: {
      control: { type: 'number' },
      description: 'Image width in pixels or CSS units',
    },
    height: {
      control: { type: 'number' },
      description: 'Image height in pixels or CSS units',
    },
    aspectRatio: {
      control: { type: 'number' },
      description: 'Aspect ratio (width/height) or "auto"',
    },
    resizeMode: {
      control: { type: 'select' },
      options: ['cover', 'contain', 'stretch', 'center', 'repeat'],
      description: 'How the image should be resized to fit its container',
    },
    borderRadius: {
      control: { type: 'number' },
      description: 'Border radius in pixels',
    },
    loading: {
      control: { type: 'select' },
      options: ['eager', 'lazy'],
      description: 'Loading strategy (web only)',
    },
    placeholder: {
      control: { type: 'select' },
      options: ['blur', 'empty'],
      description: 'Placeholder strategy while loading',
    },
    svg: {
      control: { type: 'boolean' },
      description: 'Force SVG handling',
    },
    onLoad: {
      action: 'loaded',
      description: 'Callback when image loads successfully',
    },
    onError: {
      action: 'error',
      description: 'Callback when image fails to load',
    },
  },
  args: {
    source: sampleImages.landscape,
    alt: 'Sample landscape image',
    width: 400,
    height: 300,
    aspectRatio: 'auto',
    resizeMode: 'cover',
    borderRadius: 0,
    loading: 'lazy',
    placeholder: 'empty',
    svg: false,
  },
};

export default meta;
type Story = StoryObj<ImageProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    source: sampleImages.landscape,
    alt: 'Interactive image demo',
    onLoad: () => console.log('Image loaded!'),
    onError: (error) => console.log('Image error:', error),
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
          <WebImage {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML img/object with CSS optimizations<br />
            Lazy loading & blur-up support
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
          <NativeImage {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            React Native Image with ActivityIndicator<br />
            Platform-optimized loading & caching
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized components and loading strategies.
      </div>
    </div>
  ),
  args: {
    source: sampleImages.landscape,
    alt: 'Platform comparison demo',
    width: 300,
    height: 200,
    borderRadius: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized image components.',
      },
    },
  },
};

// Different image types and formats
export const ImageFormats: Story = {
  name: '🖼️ Image Formats',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Supported Image Formats</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Formats */}
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
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>JPEG Photo</div>
              <WebImage
                source={sampleImages.landscape}
                alt="JPEG landscape"
                width={200}
                height={150}
                borderRadius={8}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>SVG Icon</div>
              <WebImage
                source={sampleImages.svg}
                alt="SVG icon"
                width={64}
                height={64}
                svg={true}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Generated Placeholder</div>
              <WebImage
                source={sampleImages.placeholder}
                alt="Placeholder image"
                width={200}
                height={150}
                borderRadius={8}
              />
            </div>
          </div>
        </div>

        {/* React Native Formats */}
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
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>JPEG Photo</div>
              <NativeImage
                source={sampleImages.landscape}
                alt="JPEG landscape"
                width={200}
                height={150}
                borderRadius={8}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>SVG (as Image)</div>
              <NativeImage
                source={sampleImages.svg}
                alt="SVG icon"
                width={64}
                height={64}
                svg={true}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Generated Placeholder</div>
              <NativeImage
                source={sampleImages.placeholder}
                alt="Placeholder image"
                width={200}
                height={150}
                borderRadius={8}
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
        story: 'Demonstration of different image formats including JPEG, PNG, SVG, and generated placeholders across both platforms.',
      },
    },
  },
};

// Aspect ratios showcase
export const AspectRatios: Story = {
  name: '📐 Aspect Ratios',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different Aspect Ratios</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Aspect Ratios */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Square (1:1)</div>
              <WebImage source={sampleImages.square} alt="Square" aspectRatio={1} width={150} borderRadius={8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Landscape (16:9)</div>
              <WebImage source={sampleImages.landscape} alt="Landscape" aspectRatio={16 / 9} width={200} borderRadius={8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Portrait (3:4)</div>
              <WebImage source={sampleImages.portrait} alt="Portrait" aspectRatio={3 / 4} width={150} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* React Native Aspect Ratios */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Square (1:1)</div>
              <NativeImage source={sampleImages.square} alt="Square" aspectRatio={1} width={150} borderRadius={8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Landscape (16:9)</div>
              <NativeImage source={sampleImages.landscape} alt="Landscape" aspectRatio={16 / 9} width={200} borderRadius={8} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Portrait (3:4)</div>
              <NativeImage source={sampleImages.portrait} alt="Portrait" aspectRatio={3 / 4} width={150} borderRadius={8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different aspect ratios (1:1, 16:9, 3:4) showing how images maintain their proportions across platforms.',
      },
    },
  },
};

// Avatar use case
export const AvatarUseCase: Story = {
  name: '👤 Avatar Use Case',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Avatar Implementation</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Web Avatars */}
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <WebImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={64}
              height={64}
              aspectRatio={1}
              borderRadius={32}
              resizeMode="cover"
            />
            <WebImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={48}
              height={48}
              aspectRatio={1}
              borderRadius={24}
              resizeMode="cover"
            />
            <WebImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={32}
              height={32}
              aspectRatio={1}
              borderRadius={16}
              resizeMode="cover"
            />
          </div>
        </div>

        {/* React Native Avatars */}
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <NativeImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={64}
              height={64}
              aspectRatio={1}
              borderRadius={32}
              resizeMode="cover"
            />
            <NativeImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={48}
              height={48}
              aspectRatio={1}
              borderRadius={24}
              resizeMode="cover"
            />
            <NativeImage
              source={sampleImages.avatar}
              alt="User avatar"
              width={32}
              height={32}
              aspectRatio={1}
              borderRadius={16}
              resizeMode="cover"
            />
          </div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
        Perfect for user avatars with consistent circular cropping and multiple sizes
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar implementation showing perfect circular images with different sizes, ideal for user profiles.',
      },
    },
  },
};

// Error handling showcase
export const ErrorHandling: Story = {
  name: '⚠️ Error Handling',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Error Handling & Fallbacks</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        width: '100%',
        maxWidth: '900px'
      }}>
        {/* Web Error Handling */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Broken URL</div>
              <WebImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Broken image"
                width={150}
                height={100}
                borderRadius={8}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Fallback Content</div>
              <WebImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Image with fallback"
                width={150}
                height={100}
                borderRadius={8}
                fallback={
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
                    🖼️
                  </div>
                }
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Error Image</div>
              <WebImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Image with error replacement"
                width={150}
                height={100}
                borderRadius={8}
                errorImage={sampleImages.placeholder}
              />
            </div>
          </div>
        </div>

        {/* React Native Error Handling */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Broken URL</div>
              <NativeImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Broken image"
                width={150}
                height={100}
                borderRadius={8}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Fallback Content</div>
              <NativeImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Image with fallback"
                width={150}
                height={100}
                borderRadius={8}
                fallback={
                  <div style={{
                    width: 150,
                    height: 100,
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8
                  }}>
                    <span style={{ fontSize: '24px' }}>🖼️</span>
                  </div>
                }
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Error Image</div>
              <NativeImage
                source="https://invalid-url.com/nonexistent.jpg"
                alt="Image with error replacement"
                width={150}
                height={100}
                borderRadius={8}
                errorImage={sampleImages.placeholder}
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
        story: 'Error handling demonstrations including broken URLs, fallback content, and error replacement images.',
      },
    },
  },
};