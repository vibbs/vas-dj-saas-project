# VAS-DJ Mobile App

React Native mobile application built with Expo, providing native mobile access to the VAS-DJ SaaS platform with cross-platform components and native performance.

## 🚀 Quick Start

```bash
# From monorepo root
pnpm install

# Start Expo development server
npx expo start

# Or run with package filter
pnpm --filter @vas-dj-saas/mobile start
```

### Platform-Specific Setup

**iOS Simulator:**
- Press `i` in the Expo CLI or scan QR code with iOS simulator
- Requires Xcode and iOS Simulator installed

**Android Emulator:**
- Press `a` in the Expo CLI or scan QR code with Android emulator
- Requires Android Studio and emulator setup

**Physical Device:**
- Install Expo Go app from App Store/Play Store
- Scan QR code from Expo CLI

## 📁 Project Structure

```
├── app/                    # Expo Router (File-based routing)
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home/Dashboard tab
│   │   ├── explore.tsx    # Explore/Discovery tab
│   │   └── _layout.tsx    # Tab layout
│   ├── auth/              # Authentication flows
│   │   ├── login.tsx      # Login screen
│   │   ├── register.tsx   # Registration screen
│   │   ├── verify-email.tsx # Email verification
│   │   └── forgot-password.tsx # Password reset
│   ├── +not-found.tsx     # 404 screen
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # React Native components
│   ├── ui/               # Platform-specific UI components
│   ├── Collapsible.tsx   # Custom components
│   └── ThemedText.tsx    # Themed components
├── constants/            # App constants and configuration
├── hooks/               # Custom React hooks
└── assets/             # Static assets (images, fonts)
```

## 🏗️ Architecture

### Expo Router (v3)
- **File-based routing** with automatic deep linking
- **Tab navigation** for main app sections
- **Stack navigation** for modal flows
- **Native navigation** performance with React Navigation

### Cross-Platform Components
- **Shared UI library** from `@vas-dj-saas/ui`
- **Platform-adaptive** components (iOS/Android specific behaviors)
- **Native performance** with React Native optimizations
- **Consistent theming** across web and mobile

### Authentication
- **JWT token storage** with secure native storage
- **Biometric authentication** support (Touch ID/Face ID)
- **Deep link handling** for email verification
- **Session management** with automatic refresh

## 📱 Key Features

### Navigation Structure
```typescript
// Tab-based main navigation
- Dashboard (index) - Main SaaS interface
- Explore - Feature discovery and settings
- Profile - User profile and organization management

// Modal/Stack navigation
- Authentication flow (login, register, verify)
- Settings and configuration screens
- Detail views and forms
```

### Native Features
- **Push notifications** for real-time updates
- **Biometric login** with fallback to passcode
- **Offline capability** with data caching
- **Camera integration** for profile photos
- **File system access** for document uploads
- **Deep linking** for email verification and invites

### Responsive Design
- **iOS and Android** platform-specific styling
- **Dynamic Type** support for accessibility
- **Dark mode** support with system preferences
- **Screen size adaptation** for tablets

## 🎨 UI & Styling

### Shared Components
All components from `@vas-dj-saas/ui` work seamlessly:
```typescript
import { Button, Input, Card } from '@vas-dj-saas/ui';

// Same API across web and mobile
<Button variant="primary" onPress={handlePress}>
  Submit
</Button>
```

### Platform-Specific Styling
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { paddingTop: 20 },
      android: { paddingTop: 24 },
    }),
  },
});
```

### Theme Integration
```typescript
import { useTheme } from '@vas-dj-saas/ui';

function MyComponent() {
  const { theme, isDarkMode } = useTheme();
  // Access theme tokens consistent with web
}
```

## 🔐 Authentication & Security

### JWT Token Management
```typescript
import { useAuth } from '@vas-dj-saas/auth';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async (credentials) => {
    await login(credentials);
    // Automatic navigation on success
  };
}
```

### Secure Storage
- **Keychain/Keystore** integration for token storage
- **Biometric protection** for sensitive data
- **Certificate pinning** for API security
- **Automatic token refresh** handling

### Deep Links
```typescript
// Handle authentication deep links
expo://auth/verify-email?token=abc123
expo://auth/reset-password?token=xyz789
```

## 📡 API Integration

### Type-Safe API Client
Same API client as web with React Native optimizations:
```typescript
import { apiClient } from '@vas-dj-saas/api-client';
import type { User } from '@vas-dj-saas/types';

