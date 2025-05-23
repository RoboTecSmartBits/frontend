// components/DevicesList.tsx
import React, { useState, useEffect } from 'react';
// Update this import line at the top of your file
import { View, Text, StyleSheet, Alert, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AddDeviceForm from "@/components/devices/adddevice";

// Manually set from .env
const BACKEND_URL = 'http://194.102.62.176:5000';

interface Device {
    id: string;
    name: string;
    type?: string;
    status?: string;
    lastConnected?: string;
    userId?: string;
    mac?: string;
}

const DevicesList = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Add to the component's state variables
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editDeviceName, setEditDeviceName] = useState('');
    const [editDeviceType, setEditDeviceType] = useState('');

    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    // Add this function to handle device deletion
    const handleDeleteDevice = () => {
        console.log("Delete button pressed");
        if (selectedDeviceId) {
            setDeleteConfirmVisible(true);
        } else {
            console.error("No device ID selected for deletion");
        }
    };

    const confirmDelete = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token || !selectedDeviceId) {
                console.error("Missing token or device ID");
                return;
            }

            console.log(`Deleting device with ID: ${selectedDeviceId}`);
            const response = await fetch(`${BACKEND_URL}/devices/${selectedDeviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            console.log("Device deleted successfully");
            setDetailsModalVisible(false);
            setDeleteConfirmVisible(false);
            handleRefresh();
        } catch (error) {
            console.error('Failed to delete device:', error);
        }
    };

    // Update the handleUpdateDevice function
        const handleUpdateDevice = async () => {
            try {
                if (!editDeviceName && !editDeviceType) {
                    Alert.alert('Error', 'Please enter at least one field to update');
                    return;
                }

                const token = await AsyncStorage.getItem('userToken');
                if (!token || !selectedDeviceId) {
                    Alert.alert('Error', 'Authentication or device selection error');
                    return;
                }

                console.log('Updating device with ID:', selectedDeviceId);
                console.log('Update data:', { name: editDeviceName, device_type: editDeviceType });

                const updateData = {};
                if (editDeviceName) updateData.name = editDeviceName;
                if (editDeviceType) updateData.device_type = editDeviceType;

                // Rest of your function remains the same

            const response = await fetch(`${BACKEND_URL}/devices/${selectedDeviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            Alert.alert('Success', 'Device updated successfully');
            setEditModalVisible(false);
            fetchDeviceDetails(selectedDeviceId);
            handleRefresh();
        } catch (error) {
            console.error('Failed to update device:', error);
            Alert.alert('Error', 'Could not update device. Please try again.');
        }
    };

// Add this function to fetch device details
    const fetchDeviceDetails = async (deviceId: string) => {
        setLoadingDetails(true);
        setSelectedDeviceId(deviceId); // This line ensures the ID is set
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to view device details.');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/devices/${deviceId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setSelectedDeviceDetails(data);
            setDetailsModalVisible(true);
        } catch (error) {
            console.error('Failed to fetch device details:', error);
            Alert.alert('Error', 'Could not load device details. Please try again.');
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchDevices = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to view your devices.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/devices/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            Alert.alert('Error', 'Could not load devices. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDevices();
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading devices...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Devices</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="#0066cc" />
                </TouchableOpacity>
            </View>

            <AddDeviceForm onDeviceAdded={handleRefresh} />

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.deviceCard}>
                        <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
                        {item.type && <Text style={styles.deviceDetail}>Type: {item.type}</Text>}
                        {item.status && (
                            <View style={styles.statusContainer}>
                                <Text style={styles.deviceDetail}>Status: </Text>
                                <Text style={[
                                    styles.statusText,
                                    { color: item.status === 'online' ? '#28a745' : '#dc3545' }
                                ]}>
                                    {item.status}
                                </Text>
                            </View>
                        )}
                        {item.lastConnected && (
                            <Text style={styles.deviceDetail}>
                                Last Active: {new Date(item.lastConnected).toLocaleString()}
                            </Text>
                        )}
                        {item.mac && <Text style={styles.macAddress}>MAC: {item.mac}</Text>}


                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => fetchDeviceDetails(item.id)}
                        >
                            <Text style={styles.detailsButtonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#888" />
                        <Text style={styles.emptyText}>No devices found</Text>
                    </View>
                }
            />
            {/* Device Details Modal */}

            <Modal
                animationType="slide"
                transparent={true}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Device Details</Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => {
                                        setEditDeviceName(selectedDeviceDetails?.name || '');
                                        setEditDeviceType(selectedDeviceDetails?.device_type || '');
                                        setSelectedDeviceId(selectedDeviceDetails?.id);
                                        setEditModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={handleDeleteDevice}
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {loadingDetails ? (
                            <ActivityIndicator size="large" color="#0066cc" />
                        ) : selectedDeviceDetails ? (
                            <ScrollView style={styles.detailsContainer}>
                                {Object.entries(selectedDeviceDetails).map(([key, value]) => (
                                    <View key={key} style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>{key}:</Text>
                                        <Text style={styles.detailValue}>
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text style={styles.errorText}>No device details available</Text>
                        )}
                    </View>
                </View>
            </Modal>
            {/* Edit Device Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Device</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.label}>Device Name:</Text>
                            <TextInput
                                style={styles.input}
                                value={editDeviceName}
                                onChangeText={setEditDeviceName}
                                placeholder="Device Name"
                            />

                            <Text style={styles.label}>Device Type:</Text>
                            <TextInput
                                style={styles.input}
                                value={editDeviceType}
                                onChangeText={setEditDeviceType}
                                placeholder="Device Type"
                            />

                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={handleUpdateDevice}
                            >
                                <Text style={styles.updateButtonText}>Update Device</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteConfirmVisible}
                onRequestClose={() => setDeleteConfirmVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.confirmModalView}>
                        <Text style={styles.confirmTitle}>Delete Device</Text>
                        <Text style={styles.confirmText}>
                            Are you sure you want to delete this device? This action cannot be undone.
                        </Text>
                        <View style={styles.confirmButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.cancelButton]}
                                onPress={() => setDeleteConfirmVisible(false)}
                            >
                                <Text style={styles.confirmButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.deleteConfirmButton]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.confirmButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f7fa',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#0066cc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    refreshButton: {
        padding: 8,
    },
    deviceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    deviceDetail: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontWeight: 'bold',
    },
    macAddress: {
        fontSize: 12,
        color: '#777',
        marginTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#888',
    },
    detailsButton: {
        backgroundColor: '#0066cc',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    detailsButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    detailsContainer: {
        maxHeight: '90%',
    },
    detailRow: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        fontSize: 16,
        color: '#dc3545',
        textAlign: 'center',
        marginTop: 20,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 12,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    updateButton: {
        backgroundColor: '#0066cc',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        marginRight: 15,
        backgroundColor: '#0066cc',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    deleteButton: {
        marginRight: 15,
        backgroundColor: '#dc3545',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    confirmModalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    confirmText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: '40%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    deleteConfirmButton: {
        backgroundColor: '#dc3545',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});


export default DevicesList;