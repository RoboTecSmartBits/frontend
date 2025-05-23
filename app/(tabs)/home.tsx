// app/(tabs)/home.tsx
import React from 'react';
import { View, Text } from 'react-native';
import UserData from '../../components/users/userdata';
import ParkinsonTracker from "@/components/parkinson/tracker";

const Home = () => {
    return (
        <View>

            <UserData />
            <ParkinsonTracker></ParkinsonTracker>
        </View>
    );
};

export default Home;