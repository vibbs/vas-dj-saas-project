// Platform detection utilities for cross-platform components

// Detect platform dynamically
const detectPlatform = () => {
  // Check if we're in a React Native environment
  try {
    const Platform = require('react-native').Platform;
    return Platform.OS;
  } catch {
    // We're in a web environment
    return 'web';
  }
};

const currentPlatform = detectPlatform();

/**
 * Platform detection utilities
 */
export const PlatformUtils = {
  /**
   * Check if running on native mobile platforms (iOS/Android)
   */
  isNative: () => currentPlatform === 'ios' || currentPlatform === 'android',

  /**
   * Check if running on web platform (including react-native-web)
   */
  isWeb: () => currentPlatform === 'web',

  /**
   * Check if running on iOS
   */
  isIOS: () => currentPlatform === 'ios',

  /**
   * Check if running on Android
   */
  isAndroid: () => currentPlatform === 'android',

  /**
   * Get the current platform OS
   */
  getOS: () => currentPlatform,

  /**
   * Check if running with react-native-web in a browser environment
   */
  isReactNativeWeb: () => {
    return typeof window !== 'undefined';
  },

  /**
   * Select implementation based on platform
   * @param nativeImplementation - Implementation for native platforms
   * @param webImplementation - Implementation for web platform
   * @returns The appropriate implementation based on current platform
   */
  select: <T>(nativeImplementation: T, webImplementation: T): T => {
    return PlatformUtils.isWeb() ? webImplementation : nativeImplementation;
  },

  /**
   * Execute platform-specific code
   * @param options - Platform-specific implementations
   */
  execute: (options: {
    native?: () => void;
    web?: () => void;
    ios?: () => void;
    android?: () => void;
  }) => {
    if (PlatformUtils.isIOS() && options.ios) {
      options.ios();
    } else if (PlatformUtils.isAndroid() && options.android) {
      options.android();
    } else if (PlatformUtils.isNative() && options.native) {
      options.native();
    } else if (PlatformUtils.isWeb() && options.web) {
      options.web();
    }
  },
};

/**
 * Convenience exports for common platform checks
 */
export const isNative = PlatformUtils.isNative;
export const isWeb = PlatformUtils.isWeb;
export const isIOS = PlatformUtils.isIOS;
export const isAndroid = PlatformUtils.isAndroid;
export const platformSelect = PlatformUtils.select;

/**
 * Type definitions for platform-aware components
 */
export type PlatformOS = 'ios' | 'android' | 'native' | 'web';

export interface PlatformProps {
  platform?: PlatformOS;
}

/**
 * HOC helper for creating platform-aware components
 */
export function createPlatformComponent<T>(
  nativeComponent: React.ComponentType<T>,
  webComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return PlatformUtils.select(nativeComponent, webComponent);
}