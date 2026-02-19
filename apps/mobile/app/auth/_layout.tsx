import { Stack } from 'expo-router';
import React from 'react';

/**
 * Auth Layout
 * Stack navigation for authentication screens
 */
export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="login" options={{ title: 'Sign In' }} />
            <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
        </Stack>
    );
}
