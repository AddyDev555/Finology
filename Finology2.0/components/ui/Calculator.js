import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, moderateScale, verticalScale } from '../utils/responsive'; // Adjust the import path as necessary
const BUTTONS = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
];

export default function Calculator({ color }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handlePress = (val) => {
        if (val === '=') {
            try {
                // eslint-disable-next-line no-eval
                const evalResult = eval(input);
                setResult(evalResult.toString());
            } catch {
                setResult('Error');
            }
        } else {
            setInput(input + val);
            setResult('');
        }
    };

    const handleClear = () => {
        if (input.length > 0) {
            setInput(input.slice(0, -1));
        }
        setResult('');
    };


    const handleAllClear = () => {
        setInput('');
        setResult('');
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.calculatorButton}
                onPress={() => setModalVisible(true)}
            >
                <MaterialCommunityIcons name="calculator-variant" size={32} color={color} />
                {/* <Text style={styles.buttonText}>Calculator</Text> */}
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={32} color="black" />
                    </TouchableOpacity>
                    <View style={styles.display}>
                        <Text style={styles.inputText}>{input}</Text>
                        <Text style={styles.resultText}>{result}</Text>
                    </View>
                    <View style={styles.buttonGrid}>
                        {BUTTONS.map((row, i) => (
                            <View key={i} style={styles.buttonRow}>
                                {row.map((btn) => (
                                    <TouchableOpacity
                                        key={btn}
                                        style={[
                                            styles.calcBtn,
                                            btn === '=' && styles.equalsBtn,
                                            ['+', '-', '*', '/'].includes(btn) && styles.operatorBtn,
                                        ]}
                                        onPress={() => handlePress(btn)}
                                    >
                                        <Text style={styles.calcBtnText}>{btn}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                                <MaterialCommunityIcons name="backspace-outline" size={24} style={styles.calcBtnText} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearBtn} onPress={handleAllClear}>
                                <Text style={styles.calcBtnText}>AC</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    calculatorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2EDFF',
        padding: scale(12),
        borderRadius: moderateScale(10),
        alignSelf: 'center',
        margin: scale(10),
        elevation: 2,
    },
    buttonText: {
        marginLeft: scale(8),
        fontSize: moderateScale(18),
        color: '#4B0082',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'flex-end',
        paddingBottom: 0,
    },
    display: {
        minHeight: verticalScale(280),
        backgroundColor: '#F4F6F8',
        alignItems: 'flex-end',
        padding: scale(24),
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputText: {
        fontSize: moderateScale(28),
        color: '#333',
    },
    resultText: {
        fontSize: moderateScale(36),
        color: '#7B68EE',
        fontWeight: 'bold',
        marginTop: verticalScale(8),
    },
    buttonGrid: {
        padding: scale(16),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(18),
    },
    calcBtn: {
        width: (width - scale(64)) / 4,
        height: verticalScale(60),
        backgroundColor: '#F2EDFF',
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(2),
        elevation: 1,
    },
    calcBtnText: {
        fontSize: moderateScale(22),
        color: '#4B0082',
        fontWeight: '600',
    },
    operatorBtn: {
        backgroundColor: '#E1D7FB',
    },
    equalsBtn: {
        backgroundColor: '#7B68EE',
    },
    clearBtn: {
        flex: 1,
        height: verticalScale(60),
        backgroundColor: '#FF9B9B',
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(8),
    },
    closeBtn: {
        position: 'absolute',
        top: verticalScale(15),
        left: scale(15),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});