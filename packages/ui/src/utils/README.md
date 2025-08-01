# Platform Utilities

Shared utilities for creating cross-platform components that automatically adapt to the current platform.

## PlatformUtils

### Basic Platform Detection

```tsx
import { PlatformUtils, isNative, isWeb } from '@vas-dj-saas/ui';

// Check current platform
console.log('Is native:', isNative());
console.log('Is web:', isWeb());
console.log('Current OS:', PlatformUtils.getOS()); // 'ios' | 'android' | 'web'

// Platform-specific checks
if (PlatformUtils.isIOS()) {
  // iOS-specific code
}

if (PlatformUtils.isAndroid()) {
  // Android-specific code
}
```

### Platform Selection

```tsx
import { platformSelect } from '@vas-dj-saas/ui';

// Select values based on platform
const buttonHeight = platformSelect(44, 40); // 44 on native, 40 on web

const styles = platformSelect(
  { paddingTop: 20 }, // Native styles
  { paddingTop: 16 }  // Web styles
);
```

### Platform Execution

```tsx
import { PlatformUtils } from '@vas-dj-saas/ui';

// Execute platform-specific code
PlatformUtils.execute({
  ios: () => console.log('Running on iOS'),
  android: () => console.log('Running on Android'),
  web: () => console.log('Running on Web'),
  native: () => console.log('Running on any native platform'),
});
```

## Creating Platform-Aware Components

### Method 1: Using createPlatformComponent (Recommended)

```tsx
// components/Card/Card.ts
import React from 'react';
import { createPlatformComponent } from '@vas-dj-saas/ui';
import { CardProps } from './types';
import { Card as WebCard } from './Card.web';
import { Card as NativeCard } from './Card.native';

// Automatically selects the right implementation
export const Card = createPlatformComponent(NativeCard, WebCard);
export type { CardProps } from './types';
```

### Method 2: Manual Platform Selection

```tsx
// components/Input/Input.ts
import React from 'react';
import { isNative } from '@vas-dj-saas/ui';
import { InputProps } from './types';

// Conditional imports
const InputComponent = isNative() 
  ? require('./Input.native').Input
  : require('./Input.web').Input;

export const Input: React.FC<InputProps> = InputComponent;
```

### Method 3: Inline Platform Selection

```tsx
// For simple components
import React from 'react';
import { platformSelect } from '@vas-dj-saas/ui';

export const Divider = () => {
  const Component = platformSelect(
    require('react-native').View,
    'hr'
  );
  
  return <Component style={platformSelect(nativeStyles, webStyles)} />;
};
```

## Usage Examples

### Component with Platform-Specific Props

```tsx
// components/Modal/Modal.tsx
import React from 'react';
import { isNative, PlatformProps } from '@vas-dj-saas/ui';

interface ModalProps extends PlatformProps {
  visible: boolean;
  onClose: () => void;
  // Web-specific props
  className?: string;
  // Native-specific props  
  animationType?: 'slide' | 'fade';
}

export const Modal: React.FC<ModalProps> = (props) => {
  if (isNative()) {
    return <NativeModal {...props} />;
  }
  return <WebModal {...props} />;
};
```

### Conditional Styling

```tsx
import { platformSelect, PlatformUtils } from '@vas-dj-saas/ui';

const MyComponent = () => {
  const containerStyle = {
    padding: platformSelect(16, 20),
    backgroundColor: platformSelect('#f5f5f5', '#ffffff'),
    ...PlatformUtils.select(
      { elevation: 2 }, // Android shadow
      { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } // Web shadow
    )
  };

  return <div style={containerStyle}>Content</div>;
};
```

### Platform-Specific Imports

```tsx
// utils/haptics.ts
import { PlatformUtils } from '@vas-dj-saas/ui';

export const hapticFeedback = PlatformUtils.select(
  // Native: Use React Native Haptics
  () => {
    const { HapticFeedback } = require('react-native');
    HapticFeedback.impact();
  },
  // Web: Use Web Vibration API or fallback
  () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
);
```

## Best Practices

### 1. Component Structure
```
MyComponent/
├── MyComponent.ts         # Platform-aware export
├── MyComponent.web.tsx    # Web implementation
├── MyComponent.native.tsx # Native implementation
├── types.ts              # Shared types
└── index.ts              # Public exports
```

### 2. Consistent APIs
```tsx
// Keep the same props interface across platforms
interface ButtonProps {
  title: string;
  onPress: () => void;  // Use onPress for both platforms
  disabled?: boolean;
  // Platform-specific props marked as optional
  className?: string;    // Web only
  testID?: string;      // Both platforms
}
```

### 3. Theme Integration
```tsx
import { useTheme, platformSelect } from '@vas-dj-saas/ui';

const MyComponent = () => {
  const { theme } = useTheme();
  
  const styles = {
    backgroundColor: theme.colors.primary,
    borderRadius: platformSelect(theme.borders.radius.md, theme.borders.radius.lg),
  };
  
  return <View style={styles} />;
};
```

## File Structure Benefits

✅ **Automatic Platform Detection** - No manual platform checks needed  
✅ **Consistent Developer Experience** - Same import works everywhere  
✅ **Type Safety** - Full TypeScript support across platforms  
✅ **Tree Shaking** - Bundlers only include the needed platform code  
✅ **Maintainable** - Centralized platform logic  
✅ **Testable** - Easy to mock platform detection for tests