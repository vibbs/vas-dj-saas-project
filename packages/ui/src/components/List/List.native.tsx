import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { ListProps, ListItemProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const List: React.FC<ListProps> = ({
  children,
  type = 'unordered',
  variant = 'default',
  size = 'base',
  marker,
  indent = true,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none' as const,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles for spacing
  const variantStyles = {
    default: {
      marginBottom: theme.spacing.md,
    },
    compact: {
      marginBottom: theme.spacing.sm,
    },
    spacious: {
      marginBottom: theme.spacing.lg,
    },
  };

  // Define size styles
  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
    },
    base: {
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const baseStyles: ViewStyle = {
    paddingLeft: indent ? theme.spacing.lg : 0,
    ...variantStyles[variant],
  };

  // Create context for list items
  const ListContextType = {
    type,
    size,
    variant,
    marker,
    itemIndex: 0,
  };
  const ListContext = React.createContext(ListContextType);

  // Enhanced children to provide context
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === ListItem) {
      return (
        <ListContext.Provider value={{ type, size, variant, marker, itemIndex: index + 1 }}>
          {child}
        </ListContext.Provider>
      );
    }
    return child;
  });

  return (
    <View
      style={[baseStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'List'}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {enhancedChildren}
    </View>
  );
};

export const ListItem: React.FC<ListItemProps> = ({
  children,
  value,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none' as const,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Default context value matching List's context type
  const defaultContext = {
    type: 'unordered' as 'unordered' | 'ordered' | 'none',
    size: 'base' as 'sm' | 'base' | 'lg', 
    variant: 'default' as 'default' | 'compact' | 'spacious',
    marker: undefined as string | undefined,
    itemIndex: 1,
  };

  // Try to get context (gracefully falls back to default)
  let context = defaultContext;
  try {
    const listContext = React.useContext(React.createContext(defaultContext));
    if (listContext) {
      context = listContext;
    }
  } catch {
    // Fallback to default if context not available
  }

  // Define size styles
  const sizeStyles = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    },
    base: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.relaxed,
    },
  };

  const containerStyles: ViewStyle = {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
    alignItems: 'flex-start',
  };

  const markerStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
    marginRight: theme.spacing.xs,
    ...sizeStyles[context.size],
    minWidth: theme.spacing.md,
  };

  const contentStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
    flex: 1,
    ...sizeStyles[context.size],
  };

  // Get marker text
  const getMarkerText = () => {
    if (context.marker === 'none') return '';
    if (context.type === 'ordered') {
      const displayValue = value || context.itemIndex;
      switch (context.marker) {
        case 'lower-alpha':
          return `${String.fromCharCode(96 + Number(displayValue))}.`;
        case 'upper-alpha':
          return `${String.fromCharCode(64 + Number(displayValue))}.`;
        case 'lower-roman':
          return `${toRoman(Number(displayValue)).toLowerCase()}.`;
        case 'upper-roman':
          return `${toRoman(Number(displayValue))}.`;
        default:
          return `${displayValue}.`;
      }
    } else {
      switch (context.marker) {
        case 'circle':
          return '○';
        case 'square':
          return '■';
        case 'disc':
        default:
          return '•';
      }
    }
  };

  return (
    <View
      style={[containerStyles, style]}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'List item')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      <Text style={markerStyles}>{getMarkerText()}</Text>
      <Text style={contentStyles}>{children}</Text>
    </View>
  );
};

// Helper function to convert numbers to Roman numerals
function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  
  return result;
}