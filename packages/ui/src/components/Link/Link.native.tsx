import React from 'react';
import { TouchableOpacity, Text, Linking, TextStyle } from 'react-native';
import { LinkProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  underline = 'hover',
  external = false,
  disabled = false,
  onPress,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'link' as const,
  // Filter out web-specific props
  onClick,
  target,
  rel,
  download,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-current': ariaCurrent,
  role,
  ...props
}) => {
  const { theme } = useTheme();

  // Define variant styles using theme tokens
  const variantStyles = {
    default: { color: theme.colors.primary },
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    muted: { color: theme.colors.muted },
    destructive: { color: theme.colors.destructive },
  };

  // Define size styles using theme tokens
  const sizeStyles = {
    xs: { fontSize: theme.typography.fontSize.xs },
    sm: { fontSize: theme.typography.fontSize.sm },
    base: { fontSize: theme.typography.fontSize.base },
    lg: { fontSize: theme.typography.fontSize.lg },
    xl: { fontSize: theme.typography.fontSize.xl },
  };

  // Define weight styles
  const weightStyles = {
    normal: { fontWeight: theme.typography.fontWeight.normal as TextStyle['fontWeight'] },
    medium: { fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'] },
    semibold: { fontWeight: theme.typography.fontWeight.semibold as TextStyle['fontWeight'] },
    bold: { fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'] },
  };

  // Define underline styles
  const underlineStyles = {
    always: { textDecorationLine: 'underline' as TextStyle['textDecorationLine'] },
    hover: { textDecorationLine: 'none' as TextStyle['textDecorationLine'] },
    never: { textDecorationLine: 'none' as TextStyle['textDecorationLine'] },
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily,
    ...sizeStyles[size],
    ...weightStyles[weight],
    ...variantStyles[variant],
    ...underlineStyles[underline],
  };

  const containerStyles = {
    opacity: disabled ? 0.5 : 1,
  };

  // Handle press events
  const handlePress = async () => {
    if (disabled) return;

    if (onPress) {
      onPress();
    } else if (href) {
      try {
        const canOpen = await Linking.canOpenURL(href);
        if (canOpen) {
          await Linking.openURL(href);
        } else {
          console.warn('Cannot open URL:', href);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[containerStyles, style]}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.7}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Link')}
      accessibilityHint={accessibilityHint || (href ? `Opens ${href}` : undefined)}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled,
      }}
      {...props}
    >
      <Text style={textStyles}>
        {children}
        {external && (
          <Text 
            style={{ 
              fontSize: textStyles.fontSize ? (textStyles.fontSize as number) * 0.8 : 12,
              opacity: 0.7 
            }}
          >
            {' ↗'}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
};