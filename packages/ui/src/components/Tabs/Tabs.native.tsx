import React, { createContext, useContext, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, ViewStyle, TextStyle } from 'react-native';
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
 * Tabs Component (React Native)
 *
 * A set of layered sections of content with theme integration.
 */
export const Tabs: React.FC<TabsProps> = ({
  value: controlledValue,
  onValueChange,
  defaultValue,
  children,
  style,
  testID,
  // Filter out web-specific props
  className,
}) => {
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
      <View style={[{ width: '100%' }, style]} testID={testID}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({
  children,
  style,
  testID,
  // Filter out web-specific props
  className,
}) => {
  const { theme } = useTheme();

  const listStyles: ViewStyle = {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    height: 40,
    borderRadius: theme.borders.radius.md,
    backgroundColor: theme.colors.muted,
    padding: theme.spacing.xs,
  };

  const contentContainerStyles: ViewStyle = {
    alignItems: 'center',
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[listStyles, style]}
      contentContainerStyle={contentContainerStyles}
      testID={testID}
      accessible={true}
      accessibilityRole="tablist"
    >
      {children}
    </ScrollView>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled,
  style,
  testID,
  accessibilityLabel,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
}) => {
  const { theme } = useTheme();
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = value === selectedValue;

  const triggerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borders.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    backgroundColor: isSelected ? theme.colors.background : 'transparent',
    opacity: disabled ? 0.5 : 1,
    marginRight: theme.spacing.xs,
  };

  const triggerTextStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily,
    color: isSelected ? theme.colors.foreground : theme.colors.foreground,
  };

  return (
    <TouchableOpacity
      style={[triggerStyles, style]}
      onPress={() => !disabled && onValueChange?.(value)}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Tab')}
      accessibilityRole="tab"
      accessibilityState={{
        selected: isSelected,
        disabled: disabled,
      }}
    >
      {typeof children === 'string' ? (
        <Text style={triggerTextStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  style,
  testID,
  // Filter out web-specific props
  className,
}) => {
  const { theme } = useTheme();
  const { value: selectedValue } = useTabsContext();
  const isSelected = value === selectedValue;

  if (!isSelected) return null;

  const contentStyles: ViewStyle = {
    marginTop: theme.spacing.sm,
  };

  return (
    <View
      style={[contentStyles, style]}
      testID={testID}
      accessible={true}
      accessibilityRole="none"
    >
      {children}
    </View>
  );
};
