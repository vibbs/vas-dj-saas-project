import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStatus } from '@vas-dj-saas/auth';
import { Button, Text, Card, useTheme } from '@vas-dj-saas/ui';

export default function LandingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const authStatus = useAuthStatus();

  // Track if we've already navigated to prevent multiple redirects
  const hasNavigated = useRef(false);

  // Redirect to dashboard if already authenticated
  // IMPORTANT: Only redirect after auth has been definitively checked
  useEffect(() => {
    // Only proceed if we have a definitive authenticated status
    // 'idle' means auth is still being checked (hydration in progress)
    if (authStatus === 'authenticated' && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [authStatus, router]);

  const handleSignIn = () => {
    router.push('auth/login' as any);
  };

  const handleSignUp = () => {
    // Registration only available on web
    Alert.alert(
      'Web Only',
      'Organization registration is only available on the web app. Please contact your admin for an invitation.'
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
    },
    logo: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    tagline: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    description: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.foreground,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.lg * 1.5,
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 320,
      alignSelf: 'center',
    },
    featuresSection: {
      marginTop: theme.spacing.xl * 2,
    },
    featuresTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.foreground,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    featuresGrid: {
      gap: theme.spacing.lg,
    },
    featureCard: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: theme.typography.fontSize['2xl'],
      marginBottom: theme.spacing.sm,
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.foreground,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.base * 1.4,
    },
  });

  // Show loading while auth is being hydrated
  // This prevents the infinite loop by not showing the landing page until auth is determined
  if (authStatus === 'idle') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If authenticated, show loading while redirect happens
  if (authStatus === 'authenticated') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Redirecting to dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.logo}>VAS-DJ</Text>
          <Text style={styles.tagline}>Your Professional SaaS Platform</Text>
          <Text style={styles.description}>
            Streamline your workflow with powerful tools and insights designed for modern businesses.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSignIn}
            style={{ width: '100%' }}
          >
            Sign In
          </Button>

          <Button
            variant="outline"
            size="lg"
            onPress={handleSignUp}
            style={{ width: '100%' }}
          >
            Create Account
          </Button>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why Choose VAS-DJ?</Text>

          <View style={styles.featuresGrid}>
            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>🚀</Text>
              <Text style={styles.featureTitle}>Fast & Reliable</Text>
              <Text style={styles.featureDescription}>
                Built with modern technology for lightning-fast performance and 99.9% uptime.
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureDescription}>
                Enterprise-grade security with end-to-end encryption to protect your data.
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>Cross-Platform</Text>
              <Text style={styles.featureDescription}>
                Access your dashboard anywhere - mobile, tablet, or desktop with seamless sync.
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>14-Day Free Trial</Text>
              <Text style={styles.featureDescription}>
                Get started immediately with full access to all features. No credit card required.
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
