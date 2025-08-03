import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AppBar } from './AppBar';
import { AppBar as WebAppBar } from './AppBar.web';
import { AppBar as NativeAppBar } from './AppBar.native';
import { AppBarProps } from './types';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Search, Bell, User, Menu, Share, Heart, Download, Settings, MoreVertical } from 'lucide-react';

// Create a simple wrapper for Storybook to avoid renderer issues
const AppBarStoryComponent = React.forwardRef<any, AppBarProps>((props, _ref) => {
  return <AppBar {...props} />;
});
AppBarStoryComponent.displayName = 'AppBar';

const basicActions = [
  { id: 'search', icon: <Search size={20} />, label: 'Search' },
  { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', badge: '3' },
  { id: 'profile', icon: <User size={20} />, label: 'Profile' },
];

const socialActions = [
  { id: 'share', icon: <Share size={20} />, label: 'Share' },
  { id: 'favorite', icon: <Heart size={20} />, label: 'Favorite' },
  { id: 'download', icon: <Download size={20} />, label: 'Download' },
  { id: 'menu', icon: <MoreVertical size={20} />, label: 'More options' },
];

const meta: Meta<AppBarProps> = {
  title: 'Components/Navigation/AppBar',
  component: AppBarStoryComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Cross-Platform AppBar Component

A unified application bar component that automatically renders the appropriate implementation based on the platform.

## Features
- **Automatic Platform Detection**: Uses React Native's \`Platform.OS\` to select the correct implementation
- **Consistent API**: Same props work on both web and React Native
- **Theme Integration**: Uses unified design tokens for consistent styling
- **Flexible Layout**: Support for title, subtitle, logo, and custom content
- **Action Buttons**: Built-in support for action buttons with badges
- **Back Navigation**: Automatic back button with customizable behavior
- **Accessibility**: Proper ARIA attributes and React Native accessibility props

## Platform Implementations
- **Web**: HTML header element with CSS-based styling and Lucide icons
- **React Native**: View with TouchableOpacity components and StatusBar integration

## Usage Examples

### Basic Usage
\`\`\`tsx
import { AppBar } from '@vas-dj-saas/ui';

const actions = [
  { id: 'search', icon: <Search size={20} />, label: 'Search' },
  { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', badge: '3' },
];

<AppBar 
  title="My Application"
  actions={actions}
  onActionClick={(action) => handleAction(action)}
/>
\`\`\`

### With Back Navigation and Subtitle
\`\`\`tsx
import { AppBar } from '@vas-dj-saas/ui';

<AppBar 
  title="Settings"
  subtitle="Manage your preferences"
  backAction={{
    label: 'Go back',
    onPress: () => navigation.goBack(),
  }}
  actions={[
    { id: 'save', icon: <Check size={20} />, label: 'Save' },
  ]}
  variant="prominent"
/>
\`\`\`

### Platform-Specific Handlers
\`\`\`tsx
// React Native
<AppBar 
  title="My App"
  actions={actions}
  onActionPress={(action) => navigation.navigate(action.id)}
/>

// Web
<AppBar 
  title="My App"
  actions={actions}
  onActionClick={(action) => router.push(\`/\${action.id}\`)}
/>
\`\`\`

## Benefits

✅ **Flexible Content** - Support for titles, subtitles, logos, and custom content  
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
        <div style={{ minHeight: '400px' }}>
          <Story />
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', height: '300px' }}>
            <h3>Main Content Area</h3>
            <p>This is where your main application content would go. The AppBar sits above this content area.</p>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Primary title text displayed in the app bar',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Secondary subtitle text displayed below the title',
    },
    actions: {
      control: { type: 'object' },
      description: 'Array of action buttons with icons, labels, and optional badges',
    },
    position: {
      control: { type: 'select' },
      options: ['static', 'fixed', 'sticky'],
      description: 'Positioning behavior of the app bar',
    },
    elevation: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Shadow elevation level',
    },
    transparent: {
      control: { type: 'boolean' },
      description: 'Make the app bar background transparent',
    },
    height: {
      control: { type: 'number', min: 48, max: 100 },
      description: 'Height of the app bar in pixels',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'minimal', 'prominent'],
      description: 'Visual style variant',
    },
    backAction: {
      control: { type: 'object' },
      description: 'Configuration for back navigation button',
    },
    onActionClick: {
      action: 'action-clicked (web)',
      description: 'Web click handler for action buttons',
    },
    onActionPress: {
      action: 'action-pressed (native)',
      description: 'React Native press handler for action buttons',
    },
    onTitleClick: {
      action: 'title-clicked (web)',
      description: 'Web click handler for title area',
    },
    onTitlePress: {
      action: 'title-pressed (native)',
      description: 'React Native press handler for title area',
    },
  },
  args: {
    title: 'My Application',
    actions: basicActions,
    position: 'static',
    elevation: 2,
    transparent: false,
    height: 64,
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<AppBarProps>;

// Interactive playground story with all controls
export const Interactive: Story = {
  name: '🎮 Interactive Playground',
  args: {
    title: 'My Application',
    subtitle: 'Dashboard',
    actions: basicActions,
    onActionClick: (action) => console.log('Web action clicked:', action),
    onActionPress: (action) => console.log('Native action pressed:', action),
    onTitleClick: () => console.log('Title clicked'),
    onTitlePress: () => console.log('Title pressed'),
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
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <WebAppBar {...args} />
            <div style={{ height: '200px', backgroundColor: '#f8f9fa', padding: '16px', fontSize: '12px' }}>
              Content area below the app bar
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            HTML header with Lucide icons<br/>
            CSS-based shadows & positioning
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
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <NativeAppBar {...args} />
            <div style={{ height: 200, backgroundColor: '#f8f9fa', padding: 16, fontSize: 12 }}>
              Content area below the app bar
            </div>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            React Native View with StatusBar<br/>
            Platform-appropriate elevation & shadows
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
    title: 'My Application',
    subtitle: 'Platform Comparison',
    actions: basicActions.slice(0, 2),
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows both web and React Native implementations side by side, demonstrating how the same props create platform-optimized app bar components.',
      },
    },
  },
};

// Different scenarios
export const AppBarScenarios: Story = {
  name: '📄 AppBar Scenarios',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Different AppBar Scenarios</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%', 
        maxWidth: '900px'
      }}>
        {/* Web Scenarios */}
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
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Simple Title</div>
              <WebAppBar title="Dashboard" actions={[{ id: 'menu', icon: <Menu size={20} />, label: 'Menu' }]} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Back Action</div>
              <WebAppBar 
                title="Settings"
                backAction={{ label: 'Go back' }}
                actions={[{ id: 'save', icon: <Settings size={20} />, label: 'Save' }]}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Social Media Style</div>
              <WebAppBar 
                title="Photo Gallery"
                subtitle="124 photos"
                actions={socialActions}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Badges</div>
              <WebAppBar 
                title="Messages"
                actions={[
                  { id: 'search', icon: <Search size={20} />, label: 'Search' },
                  { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', badge: '99+' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* React Native Scenarios */}
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
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Simple Title</div>
              <NativeAppBar title="Dashboard" actions={[{ id: 'menu', icon: <Menu size={20} />, label: 'Menu' }]} />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Back Action</div>
              <NativeAppBar 
                title="Settings"
                backAction={{ label: 'Go back' }}
                actions={[{ id: 'save', icon: <Settings size={20} />, label: 'Save' }]}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Social Media Style</div>
              <NativeAppBar 
                title="Photo Gallery"
                subtitle="124 photos"
                actions={socialActions}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>With Badges</div>
              <NativeAppBar 
                title="Messages"
                actions={[
                  { id: 'search', icon: <Search size={20} />, label: 'Search' },
                  { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', badge: '99+' },
                ]}
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
        story: 'Different app bar scenarios including simple titles, back navigation, social media style, and badge notifications.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  name: '🎨 All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>AppBar Variants - Side by Side</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px', 
        width: '100%', 
        maxWidth: '900px'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Default</div>
              <WebAppBar variant="default" title="Default AppBar" actions={basicActions.slice(0, 2)} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Minimal</div>
              <WebAppBar variant="minimal" title="Minimal AppBar" actions={basicActions.slice(0, 2)} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Prominent</div>
              <WebAppBar variant="prominent" title="Prominent AppBar" subtitle="Enhanced visibility" actions={basicActions.slice(0, 2)} />
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Default</div>
              <NativeAppBar variant="default" title="Default AppBar" actions={basicActions.slice(0, 2)} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Minimal</div>
              <NativeAppBar variant="minimal" title="Minimal AppBar" actions={basicActions.slice(0, 2)} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Prominent</div>
              <NativeAppBar variant="prominent" title="Prominent AppBar" subtitle="Enhanced visibility" actions={basicActions.slice(0, 2)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available app bar variants (default, minimal, prominent) shown side by side for web and React Native platforms.',
      },
    },
  },
};