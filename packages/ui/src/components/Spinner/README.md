# Cross-Platform Spinner Component

A unified loading spinner component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Spinner component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Spinner.native.tsx` (React Native ActivityIndicator)
- **Web** → `Spinner.web.tsx` (CSS-animated div with border spinner)
- **Web + react-native-web** → `Spinner.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Spinner } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function LoadingComponent() {
  return <Spinner size="md" />;
}
```

### Custom Color

```tsx
import { Spinner } from '@vas-dj-saas/ui';

function CustomSpinner() {
  return <Spinner size="lg" color="#3b82f6" />;
}
```

### With Theme Provider

```tsx
import { Spinner, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Spinner size="md" />
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface SpinnerProps {
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  // Color customization
  color?: string;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
}
```

## Sizes

### Small (`sm`)
- **Web**: 16px × 16px with 2px border
- **React Native**: Small ActivityIndicator
- **Use case**: Inline loading states, small buttons

### Medium (`md`) - Default
- **Web**: 24px × 24px with 3px border  
- **React Native**: Large ActivityIndicator
- **Use case**: General loading states, cards, forms

### Large (`lg`)
- **Web**: 32px × 32px with 4px border
- **React Native**: Large ActivityIndicator
- **Use case**: Page loading, large content areas

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { Spinner } from '@vas-dj-saas/ui';

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Spinner 
        size="lg" 
        color="#3b82f6"
        accessibilityLabel="Loading content"
        accessibilityHint="Please wait while we load your data"
      />
    </View>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/LoadingState.tsx
import { Spinner } from '@vas-dj-saas/ui';

export default function LoadingState() {
  return (
    <div className="flex justify-center items-center p-4">
      <Spinner 
        size="md" 
        color="#3b82f6"
        aria-label="Loading content"
        aria-describedby="loading-description"
      />
      <span id="loading-description" className="sr-only">
        Please wait while we load your data
      </span>
    </div>
  );
}
```

## Integration with Other Components

The Spinner component is designed to be used within other UI components for loading states:

### Button Loading State
```tsx
import { Button, Spinner } from '@vas-dj-saas/ui';

<Button loading>
  {/* Spinner is automatically included */}
  Save Changes
</Button>
```

### Card Loading State
```tsx
import { Card, Spinner } from '@vas-dj-saas/ui';

<Card loading>
  {/* Spinner is automatically centered */}
  <h3>Card Content</h3>
</Card>
```

### Custom Loading Overlay
```tsx
import { Spinner } from '@vas-dj-saas/ui';

function LoadingOverlay({ isLoading, children }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}>
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
}
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA)
- **Semantic Role**: Uses `role="status"` for screen readers
- **ARIA Labels**: Supports `aria-label` and `aria-describedby`
- **Live Region**: Uses `aria-live="polite"` for announcements
- **Busy State**: Uses `aria-busy="true"` to indicate loading
- **Default Label**: Automatically provides "Loading" label

### React Native Accessibility
- **Accessibility Role**: Uses `accessibilityRole="progressbar"`
- **State Information**: Uses `accessibilityState={{ busy: true }}`
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Accessibility Labels**: Supports `accessibilityLabel` and `accessibilityHint`
- **Default Label**: Automatically provides "Loading" label

## Color Customization

### Theme Colors
```tsx
// Uses theme primary color by default
<Spinner size="md" />
```

### Custom Colors
```tsx
// Custom hex color
<Spinner size="md" color="#3b82f6" />

// CSS color names
<Spinner size="md" color="red" />

// Current text color
<Spinner size="md" color="currentColor" />
```

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Integration** - Works with unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  
✅ **Accessibility** - WCAG 2.1 AA compliant across platforms  
✅ **Reusable** - Can be used standalone or within other components  

## File Structure

```
Spinner/
├── Spinner.ts              # Platform-aware export
├── Spinner.web.tsx         # Web implementation  
├── Spinner.native.tsx      # React Native implementation
├── types.ts               # Shared TypeScript types
├── index.ts               # Public exports
├── Spinner.stories.tsx    # Storybook stories
└── README.md              # Documentation
```