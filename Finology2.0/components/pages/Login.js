import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LoginForm from '../auth/login-form'

export default function Login({navigation}) {
    return (
        <View style={styles.container}>
            <LoginForm navigation={navigation}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})