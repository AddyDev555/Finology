import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import TopBar from '../ui/TopBar';
import Greeting from '../ui/Greeting';

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <TopBar />
            <Greeting />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingHorizontal: 20,
    },
})

export default Home;
