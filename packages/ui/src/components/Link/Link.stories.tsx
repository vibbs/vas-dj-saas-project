import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Link } from './Link';
import { Link as WebLink } from './Link.web';
import { Link as NativeLink } from './Link.native';
import { LinkProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Create a simple wrapper for Storybook to avoid renderer issues
const LinkStoryComponent = React.forwardRef<any, LinkProps>((props, _ref) => {
  return <Link {...props} />;
});
LinkStoryComponent.displayName = 'Link';

const meta: Meta<LinkProps> = {
  title: 'Typography/Link',
  component: LinkStoryComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Cross-Platform Link Component

A unified link component that automatically renders the appropriate implementation based on the platform with proper navigation and accessibility features.

## Features
- **Smart Rendering**: Semantic anchor tags on web, TouchableOpacity on React Native
- **External Link Support**: Automatic external indicators and security attributes
- **Navigation Handling**: URL navigation on web, React Native Linking API on mobile
- **Underline Options**: Always, hover, or never underline styles
- **Disabled States**: Proper accessibility handling for disabled links
- **Theme Integration**: Uses unified design tokens for consistent styling

## Platform Implementations
- **Web**: HTML anchor elements with proper href, target, and rel attributes
- **React Native**: TouchableOpacity with React Native Linking API for URL handling

## Usage Examples

### Basic Usage
\`\`\`tsx
import { Link } from '@vas-dj-saas/ui';

<Link href="https://example.com">
  Visit Example
</Link>
\`\`\`

### External Links
\`\`\`tsx
<Link href="https://external-site.com" external>
  External Link
</Link>
\`\`\`

### Interactive Links (No URL)
\`\`\`tsx
<Link onClick={() => navigate('/page')}>
  Navigate to Page
</Link>
\`\`\`

### Styled Links
\`\`\`tsx
<Link 
  href="/page" 
  variant="primary" 
  size="lg" 
  weight="semibold"
  underline="never"
>
  Styled Link
</Link>
\`\`\`

## Benefits

✅ **Semantic HTML** - Proper anchor elements for SEO and accessibility  
✅ **Smart Navigation** - Platform-appropriate URL handling  
✅ **External Link Safety** - Automatic security attributes  
✅ **Theme Consistency** - Unified design system  
✅ **Accessibility** - Screen reader friendly with proper ARIA attributes  
✅ **Performance** - Platform-optimized rendering
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="default">
        <div style={{ maxWidth: '600px', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: { type: 'text' },
      description: 'URL to navigate to (leave empty for interactive-only links)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'muted', 'destructive'],
      description: 'Color variant of the link',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'base', 'lg', 'xl'],
      description: 'Font size of the link',
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight of the link',
    },
    underline: {
      control: { type: 'select' },
      options: ['always', 'hover', 'never'],
      description: 'Underline behavior',
    },
    external: {
      control: { type: 'boolean' },
      description: 'Mark as external link (adds indicator and security attributes)',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable link interactions',
    },
    target: {
      control: { type: 'select' },
      options: ['_blank', '_self', '_parent', '_top'],
      description: 'Link target (web only)',
    },
    children: {
      control: { type: 'text' },
      description: 'Link text content',
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
    children: 'Sample Link',
    href: 'https://example.com',
    variant: 'default',
    size: 'base',
    weight: 'normal',
    underline: 'hover',
    external: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<LinkProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    children: 'Interactive Link',
    href: 'https://example.com',
    onClick: () => console.log('Link clicked!'),
    onPress: () => console.log('Link pressed!'),
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
          <WebLink {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML anchor element<br/>
            Semantic navigation with href
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
          <NativeLink {...args} />
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            TouchableOpacity with Text<br/>
            React Native Linking API
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
        ✨ Both implementations use the same props and theme system, but render with platform-optimized navigation handling.
      </div>
    </div>
  ),
  args: {
    children: 'Cross-Platform Link',
    href: 'https://example.com',
    variant: 'primary',
    underline: 'hover',
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized components.',
      },
    },
  },
};

// Link variants showcase
export const LinkVariants: Story = {
  name: '🎨 Link Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Link Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Web Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLink variant="default" href="#">Default link</WebLink>
            <WebLink variant="primary" href="#">Primary link</WebLink>
            <WebLink variant="secondary" href="#">Secondary link</WebLink>
            <WebLink variant="muted" href="#">Muted link</WebLink>
            <WebLink variant="destructive" href="#">Destructive link</WebLink>
          </div>
        </div>

        {/* React Native Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLink variant="default">Default link</NativeLink>
            <NativeLink variant="primary">Primary link</NativeLink>
            <NativeLink variant="secondary">Secondary link</NativeLink>
            <NativeLink variant="muted">Muted link</NativeLink>
            <NativeLink variant="destructive">Destructive link</NativeLink>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available link color variants using the unified theme system.',
      },
    },
  },
};

// Underline behaviors showcase
export const UnderlineBehaviors: Story = {
  name: '📝 Underline Behaviors',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Underline Behaviors - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Web Underlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLink underline="always" href="#">Always underlined</WebLink>
            <WebLink underline="hover" href="#">Hover to underline</WebLink>
            <WebLink underline="never" href="#">Never underlined</WebLink>
          </div>
        </div>

        {/* React Native Underlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLink underline="always">Always underlined</NativeLink>
            <NativeLink underline="hover">Touch feedback underline</NativeLink>
            <NativeLink underline="never">Never underlined</NativeLink>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different underline behaviors for various design needs.',
      },
    },
  },
};

// Link types showcase
export const LinkTypes: Story = {
  name: '🔗 Link Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Link Types - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '800px'
      }}>
        {/* Web Link Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLink href="/internal">Internal link</WebLink>
            <WebLink href="https://external.com" external>External link</WebLink>
            <WebLink onClick={() => alert('Button action!')}>Interactive link (no URL)</WebLink>
            <WebLink href="mailto:hello@example.com">Email link</WebLink>
            <WebLink href="tel:+1234567890">Phone link</WebLink>
            <WebLink href="#" disabled>Disabled link</WebLink>
          </div>
        </div>

        {/* React Native Link Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLink href="myapp://internal">Deep link</NativeLink>
            <NativeLink href="https://external.com" external>External link</NativeLink>
            <NativeLink onPress={() => alert('Button action!')}>Interactive link (no URL)</NativeLink>
            <NativeLink href="mailto:hello@example.com">Email link</NativeLink>
            <NativeLink href="tel:+1234567890">Phone link</NativeLink>
            <NativeLink disabled>Disabled link</NativeLink>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different types of links including internal, external, email, phone, and interactive links.',
      },
    },
  },
};

// Link sizes showcase
export const LinkSizes: Story = {
  name: '📏 Link Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Link Sizes - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '700px'
      }}>
        {/* Web Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1976d2',
            alignSelf: 'center'
          }}>
            🌐 Web Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <WebLink size="xs" href="#">Extra small link</WebLink>
            <WebLink size="sm" href="#">Small link</WebLink>
            <WebLink size="base" href="#">Base link (default)</WebLink>
            <WebLink size="lg" href="#">Large link</WebLink>
            <WebLink size="xl" href="#">Extra large link</WebLink>
          </div>
        </div>

        {/* React Native Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f3e5f5',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#7b1fa2',
            alignSelf: 'center'
          }}>
            📱 React Native Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <NativeLink size="xs">Extra small link</NativeLink>
            <NativeLink size="sm">Small link</NativeLink>
            <NativeLink size="base">Base link (default)</NativeLink>
            <NativeLink size="lg">Large link</NativeLink>
            <NativeLink size="xl">Extra large link</NativeLink>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available link sizes showing consistent typography scaling.',
      },
    },
  },
};