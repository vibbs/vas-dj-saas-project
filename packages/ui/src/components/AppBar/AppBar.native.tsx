import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle, TextStyle, StatusBar } from 'react-native';
import { AppBarProps, AppBarAction } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  logo,
  actions = [],
  backAction,
  position = 'static',
  elevation = 2,
  transparent = false,
  height = 64,
  variant = 'default',
  onActionPress,
  onTitlePress,
  style,
  testID,
  accessibilityLabel,
  leading,
  trailing,
  children,
  // Filter out web-specific props
  className,
  onActionClick,
  onTitleClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme } = useTheme();

  const handleActionPress = (action: AppBarAction) => {
    if (!action.disabled) {
      onActionPress?.(action);
    }
  };

  const handleBackPress = () => {
    backAction?.onPress?.();
  };

  const handleTitlePress = () => {
    onTitlePress?.();
  };

  const variantStyles = {
    default: {
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
      borderColor: theme.colors.border,
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    prominent: {
      backgroundColor: transparent ? 'transparent' : theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  };

  const currentVariant = variantStyles[variant];

  const appBarStyles: ViewStyle = {
    height: height,
    backgroundColor: currentVariant.backgroundColor,
    borderBottomWidth: variant !== 'minimal' ? 1 : 0,
    borderBottomColor: currentVariant.borderColor,
    elevation: transparent ? 0 : elevation,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: transparent ? 0 : 0.1,
    shadowRadius: elevation * 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    paddingTop: position === 'fixed' ? (StatusBar.currentHeight || 0) : 0,
  };

  const titleColor = variant === 'prominent' ? theme.colors.primaryForeground : theme.colors.foreground;
  const subtitleColor = variant === 'prominent' ? theme.colors.primaryForeground : theme.colors.mutedForeground;

  const AppBarActionComponent: React.FC<{
    action: AppBarAction;
  }> = ({ action }) => {
    const actionStyles: ViewStyle = {
      padding: theme.spacing.sm,
      borderRadius: theme.borders.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: action.disabled ? 0.5 : 1,
      position: 'relative',
    };

    return (
      <TouchableOpacity
        style={actionStyles}
        onPress={() => handleActionPress(action)}
        disabled={action.disabled}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={action.label}
        accessibilityRole="button"
        accessibilityState={{
          disabled: action.disabled,
        }}
        testID={testID ? `${testID}-action-${action.id}` : undefined}
      >
        {action.icon}
        {action.badge && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: theme.colors.destructive,
              borderRadius: theme.borders.radius.full,
              paddingHorizontal: 4,
              paddingVertical: 2,
              minWidth: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: theme.colors.destructiveForeground,
                fontSize: theme.typography.fontSize.xs,
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeight.medium as any,
                lineHeight: 12,
              }}
            >
              {action.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[appBarStyles, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Application header'}
      accessibilityRole="header"
    >
      {/* Leading content */}
      {(leading || backAction || logo) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          {backAction && (
            <TouchableOpacity
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.borders.radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleBackPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={backAction.label || 'Go back'}
              accessibilityRole="button"
            >
              {backAction.icon || <Text style={{ color: titleColor, fontSize: 18 }}>‹</Text>}
            </TouchableOpacity>
          )}
          {logo}
          {leading}
        </View>
      )}

      {/* Title section */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {children || (title || subtitle) ? (
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={onTitlePress ? handleTitlePress : undefined}
            disabled={!onTitlePress}
            activeOpacity={onTitlePress ? 0.7 : 1}
            accessible={true}
            accessibilityLabel={title || 'App title'}
            accessibilityRole={onTitlePress ? 'button' : 'text'}
          >
            {children || (
              <View>
                {title && (
                  <Text
                    style={{
                      fontSize: variant === 'prominent' ? theme.typography.fontSize.xl : theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.medium as any,
                      color: titleColor,
                      fontFamily: theme.typography.fontFamily,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: subtitleColor,
                      fontFamily: theme.typography.fontFamily,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Trailing content and actions */}
      {(trailing || actions.length > 0) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          {trailing}
          {actions.map((action) => (
            <AppBarActionComponent key={action.id} action={action} />
          ))}
        </View>
      )}
    </View>
  );
};