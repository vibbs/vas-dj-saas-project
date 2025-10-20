import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card, useTheme } from '@vas-dj-saas/ui';

export default function LandingScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Disable auth check to test theme provider
  // const [authChecked, setAuthChecked] = React.useState(false);

  // React.useEffect(() => {
  //   // Simple timeout to simulate auth check
  //   const timer = setTimeout(() => {
  //     setAuthChecked(true);
  //   }, 100);
  //   
  //   return () => clearTimeout(timer);
  // }, []);

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

  // Disable loading state for testing
  // if (!authChecked) {
  //   return (
  //     <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

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