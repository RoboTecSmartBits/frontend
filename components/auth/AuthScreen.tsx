import React, { useState } from 'react';
import { View, Button, Image, useWindowDimensions, StyleSheet } from 'react-native';
import Login from './Login';
import Register from './Register';

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
        <View style={[styles.container, isPortrait ? styles.portrait : styles.landscape]}>
            <Image
                source={require('../../assets/logo.png')} // Replace with your logo path
                style={styles.logo}
                resizeMode="contain"
            />
            <Button
                title={isLogin ? "Switch to Register" : "Switch to Login"}
                onPress={() => setIsLogin(!isLogin)}
            />
            <View style={styles.formContainer}>
                {isLogin ? (
                    <Login onLogin={handleLogin} />
                ) : (
                    <Register onRegister={handleRegister} />
                )}

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
    },
    formContainer: {
        flex: 1,
        minWidth: 250,
        maxWidth: 400,
        justifyContent: 'center',
    },
});