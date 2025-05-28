import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function SignupForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({});
    const navigation = useNavigation();
    const [isFirstTime, setIsFirstTime] = useState(false);

    const handleSignup = () => {
        let errors = {};
        const FormPayload = {
            "username": username,
            "email": email,
            "phoneNumber": `${countryCode}${phoneNumber}`,
            "password": password
        }

        // Validate all fields
        if (!username) errors.username = "Username is required";
        if (!email) errors.email = "Email is required";
        if (!phoneNumber) errors.phoneNumber = "Phone number is required";
        if (!password) errors.password = "Password is required";

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (email && !emailRegex.test(email)) {
            errors.email = "Invalid email format";
        }

        if (phoneNumber && phoneNumber.length !== 10) {
            errors.phoneNumber = "Phone number must be 10 digits";
        }

        if (password && password.length !== 5) {
            errors.password = "Password must be 5 characters long";
        }

        // If there are errors, set them in state
        if (Object.keys(errors).length > 0) {
            setError(errors);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Please fill in all the required fields.',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }

        fetch('https://finology.pythonanywhere.com/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(FormPayload),
        })
            .then(response => {
                if (!response.ok) {
                    Toast.show({
                        type: 'error',
                        position: 'top',
                        text1: 'Failed!',
                        text2: `${response.json().error}`,
                        visibilityTime: 3000,
                        autoHide: true,
                    });
                }
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Success!',
                    text2: `${response.json().message}`,
                    visibilityTime: 3000,
                    autoHide: true,
                });

                setError({});
                setUsername('');
                setEmail('');
                setCountryCode('+91');
                setPhoneNumber('');
                setPassword('');

                navigation.navigate('Login');
            })
            .then(data => {
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Submission error:', error);
            });
    };

    const loginNavigation = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.signupContainer}>
                <View style={styles.logoTitleContainer}>
                    <View style={isFirstTime ? styles.logoContainer : styles.logoLeftContainer}>
                        <Image source={require('../../assets/mainLogo.png')} style={styles.logo} />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                </View>

                {/* Username */}
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#777"
                    onChangeText={setUsername}
                    value={username}
                />
                {error.username && <Text style={styles.errorText}>{error.username}</Text>}

                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#777"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />
                {error.email && <Text style={styles.errorText}>{error.email}</Text>}

                {/* Phone */}
                <Text style={styles.label}>Phone Number</Text>
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
                        style={styles.phoneInput}
                        placeholderTextColor="#777"
                        keyboardType="phone-pad"
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                        maxLength={10}
                    />
                </View>
                {error.phoneNumber && <Text style={styles.errorText}>{error.phoneNumber}</Text>}

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#777"
                    secureTextEntry
                    keyboardType="numeric"
                    onChangeText={setPassword}
                    value={password}
                    maxLength={5}
                />
                {error.password && <Text style={styles.errorText}>{error.password}</Text>}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={loginNavigation}>
                    <Text style={[styles.loginNav, { textAlign: 'center' }]}>
                        Already got an account? Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    signupContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    logoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4B0082',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
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
        marginTop: 15,
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
    loginNav: {
        marginTop: 10,
        color: '#4B0082',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    label: {
        fontSize: 15,
        color: '#4B0082',
        marginBottom: 4,
        marginTop: 10,
        fontWeight: '600',
    },
});