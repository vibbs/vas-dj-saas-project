# Cross-Platform Icon Component

A unified Icon component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Icon component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Icon.native.tsx` (React Native Text with emoji icons)
- **Web** → `Icon.web.tsx` (SVG element with vector graphics)
- **Web + react-native-web** → `Icon.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Icon } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <Icon name="home" size="md" />
  );
}
```

### With Theme Provider

```tsx
import { Icon, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Icon name="star" size="lg" />
    </ThemeProvider>
  );
}
```

### Custom SVG Icon (Web Only)

```tsx
import { Icon } from '@vas-dj-saas/ui';

function CustomIcon() {
  return (
    <Icon size="xl" color="#3b82f6">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Icon>
  );
}
```

## Props

```tsx
interface IconProps {
  children?: React.ReactNode;  // Custom SVG paths (web only)
  name?: string;              // Predefined icon name
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;             // Icon color (overrides theme)
  fill?: string;              // SVG fill color (web only)
  stroke?: string;            // SVG stroke color (web only)
  strokeWidth?: number;       // SVG stroke width (web only)
  viewBox?: string;           // SVG viewBox (web only)
  onPress?: () => void;       // React Native press handler
  onClick?: () => void;       // Web click handler
  className?: string;         // Web CSS class
  style?: any;               // React Native style
  testID?: string;           // Cross-platform testing ID
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'image' | 'none' | 'button';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  role?: string;
  alt?: string;
  title?: string;
}
```

## Available Predefined Icons

The Icon component includes these predefined icons:

- `home` - Home/house icon
- `user` - User/person icon
- `settings` - Settings/gear icon
- `search` - Search/magnifying glass icon
- `bell` - Notification bell icon
- `heart` - Heart icon
- `star` - Star icon
- `plus` - Plus/add icon
- `minus` - Minus/subtract icon
- `check` - Checkmark icon
- `x` - Close/x icon
- `chevron-right` - Right arrow icon
- `chevron-left` - Left arrow icon
- `chevron-up` - Up arrow icon
- `chevron-down` - Down arrow icon

## Platform-Specific Usage

### React Native App

```tsx
// apps/mobile/App.tsx
import { Icon } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <Icon 
      name="settings" 
      size="lg"
      onPress={() => console.log('Settings pressed')}
    />
  );
}
```

### Next.js Web App

```tsx
// apps/web/components/MyComponent.tsx
import { Icon } from '@vas-dj-saas/ui';

export default function MyComponent() {
  return (
    <Icon 
      name="settings" 
      size="lg"
      onClick={() => console.log('Settings clicked')}
      className="custom-icon"
    />
  );
}
```

## Platform Differences

### Web Platform (SVG)
- **Vector Graphics**: Full SVG support with customizable paths
- **Scalability**: Crisp at any size
- **Customization**: Custom SVG paths via children prop
- **Styling**: CSS-based styling with theme integration
- **Interactions**: Click handlers with hover effects

### React Native Platform (Emoji)
- **Text-Based**: Uses emoji representations of icons
- **Consistency**: Uniform rendering across devices
- **Performance**: Lightweight text rendering
- **Accessibility**: Native screen reader support
- **Interactions**: Touch handlers with proper accessibility

## Theme System

The Icon component uses a unified theme system that works across platforms:

```tsx
// Both platforms use the same theme tokens
const theme = {
  colors: {
    foreground: '#1f2937',    // Default icon color
    primary: '#3b82f6',       // Primary brand color
    // ... more colors
  },
  typography: {
    fontFamily: 'Inter',      // Font family for React Native text
  },
};
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA)
- **Semantic SVG**: Proper SVG roles and attributes
- **ARIA Labels**: Accessible names and descriptions
- **Keyboard Navigation**: Tab support for interactive icons
- **Screen Reader Support**: Descriptive labels and state information
- **Focus Management**: Proper focus indicators

### React Native Accessibility
- **Accessibility Props**: accessibilityLabel, accessibilityHint, accessibilityRole
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Touch Accessibility**: Proper touch target sizes
- **Accessible States**: Disabled and loading state information

## Benefits

✅ **Platform Optimized** - SVG on web, emoji on mobile  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Integration** - Unified color and sizing system  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant  
✅ **Performance** - Platform-optimized rendering  
✅ **Extensible** - Custom SVG support on web  

## File Structure

```
Icon/
├── Icon.ts              # Platform-aware export
├── Icon.web.tsx         # Web implementation (SVG)
├── Icon.native.tsx      # React Native implementation (Text/Emoji)
├── types.ts             # Shared TypeScript types
├── index.ts             # Public exports
├── Icon.stories.tsx     # Storybook stories
└── README.md            # Documentation
```

## Examples

### Basic Usage
```tsx
<Icon name="home" size="md" />
```

### With Color
```tsx
<Icon name="heart" size="lg" color="#ef4444" />
```

### Interactive Icon
```tsx
<Icon 
  name="settings" 
  size="md" 
  onClick={() => openSettings()}
  accessibilityLabel="Open settings"
/>
```

### Custom SVG (Web)
```tsx
<Icon size="xl" color="#10b981">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
</Icon>
```

### Numeric Size
```tsx
<Icon name="star" size={48} />
```

This Icon component provides a professional, accessible, and performant solution for cross-platform icon rendering with both predefined icons and custom SVG support.