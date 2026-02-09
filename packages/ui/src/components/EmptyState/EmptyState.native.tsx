import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { EmptyStateProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const EmptyState: React.FC<EmptyStateProps> = ({
  children,
  title = 'No data available',
  description,
  icon,
  image,
  action,
  size = 'md',
  variant = 'default',
  style,
  titleStyle,
  descriptionStyle,
  testID,
  // Accessibility props
  accessibilityRole = 'text' as const,
  accessibilityLabel,
  accessibilityHint,
  // Filter out web-specific props
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: theme.spacing.lg,
          iconSize: 32,
          titleSize: theme.typography.fontSize.lg,
          descriptionSize: theme.typography.fontSize.sm,
          gap: theme.spacing.sm,
        };
      case 'md':
        return {
          padding: theme.spacing.xl,
          iconSize: 48,
          titleSize: theme.typography.fontSize.xl,
          descriptionSize: theme.typography.fontSize.base,
          gap: theme.spacing.md,
        };
      case 'lg':
        return {
          padding: theme.spacing.xxl,
          iconSize: 64,
          titleSize: theme.typography.fontSize['2xl'],
          descriptionSize: theme.typography.fontSize.lg,
          gap: theme.spacing.lg,
        };
      default:
        return {
          padding: theme.spacing.xl,
          iconSize: 48,
          titleSize: theme.typography.fontSize.xl,
          descriptionSize: theme.typography.fontSize.base,
          gap: theme.spacing.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeStyles.padding,
    minHeight: variant === 'minimal' ? undefined : 200,
    backgroundColor: variant === 'illustration' ? theme.colors.muted : 'transparent',
    borderRadius: variant === 'illustration' ? theme.borders.radius.lg : 0,
    borderWidth: variant === 'illustration' ? 1 : 0,
    borderColor: variant === 'illustration' ? theme.colors.border : 'transparent',
    ...style,
  };

  const iconContainerStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeStyles.iconSize,
    height: sizeStyles.iconSize,
    marginBottom: sizeStyles.gap,
  };

  const titleStyles: TextStyle = {
    fontSize: sizeStyles.titleSize,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    marginBottom: description ? theme.spacing.xs : sizeStyles.gap,
    ...titleStyle,
  };

  const descriptionStyles: TextStyle = {
    fontSize: sizeStyles.descriptionSize,
    color: theme.colors.mutedForeground,
    fontFamily: theme.typography.fontFamily,
    lineHeight: sizeStyles.descriptionSize * 1.5,
    textAlign: 'center',
    marginBottom: action ? sizeStyles.gap : 0,
    maxWidth: 400,
    ...descriptionStyle,
  };

  const actionContainerStyles: ViewStyle = {
    marginTop: sizeStyles.gap,
    alignItems: 'center',
  };

  const DefaultIcon = () => (
    <View style={{
      width: sizeStyles.iconSize,
      height: sizeStyles.iconSize,
      borderRadius: sizeStyles.iconSize / 2,
      backgroundColor: theme.colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{
        fontSize: sizeStyles.iconSize * 0.4,
      }}>
        📭
      </Text>
    </View>
  );

  return (
    <View
      style={containerStyles}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={
        accessibilityLabel || 
        ariaLabel || 
        `${title}${description ? '. ' + description : ''}`
      }
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {/* Custom children override everything */}
      {children ? (
        typeof children === 'string' ? (
          <Text style={titleStyles}>{children}</Text>
        ) : (
          children
        )
      ) : (
        <>
          {/* Icon or Image */}
          {(icon || image || variant !== 'minimal') && (
            <View style={iconContainerStyles}>
              {image || icon || <DefaultIcon />}
            </View>
          )}

          {/* Title */}
          {title && (
            <Text style={titleStyles}>
              {title}
            </Text>
          )}

          {/* Description */}
          {description && (
            <Text style={descriptionStyles}>
              {description}
            </Text>
          )}

          {/* Action */}
          {action && (
            <View style={actionContainerStyles}>
              {action}
            </View>
          )}
        </>
      )}
    </View>
  );
};