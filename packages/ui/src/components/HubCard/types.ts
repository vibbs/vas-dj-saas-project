/**
 * HubCard component props
 */
export interface HubCardProps {
  /** Unique identifier */
  id: string;

  /** Card title */
  title: string;

  /** Card description */
  description?: string;

  /** Icon name */
  icon: string;

  /** Navigation path when card is clicked */
  href: string;

  /** Metric value (e.g., "12 members", "5 roles") */
  metric?: string | number;

  /** Metric label (e.g., "Active", "Total") */
  metricLabel?: string;

  /** Badge text/count */
  badge?: string | number;

  /** Badge variant */
  badgeVariant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning";

  /** Click handler */
  onPress?: () => void;

  /** Custom className for styling */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Test ID for testing */
  testID?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Disabled state */
  isDisabled?: boolean;

  /** Order/priority */
  order?: number;
}
