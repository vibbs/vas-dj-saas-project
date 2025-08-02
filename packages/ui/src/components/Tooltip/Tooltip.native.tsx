import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { TooltipProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  visible: controlledVisible,
  delay = 200,
  offset = 8,
  disabled = false,
  arrow = true,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
  ...props
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(controlledVisible || false);
  const [tooltipLayout, setTooltipLayout] = useState({ width: 0, height: 0 });
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isControlled = controlledVisible !== undefined;
  const shouldShow = isControlled ? controlledVisible : isVisible;

  const screenDimensions = Dimensions.get('window');

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerLayout.width || !tooltipLayout.width) return { top: 0, left: 0 };

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerLayout.y - tooltipLayout.height - offset;
        left = triggerLayout.x + (triggerLayout.width - tooltipLayout.width) / 2;
        break;
      case 'top-start':
        top = triggerLayout.y - tooltipLayout.height - offset;
        left = triggerLayout.x;
        break;
      case 'top-end':
        top = triggerLayout.y - tooltipLayout.height - offset;
        left = triggerLayout.x + triggerLayout.width - tooltipLayout.width;
        break;
      case 'bottom':
        top = triggerLayout.y + triggerLayout.height + offset;
        left = triggerLayout.x + (triggerLayout.width - tooltipLayout.width) / 2;
        break;
      case 'bottom-start':
        top = triggerLayout.y + triggerLayout.height + offset;
        left = triggerLayout.x;
        break;
      case 'bottom-end':
        top = triggerLayout.y + triggerLayout.height + offset;
        left = triggerLayout.x + triggerLayout.width - tooltipLayout.width;
        break;
      case 'left':
        top = triggerLayout.y + (triggerLayout.height - tooltipLayout.height) / 2;
        left = triggerLayout.x - tooltipLayout.width - offset;
        break;
      case 'right':
        top = triggerLayout.y + (triggerLayout.height - tooltipLayout.height) / 2;
        left = triggerLayout.x + triggerLayout.width + offset;
        break;
    }

    // Keep tooltip within screen bounds
    const padding = theme.spacing.sm;
    if (left < padding) left = padding;
    if (left + tooltipLayout.width > screenDimensions.width - padding) {
      left = screenDimensions.width - tooltipLayout.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipLayout.height > screenDimensions.height - padding) {
      top = screenDimensions.height - tooltipLayout.height - padding;
    }

    return { top, left };
  };

  // Show tooltip with animation
  const showTooltip = () => {
    if (disabled || isControlled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  };

  // Hide tooltip with animation
  const hideTooltip = () => {
    if (disabled || isControlled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  // Toggle tooltip for click trigger
  const toggleTooltip = () => {
    if (disabled || isControlled) return;
    
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Handle trigger events
  const getTriggerProps = () => {
    const props: any = {};

    if (trigger === 'click') {
      props.onPress = toggleTooltip;
    }
    // Note: React Native doesn't have native hover/focus events like web
    // These would typically be handled by gesture responders or third-party libraries

    return props;
  };

  // Handle trigger layout
  const handleTriggerLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTriggerLayout({ x, y, width, height });
  };

  // Handle tooltip layout
  const handleTooltipLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTooltipLayout({ width, height });
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update animations when visibility changes
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [shouldShow, fadeAnim, scaleAnim]);

  const position = calculatePosition();

  const tooltipContainerStyle: ViewStyle = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex: 10000,
    maxWidth: 200,
  };

  const tooltipStyle: ViewStyle = {
    backgroundColor: theme.colors.foreground,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borders.radius.sm,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  const tooltipTextStyle: TextStyle = {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  };

  // Arrow styles
  const getArrowStyle = (): ViewStyle => {
    const arrowSize = 6;
    const arrowStyle: ViewStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    if (placement.startsWith('top')) {
      arrowStyle.bottom = -arrowSize;
      arrowStyle.left = '50%';
      arrowStyle.marginLeft = -arrowSize;
      arrowStyle.borderLeftWidth = arrowSize;
      arrowStyle.borderRightWidth = arrowSize;
      arrowStyle.borderTopWidth = arrowSize;
      arrowStyle.borderLeftColor = 'transparent';
      arrowStyle.borderRightColor = 'transparent';
      arrowStyle.borderTopColor = theme.colors.foreground;
    } else if (placement.startsWith('bottom')) {
      arrowStyle.top = -arrowSize;
      arrowStyle.left = '50%';
      arrowStyle.marginLeft = -arrowSize;
      arrowStyle.borderLeftWidth = arrowSize;
      arrowStyle.borderRightWidth = arrowSize;
      arrowStyle.borderBottomWidth = arrowSize;
      arrowStyle.borderLeftColor = 'transparent';
      arrowStyle.borderRightColor = 'transparent';
      arrowStyle.borderBottomColor = theme.colors.foreground;
    } else if (placement === 'left') {
      arrowStyle.right = -arrowSize;
      arrowStyle.top = '50%';
      arrowStyle.marginTop = -arrowSize;
      arrowStyle.borderTopWidth = arrowSize;
      arrowStyle.borderBottomWidth = arrowSize;
      arrowStyle.borderLeftWidth = arrowSize;
      arrowStyle.borderTopColor = 'transparent';
      arrowStyle.borderBottomColor = 'transparent';
      arrowStyle.borderLeftColor = theme.colors.foreground;
    } else if (placement === 'right') {
      arrowStyle.left = -arrowSize;
      arrowStyle.top = '50%';
      arrowStyle.marginTop = -arrowSize;
      arrowStyle.borderTopWidth = arrowSize;
      arrowStyle.borderBottomWidth = arrowSize;
      arrowStyle.borderRightWidth = arrowSize;
      arrowStyle.borderTopColor = 'transparent';
      arrowStyle.borderBottomColor = 'transparent';
      arrowStyle.borderRightColor = theme.colors.foreground;
    }

    return arrowStyle;
  };

  const renderContent = () => {
    if (typeof content === 'string') {
      return <Text style={tooltipTextStyle}>{content}</Text>;
    }
    return content;
  };

  // Check if child is already a touchable element to avoid nesting
  const isChildTouchable = React.isValidElement(children) && 
    (children.type === TouchableOpacity || 
     (typeof children.type === 'string' && children.type === 'button') ||
     children.props?.onPress || 
     children.props?.onClick);

  const triggerElement = isChildTouchable ? (
    React.cloneElement(children as React.ReactElement, {
      onLayout: handleTriggerLayout,
      ...getTriggerProps(),
      testID: testID || (children as React.ReactElement).props.testID,
    })
  ) : (
    <TouchableOpacity
      onLayout={handleTriggerLayout}
      activeOpacity={trigger === 'click' ? 0.7 : 1}
      {...getTriggerProps()}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <>
      {triggerElement}
      
      {isVisible && (
        <View style={tooltipContainerStyle} pointerEvents="none">
          <Animated.View
            style={[
              tooltipStyle,
              style,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onLayout={handleTooltipLayout}
            // Accessibility attributes (WCAG 2.1 AA compliant)
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel}
            accessible={true}
          >
            {renderContent()}
            {arrow && <View style={getArrowStyle()} />}
          </Animated.View>
        </View>
      )}
    </>
  );
};