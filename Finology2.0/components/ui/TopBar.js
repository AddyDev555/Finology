import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import Avatar from './Avatar';
import { router } from 'expo-router';

export default function TopBar({ searchQuery, onSearchChange, onClearSearch }) {
    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Feather name="search" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search expenses..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearIcon}
                        onPress={onClearSearch}
                    >
                        <Feather name="x" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notification')}>
                <Feather name="bell" size={22} color="#7F00FF" />
            </TouchableOpacity>
            <Avatar />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '72%',
        paddingHorizontal: 6,
        marginLeft: 15,
    },
    container: {
        width: '100%',
        position: 'absolute',
        top: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 30,
        backgroundColor: '#fff',
        paddingLeft: 32,
    },
    icon: {
        fontSize: 17,
        color: '#999',
        position: 'relative',
        top: 28,
        left: 10,
        zIndex: 10,
    },
    notificationButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 12,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearIcon: {
        position: 'absolute',
        right: 20,
        top: 28,
        zIndex: 10,
    }
});