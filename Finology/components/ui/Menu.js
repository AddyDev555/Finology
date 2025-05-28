import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function Menu() {
    const navigation = useNavigation();

    const handleMenuItemPress = (screen) => {
        navigation.navigate(screen);
    }

    return (
        <View style={styles.container}>
            <View style={styles.menuContainer}>
                <TouchableOpacity onPress={() => handleMenuItemPress("ExpenseDashboard")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="finance" size={30} color="#2196F3" />
                    <Text style={styles.menuText}>Expense Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuItemPress("ManualEntry")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="file-document-edit-outline" size={30} color="#4CAF50" />
                    <Text style={styles.menuText}>Expense Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuItemPress("BacklogPage")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="calendar-clock" size={30} color="#E91E63" />
                    <Text style={styles.menuText}>Payment Backlog</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="clipboard-text-clock" size={30} color="#2196F3" />
                    <Text style={styles.menuText}>Backlogs</Text>
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => handleMenuItemPress("EMICalculatorPage")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="calculator-variant" size={30} color="#FF9800" />
                    <Text style={styles.menuText}>EMI Calculator</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuItemPress("CurrencyConverter")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="currency-usd" size={30} color="#7B68EE" />
                    <Text style={styles.menuText}>Currency Converter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuItemPress("OnlineExpense")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="credit-card-outline" size={30} color="gray" />
                    <Text style={styles.menuText}>Online Expense</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        padding: 0,
        backgroundColor: 'white',
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        paddingTop: 20,
        paddingBottom: 8,
    },
    menuContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 15.9,
        rowGap: 3, 
    },
    menuItem: {
        width: '30%',
        alignItems: 'center',
        padding: 0,
        borderRadius: 8,
    },
    menuText: {
        width: '80%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        paddingTop: 5,
        marginBottom: 15,
    },
});