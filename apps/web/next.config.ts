import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude React Native modules from web builds
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native/Libraries/Utilities/codegenNativeComponent': false,
      'react-native-svg$': 'react-native-svg-web',
    };

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native': 'react-native-web',
    };

    return config;
  },
  transpilePackages: ['@vas-dj-saas/ui', '@vas-dj-saas/auth'],
};

export default nextConfig;
