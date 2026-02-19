import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginForm, useAuthActions, useAuthStatus } from '@vas-dj-saas/auth';
import type { LoginCredentials } from '@vas-dj-saas/api-client';
import { Text, Heading, useTheme } from '@vas-dj-saas/ui';
import { StatusBar } from 'expo-status-bar';

/**
 * Mobile Login Page
 * Allows users to sign in to their account
 * Note: Organization registration is only available via web app
 */
export default function LoginPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { login } = useAuthActions();
    const authStatus = useAuthStatus();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation value for subtle card entrance
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    // Redirect authenticated users to main app
    useEffect(() => {
        if (authStatus === 'authenticated') {
            router.replace('/(tabs)');
        }
    }, [authStatus, router]);

    // Entrance animation
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [authStatus, fadeAnim, slideAnim]);

    const handleSubmit = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            await login(credentials.email, credentials.password);
            // Navigation handled by useEffect above
        } catch (err: any) {
            console.error('Login error:', err);

            // Extract error message
            let errorMessage = 'Invalid email or password. Please try again.';

            // Check if it's a user not found error
            if (
                err?.message?.toLowerCase().includes('user') &&
                (err?.message?.toLowerCase().includes('not found') ||
                    err?.message?.toLowerCase().includes('does not exist'))
            ) {
                errorMessage =
                    'Account not found. Please contact your organization admin to receive an invitation.';
            } else if (err?.response?.status === 404) {
                errorMessage =
                    'Account not found. Please contact your organization admin to receive an invitation.';
            } else if (err?.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
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
            // Shadow for iOS
            shadowColor: theme.colors.foreground,
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.1,
            shadowRadius: 25,
            // Shadow for Android
            elevation: 10,
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        logoText: {
            fontSize: 32,
            fontWeight: '700',
            color: theme.colors.primary,
            letterSpacing: -0.5,
        },
        header: {
            marginBottom: theme.spacing.xl,
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
        infoBox: {
            padding: theme.spacing.md,
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: theme.borders.radius.md,
            marginBottom: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.primary + '20', // 20% opacity
        },
        infoText: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.primary,
            textAlign: 'center',
            lineHeight: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        loadingText: {
            color: theme.colors.mutedForeground,
            fontSize: theme.typography.fontSize.base,
        },
        spinnerContainer: {
            width: 48,
            height: 48,
            borderRadius: theme.borders.radius.full,
            backgroundColor: theme.colors.primaryMuted,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        spinnerDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
        },
    });

    // Show loading while checking auth status
    if (authStatus === 'authenticating' || authStatus === 'authenticated') {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar style="auto" />
                <View style={styles.spinnerContainer}>
                    <View style={styles.spinnerDot} />
                </View>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar style="auto" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.cardContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.cardWrapper}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>VAS-DJ</Text>
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Heading level={1} style={styles.title}>
                                Welcome Back
                            </Heading>
                            <Text style={styles.subtitle}>
                                Sign in to your account to continue
                            </Text>
                        </View>

                        {/* Info Message for Mobile Users */}
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                Organization registration is available on the web app. Contact your admin for an invitation.
                            </Text>
                        </View>

                        {/* Login Form */}
                        <LoginForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            error={error}
                            showRememberMe={true}
                            showForgotPassword={false}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
