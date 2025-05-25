import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Overview() {
    const [overviewData, setOverviewData] = useState([]);
    const TotalExpenditure = overviewData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const MonthlyExpenditure = overviewData
        .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

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

    const getOverviewData = async () => {
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
                throw new Error('Failed to fetch overview data');
            }

            const data = await response.json();
            setOverviewData(data);
        } catch (error) {
            console.error('Error fetching overview data:', error);
        }
    };

    // Optional: Call it on component mount
    useEffect(() => {
        getOverviewData();
    }, []);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <MaterialCommunityIcons name="wallet" size={28} color="#A5D6A7" />
                <Text style={styles.cardTitle}>Total Expense</Text>
                <Text style={[styles.cardValue, { color: "#4CAF50" }]}>₹ {TotalExpenditure}</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="cash-minus" size={28} color="#EF9A9A" />
                <Text style={styles.cardTitle}>Monthly Expense</Text>
                <Text style={[styles.cardValue, { color: "#F44336" }]}>₹ {MonthlyExpenditure}</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="cash-plus" size={28} color="#90CAF9" />
                <Text style={styles.cardTitle}>Income</Text>
                <Text style={[styles.cardValue, { color: "#2196F3" }]}>₹ 75,000</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="bank" size={28} color="#CE93D8" />
                <Text style={styles.cardTitle}>Savings</Text>
                <Text style={[styles.cardValue, { color: "#9C27B0" }]}>₹ 30,000</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
        marginTop: 15,
    },
    card: {
        width: '48.5%',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 8,
        marginBottom: 5,
        textAlign: 'center',
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
});