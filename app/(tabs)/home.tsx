// app/(tabs)/home.tsx
import React from 'react';
import { View, Text } from 'react-native';
import UserData from '../../components/users/userdata';

const Home = () => {
    return (
        <View>
            <Text>Home Screen</Text>
            <UserData />
        </View>
    );
};

export default Home;