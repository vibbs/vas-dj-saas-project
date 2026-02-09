// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add monorepo support
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Configure platform-specific extensions
// This ensures .native.tsx files are picked up before .ts files for React Native
config.resolver.sourceExts = [
  "expo.tsx",
  "expo.ts",
  "expo.js",
  "native.tsx", // Prioritize .native.tsx
  "native.ts",
  "native.js",
  "tsx",
  "ts",
  "jsx",
  "js",
  "json",
  "wasm",
  "mjs",
  "cjs",
];

// Ensure native platform extensions are prioritized
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Add workspace packages to be transpiled by Metro
// This allows Metro to process source files from workspace packages
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
