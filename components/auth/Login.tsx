// components/auth/login.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export default function Login({ onLogin }: { onLogin: (data: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://194.102.62.176:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data = await response.json();
            console.log('Response:', data);
            if (response.ok && data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userId', data.user.id);
                onLogin(data);
            } else {
                Alert.alert('Login failed', data.message || 'Unknown error');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#aaa"
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#aaa"
            />
            <Button title="Login" onPress={handleSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,

    },
});