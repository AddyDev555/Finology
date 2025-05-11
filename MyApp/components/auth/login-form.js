import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Alert,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginForm({ navigation }) {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        checkFirstLogin();
    }, []);

    const checkFirstLogin = async () => {
        const user = await AsyncStorage.getItem('user');
        if (user) {
            setIsFirstTime(false);
        }
    };

    const handleFirstLogin = async () => {
        if (username && password) {
            await AsyncStorage.setItem('user', JSON.stringify({ username, password }));
            Alert.alert('Login Success', 'Welcome, ' + username);
            setIsFirstTime(false);
            navigation.replace("Home");
        } else {
            Alert.alert('Error', 'Please fill all fields');
        }
    };

    const handlePasswordCheck = async () => {
        const savedData = await AsyncStorage.getItem('user');
        const userData = JSON.parse(savedData);
        if (password === userData.password) {
            Alert.alert('Access Granted', 'Welcome back, ' + userData.username);
            navigation.replace("Home");
        } else {
            Alert.alert('Access Denied', 'Wrong password');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isFirstTime ? "First-Time Login" : "Enter Password to Continue"}</Text>

            {isFirstTime && (
                <TextInput
                    placeholder="Enter username/phone/email"
                    style={styles.input}
                    placeholderTextColor="#777"
                    onChangeText={setUsername}
                />
            )}

            <TextInput
                placeholder={isFirstTime ? "Create Password" : "Password"}
                style={styles.input}
                placeholderTextColor="#777"
                secureTextEntry
                keyboardType="numeric"
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={isFirstTime ? handleFirstLogin : handlePasswordCheck}
            >
                <Text style={styles.buttonText}>{isFirstTime ? "Login" : "Unlock"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CDC1FF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#4B0082',
    },
    input: {
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        width: '100%',
        backgroundColor: '#7B68EE',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});