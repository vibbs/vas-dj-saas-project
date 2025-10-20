// Platform-specific component imports
// This file acts as a bridge to allow bundlers to resolve the correct platform file
//
// For React Native (Metro bundler):
//   - Metro will look for LoginForm.native.tsx first
//   - If importing from './LoginForm', it prefers .native.tsx over .ts
//
// For Web (Next.js/Webpack):
//   - Will use LoginForm.web.tsx when available
//   - Falls back to this file which exports the web version
//
// To avoid hydration mismatches, we export the web version by default
// React Native's Metro bundler will override this with the .native.tsx file

export { LoginForm } from "./LoginForm.web";
