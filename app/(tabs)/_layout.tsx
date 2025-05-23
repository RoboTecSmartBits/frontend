// app/%28tabs%29/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

export default function TabLayout() {
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                router.replace('/auth');
            }
        };

        checkToken();
    }, [router]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        // No redirect to /auth or state management
    };

    return (
        <Tabs screenOptions={{
            headerRight: () => (
                <Button title="Logout" onPress={handleLogout} />
            ),
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                    title: 'Home',
                    headerShown: true,
                }}
            />
            <Tabs.Screen name="profile" options={{/* unchanged */}} />
            <Tabs.Screen name="settings" options={{/* unchanged */}} />
        </Tabs>
    );
}