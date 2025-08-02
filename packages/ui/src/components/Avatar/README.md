# Cross-Platform Avatar Component

A unified Avatar component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Avatar component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Avatar.native.tsx` (React Native Image and Text components)
- **Web** → `Avatar.web.tsx` (HTML img/div elements with CSS styling)
- **Web + react-native-web** → `Avatar.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Avatar } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function UserProfile() {
  return (
    <Avatar name="John Doe" size="md" />
  );
}
```

### With Image

```tsx
import { Avatar } from '@vas-dj-saas/ui';

function UserProfile() {
  return (
    <Avatar 
      src="https://example.com/avatar.jpg" 
      name="John Doe" 
      alt="John's profile picture"
      size="lg" 
    />
  );
}
```

### With Theme Provider

```tsx
import { Avatar, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Avatar name="Jane Smith" variant="rounded" />
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface AvatarProps {
  // Content options
  src?: string;                    // Image URL
  alt?: string;                    // Image alt text
  name?: string;                   // User name for initials fallback
  initials?: string;               // Custom initials override
  fallbackIcon?: React.ReactNode; // Custom fallback icon/content
  
  // Styling options
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'circular' | 'rounded' | 'square';
  color?: string;                  // Background color for initials
  textColor?: string;              // Text color for initials
  
  // Interactive options
  onClick?: () => void;            // Web click handler
  onPress?: () => void;            // React Native press handler
  
  // Platform-specific styling
  className?: string;              // Web only
  style?: any;                     // React Native only
  testID?: string;                 // Cross-platform testing
  
  // Image loading options
  loading?: 'lazy' | 'eager';      // Web image loading strategy
  onImageLoad?: () => void;        // Image load success callback
  onImageError?: () => void;       // Image load error callback
  
  // Accessibility props
  accessibilityLabel?: string;     // React Native accessibility
  accessibilityHint?: string;      // React Native accessibility
  'aria-label'?: string;           // Web accessibility
  role?: string;                   // Web accessibility
  title?: string;                  // Web tooltip
}
```

## Fallback System

The Avatar component implements an intelligent fallback system:

1. **Image** - If `src` is provided and loads successfully
2. **Initials** - Generated from `name` or custom `initials` prop
3. **Default Icon** - Web shows user icon SVG, React Native shows 👤 emoji

```tsx
// Image with fallback to initials
<Avatar src="https://example.com/avatar.jpg" name="John Doe" />

// Custom initials
<Avatar initials="JD" />

// Name generates initials automatically
<Avatar name="Jane Smith" /> // Shows "JS"

// Default icon fallback
<Avatar /> // Shows default user icon
```

## Size Options

The Avatar component supports multiple size options:

```tsx
// Predefined sizes
<Avatar name="John" size="xs" />   // 24px
<Avatar name="John" size="sm" />   // 32px
<Avatar name="John" size="md" />   // 40px (default)
<Avatar name="John" size="lg" />   // 48px
<Avatar name="John" size="xl" />   // 64px

// Custom numeric size
<Avatar name="John" size={80} />   // 80px
```

## Variant Options

Choose from different shape variants:

```tsx
// Circular (default)
<Avatar name="John" variant="circular" />

// Rounded corners
<Avatar name="John" variant="rounded" />

// Square with small border radius
<Avatar name="John" variant="square" />
```

## Color Generation

Avatars automatically generate consistent colors based on the name or initials:

```tsx
// Same name always generates the same color
<Avatar name="John Doe" />    // Always gets the same color
<Avatar name="Jane Smith" />  // Always gets a different, consistent color

// Override with custom color
<Avatar name="John" color="#3b82f6" textColor="#ffffff" />
```

## Platform-Specific Usage

### React Native App

```tsx
// apps/mobile/App.tsx
import { Avatar } from '@vas-dj-saas/ui';

export default function UserList() {
  return (
    <Avatar 
      src="https://example.com/avatar.jpg"
      name="John Doe" 
      size="lg"
      onPress={() => openProfile()}
    />
  );
}
```

### Next.js Web App

```tsx
// apps/web/components/UserProfile.tsx
import { Avatar } from '@vas-dj-saas/ui';

export default function UserProfile() {
  return (
    <Avatar 
      src="https://example.com/avatar.jpg"
      name="John Doe" 
      size="lg"
      onClick={() => openProfile()}
      className="profile-avatar"
      loading="lazy"
    />
  );
}
```

## Platform Differences

### Web Platform
- **HTML Elements**: Uses `img` for images, `div`/`button` for containers
- **CSS Styling**: Full CSS support with hover effects and transitions
- **Image Loading**: Supports lazy loading and loading states
- **Accessibility**: ARIA attributes and semantic HTML
- **Fallback Icon**: SVG user icon for scalability

### React Native Platform
- **Native Components**: Uses `Image` and `Text` components
- **StyleSheet**: React Native styling with proper performance
- **Image Handling**: Native image loading and error handling
- **Accessibility**: React Native accessibility props
- **Fallback Icon**: Emoji (👤) for consistent cross-platform appearance

## Theme System

The Avatar component uses a unified theme system:

```tsx
// Both platforms use the same theme tokens
const theme = {
  typography: {
    fontFamily: 'Inter',         // Font family for initials
    fontWeight: {
      medium: '500',             // Font weight for initials
    },
  },
  borders: {
    radius: {
      sm: 4,                     // Square variant radius
      md: 8,                     // Rounded variant radius
    },
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)', // Hover shadow (web)
  },
};
```

## Interactive Avatars

Avatars can be made interactive with proper accessibility:

```tsx
// Interactive avatar with accessibility
<Avatar 
  name="John Doe"
  onClick={() => openProfile()}
  accessibilityLabel="View John Doe's profile"
  title="Click to view profile"
