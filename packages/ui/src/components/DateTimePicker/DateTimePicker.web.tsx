import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DateTimePickerProps } from './types';
import { CalendarView } from './CalendarView';
import { TimeSelector } from './TimeSelector';
import { Input } from '../Input';
import { Button } from '../Button';
import { Icon } from '../Icon';
import {
  formatDateForDisplay,
  parseDateFromInput,
  combineDateTime,
  validateDateRange,
  roundTimeToStep
} from './utils';
import './DateTimePicker.css';

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  mode = 'date',
  range = false,
  value,
  onChange,
  label,
  helpText,
  errorText,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  minDate,
  maxDate,
  minTime,
  maxTime,
  timeStep = 15,
  dateFormat,
  timeFormat,
  showTimezone = false,
  timezone,
  locale,
  firstDayOfWeek = 0,
  closeOnSelect = true,
  showClearButton = true,
  showTodayButton = true,
  className,
  onFocus,
  onBlur,
  onOpen,
  onClose,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...ariaProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentView, setCurrentView] = useState<'calendar' | 'time'>('calendar');
  const [tempValue, setTempValue] = useState<Date | [Date, Date] | [Date, null] | null>(value || null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Update input value when prop value changes using date-fns formatting
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        const [start, end] = value;
        const startStr = formatDateForDisplay(start, mode, dateFormat, timeFormat, locale);
        if (end) {
          const endStr = formatDateForDisplay(end, mode, dateFormat, timeFormat, locale);
          setInputValue(`${startStr} - ${endStr}`);
        } else {
          setInputValue(startStr);
        }
      } else {
        setInputValue(formatDateForDisplay(value, mode, dateFormat, timeFormat, locale));
      }
    } else {
      setInputValue('');
    }
    setTempValue(value || null);
  }, [value, mode, dateFormat, timeFormat, locale]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handlePopoverClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        handlePopoverClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleInputChange = (text: string) => {
    setInputValue(text);

    if (!text.trim()) {
      onChange(null);
      return;
    }

    // Try to parse the input using date-fns
    if (range) {
      const parts = text.split(' - ');
      if (parts.length === 2) {
        const start = parseDateFromInput(parts[0], mode, dateFormat, timeFormat, locale);
        const end = parseDateFromInput(parts[1], mode, dateFormat, timeFormat, locale);

        if (start && end) {
          const validation = validateDateRange([start, end], minDate, maxDate);
          if (validation.isValid) {
            onChange([start, end]);
          }
        }
      }
    } else {
      const parsed = parseDateFromInput(text, mode, dateFormat, timeFormat, locale);
      if (parsed) {
        onChange(parsed);
      }
    }
  };

  const handleInputClick = () => {
    if (!disabled && !readOnly) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        onFocus?.();
        onOpen?.();
      }
    }
  };

  const handleInputBlur = () => {
    onBlur?.();
  };

  const handlePopoverClose = () => {
    setIsOpen(false);
    setTempValue(value || null);
    setCurrentView('calendar');
    onClose?.();
  };

  const handleDateChange = useCallback((newValue: Date | [Date, Date] | [Date, null]) => {
    setTempValue(newValue);

    if (mode === 'date') {
      // For range mode, don't commit immediately - wait for Apply button
      if (range) {
        // Just update temp value, don't close or commit
        return;
      }
      
      // For single date mode, commit immediately
      onChange(newValue);
      if (closeOnSelect) {
        handlePopoverClose();
      }
    } else if (mode === 'datetime') {
      // For datetime mode, update the date part but keep existing time or set default
      if (Array.isArray(newValue)) {
        const [start, end] = newValue;
        const startWithTime = value && Array.isArray(value) && value[0] ?
          combineDateTime(start, value[0]) : start;
        const endWithTime = end && value && Array.isArray(value) && value[1] ?
          combineDateTime(end, value[1]) : end;
        setTempValue([startWithTime, endWithTime]);
      } else {
        const withTime = value && !Array.isArray(value) ?
          combineDateTime(newValue, value) : newValue;
        setTempValue(withTime);
      }
    }
  }, [mode, value, onChange, closeOnSelect, range]);

  // Check if we're in a partial range selection state
  const isPartialRange = range && tempValue && Array.isArray(tempValue) && tempValue[0] && !tempValue[1];

  const handleTimeChange = useCallback((newTime: Date) => {
    if (mode === 'time') {
      // For time-only mode, update the time directly
      setTempValue(newTime);
    } else if (tempValue) {
      // For datetime mode, combine the time with existing date
      if (Array.isArray(tempValue)) {
        // For range mode, apply time to both dates (or just start date)
        const [start, end] = tempValue;
        const startWithTime = combineDateTime(start, newTime);
        const endWithTime = end ? combineDateTime(end, newTime) : null;
        setTempValue([startWithTime, endWithTime]);
      } else {
        const withTime = combineDateTime(tempValue, newTime);
        setTempValue(withTime);
      }
    }
  }, [mode, tempValue]);

  const handleApply = () => {
    if (tempValue) {
      onChange(tempValue);
    }
    handlePopoverClose();
  };

  const handleClear = () => {
    onChange(null);
    setInputValue('');
    handlePopoverClose();
  };

  const handleToday = () => {
    const today = new Date();

    if (mode === 'time') {
      const roundedTime = roundTimeToStep(today, timeStep);
      onChange(roundedTime);
    } else if (range) {
      if (!value || !Array.isArray(value) || !value[1]) {
        // If we don't have a complete range, start new range with today
        onChange([today, null]);
      } else {
        // If we have a complete range, replace with today-today
        onChange([today, today]);
      }
    } else {
      onChange(today);
    }

    if (closeOnSelect && mode === 'date' && !range) {
      handlePopoverClose();
    }
  };

  const getModalContent = () => {
    if (mode === 'time') {
      return (
        <TimeSelector
          value={(tempValue as Date) || new Date()}
          onChange={handleTimeChange}
          minTime={minTime}
          maxTime={maxTime}
          timeStep={timeStep}
          timeFormat={timeFormat}
          locale={locale}
        />
      );
    }

    if (mode === 'datetime') {
      return (
        <div className="datetime-picker-content">
          <div className="datetime-tabs">
            <Button
              variant={currentView === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('calendar')}
            >
              <Icon name="Calendar" size="sm" />
              Date
            </Button>
            <Button
              variant={currentView === 'time' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('time')}
            >
              <Icon name="Clock" size="sm" />
              Time
            </Button>
          </div>

          {currentView === 'calendar' ? (
            <CalendarView
              value={tempValue}
              onChange={handleDateChange}
              mode={mode}
              range={range}
              minDate={minDate}
              maxDate={maxDate}
              locale={locale}
              firstDayOfWeek={firstDayOfWeek}
              showTodayButton={showTodayButton}
            />
          ) : (
            <TimeSelector
              value={(Array.isArray(tempValue) ? (tempValue[0] || new Date()) : tempValue) || new Date()}
              onChange={handleTimeChange}
              minTime={minTime}
              maxTime={maxTime}
              timeStep={timeStep}
              timeFormat={timeFormat}
              locale={locale}
            />
          )}
        </div>
      );
    }

    // Default to calendar view for date mode
    return (
      <CalendarView
        value={tempValue}
        onChange={handleDateChange}
        mode={mode}
        range={range}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
        firstDayOfWeek={firstDayOfWeek}
        showTodayButton={showTodayButton}
      />
    );
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    // Use date-fns format as placeholder hint
    switch (mode) {
      case 'date':
        return range ? `${dateFormat || 'MM/dd/yyyy'} - ${dateFormat || 'MM/dd/yyyy'}` : dateFormat || 'MM/dd/yyyy';
      case 'time':
        return timeFormat || 'HH:mm';
      case 'datetime':
        const datePattern = dateFormat || 'MM/dd/yyyy';
        const timePattern = timeFormat || 'HH:mm';
        return range ? `${datePattern} ${timePattern} - ${datePattern} ${timePattern}` : `${datePattern} ${timePattern}`;
      default:
        return 'Select';
    }
  };

  return (
    <div className={`datetime-picker ${className || ''}`} data-testid={testID} ref={containerRef}>
      <div ref={inputRef} onClick={handleInputClick}>
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={getPlaceholder()}
          label={label}
          helpText={helpText}
          errorText={errorText}
          disabled={disabled}
          readOnly={true}
          required={required}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          {...ariaProps}
        />
      </div>

      {isOpen && (
        <div
          className="datetime-picker-popover"
          ref={popoverRef}
          role="dialog"
          aria-label={range ? `Select ${mode} range` : `Select ${mode}`}
        >
          {/* Selection Summary for Range Mode */}
          {range && (
            <div className="datetime-picker-selection-summary">
              <div className="selection-header">
                <Icon name="Calendar" size="sm" />
                <span>Selected Range</span>
              </div>
              <div className="selection-display">
                <div className="selection-item">
                  <span className="selection-label">Start Date:</span>
                  <span className="selection-value">
                    {tempValue && Array.isArray(tempValue) && tempValue[0]
                      ? formatDateForDisplay(tempValue[0], mode, dateFormat, timeFormat, locale)
                      : 'Not selected'}
                  </span>
                </div>
                <div className="selection-item">
                  <span className="selection-label">End Date:</span>
                  <span className="selection-value">
                    {tempValue && Array.isArray(tempValue) && tempValue[1]
                      ? formatDateForDisplay(tempValue[1], mode, dateFormat, timeFormat, locale)
                      : 'Not selected'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="datetime-picker-content">
            {getModalContent()}
          </div>

          <div className="datetime-picker-actions">
            <div className="datetime-picker-action-group">
              {showClearButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}

              {showTodayButton && mode !== 'time' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                >
                  Today
                </Button>
              )}
            </div>

            {/* Show Apply button for range selection or datetime/time modes */}
            {(mode === 'datetime' || mode === 'time' || range) && (
              <div className="datetime-picker-primary-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePopoverClose}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  disabled={range && (!tempValue || (Array.isArray(tempValue) && !tempValue[0]))}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
