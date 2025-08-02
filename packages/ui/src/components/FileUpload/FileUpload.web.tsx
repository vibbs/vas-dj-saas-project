import React, { useRef, useState } from 'react';
import { FileUploadProps } from './types';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../Icon';

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

    // Define variant styles using theme tokens
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

    // Define size styles using theme tokens
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

    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.typography.fontFamily,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease-in-out',
        ...sizeStyles[size],
        ...variantStyles[variant],
    };

    const hoverStyles = !disabled ? {
        ':hover': {
            opacity: 0.9,
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows.sm,
        },
    } : {};

    // Add CSS animations for loading states
    React.useEffect(() => {
        const styleId = 'fileupload-animations';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
            document.head.appendChild(style);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
        if (onFileSelect) {
            onFileSelect(e.target.files);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!disabled && !loading) {
            // Trigger file input click
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
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
            <div style={{ ...baseStyles, justifyContent: 'space-between', ...style }}>
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
            <button
                style={{ ...baseStyles, ...style }}
                onClick={handleClick}
                disabled={disabled || loading}
                data-testid={testID}
                className={className}
                // Accessibility attributes (WCAG 2.1 AA compliant)
                type={type}
                role={role}
                aria-label={ariaLabel || accessibilityLabel}
                aria-describedby={ariaDescribedBy}
                aria-pressed={ariaPressed}
                aria-disabled={disabled || loading}
                aria-busy={loading}
                tabIndex={disabled ? -1 : 0}
                // Keyboard navigation support
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading) {
                        e.preventDefault();
                        // We can't directly call handleClick here as it expects a mouse event
                        // But we can trigger the file selection via the ref
                        if (fileInputRef.current) {
                            fileInputRef.current.click();
                        }
                    }
                }}
                {...props}
            >
                {loading && (
                    <span
                        style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid currentColor',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginRight: theme.spacing.xs,
                        }}
                        aria-hidden="true"
                    />
                )}
                {children}
            </button>
        </div>
    );
};
