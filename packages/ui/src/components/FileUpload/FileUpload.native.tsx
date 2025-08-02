import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, Platform, View } from 'react-native';
import { FileUploadProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../Icon';

export const FileUpload: React.FC<FileUploadProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onPress,
    style,
    testID,
    // File upload specific props
    onFileSelect,
    accept,
    multiple = false,
    maxFileSize,
    // Accessibility props
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = 'button' as const,
    // Filter out web-specific props
    className,
    onClick,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-pressed': ariaPressed,
    role,
    type,
    ...props
}) => {
    const { theme } = useTheme();
    const [file, setFile] = useState<any>(null);

    // Define variant styles using theme tokens
    const variantStyles = {
        primary: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        secondary: {
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.border,
        },
        outline: {
            backgroundColor: 'transparent',
            borderColor: theme.colors.primary,
        },
        ghost: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
        },
        destructive: {
            backgroundColor: theme.colors.destructive,
            borderColor: theme.colors.destructive,
        },
    };

    const variantTextStyles = {
        primary: { color: theme.colors.primaryForeground },
        secondary: { color: theme.colors.secondaryForeground },
        outline: { color: theme.colors.primary },
        ghost: { color: theme.colors.foreground },
        destructive: { color: theme.colors.destructiveForeground },
    };

    // Define size styles using theme tokens
    const sizeStyles = {
        sm: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            borderRadius: theme.borders.radius.sm,
        },
        md: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borders.radius.md,
        },
        lg: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borders.radius.lg,
        },
    };

    const sizeTextStyles = {
        sm: { fontSize: theme.typography.fontSize.sm },
        md: { fontSize: theme.typography.fontSize.base },
        lg: { fontSize: theme.typography.fontSize.lg },
    };

    const baseStyles: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        opacity: disabled ? 0.5 : 1,
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    const textStyles: TextStyle = {
        fontFamily: theme.typography.fontFamily,
        fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'],
        ...sizeTextStyles[size],
        ...variantTextStyles[variant],
    };

    // For React Native, we'll simulate file selection behavior
    const handlePress = () => {
        if (!disabled && !loading) {
            // In a real implementation, this would trigger the file selection dialog
            // For now we just call the onPress handler
            onPress?.();
            // Simulate file selection
            setFile({ name: 'example-file.png' });
        }
    };

    const handleClear = () => {
        setFile(null);
    };

    if (file) {
        return (
            <View style={[baseStyles, { justifyContent: 'space-between' }, style]}>
                <Icon name="File" size={20} color={variantTextStyles[variant].color} />
                <Text style={[textStyles, { flex: 1, marginLeft: theme.spacing.sm }]}>{file.name}</Text>
                <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
                    <Icon name="X" size={20} color={variantTextStyles[variant].color} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[baseStyles, style]}
            onPress={handlePress}
            disabled={disabled || loading}
            testID={testID}
            activeOpacity={0.8}
            // React Native accessibility (WCAG 2.1 AA compliant)
            accessible={true}
            accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'File Upload')}
            accessibilityHint={accessibilityHint}
            accessibilityRole={accessibilityRole}
            accessibilityState={{
                disabled: disabled || loading,
                busy: loading,
            }}
            {...props}
        >
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={variantTextStyles[variant].color}
                    style={{ marginRight: theme.spacing.xs }}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants"
                />
            )}
            <Text style={textStyles}>{children}</Text>
        </TouchableOpacity>
    );
};
