// app/auth.tsx
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Button, StyleSheet, useWindowDimensions, View } from 'react-native';
import Login from '../components/auth/login';
import Register from '../components/auth/register';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;
    const router = useRouter();

    const handleLogin = (data: any) => {
        console.log('BACKEND_URL:', BACKEND_URL);
        router.replace('/(tabs)/home');
    };

    const handleRegister = (data: any) => {
        console.log('BACKEND_URL:', BACKEND_URL);
        router.replace('/(tabs)/home');
    };

    return (
        <View style={[styles.container, isPortrait ? styles.portrait : styles.landscape]}>
            <Image
                source={require('@/assets/icon.png')}
                style={styles.logo}
            />
            <View style={styles.formContainer}>
                {isLogin ? 'Login' : 'Register'}
                <Button
                    title={isLogin ? "Switch to Register" : "Switch to Login"}
                    onPress={() => setIsLogin(!isLogin)}
                />
                <View style={styles.buttonContainer}>
                    {isLogin ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <Register onRegister={handleRegister} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    portrait: {
        flexDirection: 'column',
    },
    landscape: {
        flexDirection: 'row',
    },
    logo: {
        width: 120,
        height: 120,
        margin: 24,
        alignSelf: 'center',
    },
    input: {
        color: 'black', // Add this line to change the text color to black
        // Other styles for the input
    },
    formContainer: {
        flex: 1,
        minWidth: 250,
        maxWidth: 400,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    buttonContainer: {
        marginTop: 20, // Add some space between the form and the button
    },
});