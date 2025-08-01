// Platform detection utilities for cross-platform components
import { Platform } from 'react-native';

/**
 * Platform detection utilities
 */
export const PlatformUtils = {
  /**
   * Check if running on native mobile platforms (iOS/Android)
   */
  isNative: () => Platform.OS === 'ios' || Platform.OS === 'android',

  /**
   * Check if running on web platform (including react-native-web)
   */
  isWeb: () => Platform.OS === 'web',

  /**
   * Check if running on iOS
   */
  isIOS: () => Platform.OS === 'ios',

  /**
   * Check if running on Android
   */
  isAndroid: () => Platform.OS === 'android',

  /**
   * Get the current platform OS
   */
  getOS: () => Platform.OS,

  /**
   * Check if running with react-native-web in a browser environment
   */
  isReactNativeWeb: () => {
    return Platform.OS === 'web' && typeof window !== 'undefined';
  },

  /**
   * Select implementation based on platform
   * @param nativeImplementation - Implementation for native platforms
   * @param webImplementation - Implementation for web platform
   * @returns The appropriate implementation based on current platform
   */
  select: <T>(nativeImplementation: T, webImplementation: T): T => {
    return PlatformUtils.isNative() ? nativeImplementation : webImplementation;
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
    if (options.ios && PlatformUtils.isIOS()) {
      options.ios();
    } else if (options.android && PlatformUtils.isAndroid()) {
      options.android();
    } else if (options.native && PlatformUtils.isNative()) {
      options.native();
    } else if (options.web && PlatformUtils.isWeb()) {
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