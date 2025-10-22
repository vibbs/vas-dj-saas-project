import React from 'react';
import { View, Text } from 'react-native';

/**
 * ShallowTabs - Web Only Component
 * 
 * This component requires Next.js navigation hooks and is not available on React Native.
 * Use native navigation patterns (React Navigation) for mobile apps instead.
 */
export const ShallowTabs: React.FC<any> = () => {
    return (
        <View style={{ padding: 16, backgroundColor: '#FFF3CD', borderRadius: 8, margin: 16 }}>
            <Text style={{ color: '#856404', fontWeight: 'bold', marginBottom: 8 }}>
                ⚠️ Web-Only Component
            </Text>
            <Text style={{ color: '#856404', fontSize: 12 }}>
                ShallowTabs is a web-only component that requires Next.js navigation.
                {'\n\n'}
                For React Native apps, use React Navigation's Tab Navigator instead:
                {'\n'}
                https://reactnavigation.org/docs/tab-based-navigation
            </Text>
        </View>
    );
};
