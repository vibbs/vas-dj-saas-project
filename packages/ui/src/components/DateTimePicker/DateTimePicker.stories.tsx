import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { enUS, fr, es, de, ja } from 'date-fns/locale';
import { DateTimePicker } from './DateTimePicker';
import { DateTimePickerProps, DateTimeMode } from './types';

// Mock React Native component for Storybook (since we can't import RN components in web)
const DateTimePickerNativeMock: React.FC<DateTimePickerProps> = (props) => {
  return (
    <div style={{
      padding: '20px',
      border: '2px dashed #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      textAlign: 'center',
      color: '#6b7280'
    }}>
      <div style={{ marginBottom: '12px', fontSize: '18px' }}>📱</div>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        React Native DateTimePicker
      </div>
      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
        Mode: {props.mode || 'date'} {props.range ? '(Range)' : ''}
      </div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        This would render the native date picker on mobile devices using<br />
        <code>@react-native-community/datetimepicker</code>
      </div>
      {props.value && (
        <div style={{ marginTop: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
          Current: {Array.isArray(props.value) ?
            `${props.value[0].toLocaleDateString()}${props.value[1] ? ` - ${props.value[1].toLocaleDateString()}` : ' (incomplete range)'}` :
            props.value.toLocaleDateString()
          }
        </div>
      )}
    </div>
  );
};

// Helper component to manage state in stories
const DateTimePickerWrapper = (props: Partial<DateTimePickerProps> & { platform?: 'web' | 'native' }) => {
  const [value, setValue] = useState<Date | [Date, Date] | [Date, null] | null>(props.value || null);
  const { platform = 'web', ...pickerProps } = props;

  const PickerComponent = platform === 'native' ? DateTimePickerNativeMock : DateTimePicker;

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          Platform: {platform === 'native' ? 'React Native' : 'Web'}
        </label>
      </div>

      <PickerComponent
        {...pickerProps}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          pickerProps.onChange?.(newValue);
        }}
      />

      {/* Debug info */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>Current Value:</strong><br />
        {value ? (
          Array.isArray(value) ?
            `[${value[0].toISOString()}, ${value[1] ? value[1].toISOString() : 'null'}]` :
            value.toISOString()
        ) : 'null'}
      </div>
    </div>
  );
};

