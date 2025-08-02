// Platform-aware FileUpload export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from "../../utils/platform";

// Import both implementations
import { FileUpload as WebFileUpload } from "./FileUpload.web";
import { FileUpload as NativeFileUpload } from "./FileUpload.native";

// Export the platform-aware FileUpload component
export const FileUpload = createPlatformComponent(
  NativeFileUpload,
  WebFileUpload
);

// Re-export types
export type { FileUploadProps } from "./types";
