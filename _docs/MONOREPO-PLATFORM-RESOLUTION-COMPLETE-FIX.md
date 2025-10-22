# Complete Fix: Platform-Specific Component Resolution for Monorepo

## The Problem

When implementing mobile login, we encountered the "div component undefined" error because React Native's Metro bundler was loading the **compiled JavaScript** from the `dist` folder instead of the **source TypeScript** files with platform-specific extensions.

### Error Chain:
```
Mobile App → @vas-dj-saas/auth → dist/components/LoginForm/LoginForm.js
                                   ↓
                              LoginForm.web.js (❌ Wrong! Has `div` tags)
```

### What We Needed:
```
Mobile App → @vas-dj-saas/auth → src/components/LoginForm/LoginForm.native.tsx ✅
```

## The Complete Solution

### 1. Configure Package.json Files to Point Metro to Source

All workspace packages now have `react-native` field pointing to source files:

#### `packages/auth/package.json`
```json
{
  "main": "dist/index.js",
  "react-native": "src/index.ts",
  "exports": {
    ".": {
      "react-native": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

#### `packages/ui/package.json`
```json
{
  "main": "dist/index.js",
  "react-native": "src/index.ts",
  "exports": {
    ".": {
      "react-native": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

#### `packages/api-client/package.json`
```json
{
  "main": "./dist/index.cjs",
  "react-native": "./src/index.ts",
  "exports": {
    ".": {
      "react-native": "./src/index.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### 2. Updated Metro Config for Proper Extension Resolution

#### `apps/mobile/metro.config.js`
```javascript
config.resolver.sourceExts = [
  'expo.tsx',
  'expo.ts',
  'expo.js',
  'native.tsx',  // ✅ Prioritize .native.tsx
  'native.ts',
  'native.js',
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
];

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
```

### 3. Platform Bridge Files Use Static Exports

#### `packages/auth/src/components/LoginForm/LoginForm.ts`
```typescript
// Exports web version by default (no runtime checks!)
// Metro will override with .native.tsx when resolving for React Native
export { LoginForm } from './LoginForm.web';
```

## How It Works Now

### For React Native (Metro):
1. App imports from `@vas-dj-saas/auth`
2. Metro checks package.json and sees `"react-native": "src/index.ts"`
3. Metro resolves to source files
4. When it encounters `LoginForm`, it finds `LoginForm.native.tsx` (prioritized in sourceExts)
5. ✅ Native components loaded!

### For Web (Next.js):
1. App imports from `@vas-dj-saas/auth`
2. Webpack/Next.js checks package.json and sees `"main": "dist/index.js"`
3. Uses compiled dist files
4. `LoginForm.ts` explicitly exports from `LoginForm.web`
5. ✅ Web components loaded, no hydration issues!

## Why This Works

| Aspect                | Before                             | After                                         |
| --------------------- | ---------------------------------- | --------------------------------------------- |
| **Mobile Resolution** | `dist/LoginForm.js` → web version  | `src/LoginForm.native.tsx` → native version ✅ |
| **Web Resolution**    | Runtime check (hydration mismatch) | Static export (no SSR issues) ✅               |
| **Build Time**        | Both platforms use compiled dist   | Mobile: source, Web: compiled ✅               |
| **Type Safety**       | Lost after compilation             | Full TypeScript support ✅                     |

## Files Modified

### Package Configurations:
- ✅ `packages/auth/package.json` - Added `react-native` field
- ✅ `packages/ui/package.json` - Added `react-native` field
- ✅ `packages/api-client/package.json` - Added `react-native` field

### Metro Configuration:
- ✅ `apps/mobile/metro.config.js` - Enhanced extension resolution

### Component Exports:
- ✅ `packages/auth/src/components/LoginForm/LoginForm.ts` - Static export
- ✅ `packages/auth/src/components/RegisterForm/RegisterForm.ts` - Static export

## Testing Checklist

### Mobile App ✅
```bash
cd apps/mobile
npx expo start --clear
# Navigate to auth/login
# Should load LoginForm.native.tsx
# No "div component undefined" errors
```

### Web App ✅
```bash
cd apps/web
pnpm dev
# Navigate to /login
# Should load LoginForm.web.tsx
# No hydration mismatches
```

## Key Learnings

1. **Metro needs source files**: When in a monorepo, Metro should transpile from source for proper platform resolution
2. **No runtime checks in SSR**: Any runtime platform detection causes hydration mismatches
3. **package.json fields matter**: The `react-native` field tells Metro where to look
4. **Extension priority**: Metro's `sourceExts` order determines which file is used

## Future Applications

This pattern can be applied to any shared component that needs platform-specific implementations:

```
Component.native.tsx  → React Native
Component.web.tsx     → Web
Component.ts          → Default export (usually web)
```

Just ensure:
1. Package has `react-native` field pointing to `src/`
2. Metro config includes `.native.tsx` in `sourceExts`
3. Bridge file (.ts) exports the web version statically

---

**Date**: October 20, 2025  
**Status**: ✅ Fully Implemented & Tested  
**Breaking Changes**: None (backward compatible)
