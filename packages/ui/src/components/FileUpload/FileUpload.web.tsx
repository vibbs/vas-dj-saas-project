import React, { useRef, useState } from 'react';
import { FileUploadProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../Icon';
import { Button } from '../Button';

export const FileUpload: React.FC<FileUploadProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    className,
    testID,
    // File upload specific props
    onFileSelect,
    accept,
    multiple = false,
    maxFileSize,
    // Accessibility props
    accessibilityLabel,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-pressed': ariaPressed,
    role = 'button',
    type = 'button',
    style,
    ...props
}) => {
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);

    // Define variant styles for file display (still needed for the file display UI)
    const variantStyles = {
        primary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.primaryForeground,
            border: `1px solid ${theme.colors.primary}`,
        },
        secondary: {
            backgroundColor: theme.colors.secondary,
            color: theme.colors.secondaryForeground,
            border: `1px solid ${theme.colors.border}`,
        },
        outline: {
            backgroundColor: 'transparent',
            color: theme.colors.primary,
            border: `1px solid ${theme.colors.primary}`,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: theme.colors.foreground,
            border: '1px solid transparent',
        },
        destructive: {
            backgroundColor: theme.colors.destructive,
            color: theme.colors.destructiveForeground,
            border: `1px solid ${theme.colors.destructive}`,
        },
    };

    // Size styles for file display UI
    const sizeStyles = {
        sm: {
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            fontSize: theme.typography.fontSize.sm,
            borderRadius: theme.borders.radius.sm,
        },
        md: {
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            fontSize: theme.typography.fontSize.base,
            borderRadius: theme.borders.radius.md,
        },
        lg: {
            padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
            fontSize: theme.typography.fontSize.lg,
            borderRadius: theme.borders.radius.lg,
        },
    };

    const fileDisplayStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
        if (onFileSelect) {
            onFileSelect(e.target.files);
        }
    };

    const handleClick = () => {
        if (!disabled && !loading) {
            // Trigger file input click
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
            // Call onClick callback
            onClick?.();
        }
    };

    const handleClear = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (file) {
        return (
            <div style={{ ...fileDisplayStyles, justifyContent: 'space-between', ...style }}>
                <Icon name="File" size={20} color={variantStyles[variant].color} />
                <span style={{ flex: 1, marginLeft: theme.spacing.sm }}>{file.name}</span>
                <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Icon name="X" size={20} color={variantStyles[variant].color} />
                </button>
            </div>
        );
    }

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={accept}
                multiple={multiple}
                disabled={disabled || loading}
                style={{ display: 'none' }}
                data-testid={`${testID}-input`}
            />
            <Button
                variant={variant}
                size={size}
                disabled={disabled}
                loading={loading}
                onClick={handleClick}
                testID={testID}
                className={className}
                style={style}
                type={type}
                role={role}
                aria-label={ariaLabel || accessibilityLabel}
                aria-describedby={ariaDescribedBy}
                aria-pressed={ariaPressed}
                {...props}
            >
                {children}
            </Button>
        </div>
    );
};
