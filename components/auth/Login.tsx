import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function Login({ onLogin }: { onLogin: (data: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        onLogin({ email, password });
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
            <Button title="Login" onPress={handleSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    input: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
        color: '#fff', // Makes input text white
    },
});