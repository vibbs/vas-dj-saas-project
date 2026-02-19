import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthService } from '@vas-dj-saas/api-client';
import { Text, Heading, useTheme } from '@vas-dj-saas/ui';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

/**
 * Animated Checkmark Component
 * Displays a success checkmark with pulsing glow effect
 */
function AnimatedCheckmark() {
    const { theme } = useTheme();

    const scale = useSharedValue(0);
    const checkProgress = useSharedValue(0);
    const glowScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.5);

    useEffect(() => {
        // Circle scale animation
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });

        // Checkmark drawing animation
        checkProgress.value = withDelay(
            300,
            withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
        );

        // Pulsing glow effect
        glowScale.value = withRepeat(
            withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        glowOpacity.value = withRepeat(
            withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: glowOpacity.value,
    }));

    const styles = StyleSheet.create({
        container: {
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.lg,
        },
        glow: {
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.success || theme.colors.primary,
        },
        circle: {
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.success || theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <View style={styles.circle}>
                <Svg width={40} height={40} viewBox="0 0 24 24">
                    <Path
                        d="M5 13l4 4L19 7"
                        stroke={theme.colors.successForeground || theme.colors.primaryForeground}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </Svg>
            </View>
        </Animated.View>
    );
}

/**
 * Animated Error Icon Component
 * Displays an X icon for error states
 */
function AnimatedErrorIcon() {
    const { theme } = useTheme();

    const scale = useSharedValue(0);
    const rotation = useSharedValue(-180);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        rotation.value = withSpring(0, { damping: 15, stiffness: 200 });
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    }));

    const styles = StyleSheet.create({
        container: {
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
        },
        background: {
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.destructive || '#EF4444',
            opacity: 0.15,
        },
    });

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.background} />
            <Svg width={32} height={32} viewBox="0 0 24 24">
                <Path
                    d="M6 18L18 6M6 6l12 12"
                    stroke={theme.colors.destructive || '#EF4444'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </Svg>
        </Animated.View>
    );
}

/**
 * Animated Warning Icon Component
 * Displays a warning triangle for error states
 */
function AnimatedWarningIcon() {
    const { theme } = useTheme();

    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const styles = StyleSheet.create({
        container: {
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
        },
        background: {
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.warning || '#F59E0B',
            opacity: 0.15,
        },
    });

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.background} />
            <Svg width={32} height={32} viewBox="0 0 24 24">
                <Path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke={theme.colors.warning || '#F59E0B'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </Svg>
        </Animated.View>
    );
}

/**
 * Animated Spinner Component
 * Loading indicator with rotation animation
 */
function AnimatedSpinner() {
    const { theme } = useTheme();

    const rotation = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withTiming(1, { duration: 300 });
        rotation.value = withRepeat(
            withTiming(360, { duration: 1000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const spinnerStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    const styles = StyleSheet.create({
        container: {
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
        },
        spinner: {
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 3,
            borderColor: theme.colors.border,
            borderTopColor: theme.colors.primary,
        },
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.spinner, spinnerStyle]} />
        </View>
    );
}

/**
 * Confetti Particle Component
 * Individual animated confetti particle for celebration effect
 */
function ConfettiParticle({ delay, startX, color }: { delay: number; startX: number; color: string }) {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        const randomXOffset = (Math.random() - 0.5) * 100;

        opacity.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 200 }),
                withDelay(1400, withTiming(0, { duration: 400 }))
            )
        );

        translateY.value = withDelay(
            delay,
            withTiming(-160, { duration: 2000, easing: Easing.out(Easing.quad) })
        );

        translateX.value = withDelay(
            delay,
            withTiming(randomXOffset, { duration: 2000, easing: Easing.out(Easing.quad) })
        );

        scale.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 200 }),
                withDelay(1400, withTiming(0.5, { duration: 400 }))
            )
        );

        rotation.value = withDelay(
            delay,
            withTiming(360, { duration: 2000, easing: Easing.linear })
        );
    }, []);

    const particleStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                    left: `${startX}%`,
                    top: '50%',
                },
                particleStyle,
            ]}
        />
    );
}

/**
 * Celebration Effect Component
 * Displays animated confetti particles on success
 */
function CelebrationEffect() {
    const { theme } = useTheme();

    const colors = [
        theme.colors.primary,
        theme.colors.success || theme.colors.primary,
        theme.colors.accent || theme.colors.primary,
        '#A78BFA',
        '#34D399',
    ];

    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: Math.random() * 500,
        startX: 20 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
    }));

    return (
        <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
            {particles.map((particle) => (
                <ConfettiParticle key={particle.id} {...particle} />
            ))}
        </View>
    );
}

/**
 * Mobile Email Verification Screen
 * Handles email verification via token from route params
 */
