import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AuthLayoutProps } from './types';

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  maxWidth = 'sm',
  style,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing['2xl'],
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoText: {
      fontSize: 32,
      fontWeight: theme.typography.fontWeight.bold as any,
      color: theme.colors.primary,
      letterSpacing: -0.5,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.semibold as any,
      color: theme.colors.foreground,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>VAS-DJ</Text>
            </View>
          )}
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          
          {children}
        </View>
      </ScrollView>
    </View>
  );
};