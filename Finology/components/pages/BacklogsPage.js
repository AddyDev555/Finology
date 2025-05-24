import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Modal,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

const BacklogPage = () => {
    const [backlogs, setBacklogs] = useState([]);
    const [formData, setFormData] = useState({
        personName: '',
        amount: '',
        description: '',
        dueDate: new Date(),
        category: 'Family',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const categories = [
        { name: 'Family', icon: 'account-group', color: '#FF6B6B' },
        { name: 'Friends', icon: 'account-multiple', color: '#4ECDC4' },
        { name: 'Colleagues', icon: 'briefcase-account', color: '#45B7D1' },
        { name: 'Other', icon: 'account', color: '#FFA726' },
    ];

    useEffect(() => {
        // Load saved backlogs from AsyncStorage or API
        loadBacklogs();
    }, []);

    const loadBacklogs = () => {
        // This would typically load from AsyncStorage or API
        // For demo purposes, using static data
        const demoBacklogs = [
            {
                id: '1',
                personName: 'John Doe',
                amount: 500,
                description: 'Dinner expenses',
                dueDate: new Date('2025-05-25'),
                category: 'Friends',
                status: 'pending',
                createdAt: new Date('2025-05-18'),
            },
            {
                id: '2',
                personName: 'Mom',
                amount: 1000,
                description: 'Grocery shopping',
                dueDate: new Date('2025-05-20'),
                category: 'Family',
                status: 'pending',
                createdAt: new Date('2025-05-17'),
            },
        ];
        setBacklogs(demoBacklogs);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.personName || !formData.personName.trim()) {
            Alert.alert('Error', 'Please enter person name');
            return false;
        }
        if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return false;
        }
        if (!formData.description || !formData.description.trim()) {
            Alert.alert('Error', 'Please enter description');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const parsedAmount = parseFloat(formData.amount);

        // Add validation for parsed amount
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const newBacklog = {
            personName: formData.personName.trim(),
            amount: parsedAmount,
            description: formData.description.trim(),
            dueDate: formData.dueDate,
            category: formData.category,
            status: 'pending',
            createdAt: editingId ? backlogs.find(b => b.id === editingId)?.createdAt : new Date(),
        };

        try {
            let response;

            if (editingId) {
                // Edit (PUT request)
                response = await fetch(`http://192.168.0.100:5000/payment-due/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBacklog),
                });
            } else {
                // Add (POST request)
                response = await fetch('http://192.168.0.100:5000/payment-due', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBacklog),
                });
            }

            if (!response.ok) {
                throw new Error('Network error while saving backlog.');
            }

            const savedData = await response.json();

            if (editingId) {
                setBacklogs(prev =>
                    prev.map(item => (item.id === editingId ? { ...newBacklog, id: editingId } : item))
                );
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Backlog Updated',
                    text2: `₹${parsedAmount.toFixed(2)} updated successfully.`,
                    visibilityTime: 3000,
                });
                setEditingId(null);
            } else {
                setBacklogs(prev => [{ ...newBacklog, id: savedData.id || Date.now().toString() }, ...prev]);
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Backlog Added',
                    text2: `₹${parsedAmount.toFixed(2)} added successfully.`,
                    visibilityTime: 3000,
                });
            }

            // Reset form
            setFormData({
                personName: '',
                amount: '',
                description: '',
                dueDate: new Date(),
                category: 'Family',
            });
            setIsFormVisible(false); // Hide form after successful submission
        } catch (error) {
            console.error('Error saving backlog:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to save backlog. Try again.',
                visibilityTime: 3000,
            });
        }
    };


    const handleEdit = (backlog) => {
        setFormData({
            personName: backlog.personName || '',
            amount: backlog.amount ? backlog.amount.toString() : '',  // Add null check
            description: backlog.description || '',
            dueDate: backlog.dueDate ? new Date(backlog.dueDate) : new Date(),
            category: backlog.category || 'Family',
        });
        setEditingId(backlog.id);
        setIsFormVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Backlog',
            'Are you sure you want to delete this backlog?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setBacklogs(prev => prev.filter(item => item.id !== id));

                        Toast.show({
                            type: 'success',
                            text1: 'Backlog Deleted',
                            text2: 'The backlog was successfully removed!',
                            position: 'top',
                            visibilityTime: 3000,
                            autoHide: true,
                        });
                    },
                },
            ]
        );
    };

    const markAsPaid = (id) => {
        setBacklogs(prev => prev.map(item =>
            item.id === id
                ? { ...item, status: 'paid', paidAt: new Date() }
                : item
        ));
        Alert.alert('Success', 'Payment marked as completed!');
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusColor = (daysUntilDue, status) => {
        if (status === 'paid') return '#4CAF50';
        if (daysUntilDue < 0) return '#F44336'; // Overdue
        if (daysUntilDue <= 3) return '#FF9800'; // Due soon
        return '#2196F3'; // Normal
    };

    const getCategoryConfig = (category) => {
        return categories.find(cat => cat.name === category) || categories[3];
    };

    const formatCurrency = (amount) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return `₹${numAmount.toFixed(2)}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Updated date picker change handler
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            handleInputChange('dueDate', selectedDate);
        }
    };

    const BacklogCard = ({ item }) => {
        const daysUntilDue = getDaysUntilDue(item.dueDate);
        const statusColor = getStatusColor(daysUntilDue, item.status);
        const categoryConfig = getCategoryConfig(item.category);

        return (
            <View style={[styles.backlogCard, { borderLeftColor: statusColor }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.personInfo}>
                        <View style={styles.nameContainer}>
                            <MaterialCommunityIcons
                                name={categoryConfig.icon}
                                size={20}
                                color={categoryConfig.color}
                            />
                            <Text style={styles.personName}>{item.personName}</Text>
                        </View>
                        <Text style={[styles.amount, { color: statusColor }]}>
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status === 'paid'
                                ? 'Paid'
                                : daysUntilDue < 0
                                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                                    : daysUntilDue === 0
                                        ? 'Due Today'
                                        : `${daysUntilDue} days left`
                            }
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.description}>{item.description}</Text>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Due Date: </Text>
                        <Text style={styles.dateValue}>{formatDate(item.dueDate)}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    {item.status !== 'paid' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.paidButton]}
                            onPress={() => markAsPaid(item.id)}
                        >
                            <MaterialCommunityIcons name="check" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Mark Paid</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                    >
                        <MaterialCommunityIcons name="pencil" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <MaterialCommunityIcons name="delete" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const totalPending = backlogs
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + (typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0), 0);
    
        const overdueCount = backlogs.filter(item =>
        item.status === 'pending' && getDaysUntilDue(item.dueDate) < 0
    ).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payment Backlog</Text>
                <View style={styles.headerStats}>
                    <Text style={styles.totalPending}>Total Pending: {formatCurrency(totalPending)}</Text>
                    {overdueCount > 0 && (
                        <Text style={styles.overdueCount}>
                            {overdueCount} Overdue
                        </Text>
                    )}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Form Section with Collapsible Header */}
                <View style={styles.formContainer}>
                    <TouchableOpacity
                        style={styles.formHeader}
                        onPress={() => setIsFormVisible(!isFormVisible)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sectionTitle}>Add New Payment Due</Text>
                        <MaterialCommunityIcons
                            name={isFormVisible ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {isFormVisible && (
                        <View style={styles.formContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Person Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.personName}
                                    onChangeText={(value) => handleInputChange('personName', value)}
                                    placeholder="Enter person name"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Amount (₹)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.amount}
                                    onChangeText={(value) => handleInputChange('amount', value)}
                                    placeholder="Enter amount"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(value) => handleInputChange('description', value)}
                                    placeholder="What is this payment for?"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.categorySelector}>
                                        {categories.map((category) => (
                                            <TouchableOpacity
                                                key={category.name}
                                                style={[
                                                    styles.categoryOption,
                                                    formData.category === category.name && styles.selectedCategory,
                                                    { borderColor: category.color }
                                                ]}
                                                onPress={() => handleInputChange('category', category.name)}
                                            >
                                                <MaterialCommunityIcons
                                                    name={category.icon}
                                                    size={20}
                                                    color={formData.category === category.name ? 'white' : category.color}
                                                />
                                                <Text style={[
                                                    styles.categoryOptionText,
                                                    formData.category === category.name && styles.selectedCategoryText
                                                ]}>
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                                    <Text style={styles.dateButtonText}>
                                        {formatDate(formData.dueDate)}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <MaterialCommunityIcons
                                    name={editingId ? "content-save" : "plus"}
                                    size={20}
                                    color="white"
                                />
                                <Text style={styles.submitButtonText}>
                                    {editingId ? 'Update Backlog' : 'Add Backlog'}
                                </Text>
                            </TouchableOpacity>

                            {editingId && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingId(null);
                                        setFormData({
                                            personName: '',
                                            amount: '',
                                            description: '',
                                            dueDate: new Date(),
                                            category: 'Family',
                                        });
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Backlogs List */}
                <View style={styles.backlogsContainer}>
                    <Text style={styles.sectionTitle}>Your Backlogs</Text>
                    {backlogs.length > 0 ? (
                        backlogs.map((item) => (
                            <BacklogCard key={item.id} item={item} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-check" size={64} color="#999" />
                            <Text style={styles.emptyText}>No backlogs yet</Text>
                            <Text style={styles.emptySubtext}>Add your first payment due above</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Updated Date Picker - No Modal Wrapper Needed */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.dueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={onDateChange}
                />
            )}
        </SafeAreaView>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#E91E63',
        padding: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    headerStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalPending: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    overdueCount: {
        fontSize: 14,
        color: '#FFEB3B',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    formContainer: {
        backgroundColor: 'white',
        margin: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    formContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categorySelector: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 20,
        borderWidth: 2,
        backgroundColor: 'white',
    },
    selectedCategory: {
        backgroundColor: '#E91E63',
    },
    categoryOptionText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedCategoryText: {
        color: 'white',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    dateButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E91E63',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    submitButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        textDecorationLine: 'underline',
    },
    backlogsContainer: {
        margin: 15,
        marginTop: 0,
    },
    backlogCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 10,
    },
    personInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    personName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardBody: {
        marginBottom: 15,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        lineHeight: 20,
    },
    dateInfo: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        color: '#333',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    categoryText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        marginHorizontal: 2,
        justifyContent: 'center',
    },
    paidButton: {
        backgroundColor: '#4CAF50',
    },
    editButton: {
        backgroundColor: '#FF9800',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
});

export default BacklogPage;