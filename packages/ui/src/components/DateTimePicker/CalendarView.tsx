import React, { useState, useMemo } from 'react';
import { CalendarViewProps } from './types';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Select } from '../Select';
import { 
  generateCalendarDays, 
  navigateMonth, 
  isDateDisabled, 
  isSameDay, 
  isDateInRange, 
  getMonthYearLabel, 
  getDayNames 
} from './utils';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  value,
  onChange,
  range = false,
  minDate,
  maxDate,
  locale,
  firstDayOfWeek = 0,
  onMonthChange,
  showTodayButton = true,
  className,
  style,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return Array.isArray(value) ? value[0] : value;
    }
    return new Date();
  });

  const [showYearMonthSelect, setShowYearMonthSelect] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');

  const today = useMemo(() => new Date(), []);

  // Generate year options (±10 years from current year or selected year)
  const yearOptions = useMemo(() => {
    const currentYear = currentMonth.getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        value: year.toString(),
        label: year.toString(),
      });
    }
    return years;
  }, [currentMonth]);

  // Generate month data for grid
  const monthsData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return months.map((month, index) => ({
      index,
      label: month,
      fullName: new Date(2000, index, 1).toLocaleDateString(locale?.code, { month: 'long' }),
    }));
  }, [locale]);

  // Generate calendar days using date-fns
  const calendarDays = useMemo(() => {
    const days = generateCalendarDays(currentMonth, firstDayOfWeek, locale);
    
    return days.map((date): CalendarDay => {
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isToday = isSameDay(date, today);
      
      let isSelected = false;
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      
      if (value) {
        if (Array.isArray(value)) {
          // Range selection
          const [start, end] = value;
          
          if (start && end && !isSameDay(start, end)) {
            // Complete range with different dates
            isRangeStart = isSameDay(date, start);
            isRangeEnd = isSameDay(date, end);
            isSelected = isRangeStart || isRangeEnd;
            // Only set isInRange for dates between start and end (not including start/end)
            isInRange = !isRangeStart && !isRangeEnd && isDateInRange(date, start, end);
          } else if (start && !end) {
            // Only start date selected (incomplete range)
            isSelected = isSameDay(date, start);
            isRangeStart = isSelected;
            // For incomplete range, don't highlight any range
            isInRange = false;
          } else if (start && end && isSameDay(start, end)) {
            // Both dates are the same (single point in range)
            isSelected = isSameDay(date, start);
            isRangeStart = true;
            isRangeEnd = true;
            isInRange = false;
          }
        } else if (value && !Array.isArray(value)) {
          // Single date selection
          isSelected = isSameDay(date, value);
        }
      }
      
      const isDisabled = isDateDisabled(date, minDate, maxDate);
      
      return {
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isDisabled,
      };
    });
  }, [currentMonth, value, minDate, maxDate, firstDayOfWeek, today, locale]);

  const handleDayClick = (day: CalendarDay) => {
    if (day.isDisabled) return;
    
    if (range) {
      if (!value || !Array.isArray(value)) {
        // Start new range - set only start date, leave end as null
        onChange([day.date, null]);
      } else {
        const [start, end] = value;
        if (!end) {
          // We have only a start date - set end date
          if (day.date >= start) {
            onChange([start, day.date]);
          } else {
            onChange([day.date, start]);
          }
        } else {
          // We have a complete range - start new range
          onChange([day.date, null]);
        }
      }
    } else {
      // Single date selection
      onChange(day.date);
    }
  };

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = navigateMonth(currentMonth, direction);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(today);
    onMonthChange?.(today);
    if (!range) {
      onChange(today);
    } else {
      // For range mode, select today as start of new range
      onChange([today, null]);
    }
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate);
    setViewMode('month'); // Go back to month selection
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
    onMonthChange?.(newDate);
    setViewMode('calendar'); // Go back to calendar
  };

  const toggleYearMonthSelect = () => {
    if (viewMode === 'calendar') {
      setViewMode('month');
    } else {
      setViewMode('calendar');
    }
  };

  const showYearGrid = () => {
    setViewMode('year');
  };

  const monthYearLabel = getMonthYearLabel(currentMonth, locale);
  const dayNames = getDayNames(firstDayOfWeek, locale);

  return (
    <div className={`calendar-view ${className || ''}`} style={style}>
      {/* Header */}
      <div className="calendar-header">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => handleNavigateMonth('prev')}
          onClick={() => handleNavigateMonth('prev')}
          aria-label="Previous month"
        >
          <Icon name="ChevronLeft" size="sm" />
        </Button>
        
        <div className="month-year">
          {viewMode === 'year' ? (
            <button 
              className="month-year-button"
              onClick={() => setViewMode('month')}
              type="button"
              aria-label="Back to month selection"
            >
              <Icon name="ChevronLeft" size="sm" />
              {currentMonth.getFullYear()}
            </button>
          ) : viewMode === 'month' ? (
            <button 
              className="month-year-button"
              onClick={showYearGrid}
              type="button"
              aria-label="Select year"
            >
              {currentMonth.getFullYear()}
              <Icon name="ChevronDown" size="sm" />
            </button>
          ) : (
            <button 
              className="month-year-button"
              onClick={toggleYearMonthSelect}
              type="button"
              aria-label="Select month and year"
            >
              {monthYearLabel}
              <Icon name="ChevronDown" size="sm" />
            </button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onPress={() => handleNavigateMonth('next')}
          onClick={() => handleNavigateMonth('next')}
          aria-label="Next month"
        >
          <Icon name="ChevronRight" size="sm" />
        </Button>
      </div>

      {/* Conditional content based on view mode */}
      {viewMode === 'year' ? (
        /* Year Grid */
        <div className="year-grid">
          {yearOptions.map(year => {
            const yearNumber = parseInt(year.value, 10);
            const isCurrentYear = yearNumber === new Date().getFullYear();
            const isSelectedYear = yearNumber === currentMonth.getFullYear();
            
            return (
              <button
                key={year.value}
                className={`year-item ${isCurrentYear ? 'current-year' : ''} ${isSelectedYear ? 'selected-year' : ''}`}
                onClick={() => handleYearSelect(yearNumber)}
                type="button"
                aria-label={`Select year ${year.label}`}
              >
                {year.label}
              </button>
            );
          })}
        </div>
      ) : viewMode === 'month' ? (
        /* Month Grid */
        <div className="month-grid">
          {monthsData.map(month => {
            const isCurrentMonth = month.index === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
            const isSelectedMonth = month.index === currentMonth.getMonth();
            
            return (
              <button
                key={month.index}
                className={`month-item ${isCurrentMonth ? 'current-month' : ''} ${isSelectedMonth ? 'selected-month' : ''}`}
                onClick={() => handleMonthSelect(month.index)}
                type="button"
                aria-label={`Select ${month.fullName}`}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <>
          {/* Day names */}
          <div className="day-names">
            {dayNames.map((day, index) => (
              <div key={index} className="day-name">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {calendarDays.map((day, index) => {
              const dayClasses = [
                'calendar-day',
                day.isCurrentMonth ? 'current-month' : 'other-month',
                day.isToday ? 'today' : '',
                day.isSelected ? 'selected' : '',
                day.isInRange ? 'in-range' : '',
                day.isRangeStart ? 'range-start' : '',
                day.isRangeEnd ? 'range-end' : '',
                day.isDisabled ? 'disabled' : ''
              ].filter(Boolean).join(' ');

              const ariaLabel = [
                day.date.toLocaleDateString(locale?.code, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                day.isSelected ? '(selected)' : '',
                day.isToday ? '(today)' : '',
                day.isDisabled ? '(disabled)' : ''
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={index}
                  className={dayClasses}
                  onClick={day.isDisabled ? undefined : () => handleDayClick(day)}
                  role="button"
                  tabIndex={day.isDisabled ? -1 : 0}
                  aria-label={ariaLabel}
                  aria-disabled={day.isDisabled}
                  aria-selected={day.isSelected}
                  onKeyDown={(e) => {
                    if (!day.isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleDayClick(day);
                    }
                  }}
                >
                  {day.date.getDate()}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      {showTodayButton && (
        <div className="calendar-footer">
          <Button
            variant="ghost"
            size="sm"
            onPress={goToToday}
            onClick={goToToday}
          >
            Today
          </Button>
        </div>
      )}
    </div>
  );
};