# Cross-Platform Modal Component

A unified Modal component that automatically renders the appropriate implementation based on the platform.

## Platform Detection

The Modal component uses React Native's `Platform.OS` to automatically select the correct implementation:

- **iOS/Android** → `Modal.native.tsx` (React Native Modal component)
- **Web** → `Modal.web.tsx` (Portal-based modal with focus management)
- **Web + react-native-web** → `Modal.web.tsx` (Optimized for web rendering)

## Usage

### Simple Import (Recommended)

```tsx
import { Modal, Button } from '@vas-dj-saas/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### Bottom Sheet (Mobile-friendly)

```tsx
import { Modal } from '@vas-dj-saas/ui';

function BottomSheetExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      variant="bottom-sheet"
    >
      <h3>Bottom Sheet</h3>
      <p>Perfect for mobile interfaces and touch interactions</p>
    </Modal>
  );
}
```

### Fullscreen Modal

```tsx
import { Modal } from '@vas-dj-saas/ui';

function FullscreenExample() {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      variant="fullscreen"
      showCloseButton={true}
    >
      <h1>Fullscreen Content</h1>
      <p>Takes up the entire viewport</p>
    </Modal>
  );
}
```

### Modal with Footer Divider

```tsx
import { Modal, Button } from '@vas-dj-saas/ui';

function ModalWithDivider() {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showDivider={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <h2>Modal Title</h2>
          <p>Your content here...</p>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </Modal>
  );
}
```

## Props

```tsx
interface ModalProps {
  children?: React.ReactNode;
  // Modal state
  isOpen: boolean;
  onClose: () => void;
  // Modal variants
  variant?: 'default' | 'fullscreen' | 'bottom-sheet' | 'dialog';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  // Modal behavior
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showDivider?: boolean;
  // Animation
  animationType?: 'fade' | 'slide' | 'none';
  // Loading state
  loading?: boolean;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  accessibilityHint?: string;      // React Native: Additional context
  accessibilityRole?: 'dialog' | 'alertdialog' | 'none';
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  'aria-labelledby'?: string;      // Web: References to title element
  'aria-modal'?: boolean;          // Web: Modal dialog indicator
  role?: 'dialog' | 'alertdialog'; // Web: Element role
  
  // Modal-specific accessibility (Web only)
  initialFocusRef?: React.RefObject<HTMLElement>; // Element to focus on open
  finalFocusRef?: React.RefObject<HTMLElement>;   // Element to focus on close
}
```

## Variants

### Default
Standard centered modal with backdrop overlay.

### Dialog
Enhanced modal with stronger shadows and dialog semantics.

### Bottom Sheet
Mobile-optimized modal that slides up from the bottom of the screen.

### Fullscreen
Modal that covers the entire viewport, perfect for complex forms or detailed content.

## Sizes

- **Small (`sm`)**: 400px width (web) / 85% width (mobile)
- **Medium (`md`)**: 500px width (web) / 90% width (mobile) - Default
- **Large (`lg`)**: 700px width (web) / 95% width (mobile)
- **Extra Large (`xl`)**: 900px width (web) / 98% width (mobile)

*Note: Sizes don't apply to fullscreen and bottom-sheet variants*

## Platform-Specific Usage

### React Native App
```tsx
// apps/mobile/App.tsx
import { Modal, Button } from '@vas-dj-saas/ui';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <Modal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="bottom-sheet"
        accessibilityLabel="Settings modal"
        accessibilityHint="Configure your app settings"
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Settings
        </Text>
        <Text>Your settings content here</Text>
      </Modal>
    </View>
  );
}
```

### Next.js Web App
```tsx
// apps/web/components/SettingsModal.tsx
import { Modal, Button } from '@vas-dj-saas/ui';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button 
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
      >
        Open Settings
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="dialog"
        size="lg"
        aria-labelledby="settings-title"
        initialFocusRef={firstInputRef}
        finalFocusRef={triggerRef}
      >
        <h2 id="settings-title">Settings</h2>
        <input ref={firstInputRef} placeholder="First input gets focus" />
        <Button onClick={() => setIsOpen(false)}>Save</Button>
      </Modal>
    </>
  );
}
```

## Accessibility Features

### Web Accessibility (WCAG 2.1 AA)
- **Portal Rendering**: Renders outside normal DOM tree to avoid stacking issues
- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: Tab cycling within modal, Escape key to close
- **ARIA Attributes**: `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Role Semantics**: Proper `dialog` or `alertdialog` roles
- **Body Scroll Lock**: Prevents background scrolling when modal is open
- **Initial/Final Focus**: Customizable focus targets for optimal UX

### React Native Accessibility
- **Native Modal**: Uses React Native's built-in Modal component
- **Accessibility Props**: `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- **Modal State**: `accessibilityViewIsModal` for proper screen reader behavior
- **Screen Reader Support**: TalkBack (Android) and VoiceOver (iOS) compatible
- **Hardware Back**: Respects Android back button behavior

## Advanced Usage

### Form Modal with Focus Management
```tsx
function FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button ref={triggerRef} onClick={() => setIsOpen(true)}>
        Edit Profile
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialFocusRef={firstInputRef}
        finalFocusRef={triggerRef}
        aria-labelledby="form-title"
      >
        <form>
          <h2 id="form-title">Edit Profile</h2>
          <input 
            ref={firstInputRef}
            type="text" 
            placeholder="Name" 
            required 
          />
          <input type="email" placeholder="Email" required />
          <Button type="submit">Save Changes</Button>
        </form>
      </Modal>
    </>
  );
}
```

### Confirmation Dialog
```tsx
function ConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      variant="dialog"
      size="sm"
      closeOnBackdropClick={false}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <h3 id="confirm-title">Confirm Delete</h3>
      <p id="confirm-message">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
```

### Loading Modal
```tsx
function LoadingModal() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    try {
      await performLongOperation();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isLoading}
      onClose={() => {}} // Prevent closing during loading
      variant="dialog"
      size="sm"
      loading={true}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <h3>Processing...</h3>
      <p>Please wait while we process your request.</p>
    </Modal>
  );
}
```

## Animation Types

### Fade (Default)
Smooth opacity transition for modal appearance.

### Slide
Sliding animation from bottom (React Native) or with transform (Web).

### None
No animation, instant appearance/disappearance.

## Theme Integration

The Modal component uses unified theme tokens:

```tsx
const theme = {
  colors: {
    card: '#ffffff',
    cardForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
  },
  spacing: {
    md: 16,
    lg: 24,
  },
  borders: {
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  },
  shadows: {
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};
```

## Benefits

✅ **Single Import** - One import works everywhere  
✅ **Automatic Platform Detection** - No manual platform checks  
✅ **Consistent API** - Same props work on both platforms  
✅ **Theme Consistency** - Unified design system  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Platform-optimized rendering  
✅ **Accessibility** - WCAG 2.1 AA compliant across platforms  
✅ **Focus Management** - Proper keyboard navigation and focus trapping  
✅ **Flexible** - Multiple variants and sizes for different use cases  

## File Structure

```
Modal/
├── Modal.ts              # Platform-aware export
├── Modal.web.tsx         # Web implementation  
├── Modal.native.tsx      # React Native implementation
├── types.ts             # Shared TypeScript types
├── index.ts             # Public exports
├── Modal.stories.tsx    # Storybook stories
└── README.md            # Documentation
```