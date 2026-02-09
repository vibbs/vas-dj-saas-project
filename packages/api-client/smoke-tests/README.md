# API Client Smoke Tests

Smoke tests verify that the API client works correctly in different environments.

## Available Tests

### 1. Node.js Smoke Test

**File:** `node-smoke.cjs`

Tests the API client in a Node.js (CommonJS) environment.

**Run:**
```bash
pnpm smoke:node
```

**Tests:**
- ✓ Basic imports
- ✓ Client instantiation
- ✓ Configuration functions
- ✓ Service availability
- ✓ Error utilities
- ✓ TypeScript definitions
- ✓ ESM support
- ✓ Dual package exports
- ✓ Bundle size check

### 2. Next.js Smoke Test

**File:** `next-smoke.tsx`

Tests the API client in a Next.js (React) environment.

**Usage:**
1. Copy `next-smoke.tsx` to your Next.js app (e.g., `app/smoke-test/page.tsx`)
2. Visit the route in your browser
3. Click "Run Smoke Tests"
4. Verify all tests pass

**Tests:**
- ✓ API client imports
- ✓ TypeScript type safety
- ✓ Error utilities
- ✓ Client-side rendering
- ✓ Configuration functions
- ✓ React hooks compatibility
- ✓ Async operations
- ✓ Service availability
- ✓ Browser environment detection
- ✓ Package loading

### 3. React Native Test (Future)

Coming soon: Smoke test for React Native/Expo environment.

## CI Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Run smoke tests
  run: |
    pnpm build
    pnpm smoke
```

## When to Run

- After building the package
- Before publishing a new version
- When updating dependencies
- When changing build configuration
- In CI/CD pipelines

## Expected Results

All tests should pass with green checkmarks (✅). If any test fails (❌), investigate before proceeding.

### Node.js Success Output:
```
🧪 Running Node.js smoke test...
✓ Test 1: Importing API client...
  ✅ All exports available
...
✅ All smoke tests passed!
🎉 Node.js environment is compatible!
```

### Next.js Success Output:
```
✓ Test 1: API client imports successful
✓ Test 2: TypeScript types working
...
🎉 All smoke tests passed!
```

## Troubleshooting

### Bundle too large
If bundle size exceeds limits, check:
- Dead code elimination is working
- Tree-shaking is enabled
- No unnecessary dependencies included

### Import errors
Check:
- Package is built (`pnpm build`)
- `dist/` directory exists
- Package.json exports are correct

### Type errors
Verify:
- TypeScript definitions are generated
- `dist/index.d.ts` exists
- Types match the implementation

## Adding New Tests

To add a new smoke test:

1. Create test file (e.g., `expo-smoke.tsx`)
2. Add npm script in `package.json`
3. Document in this README
4. Update CI pipeline

## Related Documentation

- [Examples](../examples/README.md) - Usage examples
- [Package README](../README.md) - Main documentation
- [Build Documentation](_docs/dev-user-journey/api-client-build.md) - Build process
