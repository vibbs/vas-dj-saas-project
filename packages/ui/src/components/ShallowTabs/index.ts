export * from "./types";

// Platform-aware export
import { ShallowTabs as WebShallowTabs } from "./ShallowTabs.web";
import { ShallowTabs as NativeShallowTabs } from "./ShallowTabs.native";
import { createPlatformComponent } from "../../utils/platform";

// Export platform-aware component
export const ShallowTabs = createPlatformComponent(
  NativeShallowTabs,
  WebShallowTabs
);
