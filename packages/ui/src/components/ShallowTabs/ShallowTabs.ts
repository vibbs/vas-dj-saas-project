// Platform-aware ShallowTabs export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from "../../utils/platform";

// Import both implementations
import { ShallowTabs as WebShallowTabs } from "./ShallowTabs.web";
import { ShallowTabs as NativeShallowTabs } from "./ShallowTabs.native";

// Export the platform-aware ShallowTabs component
export const ShallowTabs = createPlatformComponent(
  NativeShallowTabs,
  WebShallowTabs
);

// Re-export types
export type { ShallowTabsProps, ShallowTab } from "./types";
