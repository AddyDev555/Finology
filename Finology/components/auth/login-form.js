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
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

export default function LoginForm({ navigation }) {
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [name, setName] = useState('');

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
            const FormPayload = {
                "phoneNumber": `${countryCode}${username}`,
                "password": password
            }
            try {
                const response = await fetch('https://finology.pythonanywhere.com/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(FormPayload),
                });

                const data = await response.json();

                if (!response.ok) {
                    Toast.show({
                        type: 'error',
                        position: 'top',
                        text1: 'Failed!',
                        text2: data.error || 'Login failed.',
                        visibilityTime: 3000,
                        autoHide: true,
                    });
                    return;
                }

                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: `Success!, Welcome ${data.username}`,
                    text2: data.message || 'Login successful!',
                    visibilityTime: 3000,
                    autoHide: true,
                });

                const name = data.username;
                const userId = data.userId;
                setName(name);

                await AsyncStorage.setItem('user', JSON.stringify({userId, name, username, password }));
                setIsFirstTime(false);

                setUsername('');
                setPassword('');
            } catch (error) {
                console.error('Submission error:', error);
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Network Error',
                    text2: error.message,
                    visibilityTime: 3000,
                    autoHide: true,
                });
            }
        } else {
            Alert.alert('Error', 'Please fill all fields');
        }
    };

    const handlePasswordCheck = async () => {
        const savedData = await AsyncStorage.getItem('user');
        const userData = JSON.parse(savedData);
        if (password === userData.password) {
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Access Granted!',
                text2: 'Welcome back, ' + userData.name,
                visibilityTime: 3000,
                autoHide: true,
            });
            navigation.replace("Home");
        } else {
            Alert.alert('Access Denied', 'Wrong password');
        }
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
                    <View style={styles.phoneContainer}>
                        <Picker
                            selectedValue={countryCode}
                            style={styles.picker}
                            onValueChange={(itemValue) => setCountryCode(itemValue)}
                        >
                            <Picker.Item label="+91 🇮🇳" value="+91" />
                            <Picker.Item label="+1 🇺🇸" value="+1" />
                            <Picker.Item label="+44 🇬🇧" value="+44" />
                            <Picker.Item label="+61 🇦🇺" value="+61" />
                        </Picker>
                        <TextInput
                            placeholder="Phone Number"
                            style={styles.phoneInput}
                            placeholderTextColor="#777"
                            keyboardType="phone-pad"
                            onChangeText={setUsername}
                            value={username}
                            maxLength={10}
                        />
                    </View>
                    <TextInput
                        placeholder="Enter Password"
                        style={styles.input}
                        placeholderTextColor="#777"
                        secureTextEntry
                        keyboardType="numeric"
                        onChangeText={setPassword}
                        maxLength={5}
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
                        maxLength={5}
                    />
                    <TouchableOpacity style={styles.button} onPress={handlePasswordCheck}>
                        <Text style={styles.buttonText}>Unlock</Text>
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
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    picker: {
        width: 129,
        height: 50,
        backgroundColor: '#F2EDFF',
        borderRadius: 50,
    },
    phoneInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#333',
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