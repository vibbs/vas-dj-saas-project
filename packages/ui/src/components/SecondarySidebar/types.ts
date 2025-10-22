/**
 * Secondary navigation item
 */
export interface SecondaryNavItem {
  id: string;
  label: string;
  icon?: string;
  href: string;
  badge?: string | number;
  order?: number;
  children?: SecondaryNavItem[];
}

/**
 * Secondary sidebar configuration
 */
export interface SecondarySidebarConfig {
  items: SecondaryNavItem[];
  showOverviewLink?: boolean;
  overviewLabel?: string;
  overviewHref?: string;
}

/**
 * SecondarySidebar component props
 */
export interface SecondarySidebarProps {
  /** Secondary sidebar configuration */
  config: SecondarySidebarConfig;

  /** Current active path */
  activePath?: string;

  /** Navigation handler */
  onNavigate?: (href: string) => void;

  /** Custom className for styling */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Test ID for testing */
  testID?: string;

  /** Filter function for items (permission/feature flag checks) */
  filterItem?: (item: SecondaryNavItem) => boolean;

  /** Responsive mode */
  mode?: 'sidebar' | 'horizontal' | 'dropdown';
}
