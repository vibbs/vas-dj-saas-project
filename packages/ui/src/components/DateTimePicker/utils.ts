import { 
  format, 
  parse, 
  isValid, 
  isSameDay as dateFnsIsSameDay,
  isWithinInterval,
  addMinutes,
  subMinutes,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  Locale
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { DateTimeMode, DateRange } from './types';

// Date comparison utilities
export function isSameDay(date1: Date, date2: Date): boolean {
  return dateFnsIsSameDay(date1, date2);
}

export function isSameTime(date1: Date, date2: Date): boolean {
  return (
    getHours(date1) === getHours(date2) &&
    getMinutes(date1) === getMinutes(date2)
  );
}

export function isSameDateTime(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2) && isSameTime(date1, date2);
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

// Range utilities
export function createDateRange(start: Date, end: Date): DateRange {
  // Ensure start is before end
  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function validateDateRange(
  range: [Date, Date],
  minDate?: Date,
  maxDate?: Date
): { isValid: boolean; error?: string } {
  const [start, end] = range;
  
  if (start.getTime() > end.getTime()) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  
  if (minDate && start.getTime() < minDate.getTime()) {
    return { isValid: false, error: 'Start date is before minimum allowed date' };
  }
  
  if (maxDate && end.getTime() > maxDate.getTime()) {
    return { isValid: false, error: 'End date is after maximum allowed date' };
  }
  
  return { isValid: true };
}

// Date formatting with date-fns
export function formatDateForDisplay(
  date: Date,
  mode: DateTimeMode,
  dateFormat?: string,
  timeFormat?: string,
  locale?: Locale
): string {
  const currentLocale = locale || enUS;
  
  try {
    switch (mode) {
      case 'date':
        return format(date, dateFormat || 'MM/dd/yyyy', { locale: currentLocale });
      case 'time':
        return format(date, timeFormat || 'HH:mm', { locale: currentLocale });
      case 'datetime':
        const datePart = format(date, dateFormat || 'MM/dd/yyyy', { locale: currentLocale });
        const timePart = format(date, timeFormat || 'HH:mm', { locale: currentLocale });
        return `${datePart} ${timePart}`;
      default:
        return format(date, 'MM/dd/yyyy HH:mm', { locale: currentLocale });
    }
  } catch (error) {
    console.warn('Date formatting error:', error);
    return date.toLocaleString();
  }
}

// Date parsing with date-fns
export function parseDateFromInput(
  input: string,
  mode: DateTimeMode,
  dateFormat?: string,
  timeFormat?: string,
  locale?: Locale
): Date | null {
  if (!input.trim()) return null;
  
  const currentLocale = locale || enUS;
  
  try {
    let formatString: string;
    let referenceDate = new Date();
    
    switch (mode) {
      case 'date':
        formatString = dateFormat || 'MM/dd/yyyy';
        break;
      case 'time':
        formatString = timeFormat || 'HH:mm';
        // For time-only parsing, use today as reference
        referenceDate = startOfDay(new Date());
        break;
      case 'datetime':
        formatString = `${dateFormat || 'MM/dd/yyyy'} ${timeFormat || 'HH:mm'}`;
        break;
      default:
        // Fallback to native Date parsing
        const parsed = new Date(input);
        return isValid(parsed) ? parsed : null;
    }
    
    const parsed = parse(input, formatString, referenceDate, { locale: currentLocale });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Date parsing error:', error);
    // Fallback to native Date parsing
    try {
      const fallback = new Date(input);
      return isValid(fallback) ? fallback : null;
    } catch {
      return null;
    }
  }
}

// DateTime combination utilities
export function combineDateTime(date: Date, time: Date): Date {
  return setMinutes(
    setHours(date, getHours(time)),
    getMinutes(time)
  );
}

export function extractTime(date: Date): Date {
  const time = new Date();
  return setMinutes(setHours(time, getHours(date)), getMinutes(date));
}

export function extractDate(date: Date): Date {
  return startOfDay(date);
}

// Time validation utilities
export function isTimeWithinRange(
  time: Date,
  minTime?: string,
  maxTime?: string
): boolean {
  if (!minTime && !maxTime) return true;
  
  const timeString = format(time, 'HH:mm');
  
  if (minTime && timeString < minTime) return false;
  if (maxTime && timeString > maxTime) return false;
  
  return true;
}

export function getNextValidTime(
  currentTime: Date,
  timeStep: number,
  minTime?: string,
  maxTime?: string
): Date {
  const nextTime = addMinutes(currentTime, timeStep);
  
  if (isTimeWithinRange(nextTime, minTime, maxTime)) {
    return nextTime;
  }
  
  // If next time is out of range, find the nearest valid time
  if (minTime) {
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const minTimeDate = setMinutes(setHours(currentTime, minHour), minMinute);
    
    if (nextTime.getTime() < minTimeDate.getTime()) {
      return minTimeDate;
    }
  }
  
  if (maxTime) {
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);
    const maxTimeDate = setMinutes(setHours(currentTime, maxHour), maxMinute);
    
    if (nextTime.getTime() > maxTimeDate.getTime()) {
      return maxTimeDate;
    }
  }
  
  return nextTime;
}

export function getPreviousValidTime(
  currentTime: Date,
  timeStep: number,
  minTime?: string,
  maxTime?: string
): Date {
  const prevTime = subMinutes(currentTime, timeStep);
  
  if (isTimeWithinRange(prevTime, minTime, maxTime)) {
    return prevTime;
  }
  
  // If previous time is out of range, find the nearest valid time
  if (maxTime) {
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);
    const maxTimeDate = setMinutes(setHours(currentTime, maxHour), maxMinute);
    
    if (prevTime.getTime() > maxTimeDate.getTime()) {
      return maxTimeDate;
    }
  }
  
  if (minTime) {
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const minTimeDate = setMinutes(setHours(currentTime, minHour), minMinute);
    
    if (prevTime.getTime() < minTimeDate.getTime()) {
      return minTimeDate;
    }
  }
  
  return prevTime;
}

