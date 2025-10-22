import React from "react";
import type { TabRouterPort } from "../../adapters/router-port";

export interface ShallowTab {
  /** Unique identifier for the tab - used in URL query (?tab=value) */
  value: string;
  /** Label displayed in the tab trigger */
  label: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Content component to render when tab is active */
  component: React.ReactNode;
  /** Optional badge content (e.g., count) */
  badge?: string | number;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface ShallowTabsProps {
  /** Array of tab configurations */
  tabs: ShallowTab[];
  /** Router adapter implementing TabRouterPort (e.g., useNextTabRouter, useReactNavTabRouter) */
  router: TabRouterPort;
  /** Optional default tab value (if not in URL) */
  defaultTab?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional custom styling */
  style?: React.CSSProperties;
  /** Optional test ID */
  testID?: string;
  /** Callback when tab changes */
  onTabChange?: (value: string) => void;
}
