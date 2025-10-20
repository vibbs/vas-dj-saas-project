#!/usr/bin/env node

/**
 * Node.js Smoke Test
 *
 * Verifies that the API client works in a Node.js environment.
 * Tests basic imports, initialization, and type safety.
 */

console.log('🧪 Running Node.js smoke test...\n');

// Test 1: Basic imports
console.log('✓ Test 1: Importing API client...');
const {
  ApiClient,
  wireAuth,
  setBaseUrl,
  enableLogging,
  AuthService,
  UsersService,
  OrganizationsService,
  formatApiError,
  ApiError,
} = require('../dist/index.cjs');

if (!ApiClient) {
  console.error('❌ Failed: ApiClient not exported');
  process.exit(1);
}
console.log('  ✅ All exports available\n');

// Test 2: Client instantiation
console.log('✓ Test 2: Creating client instance...');
const client = new ApiClient({
  baseUrl: 'http://localhost:8000/api/v1',
});

if (!client) {
  console.error('❌ Failed: Could not create client');
  process.exit(1);
}
console.log('  ✅ Client created successfully\n');

// Test 3: Configuration functions
console.log('✓ Test 3: Testing configuration functions...');
try {
  setBaseUrl('http://localhost:8000/api/v1');
  enableLogging({ requests: false, responses: false });
  wireAuth({
    getAccessToken: () => undefined,
    refreshToken: async () => {},
  });
  console.log('  ✅ Configuration functions work\n');
} catch (error) {
  console.error('❌ Failed: Configuration error:', error.message);
  process.exit(1);
}

// Test 4: Service availability
console.log('✓ Test 4: Checking service availability...');
const services = {
  AuthService,
  UsersService,
  OrganizationsService,
};

for (const [name, service] of Object.entries(services)) {
  if (!service) {
    console.error(`❌ Failed: ${name} not available`);
    process.exit(1);
  }
}
console.log('  ✅ All services available\n');

// Test 5: Error utilities
console.log('✓ Test 5: Testing error utilities...');
try {
  const testError = new Error('Test error');
  const formatted = formatApiError(testError);

  if (typeof formatted !== 'string') {
    throw new Error('formatApiError did not return a string');
  }

  const apiError = new ApiError('Test', 404, 'NOT_FOUND');
  if (!apiError.isNotFoundError()) {
    throw new Error('ApiError type checking failed');
  }

  console.log('  ✅ Error utilities work\n');
} catch (error) {
  console.error('❌ Failed: Error utility error:', error.message);
  process.exit(1);
}

// Test 6: Type definitions (runtime check)
console.log('✓ Test 6: Checking TypeScript definitions...');
const fs = require('fs');
const path = require('path');

const dtsPath = path.join(__dirname, '../dist/index.d.ts');
if (!fs.existsSync(dtsPath)) {
  console.error('❌ Failed: Type definitions not found');
  process.exit(1);
}

const dtsContent = fs.readFileSync(dtsPath, 'utf-8');
const requiredTypes = ['ApiClient', 'Account', 'Organization', 'ApiError'];

for (const type of requiredTypes) {
  if (!dtsContent.includes(type)) {
    console.error(`❌ Failed: Type ${type} not found in definitions`);
    process.exit(1);
  }
}
console.log('  ✅ Type definitions present\n');

// Test 7: ESM import support
console.log('✓ Test 7: Checking ESM support...');
const esmPath = path.join(__dirname, '../dist/index.mjs');
if (!fs.existsSync(esmPath)) {
  console.error('❌ Failed: ESM build not found');
  process.exit(1);
}
console.log('  ✅ ESM build available\n');

// Test 8: Dual package support
console.log('✓ Test 8: Checking dual package exports...');
const packageJson = require('../package.json');

if (!packageJson.exports) {
  console.error('❌ Failed: package.json exports not defined');
  process.exit(1);
}

if (!packageJson.exports['.']) {
  console.error('❌ Failed: Main export not defined');
  process.exit(1);
}

const mainExport = packageJson.exports['.'];
if (!mainExport.import || !mainExport.require) {
  console.error('❌ Failed: Dual package exports not properly configured');
  process.exit(1);
}
console.log('  ✅ Dual package exports configured\n');

// Test 9: Bundle size check
console.log('✓ Test 9: Checking bundle size...');
const stats = fs.statSync(path.join(__dirname, '../dist/index.mjs'));
const sizeKB = stats.size / 1024;

console.log(`  📦 Bundle size: ${sizeKB.toFixed(2)} KB`);

if (sizeKB > 100) {
  console.warn(`  ⚠️  Warning: Bundle size (${sizeKB.toFixed(2)} KB) exceeds 100 KB`);
}
console.log('  ✅ Bundle size check complete\n');

// Success!
console.log('✅ All smoke tests passed!\n');
console.log('Summary:');
console.log('  ✓ Imports working');
console.log('  ✓ Client instantiation working');
console.log('  ✓ Configuration working');
console.log('  ✓ Services available');
console.log('  ✓ Error utilities working');
console.log('  ✓ Type definitions present');
console.log('  ✓ ESM support available');
console.log('  ✓ Dual package exports configured');
console.log(`  ✓ Bundle size: ${sizeKB.toFixed(2)} KB`);
console.log('\n🎉 Node.js environment is compatible!\n');

process.exit(0);