// Time options generation
export function generateTimeOptions(
  timeStep: number = 15,
  minTime?: string,
  maxTime?: string,
  timeFormat: string = 'HH:mm',
  locale?: Locale
): Array<{ value: string; label: string; hour: number; minute: number }> {
  const options = [];
  const currentLocale = locale || enUS;
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += timeStep) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (minTime && timeString < minTime) continue;
      if (maxTime && timeString > maxTime) continue;
      
      const timeDate = setMinutes(setHours(new Date(), hour), minute);
      const label = format(timeDate, timeFormat, { locale: currentLocale });
      
      options.push({
        value: timeString,
        label,
        hour,
        minute,
      });
    }
  }
  
  return options;
}

// Time rounding utility
export function roundTimeToStep(date: Date, timeStep: number): Date {
  const minutes = getMinutes(date);
  const roundedMinutes = Math.round(minutes / timeStep) * timeStep;
  
  if (roundedMinutes >= 60) {
    return setMinutes(addDays(setHours(date, getHours(date) + 1), 0), 0);
  } else {
    return setMinutes(date, roundedMinutes);
  }
}

// Calendar utilities with date-fns
export function generateCalendarDays(
  currentMonth: Date,
  firstDayOfWeek: number = 0,
  locale?: Locale
): Date[] {
  const currentLocale = locale || enUS;
  
  // Get the start and end of the month
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // Get the start and end of the calendar view (6 weeks)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6, locale: currentLocale });
  const calendarEnd = endOfWeek(addDays(calendarStart, 41), { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6, locale: currentLocale });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

// Month navigation utilities
export function navigateMonth(currentMonth: Date, direction: 'prev' | 'next'): Date {
  const newMonth = new Date(currentMonth);
  newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
  return newMonth;
}

// Validation utilities
export function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean {
  if (minDate && date < startOfDay(minDate)) return true;
  if (maxDate && date > endOfDay(maxDate)) return true;
  return false;
}

// Format utilities for display
export function getMonthYearLabel(date: Date, locale?: Locale): string {
  const currentLocale = locale || enUS;
  return format(date, 'MMMM yyyy', { locale: currentLocale });
}

export function getDayNames(firstDayOfWeek: number = 0, locale?: Locale): string[] {
  const currentLocale = locale || enUS;
  const days = [];
  const startDate = startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6, locale: currentLocale });
  
  for (let i = 0; i < 7; i++) {
    days.push(format(addDays(startDate, i), 'EEEEEE', { locale: currentLocale }));
  }
  
  return days;
}