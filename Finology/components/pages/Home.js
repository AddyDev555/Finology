import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import TopBar from '../ui/TopBar';
import Greeting from '../ui/Greeting';
import Overview from '../ui/Overview';
import Menu from '../ui/Menu';

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <TopBar />
                <Greeting />
                <Overview />
                <Menu />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default Home;