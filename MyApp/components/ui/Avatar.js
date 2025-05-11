import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Avatar() {
    return (
        <View style={styles.container}>
            <Text>A</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#CDC1FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
    },
    text: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    }
})