const meta: Meta<typeof DateTimePicker> = {
  title: 'Form/DateTimePicker',
  component: DateTimePicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A flexible DateTimePicker component powered by **date-fns** for web and **@react-native-community/datetimepicker** for React Native:

## Features
- **Multiple Modes**: \`date\`, \`time\`, \`datetime\`  
- **Range Selection**: Single dates or date ranges
- **date-fns Integration**: Proper formatting, parsing, and localization
- **Cross-platform**: Native pickers on mobile, custom UI on web
- **Accessibility**: Full keyboard navigation and screen reader support
- **Customizable**: Formats, locales, constraints, and styling

## Usage Examples
\`\`\`tsx
// Basic date picker
<DateTimePicker mode="date" value={date} onChange={setDate} />

// Time picker with constraints  
<DateTimePicker 
  mode="time" 
  minTime="09:00" 
  maxTime="17:00" 
  timeStep={30}
/>

// Date range with custom format
<DateTimePicker 
  mode="date" 
  range 
  dateFormat="dd/MM/yyyy"
  locale={fr}
/>

// DateTime with timezone
<DateTimePicker 
  mode="datetime"
  dateFormat="PPP"
  timeFormat="pp"
  showTimezone
/>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['date', 'time', 'datetime'],
      description: 'The type of picker to display'
    },
    range: {
      control: { type: 'boolean' },
      description: 'Whether to allow range selection'
    },
    value: {
      control: false,
      description: 'Current value (Date for single, [Date, Date] for range)'
    },
    onChange: {
      control: false,
      description: 'Callback when value changes'
    },
    dateFormat: {
      control: { type: 'text' },
      description: 'date-fns format string for dates (e.g., "MM/dd/yyyy", "dd/MM/yyyy", "PPP")'
    },
    timeFormat: {
      control: { type: 'text' },
      description: 'date-fns format string for times (e.g., "HH:mm", "h:mm aa", "pp")'
    },
    locale: {
      control: { type: 'select' },
      options: [enUS, fr, es, de, ja],
      description: 'date-fns locale object for internationalization'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the picker is disabled'
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the picker is read-only'
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the picker is required'
    },
    minDate: {
      control: { type: 'date' },
      description: 'Minimum selectable date'
    },
    maxDate: {
      control: { type: 'date' },
      description: 'Maximum selectable date'
    },
    minTime: {
      control: { type: 'text' },
      description: 'Minimum time in HH:mm format'
    },
    maxTime: {
      control: { type: 'text' },
      description: 'Maximum time in HH:mm format'
    },
    timeStep: {
      control: { type: 'number', min: 1, max: 60 },
      description: 'Time step in minutes'
    },
    firstDayOfWeek: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'First day of week (0=Sunday, 1=Monday, etc.)'
    },
    closeOnSelect: {
      control: { type: 'boolean' },
      description: 'Whether to close picker after selection'
    },
    showClearButton: {
      control: { type: 'boolean' },
      description: 'Whether to show clear button'
    },
    showTodayButton: {
      control: { type: 'boolean' },
      description: 'Whether to show today button'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

// Basic Examples
export const DatePicker: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Select Date',
    placeholder: 'Pick a date...',
  },
};

export const TimePicker: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'time',
    label: 'Select Time',
    placeholder: 'Pick a time...',
    timeStep: 15,
  },
};

export const DateTimeCombined: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'datetime',
    label: 'Select Date & Time',
    placeholder: 'Pick date and time...',
    timeStep: 30,
  },
};

export const DateRangePicker: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    range: true,
    label: 'Select Date Range',
    placeholder: 'Pick date range...',
  },
};

export const DateTimeRangePicker: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'datetime',
    range: true,
    label: 'Select DateTime Range',
    placeholder: 'Pick datetime range...',
    timeStep: 60,
  },
};

// Formatting Examples
export const CustomFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>Custom Date and Time Formats</h3>

      <DateTimePickerWrapper
        mode="date"
        label="US Format (MM/dd/yyyy)"
        dateFormat="MM/dd/yyyy"
      />

      <DateTimePickerWrapper
        mode="date"
        label="European Format (dd/MM/yyyy)"
        dateFormat="dd/MM/yyyy"
      />

      <DateTimePickerWrapper
        mode="date"
        label="ISO Format (yyyy-MM-dd)"
        dateFormat="yyyy-MM-dd"
      />

      <DateTimePickerWrapper
        mode="time"
        label="12-hour Format"
        timeFormat="h:mm aa"
      />

      <DateTimePickerWrapper
        mode="datetime"
        label="Verbose Format"
        dateFormat="PPP"
        timeFormat="pp"
      />
    </div>
  ),
};

// Internationalization Examples
export const Internationalization: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>International Locales</h3>

      <DateTimePickerWrapper
        mode="date"
        label="English (US)"
        locale={enUS}
        dateFormat="PPP"
        firstDayOfWeek={0}
      />

      <DateTimePickerWrapper
        mode="date"
        label="French"
        locale={fr}
        dateFormat="PPP"
        firstDayOfWeek={1}
      />

      <DateTimePickerWrapper
        mode="date"
        label="Spanish"
        locale={es}
        dateFormat="PPP"
        firstDayOfWeek={1}
      />

      <DateTimePickerWrapper
        mode="date"
        label="German"
        locale={de}
        dateFormat="PPP"
        firstDayOfWeek={1}
      />

      <DateTimePickerWrapper
        mode="datetime"
        label="Japanese"
        locale={ja}
        dateFormat="PPP"
        timeFormat="pp"
        firstDayOfWeek={0}
      />
    </div>
  ),
};

// Constraint Examples
export const WithConstraints: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Constrained Date Picker',
    minDate: new Date(2024, 0, 1), // Jan 1, 2024
    maxDate: new Date(2024, 11, 31), // Dec 31, 2024
    helpText: 'Only dates in 2024 are allowed',
  },
};

export const BusinessHours: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'time',
    label: 'Business Hours Only',
    minTime: '09:00',
    maxTime: '17:00',
    timeStep: 30,
    helpText: 'Business hours: 9 AM to 5 PM',
    timeFormat: 'h:mm aa',
  },
};

// State Examples
export const WithError: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Date with Error',
    errorText: 'Please select a valid date',
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Disabled Date Picker',
    disabled: true,
    value: new Date(),
  },
};

export const ReadOnly: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'datetime',
    label: 'Read-only DateTime',
    readOnly: true,
    value: new Date(),
    dateFormat: 'PPP',
    timeFormat: 'pp',
  },
};

// Pre-filled Examples
export const PreFilled: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'datetime',
    label: 'Pre-filled DateTime',
    value: new Date(2024, 5, 15, 14, 30), // June 15, 2024 at 2:30 PM
    helpText: 'This picker has a pre-filled value',
    dateFormat: 'PPP',
    timeFormat: 'pp',
  },
};

export const PreFilledRange: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    range: true,
    label: 'Pre-filled Date Range',
    value: [
      new Date(2024, 5, 10), // June 10, 2024
      new Date(2024, 5, 20), // June 20, 2024
    ],
    helpText: 'This range picker has pre-filled dates',
    dateFormat: 'PPP',
  },
};

// Advanced Examples
export const CustomTimeSteps: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'time',
    label: 'Custom Time Steps (5 minutes)',
    timeStep: 5,
    helpText: 'Time can be selected in 5-minute intervals',
    timeFormat: 'HH:mm',
  },
};

export const YearSelection: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Date Picker with Year Selection',
    helpText: 'Click on the month/year header to select different years',
    dateFormat: 'PPP',
  },
};

export const MinimalInterface: Story = {
  render: (args) => <DateTimePickerWrapper {...args} />,
  args: {
    mode: 'date',
    label: 'Minimal Interface',
    showClearButton: false,
    showTodayButton: false,
    closeOnSelect: true,
    helpText: 'No clear or today buttons, closes on select',
  },
};

// Comprehensive Example
export const AllModes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>All DateTimePicker Modes</h3>

      <DateTimePickerWrapper
        mode="date"
        label="Date Only"
        dateFormat="PPP"
      />

      <DateTimePickerWrapper
        mode="time"
        label="Time Only"
        timeFormat="pp"
      />

      <DateTimePickerWrapper
        mode="datetime"
        label="Date & Time"
        dateFormat="PPP"
        timeFormat="pp"
      />

      <DateTimePickerWrapper
        mode="date"
        range
        label="Date Range"
        dateFormat="PPP"
      />

      <DateTimePickerWrapper
        mode="datetime"
        range
        label="DateTime Range"
        dateFormat="PPP"
        timeFormat="pp"
      />
    </div>
  ),
};

// Platform Comparison
export const PlatformComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px' }}>
      <h3>Platform Comparison</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <DateTimePickerWrapper
          platform="web"
          mode="date"
          label="Web DatePicker"
          dateFormat="PPP"
        />

        <DateTimePickerWrapper
          platform="native"
          mode="date"
          label="React Native DatePicker"
          dateFormat="PPP"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <DateTimePickerWrapper
          platform="web"
          mode="datetime"
          label="Web DateTime"
          dateFormat="PPP"
          timeFormat="pp"
        />

        <DateTimePickerWrapper
          platform="native"
          mode="datetime"
          label="React Native DateTime"
          dateFormat="PPP"
          timeFormat="pp"
        />
      </div>
    </div>
  ),
};

// React Native Showcase
export const ReactNativeShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h3>React Native DateTimePicker Components</h3>

      <DateTimePickerWrapper
        platform="native"
        mode="date"
        label="Native Date Picker"
        dateFormat="PPP"
      />

      <DateTimePickerWrapper
        platform="native"
        mode="time"
        label="Native Time Picker"
        timeFormat="pp"
      />

      <DateTimePickerWrapper
        platform="native"
        mode="datetime"
        label="Native DateTime Picker"
        dateFormat="PPP"
        timeFormat="pp"
      />

      <DateTimePickerWrapper
        platform="native"
        mode="date"
        range
        label="Native Date Range"
        dateFormat="PPP"
      />
    </div>
  ),
};

// Real-world Form Example
export const FormIntegration: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [meetingTime, setMeetingTime] = useState<Date | null>(null);

    return (
      <div style={{ padding: '20px', maxWidth: '500px' }}>
        <h3>Event Planning Form</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DateTimePicker
            mode="date"
            label="Event Start Date"
            value={startDate}
            onChange={(value) => setStartDate(value as Date)}
            required
            minDate={new Date()}
            dateFormat="PPP"
          />

          <DateTimePicker
            mode="date"
            label="Event End Date"
            value={endDate}
            onChange={(value) => setEndDate(value as Date)}
            required
            minDate={startDate || new Date()}
            dateFormat="PPP"
          />

          <DateTimePicker
            mode="time"
            label="Meeting Time"
            value={meetingTime}
            onChange={(value) => setMeetingTime(value as Date)}
            timeStep={15}
            minTime="08:00"
            maxTime="18:00"
            timeFormat="h:mm aa"
            helpText="Business hours only"
          />

          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Selected Values:</strong><br />
            Start: {startDate ? startDate.toLocaleDateString() : 'Not selected'}<br />
            End: {endDate ? endDate.toLocaleDateString() : 'Not selected'}<br />
            Time: {meetingTime ? meetingTime.toLocaleTimeString() : 'Not selected'}
          </div>
        </form>
      </div>
    );
  },
};