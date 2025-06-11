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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from '@/components/utils/responsive';

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

                await AsyncStorage.setItem('user', JSON.stringify({ userId, name, username, password }));
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
            router.replace("/home");
        } else {
            Alert.alert('Access Denied', 'Wrong password');
        }
    };

    const signUpNavigation = () => {
        router.replace("/signup");
        setIsFirstTime(true);
    };

    const handleNumericKeyPress = (num) => {
        if (password.length < 5) {
            setPassword(prevPassword => prevPassword + num);
        }
    };

    const handleDeletePress = () => {
        setPassword(prevPassword => prevPassword.slice(0, -1));
    };

    const renderPasswordDots = () => {
        const dots = [];
        const maxLength = 5;

        for (let i = 0; i < maxLength; i++) {
            dots.push(
                <View
                    key={i}
                    style={[
                        styles.passwordDot,
                        i < password.length ? styles.passwordDotFilled : {}
                    ]}
                />
            );
        }
        return dots;
    };

    return (
        <View style={styles.container}>
            {isFirstTime && (
                <View style={styles.loginFormContainer}>
                    <View style={styles.titleContainer}>
                        <View style={isFirstTime ? styles.logoContainer : styles.logoLeftContainer}>
                            <Image source={require('@/assets/images/mainLogo.png')} style={styles.logo} />
                        </View>
                        <Text style={styles.title}>Login</Text>
                    </View>
                    
                    {/* Phone Number Field with Label */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
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
                                keyboardType="phone-pad"
                                onChangeText={setUsername}
                                value={username}
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Password Field with Label */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            keyboardType="numeric"
                            onChangeText={setPassword}
                            maxLength={5}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleFirstLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.NavText} onPress={signUpNavigation}>
                        <Text style={styles.NavText}>don't have an account? Signup</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isFirstTime && (
                <>
                    <View style={styles.passwordContainer}>
                        <Text style={styles.unlockTitle}>Enter PIN</Text>
                        <View style={styles.dotsContainer}>
                            {renderPasswordDots()}
                        </View>
                    </View>

                    <View style={styles.keypadContainer}>
                        {/* Row 1 */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('1')}>
                                <Text style={styles.keypadButtonText}>1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('2')}>
                                <Text style={styles.keypadButtonText}>2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('3')}>
                                <Text style={styles.keypadButtonText}>3</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('4')}>
                                <Text style={styles.keypadButtonText}>4</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('5')}>
                                <Text style={styles.keypadButtonText}>5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('6')}>
                                <Text style={styles.keypadButtonText}>6</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Row 3 */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('7')}>
                                <Text style={styles.keypadButtonText}>7</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('8')}>
                                <Text style={styles.keypadButtonText}>8</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('9')}>
                                <Text style={styles.keypadButtonText}>9</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Row 4 */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumericKeyPress('0')}>
                                <Text style={styles.keypadButtonText}>0</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={handleDeletePress}>
                                <Text style={styles.deleteButtonText}>⌫</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.keypadButton} onPress={handlePasswordCheck} disabled={password.length !== 5}>
                                <MaterialCommunityIcons name="lock-open-variant" size={30} color="#4B0082" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(30),
    },
    logoContainer: {
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
        width: scale(50),
        height: scale(50),
        marginBottom: verticalScale(20),
    },
    logoTitle: {
        fontSize: scale(30),
        fontWeight: 'bold',
        color: 'black',
        marginLeft: scale(5),
        position: 'relative',
        bottom: verticalScale(10),
    },
    loginFormContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: scale(15),
        padding: scale(25),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    titleContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    title: {
        fontSize: scale(28),
        fontWeight: 'bold',
        color: '#4B0082',
        marginBottom: verticalScale(20),
    },
    unlockTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(20),
        color: '#4B0082',
    },
    inputContainer: {
        width: '100%',
        marginBottom: verticalScale(20),
    },
    inputLabel: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#4B0082',
        marginBottom: verticalScale(8),
        marginLeft: scale(4),
    },
    input: {
        width: '100%',
        backgroundColor: '#F2EDFF',
        borderRadius: scale(10),
        padding: moderateScale(15),
        fontSize: scale(16),
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
        borderRadius: scale(10),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    picker: {
        width: scale(129),
        height: verticalScale(50),
        backgroundColor: '#F2EDFF',
        borderRadius: scale(50),
    },
    phoneInput: {
        flex: 1,
        paddingLeft: 0,
        padding: moderateScale(15),
        fontSize: scale(16),
        color: '#333',
    },
    button: {
        width: '100%',
        backgroundColor: '#7B68EE',
        paddingVertical: verticalScale(15),
        borderRadius: scale(10),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
        marginTop: verticalScale(5),
    },
    buttonActive: {
        backgroundColor: '#7B68EE',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: scale(16),
        letterSpacing: 1,
    },
    NavText: {
        marginTop: verticalScale(10),
        color: '#4B0082',
        fontSize: scale(16),
        textDecorationLine: 'underline',
        textAlign: 'center',
        alignSelf: 'center',
    },
    passwordContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    passwordDot: {
        width: scale(16),
        height: scale(16),
        borderRadius: scale(8),
        backgroundColor: '#F2EDFF',
        marginHorizontal: scale(8),
        borderWidth: 1,
        borderColor: '#A697E8',
    },
    passwordDotFilled: {
        backgroundColor: '#7B68EE',
        borderColor: '#4B0082',
    },
    keypadContainer: {
        position: 'relative',
        top: verticalScale(100),
        width: '90%',
        maxWidth: scale(320),
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    keypadButton: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2EDFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    keypadButtonText: {
        fontSize: scale(28),
        fontWeight: '500',
        color: '#4B0082',
    },
    deleteButtonText: {
        fontSize: scale(24),
        fontWeight: '500',
        color: '#9370DB',
    },
});