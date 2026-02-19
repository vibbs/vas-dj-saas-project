import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStatus } from '@vas-dj-saas/auth';
import { Text, useTheme } from '@vas-dj-saas/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
  onPress?: () => void;
}

function FeatureCard({ icon, title, description, delay, onPress }: FeatureCardProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borders.radius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: theme.borders.radius.lg,
      backgroundColor: theme.colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      alignSelf: 'center',
    },
    icon: {
      fontSize: 28,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.cardForeground,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.sm * 1.5,
    },
  });

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={animatedStyle}
    >
      <View style={cardStyles.card}>
        <View style={cardStyles.iconContainer}>
          <Text style={cardStyles.icon}>{icon}</Text>
        </View>
        <Text style={cardStyles.title}>{title}</Text>
        <Text style={cardStyles.description}>{description}</Text>
      </View>
    </AnimatedPressable>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const authStatus = useAuthStatus();

  // Track if we've already navigated to prevent multiple redirects
  const hasNavigated = useRef(false);

  // Animation values
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(-20);
  const taglineOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Start animations on mount
  useEffect(() => {
    // Hero text animation
    heroOpacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
    heroTranslateY.value = withDelay(100, withSpring(0, { damping: 12, stiffness: 100 }));

    // Tagline fade in
    taglineOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    // Description fade in
    descriptionOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

    // Buttons slide up
    buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    buttonsTranslateY.value = withDelay(700, withSpring(0, { damping: 15, stiffness: 100 }));

    // Pulsing glow effect
    glowScale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authStatus === 'authenticated' && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [authStatus, router]);

  const handleSignIn = () => {
    router.push('auth/login' as any);
  };

  const handleSignUp = () => {
    Alert.alert(
      'Web Only',
      'Organization registration is only available on the web app. Please contact your admin for an invitation.'
    );
  };

  const handleFeaturePress = (feature: string) => {
    Alert.alert(
      feature,
      `Learn more about ${feature.toLowerCase()} on our website.`
    );
  };

  // Animated styles
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

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
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing['2xl'],
    },
    // Hero section with gradient effect
    heroSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
      position: 'relative',
    },
    heroGradientTop: {
      position: 'absolute',
      top: -100,
      left: -50,
      right: -50,
      height: 300,
      backgroundColor: theme.colors.primaryMuted,
      opacity: 0.5,
      borderRadius: 150,
    },
    heroGlow: {
      position: 'absolute',
      top: -80,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.primary,
    },
    heroContent: {
      zIndex: 1,
      alignItems: 'center',
    },
    logo: {
      fontSize: theme.typography.fontSize['5xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
      letterSpacing: 2,
    },
    logoAccent: {
      fontSize: theme.typography.fontSize['5xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.accent,
    },
    tagline: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    description: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.foreground,
      textAlign: 'center',
      lineHeight: theme.typography.fontSize.base * 1.6,
      marginBottom: theme.spacing.xl,
      maxWidth: 340,
      paddingHorizontal: theme.spacing.md,
    },
    // Buttons
    buttonContainer: {
      gap: theme.spacing.md,
      width: '100%',
      maxWidth: 320,
      alignSelf: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borders.radius.lg,
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: theme.colors.primaryForeground,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: theme.borders.radius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.md + 2,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.colors.foreground,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.medium,
    },
    // Features section
    featuresSection: {
      marginTop: theme.spacing.xl,
    },
    featuresHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    featuresTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.foreground,
      textAlign: 'center',
    },
    featuresDivider: {
      height: 3,
      width: 40,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.borders.radius.full,
    },
    featuresGrid: {
      gap: theme.spacing.md,
    },
    featuresRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    featureCardWrapper: {
      flex: 1,
    },
    // Footer
    footer: {
      marginTop: theme.spacing['2xl'],
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
    },
    loadingText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.mutedForeground,
    },
  });

  // Show loading while auth is being hydrated
  if (authStatus === 'idle') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If authenticated, show loading while redirect happens
  if (authStatus === 'authenticated') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Redirecting to dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient Effect */}
        <View style={styles.heroSection}>
          {/* Background gradient layers */}
          <View style={styles.heroGradientTop} />
          <Animated.View style={[styles.heroGlow, glowAnimatedStyle]} />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Animated.View style={heroAnimatedStyle}>
              <Text style={styles.logo}>
                VAS<Text style={styles.logoAccent}>-</Text>DJ
              </Text>
            </Animated.View>

            <Animated.View style={taglineAnimatedStyle}>
              <Text style={styles.tagline}>Your Professional SaaS Platform</Text>
            </Animated.View>

            <Animated.View style={descriptionAnimatedStyle}>
              <Text style={styles.description}>
                Streamline your workflow with powerful tools and insights designed for modern businesses.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonsAnimatedStyle]}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleSignIn}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7, backgroundColor: theme.colors.muted }
            ]}
            onPress={handleSignUp}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Pressable>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresHeader}>
            <View style={styles.featuresDivider} />
            <Text style={styles.featuresTitle}>Why Choose VAS-DJ?</Text>
            <View style={styles.featuresDivider} />
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featuresRow}>
              <View style={styles.featureCardWrapper}>
                <FeatureCard
                  icon="🚀"
                  title="Fast & Reliable"
                  description="Lightning-fast performance with 99.9% uptime."
                  delay={900}
                  onPress={() => handleFeaturePress('Fast & Reliable')}
                />
              </View>
              <View style={styles.featureCardWrapper}>
                <FeatureCard
                  icon="🔒"
                  title="Secure"
                  description="Enterprise-grade security for your data."
                  delay={1000}
                  onPress={() => handleFeaturePress('Secure & Private')}
                />
              </View>
            </View>

            <View style={styles.featuresRow}>
              <View style={styles.featureCardWrapper}>
                <FeatureCard
                  icon="📱"
                  title="Cross-Platform"
                  description="Access anywhere with seamless sync."
                  delay={1100}
                  onPress={() => handleFeaturePress('Cross-Platform')}
                />
              </View>
              <View style={styles.featureCardWrapper}>
                <FeatureCard
                  icon="⚡"
                  title="Free Trial"
                  description="14 days of full access. No credit card."
                  delay={1200}
                  onPress={() => handleFeaturePress('14-Day Free Trial')}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 VAS-DJ. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
