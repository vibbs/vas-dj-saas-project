# Cross-Platform Badge Component

A unified badge component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Badge component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Badge.native.tsx` (React Native View/TouchableOpacity)
- **Web** → `Badge.web.tsx` (HTML span/button element with theme styles)
- **Web + react-native-web** → `Badge.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Badge } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <Badge variant="primary" size="md">
      Status
    </Badge>
  );
}
```

### With Theme Provider

```tsx
import { Badge, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Badge variant="success">Online</Badge>
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;  // React Native
  onClick?: () => void;  // Web
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'text' | 'none' | 'status';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
}
```

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { Badge } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <Badge 
      variant="success" 
      onPress={() => console.log('Status clicked')}
    >
      Online
    </Badge>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/MyComponent.tsx
import { Badge } from '@vas-dj-saas/ui';

export default function MyComponent() {
  return (
    <Badge 
      variant="warning" 
      onClick={() => console.log('Filter applied')}
      className="custom-class"
    >
      Pending
    </Badge>
  );
}
```

## Interactive vs Static Badges

The Badge component automatically chooses the appropriate HTML element or React Native component based on the presence of click/press handlers:

### Static Badges (Status Indicators)
```tsx
// Renders as <span> on web, <View> on React Native
<Badge variant="success">Online</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Offline</Badge>
```

### Interactive Badges (Clickable)
```tsx
// Renders as <button> on web, <TouchableOpacity> on React Native
<Badge variant="primary" onClick={() => applyFilter()}>Filter</Badge>
<Badge variant="outline" onPress={() => selectTag()}>Tag</Badge>
```

## Variants

The Badge component supports 7 different variants:

- **primary** - Main brand color badge
- **secondary** - Secondary color badge
- **outline** - Transparent with colored border
- **ghost** - Minimal transparent badge
- **destructive** - Error/danger state
- **success** - Success/positive state
- **warning** - Warning/caution state

## Sizes

- **sm** - Small badge for compact spaces
- **md** - Medium badge (default)
- **lg** - Large badge for emphasis

## Theme System

The Badge component uses a unified theme system that works across platforms:

```tsx
// Both platforms use the same theme tokens
const theme = {
  colors: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    destructive: '#ef4444',
    // ... more colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  // ... more tokens
};
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA Compliant)
- **Semantic HTML**: Uses appropriate `span` or `button` elements
- **ARIA Attributes**: Proper `aria-label`, `aria-live`, and `role` attributes
- **Keyboard Navigation**: Support for Enter and Spacebar activation (interactive badges)
- **Focus Management**: Proper tab order and focus indicators
- **Screen Reader Support**: Descriptive labels and live region announcements

### React Native Accessibility
- **Accessibility Props**: `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- **State Information**: `accessibilityState` for disabled states
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Touch Accessibility**: Proper touch target sizes and feedback

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Smart Element Selection** - Automatically chooses span/button or View/TouchableOpacity  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant  
✅ **Performance** - Platform-optimized rendering  

## File Structure

```
Badge/
├── Badge.ts              # Platform-aware export
├── Badge.web.tsx         # Web implementation  
├── Badge.native.tsx      # React Native implementation
├── types.ts              # Shared TypeScript types
├── index.ts              # Public exports
├── Badge.stories.tsx     # Storybook stories
└── README.md             # Documentation
```

## Examples

### Status Indicators
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Suspended</Badge>
```

### User Roles
```tsx
<Badge variant="primary">Admin</Badge>
<Badge variant="secondary">User</Badge>
<Badge variant="outline">Guest</Badge>
```

### Notification Counts
```tsx
<Badge variant="destructive" size="sm">3</Badge>
<Badge variant="primary" size="sm">12</Badge>
```

### Interactive Tags/Filters
```tsx
<Badge variant="outline" onClick={() => toggleFilter('react')}>
  React
</Badge>
<Badge variant="ghost" onPress={() => removeTag('typescript')}>
  TypeScript ×
</Badge>
```