import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseEntryPage = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [userData, setUserData] = useState({});

    // Common expense categories
    const categories = [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Travel',
        'Personal Care',
        'Education',
        'Other'
    ];

    // Common business suggestions based on category
    const businessSuggestions = {
        'Food & Dining': ['McDonald\'s', 'Starbucks', 'Pizza Hut', 'Local Restaurant'],
        'Transportation': ['Car Wash', 'Gas Station', 'Uber', 'Parking'],
        'Shopping': ['Walmart', 'Target', 'Amazon', 'Local Store'],
        'Entertainment': ['Movie Theater', 'Concert', 'Sports Event', 'Gaming'],
        'Bills & Utilities': ['Electric Company', 'Internet Provider', 'Phone Bill', 'Water Bill'],
        'Healthcare': ['Pharmacy', 'Doctor Visit', 'Hospital', 'Dentist'],
        'Travel': ['Hotel', 'Airline', 'Car Rental', 'Tourist Attraction'],
        'Personal Care': ['Salon', 'Spa', 'Gym', 'Beauty Store'],
        'Education': ['Bookstore', 'Online Course', 'Tuition', 'Supplies'],
        'Other': ['ATM Fee', 'Bank Charge', 'Miscellaneous', 'Cash Expense']
    };

    // Update date and time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format date and time for display
    const formatDateTime = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handelUsername = async () => {
        const savedData = await AsyncStorage.getItem('user');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        }
    }

    useEffect(()=>{
        handelUsername();
    },[])

    // Validate and save expense
    const saveExpense = async () => {
        if (!amount || !description || !businessName || !category) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Form not Filled',
                text2: 'Please fill in all required fields.',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Invalid Amount',
                text2: 'Please enter a valid amount.',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }

        const expense = {
            user_id: userData.userId,
            amount: parseFloat(amount),
            description: description.trim(),
            business: businessName.trim(),
            category,
            date: currentDateTime,
        };

        handelUsername();

        try {
            const response = await fetch('https://finology.pythonanywhere.com/manual-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expense),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            console.log('Expense saved:', expense);

            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Success',
                text2: `Expense of $${amount} saved successfully!`,
                visibilityTime: 3000,
                autoHide: true,
            });

            clearForm();
        } catch (error) {
            console.error('Error saving expense:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to save expense. Please try again.',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
    };

    // Clear form after saving
    const clearForm = () => {
        setAmount('');
        setDescription('');
        setBusinessName('');
        setCategory('');
    };

    // Handle business name suggestion selection
    const selectBusinessSuggestion = (business) => {
        setBusinessName(business);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Add Expense</Text>
                        <Text style={styles.dateTime}>{formatDateTime(currentDateTime)}</Text>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>

                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount *</Text>
                            <View style={styles.amountContainer}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0.00"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Category Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={category}
                                    onValueChange={setCategory}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                >
                                    <Picker.Item label="Select a category" value="" />
                                    {categories.map((cat, index) => (
                                        <Picker.Item key={index} label={cat} value={cat} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Business/Store Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business/Store Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={businessName}
                                onChangeText={setBusinessName}
                                placeholder="e.g., McDonald's, Shell Gas Station"
                                placeholderTextColor="#999"
                                returnKeyType="next"
                            />

                            {/* Business Suggestions */}
                            {category && businessSuggestions[category] && (
                                <View style={styles.suggestionsContainer}>
                                    <Text style={styles.suggestionsTitle}>Quick Select:</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.suggestionsScroll}
                                    >
                                        {businessSuggestions[category].map((business, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionChip}
                                                onPress={() => selectBusinessSuggestion(business)}
                                            >
                                                <Text style={styles.suggestionText}>{business}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={[styles.textInput, styles.descriptionInput]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What was this expense for?"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                returnKeyType="done"
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity style={styles.saveButton} onPress={saveExpense}>
                            <Text style={styles.saveButtonText}>Save Expense</Text>
                        </TouchableOpacity>

                        {/* Clear Button */}
                        <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
                            <Text style={styles.clearButtonText}>Clear Form</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    dateTime: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        paddingLeft: 15,
        paddingRight: 5,
    },
    amountInput: {
        flex: 1,
        height: 50,
        fontSize: 18,
        color: '#333',
        paddingRight: 15,
    },
    textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    descriptionInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    picker: {
        height: 55,
    },
    pickerItem: {
        height: 50,
    },
    suggestionsContainer: {
        marginTop: 10,
    },
    suggestionsTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    suggestionsScroll: {
        paddingVertical: 5,
    },
    suggestionChip: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    suggestionText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    clearButtonText: {
        color: '#999',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ExpenseEntryPage;