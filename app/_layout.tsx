// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const isLoadingAuth = isAuthenticated === null;

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (isLoadingAuth) {
      return;
    }

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isLoadingAuth, isAuthenticated, segments, router]);

  if (isLoadingAuth) {
    return null;
  }

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
  );
}