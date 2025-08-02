import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ViewStyle, TextStyle } from 'react-native';
import { SelectProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { FormField } from '../FormField';

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option...',
  multiple = false,
  searchable = false,
  clearable = false,
  onChange,
  onValueChange,
  onFocus,
  onBlur,
  onSearch,
  size = 'md',
  variant = 'default',
  // FormField props
  label,
  helpText,
  errorText,
  required = false,
  disabled = false,
  id,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(
    multiple ? (defaultValue ? [defaultValue] : []) : (defaultValue || '')
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentValue = value !== undefined ? value : internalValue;
  const currentValueArray = Array.isArray(currentValue) ? currentValue : [currentValue].filter(Boolean);

  // Define size mappings
  const sizeMap = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: theme.spacing.xs,
      height: 32,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: theme.spacing.sm,
      height: 40,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: theme.spacing.md,
      height: 48,
    },
  };

  const sizeConfig = sizeMap[size];

  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borders.radius.md,
    },
    filled: {
      backgroundColor: theme.colors.accent,
      borderColor: 'transparent',
      borderWidth: 1,
      borderRadius: theme.borders.radius.md,
    },
    flushed: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderBottomColor: theme.colors.border,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderRadius: 0,
    },
  };

  // Filter options based on search query
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get display text
  const getDisplayText = () => {
    if (multiple) {
      if (currentValueArray.length === 0) return placeholder;
      if (currentValueArray.length === 1) {
        const option = options.find(opt => opt.value === currentValueArray[0]);
        return option?.label || currentValueArray[0];
      }
      return `${currentValueArray.length} selected`;
    } else {
      const option = options.find(opt => opt.value === currentValue);
      return option?.label || placeholder;
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      onFocus?.();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    onBlur?.();
  };

  const handleOptionSelect = (optionValue: string) => {
    let newValue: string | string[];
    
    if (multiple) {
      const currentArray = currentValueArray;
      if (currentArray.includes(optionValue)) {
        newValue = currentArray.filter(v => v !== optionValue);
      } else {
        newValue = [...currentArray, optionValue];
      }
    } else {
      newValue = optionValue;
      handleClose();
    }
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  const handleClear = () => {
    const newValue = multiple ? [] : '';
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const triggerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.padding,
    opacity: disabled ? 0.5 : 1,
    ...variantStyles[variant],
    ...(errorText && {
      borderColor: theme.colors.destructive,
    }),
    ...style,
  };

  const textStyles: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontFamily: theme.typography.fontFamily,
    color: currentValueArray.length === 0 ? theme.colors.muted : theme.colors.foreground,
    flex: 1,
  };

  const modalStyles: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  };

  const modalContentStyles: ViewStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borders.radius.lg,
    maxHeight: '70%',
    padding: theme.spacing.md,
  };

  const headerStyles: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const renderOption = ({ item: option }: { item: any }) => {
    const isSelected = currentValueArray.includes(option.value);
    const isDisabled = option.disabled;
    
    return (
      <TouchableOpacity
        onPress={() => !isDisabled && handleOptionSelect(option.value)}
        disabled={isDisabled}
        style={{
          padding: theme.spacing.sm,
          backgroundColor: isSelected ? theme.colors.accent : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
          borderRadius: theme.borders.radius.sm,
          marginVertical: 2,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      >
        <Text style={{
          fontSize: sizeConfig.fontSize,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.foreground,
        }}>
          {option.label}
        </Text>
        {option.description && (
          <Text style={{
            fontSize: theme.typography.fontSize.xs,
            fontFamily: theme.typography.fontFamily,
            color: theme.colors.muted,
            marginTop: 2,
          }}>
            {option.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const select = (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        onPress={handleToggle}
        disabled={disabled}
        style={triggerStyles}
        testID={testID}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || getDisplayText()}
        accessibilityHint={accessibilityHint || 'Tap to open options'}
        accessibilityState={{ expanded: isOpen, disabled }}
      >
        <Text style={textStyles} numberOfLines={1}>
          {getDisplayText()}
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {clearable && currentValueArray.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={{
                padding: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
            >
              <Text style={{
                color: theme.colors.muted,
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                ×
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={{
            width: 0,
            height: 0,
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderTopWidth: 4,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: theme.colors.muted,
          }} />
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={modalStyles}>
          <View style={modalContentStyles}>
            {/* Header */}
            <View style={headerStyles}>
              <Text style={{
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.foreground,
              }}>
                {label || 'Select Option'}
              </Text>
              
              <TouchableOpacity
                onPress={handleClose}
                style={{ padding: theme.spacing.xs }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={{
                  color: theme.colors.muted,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            {searchable && (
              <View style={{ marginBottom: theme.spacing.md }}>
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder="Search options..."
                  style={{
                    padding: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borders.radius.sm,
                    fontSize: sizeConfig.fontSize,
                    fontFamily: theme.typography.fontFamily,
                    color: theme.colors.foreground,
                  }}
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={{
                  textAlign: 'center',
                  color: theme.colors.muted,
                  fontStyle: 'italic',
                  padding: theme.spacing.lg,
                }}>
                  No options found
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <FormField
      label={label}
      helpText={helpText}
      errorText={errorText}
      required={required}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
    >
      {select}
    </FormField>
  );
};