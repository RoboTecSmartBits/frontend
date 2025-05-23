import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://194.102.62.176:5000';

interface ShakeByMinute {
    [timeKey: string]: number;
}

interface MedicationLog {
    user_id: string | number;
    medication_name: string;
    timestamp: string;
}

interface MedicationResponse {
    med_time: string;
    before_avg: number;
    after_avg: number;
    delta: number;
    effective: boolean;
}

const ParkinsonTracker = () => {
    const [trainingModel, setTrainingModel] = useState(false);
    const [predictionResult, setPredictionResult] = useState<{
        date: string;
        probability_better: number;
        prediction: string;
    } | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [fetchingPrediction, setFetchingPrediction] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [lastShakeValue, setLastShakeValue] = useState<number | null>(null);
    const [shakeData, setShakeData] = useState<ShakeByMinute | null>(null);
    const [userId, setUserId] = useState<string | number | null>(null);
    const [userMedications, setUserMedications] = useState<string[]>([]);

    // Medication tracking states
    const [medicationModalVisible, setMedicationModalVisible] = useState(false);
    const [lastMedication, setLastMedication] = useState<MedicationLog | null>(null);
    const [medicationResponse, setMedicationResponse] = useState<MedicationResponse[]>([]);
    const [fetchingMedResponse, setFetchingMedResponse] = useState(false);

    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication required. Please log in.');
                return null;
            }

            const profileResponse = await fetch(`${BACKEND_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!profileResponse.ok) {
                throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
            }

            const profileData = await profileResponse.json();
            setUserId(profileData.id);

            // Extract medications from profile if available
            if (profileData.medications && Array.isArray(profileData.medications)) {
                setUserMedications([...profileData.medications, "Other"]);
            } else {
                // Fallback to default medications
                setUserMedications([
                    "Carbidopa-Levodopa",
                    "Dopamine Agonists",
                    "MAO-B Inhibitors",
                    "COMT Inhibitors",
                    "Amantadine",
                    "Anticholinergics",
                    "Other"
                ]);
            }

            return profileData.id;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    const fetchMedicationResponse = async (uid: string | number) => {
        setFetchingMedResponse(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch(
                `${BACKEND_URL}/parkinson/${uid}/medication-response`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setMedicationResponse(data.medication_response || []);
        } catch (error) {
            console.error('Error fetching medication response:', error);
        } finally {
            setFetchingMedResponse(false);
        }
    };

    const fetchShakeData = async (uid: string | number) => {
        setFetchingHistory(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const todayDate = getTodayDateString();
            const response = await fetch(
                `${BACKEND_URL}/parkinson/${uid}/shake-by-minute?day=${todayDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setShakeData(data);
        } catch (error) {
            console.error('Error fetching shake data:', error);
        } finally {
            setFetchingHistory(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const uid = await fetchUserProfile();
            if (uid) {
                fetchShakeData(uid);
                fetchMedicationResponse(uid);
                fetchProgressPrediction(uid);
            }
        };
        init();
    }, []);

    const generateRandomValue = (min: number, max: number) => {
        return Number((Math.random() * (max - min) + min).toFixed(3));
    };

    const sendParkinsonData = async () => {
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication required. Please log in.');
                return;
            }

            const currentUserId = userId || await fetchUserProfile();
            if (!currentUserId) {
                throw new Error('Could not get user ID');
            }

            const sensorData = {
                user_id: currentUserId,
                accel_x: generateRandomValue(-1, 1),
                accel_y: generateRandomValue(-1, 1),
                accel_z: generateRandomValue(-1, 1),
                gyro_x: generateRandomValue(-0.5, 0.5),
                gyro_y: generateRandomValue(-0.5, 0.5),
                gyro_z: generateRandomValue(-0.5, 0.5)
            };

            const response = await fetch(`${BACKEND_URL}/parkinson/log`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sensorData)
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();
            setLastShakeValue(result.shake_per_minute);
            Alert.alert('Success', 'Parkinson data recorded successfully');

            // Refresh shake data after recording
            fetchShakeData(currentUserId);
        } catch (error) {
            console.error('Error sending data:', error);
            Alert.alert('Error', 'Failed to send data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const trainProgressModel = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication required. Please log in.');
                return;
            }

            const currentUserId = userId || await fetchUserProfile();
            if (!currentUserId) {
                throw new Error('Could not get user ID');
            }

            setTrainingModel(true);

            const response = await fetch(`${BACKEND_URL}/parkinson/${currentUserId}/train-progress-lstm`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();
            Alert.alert('Success', 'LSTM model trained successfully');
            fetchProgressPrediction(currentUserId);
        } catch (error) {
            console.error('Error training model:', error);
            Alert.alert('Error', 'Failed to train model. Please try again.');
        } finally {
            setTrainingModel(false);
        }
    };

    const fetchProgressPrediction = async (uid: string | number) => {
        setFetchingPrediction(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch(
                `${BACKEND_URL}/parkinson/${uid}/predict-progress-lstm`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    setPredictionError(errorData.error);
                    setPredictionResult(null);
                    return;
                }
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setPredictionResult(data);
            setPredictionError(null);
        } catch (error) {
            console.error('Error fetching prediction:', error);
            setPredictionError('Failed to get prediction. Please try again.');
        } finally {
            setFetchingPrediction(false);
        }
    };

    const logMedication = async (medicationName: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication required. Please log in.');
                return;
            }

            const currentUserId = userId || await fetchUserProfile();
            if (!currentUserId) {
                throw new Error('Could not get user ID');
            }

            // Option 1: Send no timestamp and let server use default current time
            const medicationData = {};

            // Option 2 (if you need to specify a time):
            // Format timestamp in Python's expected format (YYYY-MM-DDThh:mm:ss)
            // const now = new Date();
            // const timestamp = now.toISOString().replace('Z', '').split('.')[0];
            // const medicationData = { timestamp: timestamp };

            const response = await fetch(`${BACKEND_URL}/parkinson/${currentUserId}/log-medication`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicationData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            // For UI display purposes
            setLastMedication({
                user_id: currentUserId,
                medication_name: medicationName,
                timestamp: new Date().toISOString()
            });

            setMedicationModalVisible(false);
            Alert.alert('Success', 'Medication logged successfully');

            fetchMedicationResponse(currentUserId);
        } catch (error) {
            console.error('Error logging medication:', error);
            Alert.alert('Error', 'Failed to log medication. Please try again.');
        }
    };

    const getSortedShakeData = () => {
        if (!shakeData) return [];
        return Object.entries(shakeData)
            .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
            .map(([time, value]) => ({ time, value }));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Parkinson Tracker</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={sendParkinsonData}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Record Tremor Data</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.medicationButton}
                        onPress={() => setMedicationModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Log Medication</Text>
                    </TouchableOpacity>
                </View>

                {lastShakeValue !== null && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultText}>
                            Last recorded tremor value: {lastShakeValue}
                        </Text>
                        <Text style={styles.resultTime}>
                            Recorded at: {new Date().toLocaleTimeString()}
                        </Text>
                    </View>
                )}

                {lastMedication && (
                    <View style={styles.medicationContainer}>
                        <Text style={styles.medicationTitle}>Last Medication Taken</Text>
                        <Text style={styles.medicationName}>{lastMedication.medication_name}</Text>
                        <Text style={styles.medicationTime}>
                            at {new Date(lastMedication.timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                )}

                <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>Today's Tremor History</Text>

                    {fetchingHistory ? (
                        <ActivityIndicator color="#4285F4" style={{ marginVertical: 20 }} />
                    ) : shakeData && Object.keys(shakeData).length > 0 ? (
                        <View style={styles.historyContainer}>
                            {getSortedShakeData().map((item, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                    <View style={styles.valueContainer}>
                                        <View
                                            style={[
                                                styles.valueBar,
                                                { width: `${Math.min(item.value * 10, 100)}%` }
                                            ]}
                                        />
                                        <Text style={styles.valueText}>{item.value.toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No tremor data recorded today.</Text>
                    )}
                </View>

                {/* Medication Response Section */}
                <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>Medication Effectiveness</Text>

                    {fetchingMedResponse ? (
                        <ActivityIndicator color="#34A853" style={{ marginVertical: 20 }} />
                    ) : medicationResponse.length > 0 ? (
                        <View style={styles.historyContainer}>
                            {medicationResponse.map((item, index) => (
                                <View key={index} style={styles.responseItem}>
                                    <Text style={styles.responseDate}>
                                        {formatDate(item.med_time)}
                                    </Text>
                                    <View style={styles.responseRow}>
                                        <Text>Before: {item.before_avg}</Text>
                                        <Text style={styles.arrowText}>→</Text>
                                        <Text>After: {item.after_avg}</Text>
                                        <View style={[
                                            styles.deltaContainer,
                                            { backgroundColor: item.effective ? '#e6f4ea' : '#fdeeee' }
                                        ]}>
                                            <Text style={[
                                                styles.deltaText,
                                                { color: item.effective ? '#34A853' : '#D93025' }
                                            ]}>
                                                {item.delta > 0 ? '+' : ''}{item.delta}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.effectiveText,
                                        { color: item.effective ? '#34A853' : '#D93025' }
                                    ]}>
                                        {item.effective ? 'Effective' : 'Not Effective'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>
                            No medication effectiveness data available yet.
                        </Text>
                    )}
                </View>
                {/* LSTM Model Prediction Section */}
                <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>Condition Prediction</Text>

                    <View style={styles.predictionButtonContainer}>
                        <TouchableOpacity
                            style={[styles.predictionButton, trainingModel && styles.disabledButton]}
                            onPress={trainProgressModel}
                            disabled={trainingModel}
                        >
                            {trainingModel ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {predictionResult ? "Retrain Model" : "Train Model"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {fetchingPrediction ? (
                        <ActivityIndicator color="#9334ea" style={{ marginVertical: 20 }} />
                    ) : predictionResult ? (
                        <View style={styles.predictionContainer}>
                            <Text style={styles.predictionDate}>
                                Prediction for: {new Date(predictionResult.date).toLocaleDateString()}
                            </Text>
                            <View style={styles.predictionRow}>
                                <Text style={styles.predictionLabel}>Condition trend:</Text>
                                <Text style={[
                                    styles.predictionValue,
                                    {color: predictionResult.prediction === 'better' ? '#34A853' : '#EA4335'}
                                ]}>
                                    {predictionResult.prediction.toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, {width: `${predictionResult.probability_better * 100}%`}]} />
                                <Text style={styles.progressText}>
                                    {Math.round(predictionResult.probability_better * 100)}% confidence
                                </Text>
                            </View>
                        </View>
                    ) : predictionError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{predictionError}</Text>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>
                            Train the model to see predictions about your condition trend.
                        </Text>
                    )}
                </View>
                {/* Medication Modal */}
                <Modal
                    transparent={true}
                    visible={medicationModalVisible}
                    animationType="slide"
                    onRequestClose={() => setMedicationModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Log Medication</Text>
                                <TouchableOpacity onPress={() => setMedicationModalVisible(false)}>
                                    <Text style={styles.closeButton}>×</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>Select your medication:</Text>

                            <ScrollView style={styles.medicationList}>
                                {userMedications.map((medication, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.medicationItem}
                                        onPress={() => logMedication(medication)}
                                    >
                                        <Text style={styles.medicationItemText}>{medication}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.timeNote}>
                                Current time: {new Date().toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#4285F4',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        marginRight: 10,
    },
    medicationButton: {
        backgroundColor: '#34A853',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e8f4fd',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    medicationContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#e6f4ea',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    medicationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    medicationName: {
        fontSize: 16,
        color: '#34A853',
    },
    medicationTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    historySection: {
        marginTop: 30,
        width: '100%',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    historyContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        width: '100%',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    timeText: {
        width: 50,
        fontSize: 14,
        color: '#555',
    },
    valueContainer: {
        flex: 1,
        marginLeft: 10,
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueBar: {
        height: '100%',
        backgroundColor: '#4285F4',
        borderRadius: 2,
    },
    valueText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginTop: 10,
    },
    // Medication response styles
    responseItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    responseDate: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    responseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    arrowText: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 5,
    },
    deltaContainer: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    deltaText: {
        fontWeight: 'bold',
    },
    effectiveText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 3,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
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
    closeButton: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#555',
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    medicationList: {
        maxHeight: 300,
    },
    medicationItem: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
    },
    medicationItemText: {
        fontSize: 16,
    },
    timeNote: {
        marginTop: 15,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    // Add to the existing styles object
    predictionButtonContainer: {
        marginBottom: 15,
    },
    predictionButton: {
        backgroundColor: '#9334ea',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    disabledButton: {
        opacity: 0.7,
    },
    predictionContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        width: '100%',
    },
    predictionDate: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    predictionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    predictionLabel: {
        fontSize: 16,
        color: '#555',
    },
    predictionValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginTop: 5,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#9334ea',
        borderRadius: 10,
    },
    progressText: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        textAlignVertical: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#ffebee',
        borderRadius: 8,
    },
});

export default ParkinsonTracker;