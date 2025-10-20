import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginForm, useAuthActions, useAuthStatus } from '@vas-dj-saas/auth';
import type { LoginCredentials } from '@vas-dj-saas/api-client';
import { Card, Text, Heading, useTheme } from '@vas-dj-saas/ui';
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

    // Redirect authenticated users to main app
    useEffect(() => {
        if (authStatus === 'authenticated') {
            router.replace('/(tabs)');
        }
    }, [authStatus, router]);

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
        header: {
            marginBottom: theme.spacing.xl,
            alignItems: 'center',
        },
        title: {
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        subtitle: {
            textAlign: 'center',
            color: theme.colors.mutedForeground,
        },
        infoBox: {
            padding: theme.spacing.md,
            backgroundColor: theme.colors.muted,
            borderRadius: theme.borders.radius.md,
            marginBottom: theme.spacing.lg,
        },
        infoText: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.mutedForeground,
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    // Show loading while checking auth status
    if (authStatus === 'authenticating' || authStatus === 'authenticated') {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={{ color: theme.colors.mutedForeground }}>Loading...</Text>
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
            >
                <View style={styles.cardContainer}>
                    <View style={styles.header}>
                        <Heading level={1} style={styles.title}>
                            Welcome Back
                        </Heading>
                        <Text style={styles.subtitle}>
                            Sign in to your account to continue
                        </Text>
                    </View>

                    <Card>
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
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
