import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import Avatar from './Avatar';
import { router } from 'expo-router';
import { scale, moderateScale, verticalScale } from '../utils/responsive';

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
        paddingHorizontal: scale(6),
        marginLeft: scale(15),
    },
    container: {
        width: '100%',
        position: 'absolute',
        top: verticalScale(30),
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: verticalScale(40),
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: moderateScale(30),
        backgroundColor: '#fff',
        paddingLeft: scale(32),
    },
    icon: {
        fontSize: moderateScale(17),
        color: '#999',
        position: 'relative',
        top: verticalScale(28),
        left: scale(10),
        zIndex: 10,
    },
    notificationButton: {
        padding: scale(8),
        borderRadius: moderateScale(12),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
        marginTop: verticalScale(12),
        marginRight: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearIcon: {
        position: 'absolute',
        right: scale(20),
        top: verticalScale(28),
        zIndex: 10,
    }
});