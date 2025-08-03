import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { ScrollAreaProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  height = 'auto',
  maxHeight,
  width = '100%',
  maxWidth,
  scrollDirection = 'vertical',
  showScrollbars = true,
  fadeScrollbars = true,
  onScroll,
  style,
  contentStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'none' as const,
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  tabIndex,
  scrollbarSize, // Not used in React Native
  ...props
}) => {
  const { theme } = useTheme();

  const containerStyles: ViewStyle = {
    height: height === 'auto' ? undefined : height,
    maxHeight: maxHeight,
    width: width === '100%' ? '100%' : width,
    maxWidth: maxWidth,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    ...style,
  };

  const contentStyles: ViewStyle = {
    padding: theme.spacing.sm,
    ...contentStyle,
  };

  const scrollViewProps = {
    showsVerticalScrollIndicator: scrollDirection !== 'horizontal' && showScrollbars,
    showsHorizontalScrollIndicator: scrollDirection !== 'vertical' && showScrollbars,
    horizontal: scrollDirection === 'horizontal',
    onScroll: onScroll,
    testID: testID,
    style: { flex: 1 },
    contentContainerStyle: contentStyles,
    // Accessibility
    accessible: accessibilityRole !== 'none',
    accessibilityRole: accessibilityRole,
    accessibilityLabel: accessibilityLabel || ariaLabel,
    accessibilityHint: accessibilityHint,
    // Native scrollbar styling
    indicatorStyle: fadeScrollbars ? 'default' : 'black',
    scrollEventThrottle: 16,
    ...props,
  };

  if (scrollDirection === 'both') {
    // For both directions, we need nested ScrollViews
    return (
      <View style={containerStyles}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={showScrollbars}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flex: 1 }}
          testID={testID ? `${testID}-horizontal` : undefined}
        >
          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={showScrollbars}
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            accessible={accessibilityRole !== 'none'}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel || ariaLabel}
            accessibilityHint={accessibilityHint}
            testID={testID ? `${testID}-vertical` : undefined}
            contentContainerStyle={contentStyles}
            scrollEventThrottle={16}
            {...props}
          >
            {children}
          </ScrollView>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      <ScrollView {...scrollViewProps}>
        {children}
      </ScrollView>
    </View>
  );
};