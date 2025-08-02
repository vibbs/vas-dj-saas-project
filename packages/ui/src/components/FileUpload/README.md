# Cross-Platform FileUpload Component

A unified FileUpload component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The FileUpload component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `FileUpload.native.tsx` (React Native TouchableOpacity)
- **Web** → `FileUpload.web.tsx` (HTML element with theme styles)
- **Web + react-native-web** → `FileUpload.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { FileUpload } from '@vas-dj-saas/ui';

// This automatically uses the correct implementation
function MyComponent() {
  return (
    <FileUpload variant="primary" size="md">
      Upload Files
    </FileUpload>
  );
}
```

### With Theme Provider

```tsx
import { FileUpload, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <FileUpload variant="primary">Themed FileUpload</FileUpload>
    </ThemeProvider>
  );
}
```

## Props

```tsx
interface FileUploadProps {
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
  
  // File upload specific props
  onFileSelect?: (files: FileList | null) => void;
  accept?: string;      // MIME types or file extensions
  multiple?: boolean;   // Allow multiple files
  maxFileSize?: number; // Maximum file size in bytes
}
```

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { FileUpload } from '@vas-dj-saas/ui';

export default function App() {
  return (
    <FileUpload 
      variant="primary" 
      onPress={() => console.log('Native press')}
    >
      Native FileUpload
    </FileUpload>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/MyComponent.tsx
import { FileUpload } from '@vas-dj-saas/ui';

export default function MyComponent() {
  return (
    <FileUpload 
      variant="primary" 
      onClick={() => console.log('Web click')}
      className="custom-class"
    >
      Web FileUpload
    </FileUpload>
  );
}
```

## Theme System

The FileUpload component uses a unified theme system that works across platforms:

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

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  

## File Structure

```
FileUpload/
├── FileUpload.ts              # Platform-aware export
├── FileUpload.web.tsx         # Web implementation  
├── FileUpload.native.tsx      # React Native implementation
├── types.ts              # Shared TypeScript types
├── index.ts              # Public exports
├── FileUpload.stories.tsx    # Storybook stories
└── README.md             # Documentation
