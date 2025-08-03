import React from 'react';
import { TimeSelectorProps } from './types';
import { Icon } from '../Icon';

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  timeStep = 15,
  timeFormat = 'HH:mm',
  locale,
  className,
  style,
}) => {
  // Spinner-style time selector inspired by native mobile time pickers
  const is12HourFormat = timeFormat?.includes('a') || timeFormat?.includes('A') || timeFormat?.includes('h');
  
  // Ensure we have a default value for initial display
  const currentValue = value || new Date();
  const spinnerHour12 = currentValue.getHours() % 12 || 12;
  const spinnerHour24 = currentValue.getHours();
  const spinnerMinute = currentValue.getMinutes();
  const spinnerSecond = currentValue.getSeconds();
  const isAM = spinnerHour24 < 12;


  const handleSpinnerHourChange = (direction: 'up' | 'down') => {
    const baseDate = value || new Date();
    const currentHour = baseDate.getHours();
    let newHour: number;
    
    if (is12HourFormat) {
      const hour12 = currentHour % 12 || 12;
      if (direction === 'up') {
        newHour = hour12 === 12 ? 1 : hour12 + 1;
      } else {
        newHour = hour12 === 1 ? 12 : hour12 - 1;
      }
      // Convert back to 24-hour format
      if (isAM) {
        newHour = newHour === 12 ? 0 : newHour;
      } else {
        newHour = newHour === 12 ? 12 : newHour + 12;
      }
    } else {
      if (direction === 'up') {
        newHour = currentHour === 23 ? 0 : currentHour + 1;
      } else {
        newHour = currentHour === 0 ? 23 : currentHour - 1;
      }
    }
    
    const newDate = new Date(baseDate);
    newDate.setHours(newHour);
    onChange(newDate);
  };

  const handleSpinnerMinuteChange = (direction: 'up' | 'down') => {
    const baseDate = value || new Date();
    const currentMinute = baseDate.getMinutes();
    let newMinute: number;
    
    if (direction === 'up') {
      newMinute = currentMinute + timeStep;
      if (newMinute >= 60) {
        newMinute = 0;
      }
    } else {
      newMinute = currentMinute - timeStep;
      if (newMinute < 0) {
        newMinute = Math.floor(59 / timeStep) * timeStep;
      }
    }
    
    // Ensure minute aligns with timeStep
    newMinute = Math.floor(newMinute / timeStep) * timeStep;
    
    const newDate = new Date(baseDate);
    newDate.setMinutes(newMinute);
    onChange(newDate);
  };

  const handleSpinnerSecondChange = (direction: 'up' | 'down') => {
    const baseDate = value || new Date();
    const currentSecond = baseDate.getSeconds();
    let newSecond: number;
    
    if (direction === 'up') {
      newSecond = currentSecond === 59 ? 0 : currentSecond + 1;
    } else {
      newSecond = currentSecond === 0 ? 59 : currentSecond - 1;
    }
    
    const newDate = new Date(baseDate);
    newDate.setSeconds(newSecond);
    onChange(newDate);
  };

  const handleAMPMToggle = (period: 'AM' | 'PM') => {
    if (!is12HourFormat) return;
    
    const baseDate = value || new Date();
    const newDate = new Date(baseDate);
    const currentHour = newDate.getHours();
    
    if (period === 'AM' && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    } else if (period === 'PM' && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    }
    
    onChange(newDate);
  };

  const showSeconds = timeFormat?.includes('s') || false;

  return (
    <div className={`time-selector ${className || ''}`} style={style}>
      <div className="time-spinner-container">
        <div className="time-display-row">
          {/* Hour Spinner */}
          <div className="time-spinner-column">
            <button
              className="time-spinner-button up"
              onClick={() => handleSpinnerHourChange('up')}
              type="button"
              aria-label="Increase hour"
            >
              <Icon name="ChevronUp" size="sm" />
            </button>
            <div className="time-value">
              <span className="time-number">
                {is12HourFormat ? spinnerHour12.toString().padStart(2, '0') : spinnerHour24.toString().padStart(2, '0')}
              </span>
              <span className="time-unit">hour</span>
            </div>
            <button
              className="time-spinner-button down"
              onClick={() => handleSpinnerHourChange('down')}
              type="button"
              aria-label="Decrease hour"
            >
              <Icon name="ChevronDown" size="sm" />
            </button>
          </div>

          {/* Minute Spinner */}
          <div className="time-spinner-column">
            <button
              className="time-spinner-button up"
              onClick={() => handleSpinnerMinuteChange('up')}
              type="button"
              aria-label="Increase minute"
            >
              <Icon name="ChevronUp" size="sm" />
            </button>
            <div className="time-value">
              <span className="time-number">{spinnerMinute.toString().padStart(2, '0')}</span>
              <span className="time-unit">min</span>
            </div>
            <button
              className="time-spinner-button down"
              onClick={() => handleSpinnerMinuteChange('down')}
              type="button"
              aria-label="Decrease minute"
            >
              <Icon name="ChevronDown" size="sm" />
            </button>
          </div>

          {/* Second Spinner (optional) */}
          {showSeconds && (
            <div className="time-spinner-column">
              <button
                className="time-spinner-button up"
                onClick={() => handleSpinnerSecondChange('up')}
                type="button"
                aria-label="Increase second"
              >
                <Icon name="ChevronUp" size="sm" />
              </button>
              <div className="time-value">
                <span className="time-number">{spinnerSecond.toString().padStart(2, '0')}</span>
                <span className="time-unit">sec</span>
              </div>
              <button
                className="time-spinner-button down"
                onClick={() => handleSpinnerSecondChange('down')}
                type="button"
                aria-label="Decrease second"
              >
                <Icon name="ChevronDown" size="sm" />
              </button>
            </div>
          )}
        </div>

        {/* AM/PM Toggle */}
        {is12HourFormat && (
          <div className="ampm-toggle">
            <button
              className={`ampm-button ${isAM ? 'active' : ''}`}
              onClick={() => handleAMPMToggle('AM')}
              type="button"
              aria-label="Select AM"
            >
              AM
            </button>
            <button
              className={`ampm-button ${!isAM ? 'active' : ''}`}
              onClick={() => handleAMPMToggle('PM')}
              type="button"
              aria-label="Select PM"
            >
              PM
            </button>
          </div>
        )}

        {/* Time Display */}
        <div className="time-display">
          {value ? (
            is12HourFormat
              ? `${spinnerHour12}:${spinnerMinute.toString().padStart(2, '0')}${showSeconds ? `:${spinnerSecond.toString().padStart(2, '0')}` : ''} ${isAM ? 'AM' : 'PM'}`
              : `${spinnerHour24.toString().padStart(2, '0')}:${spinnerMinute.toString().padStart(2, '0')}${showSeconds ? `:${spinnerSecond.toString().padStart(2, '0')}` : ''}`
          ) : 'No time selected'}
        </div>
      </div>
    </div>
  );
};