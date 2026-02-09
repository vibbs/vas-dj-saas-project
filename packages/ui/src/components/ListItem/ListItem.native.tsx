import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { ListItemProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const ListItem: React.FC<ListItemProps> = ({
  children,
  title,
  subtitle,
  description,
  leading,
  trailing,
  avatar,
  selected = false,
  disabled = false,
  divider = false,
  dense = false,
  multiline = false,
  onPress,
  onLongPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'button' as const,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  // Filter out web-specific props
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-selected': ariaSelected,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const containerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: dense ? theme.spacing.xs : theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: selected ? theme.colors.accent : 'transparent',
    borderBottomWidth: divider ? 1 : 0,
    borderBottomColor: theme.colors.border,
    opacity: disabled ? 0.5 : 1,
    minHeight: dense ? 40 : 56,
    ...style,
  };

  const leadingStyles: ViewStyle = {
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyles: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    ...contentStyle,
  };

  const titleStyles: TextStyle = {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: theme.typography.fontSize.base * 1.5,
    ...titleStyle,
  };

  const subtitleStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: theme.typography.fontSize.sm * 1.4,
    marginTop: theme.spacing.xs / 2,
    ...subtitleStyle,
  };

  const descriptionStyles: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: theme.typography.fontSize.sm * 1.4,
    marginTop: theme.spacing.xs,
  };

  const trailingStyles: ViewStyle = {
    marginLeft: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled) return;
    onLongPress?.();
  };

  const ListItemContainer = (onPress || onLongPress) ? TouchableOpacity : View;

  return (
    <ListItemContainer
      style={containerStyles}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityRole={onPress ? 'button' : accessibilityRole}
      accessibilityLabel={
        accessibilityLabel || 
        ariaLabel || 
        title || 
        (typeof children === 'string' ? children : 'List item')
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled,
        selected: selected,
        ...accessibilityState,
      }}
      {...props}
    >
      {/* Leading content (avatar or icon) */}
      {(leading || avatar) && (
        <View style={leadingStyles}>
          {avatar || leading}
        </View>
      )}

      {/* Main content */}
      <View style={contentStyles}>
        {/* Custom children override everything */}
        {children ? (
          typeof children === 'string' ? (
            <Text style={titleStyles}>{children}</Text>
          ) : (
            children
          )
        ) : (
          <>
            {/* Title */}
            {title && (
              <Text style={titleStyles} numberOfLines={multiline ? undefined : 1}>
                {title}
              </Text>
            )}
            
            {/* Subtitle */}
            {subtitle && (
              <Text style={subtitleStyles} numberOfLines={multiline ? undefined : 1}>
                {subtitle}
              </Text>
            )}
            
            {/* Description */}
            {description && (
              <Text style={descriptionStyles} numberOfLines={multiline ? undefined : 2}>
                {description}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Trailing content */}
      {trailing && (
        <View style={trailingStyles}>
          {trailing}
        </View>
      )}
    </ListItemContainer>
  );
};