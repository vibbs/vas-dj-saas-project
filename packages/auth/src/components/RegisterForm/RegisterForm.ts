// Platform-specific component imports
// This file acts as a bridge to allow bundlers to resolve the correct platform file
//
// For React Native (Metro bundler):
//   - Metro will look for RegisterForm.native.tsx first
//   - If importing from './RegisterForm', it prefers .native.tsx over .ts
//
// For Web (Next.js/Webpack):
//   - Will use RegisterForm.web.tsx when available
//   - Falls back to this file which exports the web version
//
// To avoid hydration mismatches, we export the web version by default
// React Native's Metro bundler will override this with the .native.tsx file

export { RegisterForm } from "./RegisterForm.web";
