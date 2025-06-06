import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import TopBar from '../ui/TopBar';
import BottomBar from '../ui/BottomBar';
import ExpenseDashboard from './ExpenseDashboard';
import { router } from 'expo-router';

const Home = () => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const getUserIdFromStorage = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            if (!userDataString) {
                throw new Error('User data not found in storage');
            }
            const userData = JSON.parse(userDataString);
            return userData.userId;
        } catch (error) {
            console.error('Error getting userId:', error);
            throw error;
        }
    };

    const fetchExpenseData = async () => {
        setIsLoading(true);
        try {
            const userId = await getUserIdFromStorage();

            const response = await fetch('https://finology.pythonanywhere.com/get-manual-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userId),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to load expenses. Please try again.',
                visibilityTime: 3000,
                autoHide: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchExpenseData();
    }, []);

    // Refresh data when screen comes into focus (user navigates back from other screens)
    useFocusEffect(
        useCallback(() => {
            fetchExpenseData();
        }, [])
    );

    // Function to manually refresh data (can be called from child components)
    const refreshExpenseData = () => {
        setRefreshKey(prev => prev + 1);
        fetchExpenseData();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <TopBar />
                    <View style={styles.ExpenseDashboardCon}>
                        <ExpenseDashboard
                            key={refreshKey}
                            expenses={expenses}
                            isLoading={isLoading}
                            onRefresh={refreshExpenseData}
                        />
                    </View>
                    {/* <Greeting /> */}
                    {/* <Overview /> */}
                    {/* <Menu /> */}
                </ScrollView>
                <View style={styles.bottomBar}>
                    <BottomBar />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    content: {
        flex: 1,
    },
    ExpenseDashboardCon: {
        marginTop: 100,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});

export default Home;