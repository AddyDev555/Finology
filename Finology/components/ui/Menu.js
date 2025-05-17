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
                <TouchableOpacity onPress={() => handleMenuItemPress("ManualEntry")} style={styles.menuItem}>
                    <MaterialCommunityIcons name="file-document-edit-outline" size={30} color="#4CAF50" />
                    <Text style={styles.menuText}>Manual Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="clipboard-text-clock" size={30} color="#2196F3" />
                    <Text style={styles.menuText}>View Backlogs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="calculator-variant" size={30} color="#FF9800" />
                    <Text style={styles.menuText}>EMI Calculator</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="calendar-clock" size={30} color="#E91E63" />
                    <Text style={styles.menuText}>Payment Due</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <MaterialCommunityIcons name="currency-usd" size={30} color="#4CAF50" />
                    <Text style={styles.menuText}>Currency Converter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 0,
        backgroundColor: '#F4F6F8',
        flex: 1,
    },
    menuContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
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
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        paddingTop: 5,
        marginBottom: 15,
    },
});