import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const EditExpense = ({
    visible,
    expense,
    onClose,
    onSave,
    categories = []
}) => {
    const [amount, setAmount] = useState('');
    const [business, setBusiness] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default categories if none provided
    const defaultCategories = [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Travel',
        'Personal Care',
        'Education',
        'Housing & Rent',
        'Clothing & Fashion',
        'Fuel & Gas',
        'Coffee & Beverages',
        'Movies & Cinema',
        'Music & Audio',
        'Fitness & Gym',
        'Pharmacy & Medicine',
        'Mobile & Phone',
        'Internet & WiFi',
        'ATM & Banking',
        'Gifts & Donations',
        'Baby & Kids',
        'Pets & Animals',
        'Home Maintenance',
        'Electronics & Tech',
        'Photography',
        'Books & Reading',
        'Art & Craft',
        'Garden & Plants',
        'Laundry & Cleaning',
        'Insurance',
        'Alcohol & Drinks',
        'Other'
    ];

    const availableCategories = categories.length > 0 ? categories : defaultCategories;

    // Category configuration for colors and icons
    const categoryConfig = {
        'Food & Dining': { color: '#FF6B6B', icon: 'silverware-fork-knife' },
        'Transportation': { color: '#4ECDC4', icon: 'car' },
        'Shopping': { color: '#45B7D1', icon: 'shopping' },
        'Entertainment': { color: '#4CAF50', icon: 'gamepad-variant' },
        'Bills & Utilities': { color: '#FF9800', icon: 'flash' },
        'Healthcare': { color: '#4B0082', icon: 'hospital-box' },
        'Travel': { color: '#98D8C8', icon: 'airplane' },
        'Personal Care': { color: '#F7DC6F', icon: 'face-woman' },
        'Education': { color: '#BB8FCE', icon: 'school' },
        'Housing & Rent': { color: '#F4A460', icon: 'home-city' },
        'Clothing & Fashion': { color: '#FF69B4', icon: 'tshirt-crew' },
        'Fuel & Gas': { color: '#A52A2A', icon: 'gas-station' },
        'Coffee & Beverages': { color: '#D2691E', icon: 'coffee' },
        'Movies & Cinema': { color: '#9C27B0', icon: 'movie-open' },
        'Music & Audio': { color: '#3F51B5', icon: 'music' },
        'Fitness & Gym': { color: '#FF1493', icon: 'dumbbell' },
        'Pharmacy & Medicine': { color: '#008080', icon: 'medical-bag' },
        'Mobile & Phone': { color: '#607D8B', icon: 'cellphone' },
        'Internet & WiFi': { color: '#03A9F4', icon: 'wifi' },
        'ATM & Banking': { color: '#795548', icon: 'credit-card' },
        'Gifts & Donations': { color: '#E91E63', icon: 'gift' },
        'Baby & Kids': { color: '#FFB6C1', icon: 'baby-face-outline' },
        'Pets & Animals': { color: '#8BC34A', icon: 'dog' },
        'Home Maintenance': { color: '#A9A9A9', icon: 'tools' },
        'Electronics & Tech': { color: '#00008B', icon: 'laptop' },
        'Photography': { color: '#FF4500', icon: 'camera' },
        'Books & Reading': { color: '#6A5ACD', icon: 'book-open-page-variant' },
        'Art & Craft': { color: '#FF6347', icon: 'palette' },
        'Garden & Plants': { color: '#228B22', icon: 'flower' },
        'Laundry & Cleaning': { color: '#ADD8E6', icon: 'washing-machine' },
        'Insurance': { color: '#808080', icon: 'shield-check' },
        'Alcohol & Drinks': { color: '#C71585', icon: 'glass-cocktail' },
        'Other': { color: '#85C1E9', icon: 'dots-horizontal' }
    };

    const getCategoryConfig = (categoryName) => {
        return categoryConfig[categoryName] || { color: '#85C1E9', icon: 'package-variant' };
    };

    // Initialize form when expense changes
    useEffect(() => {
        if (expense) {
            setAmount(expense.amount ? expense.amount.toString() : '');
            setBusiness(expense.business || '');
            setCategory(expense.category || '');
            setDescription(expense.description || '');
        }
    }, [expense]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            setIsSubmitting(false);
            setShowCategoryPicker(false);
        }
    }, [visible]);

    const handleSave = async () => {
        // Validation
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!business.trim()) {
            Alert.alert('Error', 'Please enter a business name');
            return;
        }

        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        const updatedExpense = {
            ...expense,
            amount: parseFloat(amount),
            business: business.trim(),
            category,
            description: description.trim(),
        };

        setIsSubmitting(true);

        try {
            if (onSave) {
                await onSave(updatedExpense);
            }
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CategoryPickerModal = () => (
        <Modal
            visible={showCategoryPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCategoryPicker(false)}
        >
            <View style={styles.categoryModalOverlay}>
                <View style={styles.categoryModalContainer}>
                    <View style={styles.categoryModalHeader}>
                        <Text style={styles.categoryModalTitle}>Select Category</Text>
                        <TouchableOpacity
                            onPress={() => setShowCategoryPicker(false)}
                            style={styles.categoryCloseButton}
                        >
                            <MaterialCommunityIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                        {availableCategories.map((cat) => {
                            const config = getCategoryConfig(cat);
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryOption,
                                        category === cat && styles.selectedCategoryOption
                                    ]}
                                    onPress={() => {
                                        setCategory(cat);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <View style={styles.categoryOptionContent}>
                                        <View style={[styles.categoryIcon, { backgroundColor: config.color }]}>
                                            <MaterialCommunityIcons
                                                name={config.icon}
                                                size={20}
                                                color="white"
                                            />
                                        </View>
                                        <Text style={[
                                            styles.categoryOptionText,
                                            category === cat && styles.selectedCategoryOptionText
                                        ]}>
                                            {cat}
                                        </Text>
                                    </View>
                                    {category === cat && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color="#2196F3"
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    if (!expense) return null;

    return (
        <>
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Expense</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                disabled={isSubmitting}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            {/* Amount Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount *</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={styles.amountInput}
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            {/* Business Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Business *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={business}
                                    onChangeText={setBusiness}
                                    placeholder="Enter business name"
                                    editable={!isSubmitting}
                                />
                            </View>

                            {/* Category Picker */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category *</Text>
                                <TouchableOpacity
                                    style={styles.categoryPicker}
                                    onPress={() => setShowCategoryPicker(true)}
                                    disabled={isSubmitting}
                                >
                                    {category ? (
                                        <View style={styles.selectedCategoryContainer}>
                                            <View style={[
                                                styles.selectedCategoryIcon,
                                                { backgroundColor: getCategoryConfig(category).color }
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={getCategoryConfig(category).icon}
                                                    size={16}
                                                    color="white"
                                                />
                                            </View>
                                            <Text style={styles.selectedCategoryText}>{category}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.categoryPickerPlaceholder}>
                                            Select a category
                                        </Text>
                                    )}
                                    <MaterialCommunityIcons
                                        name="chevron-down"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.textInput, styles.descriptionInput]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Enter description"
                                    multiline={true}
                                    numberOfLines={3}
                                    editable={!isSubmitting}
                                />
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]}
                                onPress={handleSave}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <CategoryPickerModal />
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        minHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 5,
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        paddingVertical: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    descriptionInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        minHeight: 48,
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedCategoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    selectedCategoryText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    categoryPickerPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 10,
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    // Category Modal Styles
    categoryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryModalContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: width * 0.9,
        maxHeight: '70%',
    },
    categoryModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryCloseButton: {
        padding: 5,
    },
    categoryList: {
        maxHeight: 400,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    selectedCategoryOption: {
        backgroundColor: '#f0f8ff',
    },
    categoryOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedCategoryOptionText: {
        color: '#2196F3',
        fontWeight: '600',
    },
});

export default EditExpense;