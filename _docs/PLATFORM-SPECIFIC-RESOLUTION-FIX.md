# Platform-Specific Component Resolution Fix

## Problem Summary
When implementing the mobile login page, we encountered two critical issues:

1. **Mobile App Error**: React Native was loading the web version (`LoginForm.web.tsx`) instead of the native version (`LoginForm.native.tsx`), causing the error:
   ```
   Invariant Violation: View config getter callback for component `div` must be a function
   ```

2. **Web App Hydration Error**: Initial attempt to fix this with runtime platform detection (`typeof navigator !== 'undefined' && navigator.product === 'ReactNative'`) caused Next.js hydration mismatches because the check evaluated differently on server vs client.

## Root Cause
The `@vas-dj-saas/auth` package had platform-agnostic TypeScript files (`LoginForm.ts`, `RegisterForm.ts`) that were hardcoded to always export the web versions, preventing proper platform-specific module resolution.

## Solution Implemented

### 1. Updated Platform Bridge Files
Modified `LoginForm.ts` and `RegisterForm.ts` to export the web version by default, while allowing Metro bundler to override with native versions:

```typescript
// packages/auth/src/components/LoginForm/LoginForm.ts
export { LoginForm } from './LoginForm.web';
```

**Key Points:**
- **Web (Next.js)**: Uses the explicit `.web` import
- **React Native (Metro)**: Will automatically resolve `.native.tsx` files when they exist
- **No runtime checks**: Prevents hydration mismatches

### 2. Added Metro Configuration
Created `apps/mobile/metro.config.js` with proper module resolution:

```javascript
config.resolver.sourceExts = [
  'expo.tsx', 'expo.ts', 'expo.js',
  'tsx', 'ts', 'jsx', 'js', 'json', 
  'wasm', 'mjs', 'cjs'
];

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
```

This ensures Metro prioritizes:
1. React Native-specific files (`.native.tsx`)
2. Platform-specific exports in package.json
3. Standard files as fallback

### 3. Enhanced package.json
Added React Native export configuration:

```json
{
  "react-native": "dist/index.js",
  "exports": {
    ".": {
      "react-native": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

## How It Works

### File Resolution Priority

**For Web Apps (Next.js/Webpack):**
```
Import: '@vas-dj-saas/auth' → LoginForm
  ↓
1. Resolves to: LoginForm.ts
2. Which exports: LoginForm.web.tsx
3. Result: Web version loaded ✅
```

**For Mobile Apps (React Native/Metro):**
```
Import: '@vas-dj-saas/auth' → LoginForm
  ↓
1. Looks for: LoginForm.native.tsx (found!)
2. Prefers native over .ts
3. Result: Native version loaded ✅
```

## Benefits

✅ **No Runtime Checks**: Eliminates hydration mismatches in SSR  
✅ **Bundler-Driven**: Leverages native bundler capabilities  
✅ **Type-Safe**: Full TypeScript support maintained  
✅ **Zero Runtime Cost**: Resolution happens at build time  
✅ **Backward Compatible**: Doesn't break existing web functionality  

## Testing

### Web App
```bash
cd apps/web
pnpm dev
# Navigate to /login - should work without hydration errors
```

### Mobile App
```bash
cd apps/mobile
pnpm start
# Navigate to auth/login - should use native components
```

## Files Modified

1. `packages/auth/src/components/LoginForm/LoginForm.ts` - Updated export strategy
2. `packages/auth/src/components/RegisterForm/RegisterForm.ts` - Updated export strategy
3. `packages/auth/package.json` - Added React Native exports
4. `apps/mobile/metro.config.js` - Created with monorepo + platform support

## Future Considerations

- This pattern can be applied to other shared components that need platform-specific implementations
- Consider documenting this pattern in the monorepo setup guide
- May want to add build-time validation to ensure both `.web` and `.native` versions exist for platform-specific components

## Related Issues

- ❌ **Old Approach**: Runtime `navigator.product` check → Hydration mismatch
- ✅ **New Approach**: Bundler-based resolution → No runtime overhead

---

**Date**: October 20, 2025  
**Author**: Development Team  
**Status**: ✅ Implemented and Tested
