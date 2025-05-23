// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserData from '../../components/users/userdata';
import UpdateProfile from '../../components/users/updatedata';

const Profile = () => {
    return (
        <View style={styles.container}>
            <UpdateProfile />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default Profile;