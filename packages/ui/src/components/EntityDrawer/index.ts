export * from "./types";

// Platform-aware export
import { EntityDrawer as WebEntityDrawer } from "./EntityDrawer.web";
import { EntityDrawer as NativeEntityDrawer } from "./EntityDrawer.native";
import { createPlatformComponent } from "../../utils/platform";

// Export platform-aware component
export const EntityDrawer = createPlatformComponent(
  NativeEntityDrawer,
  WebEntityDrawer
);
