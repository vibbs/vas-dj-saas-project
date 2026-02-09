import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStatus, useAuthAccount, useAuthActions } from '@vas-dj-saas/auth';
import { Button, Card, Text, useTheme } from '@vas-dj-saas/ui';

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logout } = useAuthActions();

  // Auth state from the store
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  // Track if we've already navigated to prevent multiple redirects
  const hasNavigated = useRef(false);

  // Derived state from account
  const user = account;
  const organization = account?.organization || null;
  const isOnTrial = organization?.onTrial || false;
  const trialDaysRemaining = organization?.trialEndsOn
    ? Math.ceil((new Date(organization.trialEndsOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const hasAdminRole = account?.role === 'admin' || account?.role === 'owner';
  const isEmailVerified = account?.isEmailVerified ?? false;

  // Redirect to landing page if unauthenticated
  // IMPORTANT: Only redirect after auth has been checked (not during 'idle' or 'authenticating')
  useEffect(() => {
    // Only proceed if we have a definitive unauthenticated status
    // 'idle' means auth is still being checked (hydration in progress)
    // 'authenticating' means login is in progress
    if (authStatus === 'unauthenticated' && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace('/');
    }
  }, [authStatus, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loading: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: 'bold',
      color: theme.colors.foreground,
    },
    noticeCard: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    emailNotice: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
      borderWidth: 1,
    },
    trialNotice: {
      backgroundColor: '#EBF8FF',
      borderColor: '#3B82F6',
      borderWidth: 1,
    },
    noticeText: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    emailNoticeText: {
      color: '#92400E',
    },
    trialNoticeText: {
      color: '#1E40AF',
    },
    cardsGrid: {
      gap: theme.spacing.lg,
    },
    card: {
      padding: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.foreground,
      marginBottom: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontWeight: '600',
      minWidth: 80,
    },
    value: {
      flex: 1,
      color: theme.colors.mutedForeground,
    },
    actionsContainer: {
      gap: theme.spacing.sm,
    },
  }), [theme]);

  // Show loading while auth is being hydrated or checked
  // This prevents the infinite loop by not rendering the dashboard until auth is determined
  if (authStatus === 'idle' || authStatus === 'authenticating') {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show loading while redirect happens
  // The useEffect above handles the actual navigation
  if (authStatus !== 'authenticated' || !user) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Button variant="outline" onPress={handleLogout}>
            Logout
          </Button>
        </View>

        {/* Email verification notice */}
        {!isEmailVerified && (
          <Card style={[styles.noticeCard, styles.emailNotice]}>
            <View style={styles.noticeText}>
              <Text style={styles.emailNoticeText}>
                Please verify your email address to access all features.{' '}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/auth/verify-email' as any)}
              >
                Verify Email
              </Button>
            </View>
          </Card>
        )}

        {/* Trial notice */}
        {isOnTrial && trialDaysRemaining !== null && (
          <Card style={[styles.noticeCard, styles.trialNotice]}>
            <View style={styles.noticeText}>
              <Text style={styles.trialNoticeText}>
                You&apos;re on a free trial! {trialDaysRemaining} days remaining.{' '}
              </Text>
              <Button variant="ghost" size="sm">
                Upgrade Now
              </Button>
            </View>
          </Card>
        )}

        <View style={styles.cardsGrid}>
          {/* User Info */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Role:</Text>
              <Text style={styles.value}>{user.role}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{user.status}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Admin:</Text>
              <Text style={styles.value}>{hasAdminRole ? 'Yes' : 'No'}</Text>
            </View>
          </Card>

          {/* Organization Info */}
          {organization && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Organization</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{organization.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Subdomain:</Text>
                <Text style={styles.value}>{organization.subdomain}.vas-dj.com</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Trial:</Text>
                <Text style={styles.value}>{organization.onTrial ? 'Yes' : 'No'}</Text>
              </View>
              {organization.trialEndsOn && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Trial Ends:</Text>
                  <Text style={styles.value}>
                    {new Date(organization.trialEndsOn).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Quick Actions */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {!isEmailVerified && (
                <Button
                  variant="primary"
                  onPress={() => router.push('/auth/verify-email' as any)}
                >
                  Verify Email
                </Button>
              )}
              <Button variant="outline">
                Account Settings
              </Button>
              {hasAdminRole && (
                <Button variant="outline">
                  Organization Settings
                </Button>
              )}
              {isOnTrial && (
                <Button variant="primary">
                  Upgrade to Pro
                </Button>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
