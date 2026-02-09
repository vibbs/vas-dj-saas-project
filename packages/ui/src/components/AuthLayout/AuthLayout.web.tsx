import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { AuthLayoutProps } from './types';
import { Heading } from '../Heading';

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  maxWidth = 'sm',
  className,
  style,
}) => {
  const { theme } = useTheme();

  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return '400px';
      case 'md':
        return '500px';
      case 'lg':
        return '600px';
      default:
        return '400px';
    }
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily,
  };

  const cardStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidth(),
    backgroundColor: theme.colors.card,
    borderRadius: theme.borders.radius.lg,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: `1px solid ${theme.colors.border}`,
    padding: theme.spacing.xl,
  };

  const logoStyles: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
  };

  const logoTextStyles: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    textDecoration: 'none',
    letterSpacing: '-0.025em',
  };

  const headerStyles: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: theme.spacing.xl,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  };

  return (
    <div className={className} style={{ ...containerStyles, ...style }}>
      <div style={cardStyles}>
        {showLogo && (
          <div style={logoStyles}>
            <span style={logoTextStyles}>VAS-DJ</span>
          </div>
        )}
        
        <div style={headerStyles}>
          <Heading level={1} variant="title" style={{ marginBottom: 0 }}>
            {title}
          </Heading>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
        
        {children}
      </div>
    </div>
  );
};