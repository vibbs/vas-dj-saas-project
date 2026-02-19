import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthAccount, useAuthActions, useAuthStatus } from '@vas-dj-saas/auth';
import { Text, Card, Button, useTheme } from '@vas-dj-saas/ui';

interface SettingsRow {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logout } = useAuthActions();
  const authStatus = useAuthStatus();
  const account = useAuthAccount();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        header: {
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.xl * 2,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        title: {
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: 'bold',
          color: theme.colors.foreground,
        },
        scrollContent: {
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
        },
        sectionTitle: {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: '600',
          color: theme.colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.sm,
        },
        card: {
          overflow: 'hidden',
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        lastRow: {
          borderBottomWidth: 0,
        },
        rowLabel: {
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.foreground,
        },
        rowValue: {
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.mutedForeground,
        },
        destructiveLabel: {
          color: theme.colors.destructive,
        },
        logoutSection: {
          marginTop: theme.spacing.lg,
        },
        empty: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        },
        emptyText: {
          color: theme.colors.mutedForeground,
        },
        version: {
          textAlign: 'center',
          color: theme.colors.mutedForeground,
          fontSize: theme.typography.fontSize.xs,
          marginTop: theme.spacing.lg,
        },
      }),
    [theme]
  );

  if (authStatus !== 'authenticated' || !account) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Please log in to view settings.</Text>
      </View>
    );
  }

  const profileSection: SettingsRow[] = [
    { label: 'Name', value: account.fullName || 'Not set' },
    { label: 'Email', value: account.email },
    { label: 'Role', value: account.role || 'Member' },
    {
      label: 'Email Verified',
      value: account.isEmailVerified ? 'Yes' : 'No',
    },
  ];

  const appSection: SettingsRow[] = [
    { label: 'Notifications', onPress: () => router.push('/(tabs)/notifications') },
    { label: 'Appearance', value: 'System' },
    { label: 'Language', value: 'English' },
  ];

  const renderRow = (row: SettingsRow, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.row, isLast && styles.lastRow]}
      onPress={row.onPress}
      disabled={!row.onPress}
    >
      <Text style={[styles.rowLabel, row.destructive && styles.destructiveLabel]}>
        {row.label}
      </Text>
      {row.value && <Text style={styles.rowValue}>{row.value}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Card style={styles.card}>
            {profileSection.map((row, i) =>
              renderRow(row, i, i === profileSection.length - 1)
            )}
          </Card>
        </View>

        {/* App Section */}
        <View>
          <Text style={styles.sectionTitle}>App</Text>
          <Card style={styles.card}>
            {appSection.map((row, i) =>
              renderRow(row, i, i === appSection.length - 1)
            )}
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.logoutSection}>
          <Button variant="destructive" onPress={handleLogout}>
            Sign Out
          </Button>
        </View>

        <Text style={styles.version}>VAS-DJ v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
