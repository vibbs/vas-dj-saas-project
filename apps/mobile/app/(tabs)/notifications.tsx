import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuthStatus } from '@vas-dj-saas/auth';
import { Text, Card, useTheme } from '@vas-dj-saas/ui';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const authStatus = useAuthStatus();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      // Will be wired to real API when backend is running
      setNotifications([
        {
          id: '1',
          title: 'Welcome!',
          message: 'Welcome to VAS-DJ. Get started by completing your profile.',
          category: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Team Update',
          message: 'Your organization settings have been updated.',
          category: 'team',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchNotifications();
    }
  }, [authStatus, fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
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
        listContent: {
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
        card: {
          padding: theme.spacing.md,
        },
        unread: {
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
        },
        notificationTitle: {
          fontSize: theme.typography.fontSize.base,
          fontWeight: '600',
          color: theme.colors.foreground,
          marginBottom: theme.spacing.xs,
        },
        notificationMessage: {
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.mutedForeground,
          marginBottom: theme.spacing.xs,
        },
        category: {
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.primary,
          textTransform: 'uppercase',
        },
        empty: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        },
        emptyText: {
          color: theme.colors.mutedForeground,
          fontSize: theme.typography.fontSize.base,
        },
      }),
    [theme]
  );

  if (authStatus !== 'authenticated') {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Please log in to view notifications.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markAsRead(item.id)}>
            <Card style={[styles.card, !item.isRead && styles.unread]}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
