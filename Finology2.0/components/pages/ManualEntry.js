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
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../ui/BottomBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Calculator from '../ui/Calculator';
import { scale, moderateScale, verticalScale } from '../utils/responsive';

const ExpenseEntryPage = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [userData, setUserData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Added search query state

    // Categories with React Native Vector Icons
    const categoriesWithIcons = [
        { name: 'Food & Dining', icon: 'cutlery', iconLibrary: 'FontAwesome', color: '#FF6B6B' },
        { name: 'Transportation', icon: 'car', iconLibrary: 'FontAwesome', color: '#4ECDC4' },
        { name: 'Shopping', icon: 'shopping-bag', iconLibrary: 'FontAwesome', color: '#45B7D1' },
        { name: 'Entertainment', icon: 'gamepad', iconLibrary: 'FontAwesome', color: '#4CAF50' },
        { name: 'Bills & Utilities', icon: 'bolt', iconLibrary: 'FontAwesome', color: '#FF9800' },
        { name: 'Healthcare', icon: 'hospital-o', iconLibrary: 'FontAwesome', color: '#4B0082' },
        { name: 'Travel', icon: 'plane', iconLibrary: 'FontAwesome', color: '#98D8C8' },
        { name: 'Personal Care', icon: 'heart', iconLibrary: 'FontAwesome', color: '#F7DC6F' },
        { name: 'Education', icon: 'graduation-cap', iconLibrary: 'FontAwesome', color: '#BB8FCE' },
        { name: 'Housing & Rent', icon: 'home', iconLibrary: 'FontAwesome', color: '#F4A460' },
        { name: 'Clothing & Fashion', icon: 'shopping-cart', iconLibrary: 'FontAwesome', color: '#FF69B4' },
        { name: 'Fuel & Gas', icon: 'tint', iconLibrary: 'FontAwesome', color: '#A52A2A' },
        { name: 'Coffee & Beverages', icon: 'coffee', iconLibrary: 'FontAwesome', color: '#D2691E' },
        { name: 'Movies & Cinema', icon: 'film', iconLibrary: 'FontAwesome', color: '#9C27B0' },
        { name: 'Music & Audio', icon: 'music', iconLibrary: 'FontAwesome', color: '#3F51B5' },
        { name: 'Fitness & Gym', icon: 'heartbeat', iconLibrary: 'FontAwesome', color: '#FF1493' },
        { name: 'Pharmacy & Medicine', icon: 'medkit', iconLibrary: 'FontAwesome', color: '#008080' },
        { name: 'Mobile & Phone', icon: 'mobile', iconLibrary: 'FontAwesome', color: '#607D8B' },
        { name: 'Internet & WiFi', icon: 'wifi', iconLibrary: 'FontAwesome', color: '#03A9F4' },
        { name: 'ATM & Banking', icon: 'credit-card', iconLibrary: 'FontAwesome', color: '#795548' },
        { name: 'Gifts & Donations', icon: 'gift', iconLibrary: 'FontAwesome', color: '#E91E63' },
        { name: 'Baby & Kids', icon: 'child', iconLibrary: 'FontAwesome', color: '#FFB6C1' },
        { name: 'Pets & Animals', icon: 'paw', iconLibrary: 'FontAwesome', color: '#8BC34A' },
        { name: 'Home Maintenance', icon: 'wrench', iconLibrary: 'FontAwesome', color: '#A9A9A9' },
        { name: 'Electronics & Tech', icon: 'laptop', iconLibrary: 'FontAwesome', color: '#00008B' },
        { name: 'Photography', icon: 'camera', iconLibrary: 'FontAwesome', color: '#FF4500' },
        { name: 'Books & Reading', icon: 'book', iconLibrary: 'FontAwesome', color: '#6A5ACD' },
        { name: 'Art & Craft', icon: 'paint-brush', iconLibrary: 'FontAwesome', color: '#FF6347' },
        { name: 'Garden & Plants', icon: 'leaf', iconLibrary: 'FontAwesome', color: '#228B22' },
        { name: 'Laundry & Cleaning', icon: 'local-laundry-service', iconLibrary: 'MaterialIcons', color: '#ADD8E6' },
        { name: 'Insurance', icon: 'security', iconLibrary: 'MaterialIcons', color: '#808080' },
        { name: 'Alcohol & Drinks', icon: 'glass', iconLibrary: 'FontAwesome', color: '#C71585' },
        { name: 'Other', icon: 'ellipsis-h', iconLibrary: 'FontAwesome', color: '#85C1E9' }
    ];

    // Filter categories based on search query
    const filteredCategories = categoriesWithIcons.filter(categoryItem =>
        categoryItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Common business suggestions based on category
    const businessSuggestions = {
        'Food & Dining': ['McDonald\'s', 'Starbucks', 'Pizza Hut', 'Local Restaurant', 'KFC', 'Subway'],
        'Transportation': ['Car Wash', 'Gas Station', 'Uber', 'Parking', 'Metro', 'Bus Ticket'],
        'Shopping': ['Walmart', 'Target', 'Amazon', 'Local Store', 'Mall', 'Online Shopping'],
        'Entertainment': ['Movie Theater', 'Concert', 'Sports Event', 'Gaming', 'Amusement Park', 'Netflix'],
        'Bills & Utilities': ['Electric Company', 'Internet Provider', 'Phone Bill', 'Water Bill', 'Gas Bill', 'Cable TV'],
        'Healthcare': ['Pharmacy', 'Doctor Visit', 'Hospital', 'Dentist', 'Lab Test', 'Eye Checkup'],
        'Travel': ['Hotel', 'Airline', 'Car Rental', 'Tourist Attraction', 'Train Ticket', 'Travel Insurance'],
        'Personal Care': ['Salon', 'Spa', 'Gym', 'Beauty Store', 'Barber Shop', 'Massage'],
        'Education': ['Bookstore', 'Online Course', 'Tuition', 'Supplies', 'Library', 'Certification'],
        'Housing & Rent': ['Monthly Rent', 'Property Tax', 'Home Insurance', 'Maintenance', 'Security Deposit', 'HOA Fee'],
        'Clothing & Fashion': ['Clothing Store', 'Shoes', 'Accessories', 'Jewelry', 'Watch', 'Designer Store'],
        'Fuel & Gas': ['Gas Station', 'Petrol Pump', 'Diesel', 'CNG', 'Fuel Card', 'Vehicle Fuel'],
        'Coffee & Beverages': ['Starbucks', 'Local Café', 'Tea Shop', 'Juice Bar', 'Energy Drink', 'Coffee Shop'],
        'Movies & Cinema': ['Movie Theater', 'IMAX', 'Drive-in', 'Film Festival', 'Movie Rental', 'Cinema Hall'],
        'Music & Audio': ['Spotify', 'Concert Ticket', 'Music Store', 'Headphones', 'Speakers', 'Vinyl Records'],
        'Fitness & Gym': ['Gym Membership', 'Personal Trainer', 'Yoga Class', 'Sports Equipment', 'Fitness App', 'Swimming Pool'],
        'Pharmacy & Medicine': ['CVS', 'Walgreens', 'Local Pharmacy', 'Prescription', 'Over-the-counter', 'Medical Store'],
        'Mobile & Phone': ['Phone Bill', 'Mobile Recharge', 'Phone Repair', 'New Phone', 'Phone Case', 'Telecom'],
        'Internet & WiFi': ['Internet Bill', 'WiFi Setup', 'Router', 'Broadband', 'Data Plan', 'Network Provider'],
        'ATM & Banking': ['ATM Fee', 'Bank Charge', 'Wire Transfer', 'Check Fee', 'Account Fee', 'Service Charge'],
        'Gifts & Donations': ['Birthday Gift', 'Wedding Gift', 'Charity', 'Donation', 'Holiday Gift', 'Anniversary'],
        'Baby & Kids': ['Baby Food', 'Diapers', 'Toys', 'Kids Clothes', 'Daycare', 'Baby Supplies'],
        'Pets & Animals': ['Pet Food', 'Vet Visit', 'Pet Grooming', 'Pet Supplies', 'Pet Insurance', 'Pet Store'],
        'Home Maintenance': ['Plumber', 'Electrician', 'Carpenter', 'Paint', 'Tools', 'Home Repair'],
        'Electronics & Tech': ['Best Buy', 'Apple Store', 'Computer Store', 'Phone Store', 'Tech Repair', 'Electronics'],
        'Photography': ['Camera Store', 'Photo Printing', 'Photography Equipment', 'Photo Studio', 'Camera Repair', 'Lens'],
        'Books & Reading': ['Bookstore', 'Amazon Books', 'Library Fee', 'E-book', 'Magazine', 'Newspaper'],
        'Art & Craft': ['Art Store', 'Craft Supplies', 'Art Class', 'Paint', 'Canvas', 'Craft Materials'],
        'Garden & Plants': ['Garden Center', 'Plant Store', 'Seeds', 'Fertilizer', 'Garden Tools', 'Nursery'],
        'Laundry & Cleaning': ['Dry Cleaner', 'Laundromat', 'Cleaning Supplies', 'Laundry Service', 'Detergent', 'Stain Removal'],
        'Insurance': ['Car Insurance', 'Health Insurance', 'Life Insurance', 'Home Insurance', 'Premium Payment', 'Policy Fee'],
        'Alcohol & Drinks': ['Liquor Store', 'Wine Shop', 'Bar', 'Brewery', 'Cocktail', 'Beer Store'],
        'Other': ['ATM Fee', 'Bank Charge', 'Miscellaneous', 'Cash Expense', 'Unknown', 'General']
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

    useEffect(() => {
        handelUsername();
    }, [])

    // Handle category selection
    const selectCategory = (selectedCategory) => {
        setCategory(selectedCategory);
        setShowForm(true);
    };

    // Handle back to categories
    const backToCategories = () => {
        setShowForm(false);
        setCategory('');
        setSearchQuery(''); // Clear search when going back
        clearForm();
    };

    // Clear search function
    const clearSearch = () => {
        setSearchQuery('');
    };

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
                text2: `Expense of ₹${amount} saved successfully!`,
                visibilityTime: 3000,
                autoHide: true,
            });

            clearForm();
            setShowForm(false);
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
    };

    // Handle business name suggestion selection
    const selectBusinessSuggestion = (business) => {
        setBusinessName(business);
    };

    // Get selected category icon
    const getSelectedCategoryIcon = () => {
        const selectedCat = categoriesWithIcons.find(cat => cat.name === category);
        return selectedCat ? { icon: selectedCat.icon, library: selectedCat.iconLibrary, color: selectedCat.color } : { icon: 'ellipsis-h', library: 'FontAwesome' };
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
                        <View style={styles.headerContent}>
                            {showForm && (
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={backToCategories}
                                >
                                    <Ionicons name="arrow-back" size={25} color="#000" style={styles.backButtonText} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.headerTitle}>
                                {showForm ? `${category}` : 'Add Expense'}
                            </Text>
                            <Text style={styles.dateTime}>{formatDateTime(currentDateTime)}</Text>
                        </View>
                        <View style={{ marginLeft: 'auto' }}>
                            <Calculator color="#8B5CF6" />
                        </View>
                    </View>

                    {!showForm ? (
                        // Category Selection Screen
                        <View style={styles.categoryContainer}>
                            <View style={styles.searchContainer}>
                                <MaterialCommunityIcon
                                    name="magnify"
                                    size={22}
                                    color="#888"
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search Categories..."
                                    placeholderTextColor="#888"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton2}>
                                        <MaterialCommunityIcon
                                            name="close-circle"
                                            size={20}
                                            color="#888"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            {/* Show filtered results count */}
                            {searchQuery.length > 0 && (
                                <Text style={styles.resultsCount}>
                                    {filteredCategories.length} categories found
                                </Text>
                            )}
                            
                            {/* No results message */}
                            {searchQuery.length > 0 && filteredCategories.length === 0 && (
                                <View style={styles.noResultsContainer}>
                                    <MaterialCommunityIcon
                                        name="magnify"
                                        size={48}
                                        color="#ccc"
                                        style={styles.noResultsIcon}
                                    />
                                    <Text style={styles.noResultsText}>No categories found</Text>
                                    <Text style={styles.noResultsSubtext}>
                                        Try searching with different keywords
                                    </Text>
                                </View>
                            )}
                            
                            <View style={styles.categoriesGrid}>
                                {filteredCategories.map((categoryItem, index) => {
                                    const IconComponent = categoryItem.iconLibrary === 'MaterialIcons' ? MaterialIcon :
                                        categoryItem.iconLibrary === 'MaterialCommunityIcons' ? MaterialCommunityIcon : Icon;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.categoryCard}
                                            onPress={() => selectCategory(categoryItem.name)}
                                            activeOpacity={0.7}
                                        >
                                            <IconComponent
                                                name={categoryItem.icon}
                                                size={24}
                                                color={categoryItem.color}
                                                style={styles.categoryIcon}
                                            />
                                            <Text style={styles.categoryName}>{categoryItem.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        // Expense Form
                        <View style={styles.formContainer}>
                            {/* Selected Category Display */}
                            <View style={[styles.selectedCategoryContainer, { borderLeftColor: getSelectedCategoryIcon().color || '#8B5CF6' }]}>
                                {(() => {
                                    const selectedIcon = getSelectedCategoryIcon();
                                    const IconComponent = selectedIcon.library === 'MaterialIcons' ? MaterialIcon :
                                        selectedIcon.library === 'MaterialCommunityIcons' ? MaterialCommunityIcon : Icon;
                                    return (
                                        <IconComponent
                                            name={selectedIcon.icon}
                                            size={24}
                                            color={selectedIcon.color || '#8B5CF6'}
                                            style={styles.selectedCategoryIconStyle}
                                        />
                                    );
                                })()}
                                <View style={styles.selectedCategoryInfo}>
                                    <Text style={styles.selectedCategoryLabel}>Category</Text>
                                    <Text style={styles.selectedCategoryName}>{category}</Text>
                                </View>
                            </View>

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

                            <View style={{ flexDirection: 'row', gap: 50, alignItems: 'center' }}>
                                {/* Save Button */}
                                <TouchableOpacity style={styles.saveButton} onPress={saveExpense}>
                                    <Text style={styles.saveButtonText}>Save Expense</Text>
                                </TouchableOpacity>

                                {/* Clear Button */}
                                <TouchableOpacity style={[styles.clearButton, { marginTop: 20 }]} onPress={clearForm}>
                                    <Text style={styles.clearButtonText}>Clear Form</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.bottomBar}>
                <BottomBar />
            </View>
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
        backgroundColor: '#8B5CF6',
        padding: scale(20),
        paddingTop: verticalScale(40),
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerContent: {
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        paddingVertical: verticalScale(5),
    },
    backButtonText: {
        color: 'white',
        marginRight: scale(30),
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: verticalScale(5),
    },
    dateTime: {
        fontSize: moderateScale(14),
        color: 'rgba(255, 255, 255, 0.9)',
    },
    categoryContainer: {
        padding: scale(20),
        paddingBottom: verticalScale(100),
    },
    categoryTitle: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    categorySubtitle: {
        fontSize: moderateScale(16),
        color: '#666',
        textAlign: 'center',
        marginBottom: verticalScale(30),
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: moderateScale(12),
        padding: scale(20),
        alignItems: 'center',
        marginBottom: verticalScale(15),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    categoryIcon: {
        marginBottom: verticalScale(10),
    },
    categoryName: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    formContainer: {
        padding: scale(20),
        paddingBottom: verticalScale(120),
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: moderateScale(12),
        padding: scale(15),
        marginBottom: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(2),
        elevation: 2,
        borderLeftWidth: 4,
    },
    selectedCategoryIconStyle: {
        marginRight: scale(15),
    },
    selectedCategoryInfo: {
        flex: 1,
    },
    selectedCategoryLabel: {
        fontSize: moderateScale(12),
        color: '#666',
        marginBottom: verticalScale(2),
    },
    selectedCategoryName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    inputGroup: {
        marginBottom: verticalScale(5),
    },
    label: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: verticalScale(8),
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(2),
        elevation: 2,
    },
    currencySymbol: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
        paddingLeft: scale(15),
        paddingRight: scale(5),
    },
    amountInput: {
        flex: 1,
        height: verticalScale(50),
        fontSize: moderateScale(18),
        color: '#333',
        paddingRight: scale(15),
    },
    textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        padding: scale(15),
        fontSize: moderateScale(16),
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(2),
        elevation: 2,
    },
    descriptionInput: {
        height: verticalScale(80),
        textAlignVertical: 'top',
    },
    suggestionsContainer: {
        marginTop: verticalScale(10),
    },
    suggestionsTitle: {
        fontSize: moderateScale(14),
        color: '#666',
        marginBottom: verticalScale(8),
    },
    suggestionsScroll: {
        paddingVertical: verticalScale(5),
    },
    suggestionChip: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        marginRight: scale(8),
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    suggestionText: {
        color: '#2196F3',
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: moderateScale(8),
        padding: scale(15),
        alignItems: 'center',
        marginTop: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    saveButtonText: {
        color: 'white',
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: moderateScale(8),
        padding: scale(15),
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    clearButton2: {
        backgroundColor: 'transparent',
        borderColor: '#999',
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#999',
        fontSize: moderateScale(16),
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: scale(10),
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: moderateScale(10),
        paddingHorizontal: scale(10),
        marginBottom: verticalScale(10),
        marginVertical: 0,
        backgroundColor: 'white',
    },
    searchIcon: {
        marginTop: verticalScale(2),
        marginRight: scale(8),
    },
    searchInput: {
        flex: 1,
        fontSize: moderateScale(16),
        paddingVertical: verticalScale(10),
        color: '#000',
        backgroundColor: 'white',
    },
});

export default ExpenseEntryPage;