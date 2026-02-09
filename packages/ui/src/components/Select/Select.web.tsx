import React, { useState, useRef, useEffect } from 'react';
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
  className,
  testID,
  // Accessibility props
  accessibilityLabel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState(
    multiple ? (defaultValue ? [defaultValue] : []) : (defaultValue || '')
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentValue = value !== undefined ? value : internalValue;
  const currentValueArray = Array.isArray(currentValue) ? currentValue : [currentValue].filter(Boolean);

  // Define size mappings
  const sizeMap = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      height: '32px',
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      height: '40px',
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      height: '48px',
    },
  };

  const sizeConfig = sizeMap[size];

  // Define variant styles
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borders.radius.md,
    },
    filled: {
      backgroundColor: theme.colors.accent,
      border: `1px solid transparent`,
      borderRadius: theme.borders.radius.md,
    },
    flushed: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${theme.colors.border}`,
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
    setIsFocused(!isOpen);
    
    if (!isOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
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
      setIsOpen(false);
      setIsFocused(false);
      onBlur?.();
    }
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : '';
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const triggerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...sizeConfig,
    ...variantStyles[variant],
    ...(isFocused && {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 2px ${theme.colors.primary}20`,
    }),
    ...(errorText && {
      borderColor: theme.colors.destructive,
    }),
    ...(disabled && {
      opacity: 0.5,
      backgroundColor: theme.colors.muted + '20',
    }),
  };

  const dropdownStyles = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borders.radius.md,
    boxShadow: theme.shadows.lg,
    maxHeight: '200px',
    overflowY: 'auto' as const,
    marginTop: '4px',
  };

  const optionStyles = {
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    cursor: 'pointer',
    fontSize: sizeConfig.fontSize,
    color: theme.colors.foreground,
    transition: 'background-color 0.2s ease-in-out',
  };

  const select = (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', ...style }}
      className={className}
      data-testid={testID}
    >
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || accessibilityLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!errorText}
        aria-required={required}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        style={triggerStyles}
      >
        <span style={{ 
          flex: 1, 
          textAlign: 'left',
          color: currentValueArray.length === 0 ? theme.colors.muted : theme.colors.foreground 
        }}>
          {getDisplayText()}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {clearable && currentValueArray.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: theme.colors.muted,
                fontSize: '16px',
              }}
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `4px solid ${theme.colors.muted}`,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={dropdownStyles}>
          {searchable && (
            <div style={{ padding: theme.spacing.sm }}>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search options..."
                style={{
                  width: '100%',
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borders.radius.sm,
                  fontSize: sizeConfig.fontSize,
                  outline: 'none',
                }}
                autoFocus
              />
            </div>
          )}
          
          <div role="listbox" aria-multiselectable={multiple}>
            {filteredOptions.length === 0 ? (
              <div style={{
                ...optionStyles,
                color: theme.colors.muted,
                fontStyle: 'italic',
              }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = currentValueArray.includes(option.value);
                const isDisabled = option.disabled;
                
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !isDisabled && handleOptionSelect(option.value)}
                    style={{
                      ...optionStyles,
                      backgroundColor: isSelected 
                        ? theme.colors.accent 
                        : 'transparent',
                      color: isDisabled 
                        ? theme.colors.muted 
                        : theme.colors.foreground,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDisabled) {
                        e.currentTarget.style.backgroundColor = theme.colors.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div>{option.label}</div>
                    {option.description && (
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.muted,
                        marginTop: '2px',
                      }}>
                        {option.description}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <FormField
      label={label}
      helpText={helpText}
      errorText={errorText}
      required={required}
      disabled={disabled}
      id={id}
    >
      {select}
    </FormField>
  );
};