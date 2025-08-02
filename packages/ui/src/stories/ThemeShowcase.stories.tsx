import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { themes, type ThemeName } from '../theme/tokens';
import { Button } from '../components/Button/Button';
import { Badge } from '../components/Badge/Badge';
import { Card } from '../components/Card/Card';
import { Toast } from '../components/Toast/Toast';
import { Progress } from '../components/Progress/Progress';

// Create a showcase component
const ThemeShowcase: React.FC<{ themeName: ThemeName }> = ({ themeName }) => {
  const theme = themes[themeName];
  
  return (
    <ThemeProvider theme={theme}>
      <div style={{ 
        padding: '24px', 
        borderRadius: '12px',
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        border: `2px solid ${theme.colors.border}`,
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Theme Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: theme.colors.primary,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {theme.name} Theme
          </h3>
          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.mutedForeground,
            fontFamily: 'monospace',
            backgroundColor: theme.colors.muted,
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            Primary: {theme.colors.primary}
          </div>
        </div>

        {/* Buttons Section */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="sm" variant="primary">Primary</Button>
          <Button size="sm" variant="secondary">Secondary</Button>
          <Button size="sm" variant="outline">Outline</Button>
          <Button size="sm" variant="destructive">Destructive</Button>
        </div>

        {/* Badges Section */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        {/* Progress Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Progress value={75} color="primary" size="sm" />
          <Progress value={60} color="success" size="sm" />
          <Progress value={40} color="warning" size="sm" />
        </div>

        {/* Card Section */}
        <Card style={{ padding: '16px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: theme.colors.cardForeground }}>
            Sample Card
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: theme.colors.mutedForeground }}>
            This card demonstrates the theme's card colors and typography.
          </p>
        </Card>

        {/* Toast Section */}
        <div style={{ position: 'relative', height: '60px' }}>
          <Toast 
            variant="success" 
            title="Theme Applied" 
            description={`${theme.name} theme is now active`}
            duration={0}
            style={{ 
              position: 'relative', 
              top: 0, 
              left: 0, 
              right: 'auto', 
              bottom: 'auto', 
              transform: 'none',
              maxWidth: '100%'
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta = {
  title: 'Foundation/Theme Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Theme System Showcase

This showcase demonstrates all available themes in the design system. Each theme provides a consistent color palette and styling across all components.

## Available Themes

- **Default** - Clean, modern light theme with blue accents
- **Dark** - Dark mode variant with improved contrast
- **Blue** - Professional blue-focused theme
- **Green** - Nature-inspired green theme
- **Purple** - Creative purple theme with modern feel
- **Rose** - Warm, elegant rose theme
- **Orange** - Energetic orange theme

## How to Use Themes

### In Storybook
Use the theme switcher in the toolbar (🎨 Theme) to change themes globally across all stories.

### In Your Application
\`\`\`tsx
import { ThemeProvider, themes } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider theme={themes.dark}>
      <YourComponents />
    </ThemeProvider>
  );
}
\`\`\`

### Dynamic Theme Switching
\`\`\`tsx
const [currentTheme, setCurrentTheme] = useState('default');

return (
  <ThemeProvider theme={themes[currentTheme]}>
    <button onClick={() => setCurrentTheme('dark')}>
      Switch to Dark Theme
    </button>
    <YourComponents />
  </ThemeProvider>
);
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// All themes in one view
export const AllThemes: Story = {
  name: '🎨 All Themes Overview',
  render: () => (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
          🎨 Theme System Showcase
        </h1>
        <p style={{ margin: '0', fontSize: '16px', color: '#6b7280', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Explore all available themes in our design system. Use the toolbar theme switcher above to test any theme globally.
        </p>
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#374151',
          display: 'inline-block'
        }}>
          💡 <strong>Tip:</strong> Use the 🎨 Theme selector in the toolbar to switch themes globally
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {(Object.keys(themes) as ThemeName[]).map((themeName) => (
          <ThemeShowcase key={themeName} themeName={themeName} />
        ))}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '48px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
          Ready to Use Themes
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {(Object.keys(themes) as ThemeName[]).map((themeName) => (
            <div
              key={themeName}
              style={{
                padding: '8px 12px',
                backgroundColor: themes[themeName].colors.primary,
                color: themes[themeName].colors.primaryForeground,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {themes[themeName].name}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete overview of all available themes. Each theme card shows the key components styled with that theme\'s colors.',
      },
    },
  },
};

// Individual theme stories for detailed view
export const DefaultTheme: Story = {
  name: '🌟 Default Theme',
  render: () => <ThemeShowcase themeName="default" />,
};

export const DarkTheme: Story = {
  name: '🌙 Dark Theme', 
  render: () => <ThemeShowcase themeName="dark" />,
};

export const BlueTheme: Story = {
  name: '🔵 Blue Theme',
  render: () => <ThemeShowcase themeName="blue" />,
};

export const GreenTheme: Story = {
  name: '🟢 Green Theme',
  render: () => <ThemeShowcase themeName="green" />,
};

export const PurpleTheme: Story = {
  name: '🟣 Purple Theme', 
  render: () => <ThemeShowcase themeName="purple" />,
};

export const RoseTheme: Story = {
  name: '🌹 Rose Theme',
  render: () => <ThemeShowcase themeName="rose" />,
};

export const OrangeTheme: Story = {
  name: '🟠 Orange Theme',
  render: () => <ThemeShowcase themeName="orange" />,
};

// Interactive theme comparison
export const ThemeComparison: Story = {
  name: '⚖️ Theme Comparison',
  render: () => (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
          ⚖️ Theme Comparison Tool
        </h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
          Compare different themes side by side to see how they affect the same components
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <ThemeShowcase themeName="default" />
        <ThemeShowcase themeName="dark" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of different themes to see how they affect the same components.',
      },
    },
  },
};