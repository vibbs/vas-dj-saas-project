import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  children,
  style,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  onPress,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'destructive':
        return {
          container: styles.destructiveContainer,
          text: styles.destructiveText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'md':
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
      case 'lg':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            color={variantStyles.text.color}
            size="small"
            style={styles.loader}
          />
        )}
        {typeof children === 'string' ? (
          <Text style={[variantStyles.text, sizeStyles.text]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    marginRight: 8,
  },
  
  // Variant styles
  primaryContainer: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  secondaryContainer: {
    backgroundColor: '#F2F2F7',
  },
  secondaryText: {
    color: '#000000',
    fontWeight: '600',
  },
  
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  outlineText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  destructiveContainer: {
    backgroundColor: '#FF3B30',
  },
  destructiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Size styles
  smallContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  smallText: {
    fontSize: 14,
  },
  
  mediumContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  mediumText: {
    fontSize: 16,
  },
  
  largeContainer: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeText: {
    fontSize: 18,
  },
});