import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from '@/components/utils/responsive';

export default function SignupForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState({});
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

                router.navigate('/');
            })
            .then(data => {
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Submission error:', error);
            });
    };

    const loginNavigation = () => {
        router.navigate('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.signupContainer}>
                <View style={styles.logoTitleContainer}>
                    <View style={isFirstTime ? styles.logoContainer : styles.logoLeftContainer}>
                        <Image source={require('@/assets/images/mainLogo.png')} style={styles.logo} />
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
        paddingHorizontal: scale(30),
    },
    signupContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: scale(15),
        padding: scale(25),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: verticalScale(4),
        },
        shadowOpacity: 0.1,
        shadowRadius: scale(8),
        elevation: 8,
    },
    logoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    logoLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: scale(50),
        height: scale(50),
        marginRight: scale(5),
    },
    title: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#4B0082',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: scale(10),
        padding: moderateScale(15),
        marginBottom: verticalScale(10),
        fontSize: scale(16),
        color: '#333',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowRadius: scale(4),
        elevation: 3,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: scale(10),
        marginBottom: verticalScale(10),
        overflow: 'hidden',
    },
    picker: {
        width: scale(129),
        height: verticalScale(50),
        backgroundColor: '#F2EDFF',
        borderRadius: scale(50),
    },
    phoneInput: {
        flex: 1,
        padding: moderateScale(15),
        fontSize: scale(16),
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#7B68EE',
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(15),
        borderRadius: scale(10),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowRadius: scale(6),
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: scale(16),
        letterSpacing: 1,
    },
    loginNav: {
        marginTop: verticalScale(10),
        color: '#4B0082',
        fontSize: scale(16),
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: scale(12),
        marginBottom: verticalScale(10),
    },
    label: {
        fontSize: scale(15),
        color: '#4B0082',
        marginBottom: verticalScale(4),
        marginTop: verticalScale(10),
        fontWeight: '600',
    },
});