import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Overview() {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <MaterialCommunityIcons name="wallet" size={28} color="#4CAF50" />
                <Text style={styles.cardTitle}>Total Balance</Text>
                <Text style={styles.cardValue}>₹ 1,00,000</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="cash-minus" size={28} color="#F44336" />
                <Text style={styles.cardTitle}>Monthly Expense</Text>
                <Text style={styles.cardValue}>₹ 45,000</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="cash-plus" size={28} color="#2196F3" />
                <Text style={styles.cardTitle}>Income</Text>
                <Text style={styles.cardValue}>₹ 75,000</Text>
            </View>
            <View style={styles.card}>
                <MaterialCommunityIcons name="bank" size={28} color="#9C27B0" />
                <Text style={styles.cardTitle}>Savings</Text>
                <Text style={styles.cardValue}>₹ 30,000</Text>
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
        marginTop: 10,
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