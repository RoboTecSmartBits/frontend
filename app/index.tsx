// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            console.log('Token:', token);
            if (token) {
                router.replace('/(tabs)/home');
            } else {
                router.replace('/auth');
            }
        };

        checkAuth();
    }, []);

    return null;
}