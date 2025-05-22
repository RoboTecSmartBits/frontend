import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

export default function Register({ onRegister }: { onRegister: (data: any) => void }) {
    const [form, setForm] = useState({
        id: '',
        name: '',
        password: '',
        medicament: '',
        age: '',
        sex: '',
        email: '',
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = () => {
        onRegister({
            ...form,
            id: Number(form.id),
            age: Number(form.age),
        });
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Username" value={form.name} onChangeText={v => handleChange('name', v)} style={styles.input} />
            <TextInput placeholder="Password" secureTextEntry value={form.password} onChangeText={v => handleChange('password', v)} style={styles.input} />
            <TextInput placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={v => handleChange('email', v)} style={styles.input} />
            <TextInput placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={v => handleChange('age', v)} style={styles.input} />
            <TextInput placeholder="Sex" value={form.sex} onChangeText={v => handleChange('sex', v)} style={styles.input} />
            <TextInput placeholder="Medicine used " value={form.medicament} onChangeText={v => handleChange('medicament', v)} style={styles.input} />
            <Button title="Register" onPress={handleSubmit} />
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