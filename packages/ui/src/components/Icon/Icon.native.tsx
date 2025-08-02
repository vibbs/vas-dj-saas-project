import React from 'react';
import Svg from 'react-native-svg';
import * as LucideIcons from 'lucide-react-native';
import { IconProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';

type LucideIconName = keyof typeof LucideIcons;

export const Icon: React.FC<IconProps> = ({
  children,
  name,
  size = 'md',
  color,
  fill,
  stroke,
  strokeWidth = 1.5,
  viewBox = '0 0 24 24',
  width,
  height,
  style,
  testID,
  // Accessibility props
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'image' as const,
  onPress,
  // Filter out web-specific props that don't apply to React Native
  className,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-hidden': ariaHidden,
  role,
  alt,
  title,
  svgFile: SvgFile,
  ...props
}) => {
  const { theme } = useTheme();

  // Define size mapping
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  // Get actual size value
  const actualSize = typeof size === 'number' ? size : sizeMap[size];

  // Use provided dimensions or fall back to size
  const finalWidth = width || actualSize;
  const finalHeight = height || actualSize;

  // Determine colors with theme fallbacks
  const iconColor = color || theme.colors.foreground;
  const iconFill = fill || 'none';
  const iconStroke = stroke || iconColor;

  const baseStyles: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  };

  // Custom SVG file takes priority
  if (SvgFile) {
    return (
      <SvgFile
        width={finalWidth}
        height={finalHeight}
        fill={iconColor}
        testID={testID}
        {...props}
      />
    );
  }

  // Icon name to SVG path mapping for React Native using react-native-svg
  const renderNamedIcon = () => {
    const IconComponent = LucideIcons[name as LucideIconName] as React.ComponentType<any>;
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in Lucide icons.`);
      return null;
    }
    return (
      <IconComponent
        width={finalWidth}
        height={finalHeight}
        fill={iconFill}
        stroke={iconStroke}
        strokeWidth={strokeWidth}
        testID={testID}
        style={baseStyles}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || (name ? `${name} icon` : 'Icon')}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        {...props}
      />
    );
  };

  const renderSvgIcon = () => (
    <Svg
      width={finalWidth}
      height={finalHeight}
      viewBox={viewBox}
      fill={iconFill}
      stroke={iconStroke}
      strokeWidth={strokeWidth}
      testID={testID}
      // React Native accessibility (WCAG 2.1 AA compliant)
      accessible={true}
      accessibilityLabel={accessibilityLabel || (name ? `${name} icon` : 'Icon')}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {name ? renderNamedIcon() : children}
    </Svg>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={baseStyles}
        onPress={onPress}
        testID={`${testID}-touchable`}
        activeOpacity={0.7}
        // React Native accessibility (WCAG 2.1 AA compliant)
        accessible={true}
        accessibilityLabel={accessibilityLabel || (name ? `${name} button` : 'Icon button')}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        {renderSvgIcon()}
      </TouchableOpacity>
    );
  }

  return renderSvgIcon();
};