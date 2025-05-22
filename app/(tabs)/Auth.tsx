import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Button, StyleSheet, useWindowDimensions, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width;

    const handleLogin = (data: any) => {
        // handle login
    };

    const handleRegister = (data: any) => {
        // handle register
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/icon.png')}
                    style={styles.logo}
                />
            }
        >
            <ThemedView style={[styles.container, isPortrait ? styles.portrait : styles.landscape]}>
                <ThemedView style={styles.formContainer}>
                    <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
                        {isLogin ? 'Login' : 'Register'}
                        <Button
                            title={isLogin ? "Switch to Register" : "Switch to Login"}
                            onPress={() => setIsLogin(!isLogin)}
                        />
                    </ThemedText>

                    {isLogin ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <Register onRegister={handleRegister} />
                    )}

                </ThemedView>
            </ThemedView>
        </ParallaxScrollView>
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
    formContainer: {
        flex: 1,
        minWidth: 250,
        maxWidth: 400,
        justifyContent: 'center',
        alignSelf: 'center',
    },

});