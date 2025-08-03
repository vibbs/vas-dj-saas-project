export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  onHeaderPress?: () => void;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRowPress?: (record: T, index: number) => void;
  onRowLongPress?: (record: T, index: number) => void;
  rowKey?: string | ((record: T) => string);
  maxHeight?: number | string;
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // Cross-platform style object
  headerStyle?: any;    // Style for header
  rowStyle?: any;       // Style for rows
  cellStyle?: any;      // Style for cells
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  'aria-label'?: string;               // Web: Accessible name
  'aria-describedby'?: string;         // Web: References describing elements
  'aria-rowcount'?: number;            // Web: Total number of rows
  'aria-colcount'?: number;            // Web: Total number of columns
  role?: string;                       // Web: Element role
  accessibilityRole?: 'table' | 'list'; // React Native: Element role
  accessibilityLabel?: string;         // React Native: Accessible name
  accessibilityHint?: string;          // React Native: Additional context
}