/>

// React Native interactive avatar
<Avatar 
  name="John Doe"
  onPress={() => openProfile()}
  accessibilityLabel="View John Doe's profile"
  accessibilityHint="Double tap to open user profile"
/>
```

## Image Loading

Handle image loading states and errors:

```tsx
<Avatar 
  src="https://example.com/avatar.jpg"
  name="John Doe"
  loading="lazy"
  onImageLoad={() => console.log('Image loaded')}
  onImageError={() => console.log('Image failed to load')}
/>
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA)
- **Semantic HTML**: Proper use of `img` and `button` elements
- **ARIA Labels**: Accessible names and descriptions
- **Keyboard Navigation**: Tab support and keyboard activation
- **Alt Text**: Meaningful alternative text for images
- **Focus Management**: Proper focus indicators for interactive avatars

### React Native Accessibility
- **Accessibility Props**: accessibilityLabel, accessibilityHint, accessibilityRole
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Touch Accessibility**: Proper touch target sizes and feedback
- **Image Accessibility**: accessibilityIgnoresInvertColors for better display

## Benefits

✅ **Smart Fallbacks** - Image → initials → default icon  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Generated Colors** - Consistent colors based on name hash  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - WCAG 2.1 AA compliant  
✅ **Performance** - Platform-optimized rendering  
✅ **Flexible** - Multiple sizes, variants, and customization options  

## File Structure

```
Avatar/
├── Avatar.ts              # Platform-aware export
├── Avatar.web.tsx         # Web implementation (img/div)
├── Avatar.native.tsx      # React Native implementation (Image/Text)
├── types.ts               # Shared TypeScript types
├── index.ts               # Public exports
├── Avatar.stories.tsx     # Storybook stories
└── README.md              # Documentation
```

## Examples

### Basic Usage
```tsx
<Avatar name="John Doe" size="md" />
```

### With Image and Fallback
```tsx
<Avatar 
  src="https://example.com/avatar.jpg" 
  name="John Doe" 
  alt="John's avatar"
/>
```

### Custom Styling
```tsx
<Avatar 
  name="Jane Smith" 
  size="lg" 
  variant="rounded"
  color="#3b82f6"
  textColor="#ffffff"
/>
```

### Interactive Avatar
```tsx
<Avatar 
  name="Bob Johnson"
  onClick={() => openProfile()}
  accessibilityLabel="View Bob's profile"
/>
```

### Custom Fallback
```tsx
<Avatar 
  fallbackIcon={<CustomIcon />}
  size="xl"
/>
```

This Avatar component provides a professional, accessible, and performant solution for displaying user avatars across web and React Native platforms with intelligent fallbacks and consistent theming.