export default function VerifyEmailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams<{ token?: string }>();

    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [error, setError] = useState<string | null>(null);

    // Animation values
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(20);

    const token = params.token;

    const verifyEmail = useCallback(
        async (verificationToken: string) => {
            setStatus('loading');
            setError(null);

            try {
                const response = await AuthService.verifyEmail({ token: verificationToken });

                if (response.status === 200) {
                    setStatus('success');

                    // Redirect to login after a short delay
                    setTimeout(() => {
                        router.replace('/auth/login');
                    }, 3000);
                } else {
                    throw new Error('Verification failed');
                }
            } catch (err: any) {
                console.error('Email verification error:', err);

                const errorMessage =
                    err?.data?.detail ||
                    err?.data?.message ||
                    err?.message ||
                    'Unable to verify your email. The link may be invalid or expired.';

                setError(errorMessage);
                setStatus('error');
            }
        },
        [router]
    );

    useEffect(() => {
        // Entrance animation
        fadeAnim.value = withTiming(1, { duration: 400 });
        slideAnim.value = withTiming(0, { duration: 400 });

        if (!token) {
            setStatus('no-token');
            return;
        }

        verifyEmail(token);
    }, [token, verifyEmail]);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ translateY: slideAnim.value }],
    }));

    const handleGoToLogin = () => {
        router.replace('/auth/login');
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
        cardContainer: {
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
        },
        cardWrapper: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.foreground,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 25,
            elevation: 10,
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        logoText: {
            fontSize: 32,
            fontWeight: '700',
            color: theme.colors.primary,
            letterSpacing: -0.5,
        },
        header: {
            marginBottom: theme.spacing.lg,
            alignItems: 'center',
        },
        title: {
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
            color: theme.colors.foreground,
        },
        subtitle: {
            textAlign: 'center',
            color: theme.colors.mutedForeground,
            fontSize: theme.typography.fontSize.base,
            lineHeight: 24,
        },
        content: {
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            position: 'relative',
            overflow: 'visible',
        },
        messageText: {
            textAlign: 'center',
            color: theme.colors.foreground,
            fontSize: theme.typography.fontSize.base,
            marginBottom: theme.spacing.sm,
        },
        mutedText: {
            textAlign: 'center',
            color: theme.colors.mutedForeground,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing.lg,
        },
        errorBox: {
            backgroundColor: (theme.colors.destructive || '#EF4444') + '15',
            borderWidth: 1,
            borderColor: theme.colors.destructive || '#EF4444',
            borderRadius: theme.borders.radius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            width: '100%',
        },
        errorText: {
            color: theme.colors.destructive || '#EF4444',
            fontSize: theme.typography.fontSize.sm,
            textAlign: 'center',
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borders.radius.md,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            alignItems: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        primaryButtonText: {
            color: theme.colors.primaryForeground,
            fontSize: theme.typography.fontSize.base,
            fontWeight: '600',
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            borderRadius: theme.borders.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            alignItems: 'center',
            marginTop: theme.spacing.sm,
        },
        secondaryButtonText: {
            color: theme.colors.foreground,
            fontSize: theme.typography.fontSize.base,
            fontWeight: '500',
        },
        buttonRow: {
            flexDirection: 'column',
            gap: theme.spacing.sm,
            width: '100%',
        },
    });

    // No token provided
    if (status === 'no-token') {
        return (
            <View style={styles.container}>
                <StatusBar style="auto" />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
                        <View style={styles.cardWrapper}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.logoText}>VAS-DJ</Text>
                            </View>

                            <View style={styles.header}>
                                <Heading level={1} style={styles.title}>
                                    Check Your Email
                                </Heading>
                                <Text style={styles.subtitle}>
                                    Open the verification link from your email
                                </Text>
                            </View>

                            <View style={styles.content}>
                                <AnimatedErrorIcon />

                                <Text style={styles.mutedText}>
                                    If you haven't received an email, check your spam folder or request a new verification link after logging in.
                                </Text>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                                    ]}
                                    onPress={handleGoToLogin}
                                >
                                    <Text style={styles.primaryButtonText}>Go to Login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }

    // Loading state
    if (status === 'loading') {
        return (
            <View style={styles.container}>
                <StatusBar style="auto" />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
                        <View style={styles.cardWrapper}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.logoText}>VAS-DJ</Text>
                            </View>

                            <View style={styles.header}>
                                <Heading level={1} style={styles.title}>
                                    Verifying Email
                                </Heading>
                                <Text style={styles.subtitle}>
                                    Please wait while we verify your email address
                                </Text>
                            </View>

                            <View style={styles.content}>
                                <AnimatedSpinner />
                                <Text style={styles.mutedText}>
                                    Verifying your email address...
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <View style={styles.container}>
                <StatusBar style="auto" />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
                        <View style={styles.cardWrapper}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.logoText}>VAS-DJ</Text>
                            </View>

                            <View style={styles.header}>
                                <Heading level={1} style={styles.title}>
                                    Email Verified!
                                </Heading>
                                <Text style={styles.subtitle}>
                                    Your email has been successfully verified
                                </Text>
                            </View>

                            <View style={[styles.content, { overflow: 'hidden', minHeight: 200 }]}>
                                <CelebrationEffect />
                                <AnimatedCheckmark />

                                <Text style={styles.messageText}>
                                    Your email address has been verified successfully.
                                </Text>

                                <Text style={styles.mutedText}>Redirecting to login...</Text>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                                    ]}
                                    onPress={handleGoToLogin}
                                >
                                    <Text style={styles.primaryButtonText}>Continue to Login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }

    // Error state
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
                    <View style={styles.cardWrapper}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>VAS-DJ</Text>
                        </View>

                        <View style={styles.header}>
                            <Heading level={1} style={styles.title}>
                                Verification Failed
                            </Heading>
                            <Text style={styles.subtitle}>
                                We couldn't verify your email
                            </Text>
                        </View>

                        <View style={styles.content}>
                            <AnimatedWarningIcon />

                            {error && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <Text style={styles.mutedText}>
                                The verification link may have expired or already been used. You can
                                request a new verification email after logging in.
                            </Text>

                            <View style={styles.buttonRow}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                                    ]}
                                    onPress={handleGoToLogin}
                                >
                                    <Text style={styles.primaryButtonText}>Go to Login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
