// components/UpdateProfile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://194.102.62.176:5000';

const UpdateProfile = () => {
    const [nume, setNume] = useState('');
    const [age, setAge] = useState('');
    const [medicamente, setMedicamente] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert('Not authenticated', 'Please login to update your profile.');
                    return;
                }

                const response = await fetch(`${BACKEND_URL}/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setNume(data.nume || '');
                setAge(String(data.age) || '');
                setMedicamente(data.medicamente || '');
                setEmail(data.email || '');
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Alert.alert('Error', 'Failed to load initial data.');
            }
        };

        loadInitialData();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Not authenticated', 'Please login to update your profile.');
                return;
            }

            // Create the update payload
            const updateData = {
                nume: nume,
                age: parseInt(age, 10),
                medicamente: medicamente,
                email: email,
            };

            // Only include password if the user entered a new one
            if (password.trim() !== '') {
                updateData.password = password;
            }
            console.log('Update Data:', updateData);
            const response = await fetch(`${BACKEND_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
        } catch (error) {
            console.error('Failed to update user data:', error);
            Alert.alert('Error', 'Failed to update profile data.');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Nume:</Text>
            <TextInput
                style={styles.input}
                value={nume}
                onChangeText={setNume}
                placeholder="Your Name"
            />

            <Text>Age:</Text>
            <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Your Age"
                keyboardType="numeric"
            />

            <Text>Medicamente:</Text>
            <TextInput
                style={styles.input}
                value={medicamente}
                onChangeText={setMedicamente}
                placeholder="Your Medicamente"
            />
            <Text>Password:</Text>
            <TextInput
                style={styles.input}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Your New Password"
            />

            <Button title="Update Profile" onPress={handleUpdateProfile} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default UpdateProfile;