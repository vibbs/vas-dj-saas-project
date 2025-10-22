import type { HubCardProps } from '../HubCard/types';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  order?: number;
}

export interface SummaryMetric {
  label: string;
  value: string | number;
  icon?: string;
}

export interface HubConfig {
  title: string;
  description?: string;
  cards: HubCardProps[];
  quickActions?: QuickAction[];
  summaryMetrics?: SummaryMetric[];
}

/**
 * SettingsHub component props
 */
export interface SettingsHubProps {
  /** Hub configuration from navigation config */
  config: HubConfig;

  /** Custom navigation handler (overrides href-based navigation) */
  onNavigate?: (href: string) => void;

  /** Custom className for styling */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Test ID for testing */
  testID?: string;

  /** Loading state for cards */
  isLoading?: boolean;

  /** Filter function for cards (for permission/feature flag checks) */
  filterCard?: (card: HubCardProps) => boolean;

  /** Filter function for quick actions */
  filterAction?: (action: QuickAction) => boolean;
}
