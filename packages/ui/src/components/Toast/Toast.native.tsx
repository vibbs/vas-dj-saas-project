import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { ToastProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  children,
  variant = 'default',
  position = 'top',
  duration = 5000,
  visible = true,
  onClose,
  title,
  description,
  closable = true,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'alert' as const,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive,
  role,
  ...props
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(visible);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  // Auto-dismiss functionality
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  // Initialize animation if initially visible
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      showToast();
    }
  }, []);

  // Animation management
  useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);
      showToast();
    } else if (!visible && isVisible) {
      hideToast();
    }
  }, [visible]);

  const showToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position.includes('top') ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose?.();
    });
  };

  const handleClose = () => {
    hideToast();
  };

  // Define variant styles using theme tokens
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    success: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
    info: {
      backgroundColor: theme.colors.info,
      borderColor: theme.colors.info,
    },
  };

  const variantTextStyles = {
    default: { color: theme.colors.foreground },
    success: { color: theme.colors.successForeground },
    warning: { color: theme.colors.warningForeground },
    error: { color: theme.colors.destructiveForeground },
    info: { color: theme.colors.infoForeground },
  };

  // Position styles
  const getPositionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 9999,
    };

    if (position.includes('top')) {
      baseStyle.top = theme.spacing.lg * 2; // Account for status bar
    } else {
      baseStyle.bottom = theme.spacing.lg * 2; // Account for bottom safe area
    }

    return baseStyle;
  };

  const containerStyles: ViewStyle = {
    ...getPositionStyle(),
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
    // Allow style overrides (especially for Storybook)
    ...style,
  };

  const baseStyles: ViewStyle = {
    padding: theme.spacing.md,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    minHeight: 60,
    maxWidth: screenWidth - (theme.spacing.md * 2),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    ...variantStyles[variant],
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    ...variantTextStyles[variant],
  };

  const titleStyles: TextStyle = {
    fontWeight: theme.typography.fontWeight.semibold as TextStyle['fontWeight'],
    marginBottom: (description || children) ? theme.spacing.xs : 0,
    ...variantTextStyles[variant],
  };

  // Get icon for variant
  const getIcon = () => {
    switch (variant) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={containerStyles}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || title || (typeof children === 'string' ? children : 'Notification')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      <View style={baseStyles}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start', 
          gap: theme.spacing.sm 
        }}>
          {/* Icon */}
          <Text style={[
            textStyles, 
            { 
              fontSize: 18, 
              lineHeight: 20, 
              marginTop: 2 
            }
          ]}>
            {getIcon()}
          </Text>
          
          {/* Content */}
          <View style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Text style={titleStyles}>
                {title}
              </Text>
            )}
            {description && (
              <Text style={[textStyles, { opacity: 0.9 }]}>
                {description}
              </Text>
            )}
            {children && !description && (
              <Text style={textStyles}>{children}</Text>
            )}
          </View>
          
          {/* Close button */}
          {closable && (
            <TouchableOpacity
              onPress={handleClose}
              style={{
                padding: theme.spacing.xs,
                margin: -theme.spacing.xs,
                borderRadius: theme.borders.radius.sm,
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Close notification"
              accessibilityRole="button"
            >
              <Text style={[
                textStyles,
                { 
                  fontSize: 16, 
                  lineHeight: 16, 
                  opacity: 0.7 
                }
              ]}>
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};