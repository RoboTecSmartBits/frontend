// app/(tabs)/devices.tsx
import { View, Text, StyleSheet } from 'react-native';
import DevicesList from '@/components/devices/deviceslist';

export default function Devices() {
    return (
        <View style={styles.container}>

            <DevicesList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});