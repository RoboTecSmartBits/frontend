// components/auth/register.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function Register({ onRegister }: { onRegister: (data: any) => void }) {
    const [form, setForm] = useState({
        nume: '',
        email: '',
        password: '',
        age: '',
        medicamente: '',
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://194.102.62.176:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nume: form.nume,
                    email: form.email,
                    password: form.password,
                    age: Number(form.age),
                    medicamente: form.medicamente,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                onRegister(data);
            } else {
                Alert.alert('Register failed', data.message || 'Unknown error');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View>
            <TextInput placeholder="Nume" value={form.nume} onChangeText={v => handleChange('nume', v)} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={v => handleChange('email', v)} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Password" secureTextEntry value={form.password} onChangeText={v => handleChange('password', v)} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={v => handleChange('age', v)} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Medicamente" value={form.medicamente} onChangeText={v => handleChange('medicamente', v)} style={styles.input} placeholderTextColor="#aaa" />
            <Button title="Register" onPress={handleSubmit} />
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