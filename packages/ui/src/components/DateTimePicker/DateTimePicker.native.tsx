import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DateTimePickerProps } from './types';
import { Input } from '../Input';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import { 
  formatDateForDisplay 
} from './utils';

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
  timeStep = 15,
  dateFormat,
  timeFormat,
  locale,
  closeOnSelect = true,
  showClearButton = true,
  showTodayButton = true,
  style,
  onFocus,
  onOpen,
  onClose,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>(
    mode === 'datetime' ? 'date' : mode as 'date' | 'time'
  );
  const [tempValue, setTempValue] = useState<Date | [Date, Date] | [Date, null] | null>(value || null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [showNativePicker, setShowNativePicker] = useState(false);

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

  const handleInputPress = () => {
    if (!disabled && !readOnly) {
      setIsOpen(true);
      setCurrentMode(mode === 'datetime' ? 'date' : mode as 'date' | 'time');
      onFocus?.();
      onOpen?.();
    }
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setShowNativePicker(false);
    setTempValue(value || null);
    setCurrentMode(mode === 'datetime' ? 'date' : mode as 'date' | 'time');
    setIsSelectingStart(true);
    onClose?.();
  };

  const handleNativeDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    if (range) {
      if (!tempValue || !Array.isArray(tempValue)) {
        // Start new range - set only start date
        setTempValue([selectedDate, null]);
        setIsSelectingStart(false);
      } else {
        const [start, end] = tempValue;
        if (!end) {
          // Complete range
          if (selectedDate >= start) {
            setTempValue([start, selectedDate]);
          } else {
            setTempValue([selectedDate, start]);
          }
          
          if (currentMode === 'date' && mode !== 'datetime') {
            // Range date selection complete
            const finalValue = selectedDate >= start ? [start, selectedDate] : [selectedDate, start];
            onChange(finalValue as [Date, Date]);
            if (closeOnSelect) {
              handleModalClose();
            }
          }
        } else {
          // Start new range - replace existing complete range
          setTempValue([selectedDate, null]);
          setIsSelectingStart(false);
        }
      }
    } else {
      setTempValue(selectedDate);
      
      if (mode === 'date') {
        onChange(selectedDate);
        if (closeOnSelect) {
          handleModalClose();
        }
      }
    }

    if (Platform.OS === 'ios' && mode === 'datetime' && currentMode === 'date') {
      // Switch to time mode for datetime
      setCurrentMode('time');
    }
  };

  const handleApply = () => {
    if (tempValue) {
      onChange(tempValue);
    }
    handleModalClose();
  };

  const handleClear = () => {
    onChange(null);
    setInputValue('');
    handleModalClose();
  };

  const handleToday = () => {
    const today = new Date();
    
    if (mode === 'time') {
      onChange(today);
    } else if (range) {
      if (!tempValue || !Array.isArray(tempValue) || !tempValue[1]) {
        // If we don't have a complete range, start new range with today
        setTempValue([today, null]);
      } else {
        // If we have a complete range, replace with today-today
        onChange([today, today]);
      }
    } else {
      onChange(today);
    }
    
    if (closeOnSelect && mode === 'date' && !range) {
      handleModalClose();
    }
  };

  const getCurrentValue = (): Date => {
    if (range && Array.isArray(tempValue)) {
      const [start, end] = tempValue;
      if (!end) {
        return start || new Date();
      }
      return isSelectingStart ? start : end;
    }
    return (tempValue as Date) || new Date();
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

  const getRangeStatusText = () => {
    if (!range || !Array.isArray(tempValue)) return 'Select start date';
    
    const [start, end] = tempValue;
    if (!start) {
      return 'Select start date';
    } else if (!end) {
      return 'Select end date';
    }
    return 'Range selected';
  };

  const openNativePicker = () => {
    setShowNativePicker(true);
  };

  const renderDateTimePicker = () => {
    const currentValue = getCurrentValue();
    
    return (
      <View style={{ padding: 16 }}>
        {range && (
          <Text style={{ 
            marginBottom: 16, 
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '500',
            color: '#374151'
          }}>
            {getRangeStatusText()}
          </Text>
        )}
        
        <TouchableOpacity
          onPress={openNativePicker}
          style={{
            backgroundColor: '#f9fafb',
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <Icon name="Calendar" size="lg" style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 16, color: '#374151' }}>
            {formatDateForDisplay(currentValue, currentMode, dateFormat, timeFormat, locale)}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Tap to {currentMode === 'date' ? 'select date' : 'select time'}
          </Text>
        </TouchableOpacity>
        
        {mode === 'datetime' && (
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            marginBottom: 16,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            padding: 4
          }}>
            <Button
              variant={currentMode === 'date' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setCurrentMode('date')}
              style={{ marginRight: 8, flex: 1 }}
            >
              Date
            </Button>
            <Button
              variant={currentMode === 'time' ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setCurrentMode('time')}
              style={{ flex: 1 }}
            >
              Time
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[{ flex: 1 }, style]} testID={testID}>
      <TouchableOpacity onPress={handleInputPress} disabled={disabled}>
        <Input
          value={inputValue}
          placeholder={getPlaceholder()}
          label={label}
          helpText={helpText}
          errorText={errorText}
          disabled={disabled}
          readOnly={true}
          required={required}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={{ pointerEvents: 'none' }}
        />
      </TouchableOpacity>

      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        variant="bottom-sheet"
        closeOnBackdropClick={true}
        showCloseButton={false}
      >
        <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              {range ? `Select ${mode} range` : `Select ${mode}`}
            </Text>
            <TouchableOpacity onPress={handleModalClose}>
              <Icon name="X" />
            </TouchableOpacity>
          </View>

          {renderDateTimePicker()}

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0'
          }}>
            <View style={{ flexDirection: 'row' }}>
              {showClearButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleClear}
                  style={{ marginRight: 8 }}
                >
                  Clear
                </Button>
              )}
              
              {showTodayButton && mode !== 'time' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleToday}
                >
                  Today
                </Button>
              )}
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Button
                variant="outline"
                size="sm"
                onPress={handleModalClose}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onPress={handleApply}
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {showNativePicker && (
        <RNDateTimePicker
          value={getCurrentValue()}
          mode={currentMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleNativeDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
          locale={locale?.code}
          themeVariant="light"
        />
      )}
    </View>
  );
};