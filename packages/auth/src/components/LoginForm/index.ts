// Platform-specific exports
// Metro (React Native) will resolve to LoginForm.native.tsx
// Web bundlers will resolve to LoginForm.web.tsx
// The .ts file acts as a fallback that exports the web version
export { LoginForm } from "./LoginForm";
export type { LoginFormProps, LoginFormState } from "./types";
