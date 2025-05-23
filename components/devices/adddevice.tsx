// components/devices/AddDeviceForm.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Same backend URL as used in other components
const BACKEND_URL = 'http://194.102.62.176:5000';

interface AddDeviceProps {
    onDeviceAdded?: () => void;
}

const AddDeviceForm = ({ onDeviceAdded }: AddDeviceProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            console.log('Error', 'Device name is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.log('Authentication Required', 'Please log in to add a device');
                setIsSubmitting(false);
                return;
            }

            // Get the user ID from storage or profile
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.log('Error', 'User ID not found');
                setIsSubmitting(false);
                return;
            }

            // Match the expected API format
            const deviceData = {
                name: name.trim(),
                device_type: description.trim() || "default", // Using description as device_type
                user_id: userId
            };

            console.log('Sending device data:', deviceData);

            const response = await fetch(`${BACKEND_URL}/devices/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deviceData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', response.status, errorText);
                throw new Error(`Request failed: ${response.status}`);
            }

            console.log('Success', 'Device added successfully');
            setName('');
            setDescription('');
            setModalVisible(false);

            if (onDeviceAdded) {
                onDeviceAdded();
            }
        } catch (error) {
            console.error('Failed to add device:', error);
            console.log('Error', 'Failed to add device. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.buttonText}>Add New Device</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Device</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Device Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter device name"
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.label}>Device Type</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter device type"
                            placeholderTextColor="#999"
                        />

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                            onPress={() => {
                                console.log('Submit button pressed');
                                handleSubmit();
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Device</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066cc',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#0066cc',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#7ab1e8',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddDeviceForm;