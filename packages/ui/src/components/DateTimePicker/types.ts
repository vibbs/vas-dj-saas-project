import { Locale } from 'date-fns';

export type DateTimeMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps {
  // Core functionality
  mode?: DateTimeMode;
  range?: boolean;
  value?: Date | [Date, Date] | [Date, null] | null;
  onChange: (value: Date | [Date, Date] | [Date, null] | null) => void;
  
  // Display and behavior
  label?: string;
  helpText?: string;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Date constraints
  minDate?: Date;
  maxDate?: Date;
  
  // Time constraints (when mode includes time)
  minTime?: string; // Format: "HH:mm"
  maxTime?: string; // Format: "HH:mm"
  timeStep?: number; // Minutes, default 15
  
  // Display options with date-fns formats
  dateFormat?: string; // date-fns format string, default 'MM/dd/yyyy'
  timeFormat?: string; // date-fns format string, default 'HH:mm'
  showTimezone?: boolean; // Whether to show timezone selector
  timezone?: string; // IANA timezone string
  
  // Locale and i18n with date-fns
  locale?: Locale; // date-fns locale object
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  
  // UI behavior
  closeOnSelect?: boolean; // Auto-close after selection (single mode only)
  showClearButton?: boolean;
  showTodayButton?: boolean;
  
  // Platform-specific styling
  className?: string; // Web only
  style?: any; // React Native only
  
  // Event handlers
  onFocus?: () => void;
  onBlur?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  
  // Testing and accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface CalendarViewProps {
  value?: Date | [Date, Date] | [Date, null] | null;
  onChange: (value: Date | [Date, Date] | [Date, null]) => void;
  mode: DateTimeMode;
  range?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onMonthChange?: (date: Date) => void;
  showTodayButton?: boolean;
  className?: string;
  style?: any;
}

export interface TimeSelectorProps {
  value?: Date | null;
  onChange: (value: Date) => void;
  minTime?: string;
  maxTime?: string;
  timeStep?: number;
  timeFormat?: string;
  locale?: Locale;
  className?: string;
  style?: any;
}

export interface RangeHandlerProps {
  startDate?: Date;
  endDate?: Date;
  onRangeChange: (start: Date, end: Date) => void;
  mode: DateTimeMode;
  minDate?: Date;
  maxDate?: Date;
}

// Internal state types
export interface DateTimePickerState {
  isOpen: boolean;
  selectedDate?: Date;
  selectedRange?: [Date, Date];
  currentMonth: Date;
  currentView: 'calendar' | 'time' | 'year' | 'month';
  isSelectingStart: boolean; // For range selection
}

// Utility types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeValue {
  hour: number;
  minute: number;
}

// React Native DateTimePicker types
export interface NativeDateTimePickerEvent {
  type: 'set' | 'dismissed';
  nativeEvent: {
    timestamp?: number;
    utcOffset?: number;
  };
}

export type NativeDateTimePickerMode = 'date' | 'time' | 'datetime' | 'countdown';
export type NativeDateTimePickerDisplay = 'default' | 'spinner' | 'clock' | 'calendar';