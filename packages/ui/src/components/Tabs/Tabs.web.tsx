import React, { createContext, useContext, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './types';

interface TabsContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
};

/**
 * Tabs Component (Web)
 *
 * A set of layered sections of content with theme integration.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value: controlledValue, onValueChange, defaultValue, children, className, style, testID }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

    const handleValueChange = (newValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div ref={ref} style={{ width: '100%', ...style }} className={className} data-testid={testID}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, style, testID }, ref) => {
    const { theme } = useTheme();

    const listStyles = {
      display: 'inline-flex',
      height: '40px',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borders.radius.md,
      backgroundColor: theme.colors.muted,
      padding: theme.spacing.xs,
      color: theme.colors.mutedForeground,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={listStyles}
        className={className}
        role="tablist"
        data-testid={testID}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, disabled, className, style, testID, accessibilityLabel, 'aria-label': ariaLabel }, ref) => {
    const { theme } = useTheme();
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isSelected = value === selectedValue;

    const triggerStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap' as const,
      borderRadius: theme.borders.radius.sm,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
      paddingTop: theme.spacing.xs + 2,
      paddingBottom: theme.spacing.xs + 2,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      fontFamily: theme.typography.fontFamily,
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      backgroundColor: isSelected ? theme.colors.background : 'transparent',
      color: isSelected ? theme.colors.foreground : theme.colors.foreground,
      boxShadow: isSelected ? theme.shadows.sm : 'none',
      ...style,
    };

    const hoverStyles = !disabled && !isSelected ? {
      ':hover': {
        backgroundColor: theme.colors.accent,
        color: theme.colors.accentForeground,
      },
    } : {};

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-label={ariaLabel || accessibilityLabel}
        disabled={disabled}
        onClick={() => !disabled && onValueChange?.(value)}
        style={{...triggerStyles, ...hoverStyles}}
        className={className}
        data-testid={testID}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className, style, testID }, ref) => {
    const { theme } = useTheme();
    const { value: selectedValue } = useTabsContext();
    const isSelected = value === selectedValue;

    if (!isSelected) return null;

    const contentStyles = {
      marginTop: theme.spacing.sm,
      ...style,
    };

    return (
      <div
        ref={ref}
        role="tabpanel"
        style={contentStyles}
        className={className}
        data-testid={testID}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';
