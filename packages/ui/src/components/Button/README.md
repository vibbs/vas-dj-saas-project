# Cross-Platform Button Component

A unified Button component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Button component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Button.native.tsx` (React Native TouchableOpacity)
- **Web** → `Button.web.tsx` (HTML button with theme styles)
- **Web + react-native-web** → `Button.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Button } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

### With Theme Provider

```tsx
import { Button, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Button variant="primary">Themed Button</Button>
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface ButtonProps {
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
import { Button } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <Button 
      variant="primary" 
      onPress={() => console.log('Native press')}
    >
      Native Button
    </Button>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/MyComponent.tsx
import { Button } from '@vas-dj-saas/ui';

export default function MyComponent() {
  return (
    <Button 
      variant="primary" 
      onClick={() => console.log('Web click')}
      className="custom-class"
    >
      Web Button
    </Button>
  );
}
```

## Theme System

The Button component uses a unified theme system that works across platforms:

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

## How It Works

1. **Import Resolution**: When you import `Button`, it goes through `Button.ts`
2. **Platform Detection**: Uses `createPlatformComponent` utility with `Platform.OS`
3. **Dynamic Export**: Exports the appropriate implementation via HOC pattern
4. **Theme Integration**: Both implementations use the same theme tokens
5. **Type Safety**: TypeScript knows about all props across platforms
6. **Reusable Pattern**: Uses shared `PlatformUtils` for consistency

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  

## File Structure

```
Button/
├── Button.ts              # Platform-aware export
├── Button.web.tsx         # Web implementation  
├── Button.native.tsx      # React Native implementation
├── types.ts              # Shared TypeScript types
├── index.ts              # Public exports
└── Button.stories.tsx    # Storybook stories
```