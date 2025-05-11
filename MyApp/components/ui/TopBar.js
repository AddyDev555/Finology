import { StyleSheet, Text, View, TextInput } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import Avatar from './Avatar';

export default function TopBar() {
    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Feather name="search" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#999"
                />
            </View>
            <Avatar />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer:{
        width: '92%',
        paddingHorizontal: 14,
        marginLeft: 5,
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
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingLeft: 29,
    },
    icon: {
        fontSize: 17,
        color: '#999',
        position: 'relative',
        top: 27,
        left: 8,
        zIndex: 10,
    }
});
