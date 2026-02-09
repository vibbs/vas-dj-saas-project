import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Configure module resolution to prefer .web extensions
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...(config.resolve.extensions || []),
    ];

    // Exclude React Native modules from web builds
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native/Libraries/Utilities/codegenNativeComponent': false,
      'react-native-svg$': 'react-native-svg-web',
      // Exclude expo modules from web builds
      'expo-modules-core': false,
      'expo': false,
    };

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native': 'react-native-web',
      'expo-modules-core': false,
    };

    // Exclude native files from being processed
    config.module.rules.push({
      test: /\.native\.(tsx?|jsx?)$/,
      use: 'null-loader',
    });

    return config;
  },
  transpilePackages: ['@vas-dj-saas/ui', '@vas-dj-saas/auth', '@vas-dj-saas/api-client', '@vas-dj-saas/core'],
};

export default nextConfig;
