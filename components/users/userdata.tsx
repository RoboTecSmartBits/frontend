// components/UserData.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://194.102.62.176:5000';

const UserData = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert('Not authenticated', 'Please login to view your profile.');
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
                setUserData(data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Alert.alert('Error', 'Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <Text>Loading profile...</Text>;
    }

    if (!userData) {
        return <Text>Could not load profile data.</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Welcome {userData.nume}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default UserData;