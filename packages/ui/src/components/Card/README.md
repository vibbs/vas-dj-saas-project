# Cross-Platform Card Component

A unified Card component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Card component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Card.native.tsx` (React Native View/TouchableOpacity)
- **Web** → `Card.web.tsx` (HTML div/button element with theme styles)
- **Web + react-native-web** → `Card.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Card } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <Card variant="elevated" size="md">
      <h3>Card Title</h3>
      <p>Card content goes here</p>
    </Card>
  );
}
```

### With Theme Provider

```tsx
import { Card, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Card variant="elevated">Themed Card</Card>
    </ThemeProvider>
  );
}
```

### Interactive Card

```tsx
import { Card } from '@vas-dj-saas/ui';

function InteractiveCard() {
  return (
    <Card 
      variant="elevated" 
      onClick={() => console.log('Web click')}
      onPress={() => console.log('Native press')}
    >
      <h3>Clickable Card</h3>
      <p>This card responds to user interaction</p>
    </Card>
  );
}
```

## Props

```tsx
interface CardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'button' | 'link' | 'none' | 'menuitem';
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-pressed'?: boolean;        // Web: Toggle button state
  role?: string;                   // Web: Element role
  type?: 'button' | 'submit' | 'reset'; // Web: Button type
}
```

## Variants

### Default
Basic card with subtle border and background color from theme.

### Elevated
Card with shadow/elevation for prominent content areas.

### Outlined
Card with prominent border and transparent background.

### Filled
Card with muted background color for secondary content areas.

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { Card } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <Card 
      variant="elevated" 
      onPress={() => console.log('Native press')}
      accessibilityLabel="Product card"
      accessibilityHint="Tap to view product details"
    >
      <Text>Native Card</Text>
    </Card>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/ProductCard.tsx
import { Card } from '@vas-dj-saas/ui';

export default function ProductCard() {
  return (
    <Card 
      variant="elevated" 
      onClick={() => console.log('Web click')}
      className="custom-card-class"
      aria-label="Product card"
      aria-describedby="product-description"
    >
      <h3>Web Card</h3>
      <p id="product-description">Product details</p>
    </Card>
  );
}
```

## Theme System

The Card component uses a unified theme system that works across platforms:

```tsx
// Both platforms use the same theme tokens
const theme = {
  colors: {
    card: '#ffffff',
    cardForeground: '#0f172a',
    border: '#e2e8f0',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    // ... more colors
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  // ... more tokens
};
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA)
- **Semantic HTML**: Uses appropriate div/button elements based on interactivity
- **ARIA Labels**: Supports aria-label, aria-describedby, aria-pressed
- **Keyboard Navigation**: Full keyboard support with Enter and Spacebar
- **Focus Management**: Proper tab order and focus indicators
- **Screen Reader Support**: Descriptive labels and state information
- **Loading States**: Proper aria-busy and loading indicators

### React Native Accessibility
- **Accessibility Props**: accessibilityLabel, accessibilityHint, accessibilityRole
- **State Information**: accessibilityState for disabled/loading states
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Touch Accessibility**: Proper touch target sizes and feedback
- **Focus Management**: Accessible navigation patterns

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  
✅ **Accessibility** - WCAG 2.1 AA compliant across platforms  
✅ **Flexible** - Works as both static container and interactive element  

## File Structure

```
Card/
├── Card.ts              # Platform-aware export
├── Card.web.tsx         # Web implementation  
├── Card.native.tsx      # React Native implementation
├── types.ts             # Shared TypeScript types
├── index.ts             # Public exports
├── Card.stories.tsx     # Storybook stories
└── README.md            # Documentation
```