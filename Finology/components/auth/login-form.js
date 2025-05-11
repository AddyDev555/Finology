import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Alert,
    Image,
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
            // navigation.replace("Home");
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

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        setUsername('');
        setPassword('');
        setIsFirstTime(true);
        Alert.alert('Logged out', 'You have been logged out successfully.');
    };

    const signUpNavigation = () => {
        navigation.navigate('Signup');
        setIsFirstTime(true);
    };

    return (
        <View style={styles.container}>
            {/* <View style={isFirstTime ? styles.logoContainer : styles.logoLeftContainer}>
                <Image source={require('../../assets/Logo.png')} style={styles.logo} />
                <Text style={styles.logoTitle}>Finology</Text>
            </View> */}

            {isFirstTime && (
                <>
                    <Text style={styles.title}>Login</Text>
                    <TextInput
                        placeholder="Enter phone-number"
                        style={styles.input}
                        placeholderTextColor="#777"
                        onChangeText={setUsername}
                    />
                    <TextInput
                        placeholder="Enter Password"
                        style={styles.input}
                        placeholderTextColor="#777"
                        secureTextEntry
                        keyboardType="numeric"
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleFirstLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.NavText} onPress={signUpNavigation}>
                        <Text style={styles.NavText}>don't have an account? Signup</Text>
                    </TouchableOpacity>
                </>
            )}

            {!isFirstTime && (
                <>
                    <TextInput
                        placeholder="Enter Password"
                        style={styles.input}
                        placeholderTextColor="#777"
                        secureTextEntry
                        keyboardType="number-pad"
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.button} onPress={handlePasswordCheck}>
                        <Text style={styles.buttonText}>Unlock</Text>
                    </TouchableOpacity>

                    {/* Logout button */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </>
            )}

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
    logoContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },

    logoLeftContainer: {
        width: '100%',
        position: 'relative',
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginBottom: 20,
    },
    logoTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5,
        position: 'relative',
        bottom: 10,
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
    NavText: {
        marginTop: 10,
        color: '#4B0082',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});