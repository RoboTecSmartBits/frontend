// components/users/userdata.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://194.102.62.176:5000';

// Define interfaces for the data types
interface UserData {
    id: string | number;
    nume: string;
    // Add other user properties as needed
}

interface UserDevice {
    id: string | number;
    name: string;
    device_type: string;
    status: boolean;
    mac_address?: string; // Optional property
}

const UserData = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [devicesError, setDevicesError] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setError('Authentication required. Please log in.');
                    setLoading(false);
                    return;
                }

                // Fetch user profile
                const profileResponse = await fetch(`${BACKEND_URL}/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!profileResponse.ok) {
                    throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
                }

                const profileData = await profileResponse.json();
                setUserData(profileData);

                try {
                    // Fetch user devices
                    const userId = profileData.id;
                    const devicesResponse = await fetch(`${BACKEND_URL}/user/${userId}/select`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!devicesResponse.ok) {
                        throw new Error(`Failed to fetch devices: ${devicesResponse.status}`);
                    }

                    const devicesData = await devicesResponse.json();
                    setUserDevices(devicesData.devices || []);
                } catch (devError) {
                    console.error('Failed to fetch device data:', devError);
                    setDevicesError(true);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>Loading profile and devices...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>Could not load profile data.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <Text style={styles.welcomeText}>Welcome {userData.nume}</Text>
            </View>

            {!devicesError && (
                <View style={styles.devicesSection}>
                    <Text style={styles.sectionTitle}>Your Devices</Text>
                    {userDevices.length === 0 ? (
                        <Text style={styles.emptyText}>You don&apos;t have any devices yet.</Text>
                    ) : (
                        userDevices.map(device => (
                            <View key={device.id} style={styles.deviceItem}>
                                <Text style={styles.deviceName}>{device.name}</Text>
                                <Text style={styles.deviceDetail}>Type: {device.device_type}</Text>
                                <Text style={styles.deviceDetail}>
                                    Status: {device.status ? 'Active' : 'Inactive'}
                                </Text>
                                {device.mac_address && (
                                    <Text style={styles.deviceMac}>MAC: {device.mac_address}</Text>
                                )}
                            </View>
                        ))
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    devicesSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    deviceItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e1e4e8',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    deviceDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    deviceMac: {
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginTop: 10,
    },
    errorText: {
        color: '#dc3545',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default UserData;