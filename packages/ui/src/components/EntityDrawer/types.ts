import React from "react";
import type { TabRouterPort } from "../../adapters/router-port";

export type DrawerSide = "right" | "left" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface EntityDrawerProps {
  /** Content to display in the drawer */
  children?: React.ReactNode;
  /** Title for the drawer header */
  title?: string;
  /** Optional description/subtitle */
  description?: string;
  /** Router adapter implementing TabRouterPort (e.g., useNextTabRouter, useReactNavTabRouter) */
  router: TabRouterPort;
  /** Optional query param name (defaults to "selected") */
  queryParam?: string;
  /** Side from which drawer slides in */
  side?: DrawerSide;
  /** Size of the drawer */
  size?: DrawerSize;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Optional custom styling */
  style?: React.CSSProperties;
  /** Optional test ID */
  testID?: string;
  /** Callback when drawer opens */
  onOpen?: (selectedId: string) => void;
  /** Callback when drawer closes */
  onClose?: () => void;
  /** Optional header actions (e.g., edit, delete buttons) */
  headerActions?: React.ReactNode;
}
