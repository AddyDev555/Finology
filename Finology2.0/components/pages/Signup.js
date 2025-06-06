import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SignupForm from '../auth/signup-form'
export default function Signup() {
    return (
        <View style={styles.container}>
            <SignupForm />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})