// Network-aware API calls
const user = await apiClient.users.getCurrentUser();
```

### Network Handling
- **Offline detection** with graceful degradation
- **Request queuing** for offline actions
- **Background sync** when connection restored
- **Retry logic** for failed requests

## ⚙️ Configuration

### App Configuration (`app.json`)
```json
{
  "expo": {
    "name": "VAS-DJ",
    "slug": "vas-dj-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.vasdj.mobile"
    },
    "android": {
      "package": "com.vasdj.mobile"
    }
  }
}
```

### Environment Variables
Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_WEB_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

## 🧪 Development

### Development Commands
```bash
# Start Expo development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Run on specific device/simulator
npx expo run:ios
npx expo run:android

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Development Tools
- **Expo DevTools** for debugging and profiling
- **React Native Debugger** for advanced debugging
- **Flipper** for network and layout inspection
- **Metro bundler** for fast refresh

### Testing
- **Jest** for unit testing
- **Testing Library** for component testing
- **Detox** for E2E testing (configured)
- **Storybook** integration for component development

## 📱 Platform Specifics

### iOS Development
```bash
# iOS simulator
npx expo run:ios

# Physical device (requires Apple Developer account)
npx expo run:ios --device

# Build for TestFlight
npx eas build --platform ios
```

### Android Development
```bash
# Android emulator
npx expo run:android

# Physical device
npx expo run:android --device

# Build for Play Store
npx eas build --platform android
```

### Native Code
- **iOS folder committed** for consistent builds
- **Custom native modules** when needed
- **CocoaPods** for iOS dependencies
- **Gradle** for Android dependencies

## 🚀 Build & Deployment

### EAS Build (Recommended)
```bash
# Configure EAS
npx eas build:configure

# Build for development
npx eas build --profile development

# Build for production
npx eas build --profile production --platform all
```

### Over-the-Air Updates
```bash
# Publish OTA update
npx eas update --branch production

# Rollback if needed
npx eas update --branch production --message "Rollback to previous version"
```

### App Store Submission
- **iOS**: Automatic TestFlight upload with EAS
- **Android**: Automatic Play Console upload with EAS
- **Metadata**: Managed through EAS Submit

## 🔧 Performance Optimizations

### Bundle Optimization
- **Tree shaking** for smaller bundle sizes
- **Code splitting** with dynamic imports
- **Image optimization** with Expo Image
- **Font optimization** with selective loading

### Memory Management
- **FlatList** for large datasets
- **Image caching** with optimized loading
- **Navigation optimization** with lazy loading
- **Memory leak prevention** with proper cleanup

### Native Performance
- **Hermes engine** for faster startup (Android)
- **JSC optimization** for iOS performance
- **Native modules** for heavy computations
- **Background tasks** for data sync

## 🔗 Integration Points

### Shared Packages
- **@vas-dj-saas/ui**: Cross-platform components
- **@vas-dj-saas/auth**: Authentication with native features
- **@vas-dj-saas/api-client**: Network-aware API client
- **@vas-dj-saas/types**: Shared TypeScript definitions
- **@vas-dj-saas/utils**: Platform-aware utilities

### Native Integrations
- **Camera**: Profile photo and document capture
- **Notifications**: Push notifications via Expo Notifications
- **Biometrics**: Touch ID/Face ID authentication
- **Storage**: Secure keychain/keystore access
- **Network**: Connection status and offline handling

## 📚 Related Documentation

- **[Backend API](../../backend/README.md)** - Django REST API
- **[Web Application](../web/README.md)** - Next.js web app
- **[UI Components](../../packages/ui/README.md)** - Cross-platform component library
- **[Authentication](../../packages/auth/README.md)** - Auth system with native features
- **[API Client](../../packages/api-client/README.md)** - Network-aware API client

## 🐛 Troubleshooting

### Common Issues

**iOS Simulator Crashes:**
```bash
# Reset simulator
npx expo run:ios --reset-cache
xcrun simctl erase all
```

**Android Build Failures:**
```bash
# Clean builds
cd android && ./gradlew clean && cd ..
npx expo run:android --reset-cache
```

**Metro Bundler Issues:**
```bash
# Clear Metro cache
npx expo start --clear
npm start -- --reset-cache
```

**Development Server Connection:**
- Ensure computer and device are on same network
- Check firewall settings
- Use `expo start --tunnel` for connection issues

## 🤝 Contributing

1. Test on both iOS and Android platforms
2. Use shared components from `@vas-dj-saas/ui`
3. Follow platform-specific design guidelines
4. Test with different screen sizes and orientations
5. Ensure accessibility features work properly
6. Test offline functionality where applicable