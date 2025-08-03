import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Text, ViewStyle, TextStyle } from 'react-native';
import { CollapseProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Collapse: React.FC<CollapseProps> = ({
  children,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onToggle,
  trigger,
  triggerWhenClosed,
  triggerWhenOpen,
  animationDuration = 300,
  disabled = false,
  style,
  contentStyle,
  triggerStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'button' as const,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  // Filter out web-specific props
  className,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-labelledby': ariaLabelledBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const animatedHeight = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(newState);
    }
    onToggle?.(newState);
  };

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [isOpen, animationDuration, animatedHeight]);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const triggerBaseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'transparent',
    opacity: disabled ? 0.5 : 1,
    ...triggerStyle,
  };

  const triggerTextStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    flex: 1,
  };

  const containerStyles: ViewStyle = {
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    ...style,
  };

  const animatedContentStyles = {
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, contentHeight],
    }),
    opacity: animatedHeight,
  };

  const DefaultTrigger = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
      <Text style={triggerTextStyles}>Toggle Content</Text>
      <Animated.Text style={{
        fontSize: 14,
        color: theme.colors.foreground,
        transform: [{
          rotate: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        }],
      }}>
        ▼
      </Animated.Text>
    </View>
  );

  const renderTrigger = () => {
    if (triggerWhenClosed && !isOpen) return triggerWhenClosed;
    if (triggerWhenOpen && isOpen) return triggerWhenOpen;
    return trigger || <DefaultTrigger />;
  };

  return (
    <View style={containerStyles} testID={testID} {...props}>
      <TouchableOpacity
        style={triggerBaseStyles}
        onPress={toggle}
        disabled={disabled}
        activeOpacity={0.8}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || 'Toggle collapse content'}
        accessibilityHint={accessibilityHint || `${isOpen ? 'Collapse' : 'Expand'} content section`}
        accessibilityState={{
          expanded: isOpen,
          disabled: disabled,
          ...accessibilityState,
        }}
      >
        {renderTrigger()}
      </TouchableOpacity>
      
      <Animated.View style={[animatedContentStyles, contentStyle]}>
        <View
          onLayout={handleContentLayout}
          style={{ padding: theme.spacing.md }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};