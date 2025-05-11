import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Avatar() {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigation = useNavigation();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.replace("Login");
    };

    return (
        <View style={{ position: 'relative', alignItems: 'flex-end', marginTop: 14, marginRight: 16 }}>
            <TouchableOpacity style={styles.container} onPress={() => setShowDropdown(!showDropdown)}>
                <Text style={styles.text}>A</Text>
            </TouchableOpacity>

            {showDropdown && (
                <View style={styles.dropdown}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.dropdownItem}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4B0082',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    text: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    dropdown: {
        width: 74,
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 10,
        zIndex: 999,
    },
    dropdownItem: {
        fontSize: 16,
        paddingVertical: 4,
        color: '#333',
    },
});