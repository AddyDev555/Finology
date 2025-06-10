import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import TopBar from '../ui/TopBar';
import BottomBar from '../ui/BottomBar';
import ExpenseDashboard from './ExpenseDashboard';
import { router } from 'expo-router';

const formatDateForSearch = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString || '';

        const formats = [
            date.toLocaleDateString(),
            date.toDateString(),
            date.toLocaleDateString('en-US', { month: 'long' }),
            date.toLocaleDateString('en-US', { month: 'short' }),
            date.getFullYear().toString(),
            date.getDate().toString(),
            date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        ];

        return formats.join(' ');
    } catch (error) {
        return dateString || '';
    }
};

const Home = () => {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) return expenses;

        const query = searchQuery.toLowerCase().trim();
        const searchWords = query.split(' ').filter(word => word.length > 0);

        return expenses.filter(expense => {
            const searchFields = [
                expense.business?.toLowerCase() || '',
                expense.description?.toLowerCase() || '',
                expense.category?.toLowerCase() || '',
                expense.amount?.toString() || '',
                formatDateForSearch(expense.date),
                `₹${expense.amount?.toFixed(2)}`.toLowerCase()
            ];

            const searchableText = searchFields.join(' ').toLowerCase();
            return searchWords.every(word => searchableText.includes(word));
        });
    }, [expenses, searchQuery]);

    const getUserIdFromStorage = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            if (!userDataString) throw new Error('User data not found in storage');
            return JSON.parse(userDataString).userId;
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userId),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data.error) throw new Error(data.error);

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

    const handleSearchChange = (text) => setSearchQuery(text);
    const clearSearch = () => setSearchQuery('');
    const refreshExpenseData = () => {
        setRefreshKey(prev => prev + 1);
        fetchExpenseData();
    };

    useEffect(() => {
        fetchExpenseData();
    }, []);

    useFocusEffect(useCallback(() => {
        fetchExpenseData();
    }, []));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <TopBar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onClearSearch={clearSearch}
                    />
                    <View style={styles.ExpenseDashboardCon}>
                        <ExpenseDashboard
                            key={refreshKey}
                            expenses={filteredExpenses}
                            isLoading={isLoading}
                            onRefresh={refreshExpenseData}
                            searchQuery={searchQuery}
                            totalExpenses={expenses.length}
                            filteredCount={filteredExpenses.length}
                        />
                    </View>
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