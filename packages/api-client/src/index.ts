// Re-export the modern API client architecture
export { http, wireAuth, type TokenPair } from './http';
export * from './endpoints';

// Keep the legacy ApiClient for backward compatibility if needed
export { ApiClient } from './legacy';

// Default http instance is already configured and ready to use
export { http as default } from './http';