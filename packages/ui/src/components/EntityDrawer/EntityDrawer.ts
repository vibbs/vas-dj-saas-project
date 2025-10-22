// Platform-aware EntityDrawer export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from "../../utils/platform";

// Import both implementations
import { EntityDrawer as WebEntityDrawer } from "./EntityDrawer.web";
import { EntityDrawer as NativeEntityDrawer } from "./EntityDrawer.native";

// Export the platform-aware EntityDrawer component
export const EntityDrawer = createPlatformComponent(
  NativeEntityDrawer,
  WebEntityDrawer
);

// Re-export types
export type { EntityDrawerProps, DrawerSide, DrawerSize } from "./types";
