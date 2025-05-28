import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Avatar() {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigation = useNavigation();
    const [name, setName] = useState('');

    useEffect(() => {
        handelUsername();
    }, [])

    const handelUsername = async () => {
        const savedData = await AsyncStorage.getItem('user');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const tempName = parsedData.name.trim();
            const nameWithoutSpaces = tempName.replace(/\s+/g, '');
            const initials = nameWithoutSpaces.substring(0, 1);
            setName(initials);
        }
    }

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.replace("Login");
    };

    return (
        <View style={{ position: 'relative', alignItems: 'flex-end', marginTop: 14, marginRight: 16 }}>
            <TouchableOpacity style={styles.container} onPress={() => setShowDropdown(!showDropdown)}>
                <Text style={styles.text}>{name}</Text>
            </TouchableOpacity>

            {showDropdown && (
                <View style={styles.dropdown}>
                    <TouchableOpacity style={styles.option} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#E53935" />
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
        backgroundColor: '#7B68EE',
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
        width: 95,
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
    option:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownItem: {
        fontSize: 16,
        paddingVertical: 4,
        marginLeft: 4,
        color: '#333',
    },
});