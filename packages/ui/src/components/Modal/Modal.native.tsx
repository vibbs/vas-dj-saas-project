import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { ModalProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../Card';
import { Button } from '../Button';

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  variant = 'default',
  size = 'md',
  closeOnBackdropClick = true,
  showDivider = false,
  animationType = 'fade',
  loading = false,
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
  'aria-labelledby': ariaLabelledBy,
  'aria-modal': ariaModal,
  role,
  closeOnEscape,
  showCloseButton = true,
  initialFocusRef,
  finalFocusRef,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return {
          modal: {
            flex: 1,
            margin: 0,
          },
          backdrop: {
            backgroundColor: theme.colors.card,
          },
          cardProps: {
            style: {
              flex: 1,
              borderRadius: 0,
            }
          }
        };
      case 'bottom-sheet':
        return {
          modal: {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '80%',
          },
          backdrop: {
            justifyContent: 'flex-end' as const,
          },
          cardProps: {
            style: {
              borderTopLeftRadius: theme.borders.radius.lg,
              borderTopRightRadius: theme.borders.radius.lg,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          }
        };
      case 'dialog':
        return {
          modal: {},
          backdrop: {
            justifyContent: 'center' as const,
          },
          cardProps: {
            variant: 'elevated' as const,
            style: {
              elevation: 12,
              shadowColor: theme.colors.foreground,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }
          }
        };
      default:
        return {
          modal: {},
          backdrop: {
            justifyContent: 'center' as const,
          },
          cardProps: {
            variant: 'elevated' as const,
            style: {
              elevation: 8,
              shadowColor: theme.colors.foreground,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
            }
          }
        };
    }
  };

  const getSizeStyles = () => {
    if (variant === 'fullscreen' || variant === 'bottom-sheet') {
      return {};
    }

    switch (size) {
      case 'sm':
        return { width: '85%', maxWidth: 400, minHeight: 200 };
      case 'md':
        return { width: '90%', maxWidth: 500, minHeight: 250 };
      case 'lg':
        return { width: '95%', maxWidth: 700, minHeight: 300 };
      case 'xl':
        return { width: '98%', maxWidth: 900, minHeight: 350 };
      default:
        return { width: '90%', maxWidth: 500, minHeight: 250 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const backdropStyles: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    ...variantStyles.backdrop,
  };

  const modalStyles: ViewStyle = {
    maxHeight: variant === 'bottom-sheet' ? undefined : '90%',
    position: 'relative',
    ...sizeStyles,
    ...variantStyles.modal,
    ...style,
  };

  const modalContentStyles: ViewStyle = {
    flex: 1,
    ...(variant === 'fullscreen' ? {
      justifyContent: 'center',
      alignItems: 'center',
    } : {}),
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  // Map our animation types to React Native Modal animation types
  const getNativeAnimationType = (): 'none' | 'slide' | 'fade' => {
    switch (animationType) {
      case 'slide':
        return 'slide';
      case 'fade':
        return 'fade';
      case 'none':
        return 'none';
      default:
        return 'fade';
    }
  };

  return (
    <RNModal
      visible={isOpen}
      transparent={true}
      animationType={getNativeAnimationType()}
      onRequestClose={onClose}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Modal dialog'}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityViewIsModal={true}
      {...props}
    >
      <TouchableOpacity
        style={backdropStyles}
        activeOpacity={1}
        onPress={handleBackdropPress}
        accessible={false}
      >
        <Card
          {...variantStyles.cardProps}
          style={{
            ...modalStyles,
            ...variantStyles.cardProps?.style,
          }}
          loading={loading}
          accessibilityLabel={accessibilityLabel || 'Modal content'}
          testID="modal-card"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{ flex: 1 }}
          >
            {showCloseButton && (
              <Button
                variant="secondary"
                size="sm"
                style={{
                  position: 'absolute',
                  top: theme.spacing.md,
                  right: theme.spacing.md,
                  width: 32,
                  height: 32,
                  minHeight: 32,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  zIndex: 2,
                }}
                onPress={onClose}
                accessibilityLabel="Close dialog"
              >
                ×
              </Button>
            )}

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={modalContentStyles}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ flex: 1 }}>
                {React.Children.map(children, (child, index) => {
                  if (React.isValidElement(child) && showDivider && index === React.Children.count(children) - 1) {
                    // Add divider to the last child if it has marginTop: auto style
                    const childStyle = child.props.style;
                    const hasMarginAuto = childStyle && (
                      childStyle.marginTop === 'auto' || 
                      (Array.isArray(childStyle) && childStyle.some((s: any) => s?.marginTop === 'auto'))
                    );
                    
                    if (hasMarginAuto) {
                      return React.cloneElement(child, {
                        ...child.props,
                        style: [
                          child.props.style,
                          { borderTopWidth: 1, borderTopColor: theme.colors.border }
                        ]
                      });
                    }
                  }
                  return child;
                })}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Card>
      </TouchableOpacity>
    </RNModal>
  );
};