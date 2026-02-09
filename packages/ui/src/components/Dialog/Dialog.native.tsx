import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { DialogProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Dialog: React.FC<DialogProps> = ({
  children,
  isOpen = false,
  onClose,
  title,
  description,
  showCloseButton = true,
  closeOnBackdropClick = true,
  size = 'md',
  position = 'center',
  animationDuration = 300,
  backdrop = 'blur',
  style,
  contentStyle,
  overlayStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'none' as const,
  accessibilityLabel,
  accessibilityHint,
  accessibilityViewIsModal = true,
  // Filter out web-specific props
  className,
  closeOnEscape,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-modal': ariaModal,
  role,
  ...props
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, fadeAnim, scaleAnim, animationDuration]);

  const getSizeStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      maxHeight: screenHeight * 0.9,
    };

    switch (size) {
      case 'sm':
        return { ...baseStyle, width: Math.min(screenWidth * 0.8, 400) };
      case 'md':
        return { ...baseStyle, width: Math.min(screenWidth * 0.85, 500) };
      case 'lg':
        return { ...baseStyle, width: Math.min(screenWidth * 0.9, 700) };
      case 'xl':
        return { ...baseStyle, width: Math.min(screenWidth * 0.95, 900) };
      case 'full':
        return { width: screenWidth * 0.95, height: screenHeight * 0.95 };
      default:
        return { ...baseStyle, width: Math.min(screenWidth * 0.85, 500) };
    }
  };

  const getPositionStyles = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { justifyContent: 'flex-start', paddingTop: screenHeight * 0.1 };
      case 'bottom':
        return { justifyContent: 'flex-end', paddingBottom: screenHeight * 0.1 };
      default:
        return { justifyContent: 'center' };
    }
  };

  const getBackdropColor = () => {
    switch (backdrop) {
      case 'dark':
        return 'rgba(0, 0, 0, 0.8)';
      case 'light':
        return 'rgba(0, 0, 0, 0.3)';
      case 'none':
        return 'transparent';
      default:
        return 'rgba(0, 0, 0, 0.5)';
    }
  };

  const overlayStyles: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    backgroundColor: getBackdropColor(),
    ...getPositionStyles(),
    ...overlayStyle,
  };

  const dialogStyles: ViewStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borders.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
    ...getSizeStyles(),
    ...style,
  };

  const headerStyles: ViewStyle = {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: title || description ? 1 : 0,
    borderBottomColor: theme.colors.border,
  };

  const contentStyles: ViewStyle = {
    padding: theme.spacing.lg,
    ...contentStyle,
  };

  const closeButtonStyles: ViewStyle = {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: theme.borders.radius.sm,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  };

  const titleStyles: TextStyle = {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.foreground,
    marginBottom: description ? theme.spacing.xs : 0,
  };

  const descriptionStyles: TextStyle = {
    margin: 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  };

  const closeButtonTextStyles: TextStyle = {
    fontSize: 24,
    color: theme.colors.mutedForeground,
    fontWeight: 'bold',
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      testID={testID ? `${testID}-modal` : undefined}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdropClick ? onClose : undefined}>
        <Animated.View style={[overlayStyles, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                dialogStyles,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                },
              ]}
              testID={testID}
              // React Native accessibility (WCAG 2.1 AA compliant)
              accessible={true}
              accessibilityRole={accessibilityRole}
              accessibilityLabel={accessibilityLabel || title || 'Dialog'}
              accessibilityHint={accessibilityHint || 'Modal dialog window'}
              accessibilityViewIsModal={accessibilityViewIsModal}
              {...props}
            >
              {showCloseButton && (
                <TouchableOpacity
                  style={closeButtonStyles}
                  onPress={onClose}
                  testID={testID ? `${testID}-close` : undefined}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                  accessibilityHint="Closes the dialog"
                >
                  <Text style={closeButtonTextStyles}>×</Text>
                </TouchableOpacity>
              )}

              {(title || description) && (
                <View style={headerStyles}>
                  {title && (
                    <Text style={titleStyles} accessible={true} accessibilityRole="header">
                      {title}
                    </Text>
                  )}
                  {description && (
                    <Text style={descriptionStyles} accessible={true}>
                      {description}
                    </Text>
                  )}
                </View>
              )}

              <View style={contentStyles}>
                {children}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};