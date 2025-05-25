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
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BallIndicator } from 'react-native-indicators';

const BacklogPage = () => {
    const [backlogs, setBacklogs] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        description: '',
        dueDate: new Date(),
        category: 'Family',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // For individual card actions

    const categories = [
        { name: 'Family', icon: 'account-group', color: '#FF6B6B' },
        { name: 'Friends', icon: 'account-multiple', color: '#4ECDC4' },
        { name: 'Colleagues', icon: 'briefcase-account', color: '#45B7D1' },
        { name: 'Other', icon: 'account', color: '#FFA726' },
    ];

    useEffect(() => {
        loadBacklogs();
    }, []);

    const getUserIdFromStorage = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            if (!userDataString) {
                throw new Error('User data not found in storage');
            }
            const userData = JSON.parse(userDataString);
            return userData.userId;
        } catch (error) {
            console.error('Error getting userId:', error);
            throw error;
        }
    };

    const loadBacklogs = async () => {
        try {
            setLoading(true);
            const userId = await getUserIdFromStorage();
            const response = await fetch(`http://192.168.0.100:5000/payment-due/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.payment_dues) {
                setBacklogs(data.payment_dues);
            }

        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: "Payment due not found",
                visibilityTime: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.amount || !formData.description.trim()) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const parsedAmount = parseFloat(formData.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            setSubmitting(true);
            const userId = await getUserIdFromStorage();
            const newBacklog = {
                userId: userId,
                name: formData.name.trim(),
                amount: parsedAmount,
                description: formData.description.trim(),
                dueDate: formData.dueDate,
                category: formData.category,
            };

            let response;
            if (editingId) {
                response = await fetch(`http://192.168.0.100:5000/payment-due/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBacklog),
                });
            } else {
                response = await fetch('http://192.168.0.100:5000/payment-due', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBacklog),
                });
            }

            if (!response.ok) {
                throw new Error('Network error while saving backlog.');
            }

            await loadBacklogs();
            Toast.show({
                type: 'success',
                position: 'top',
                text1: editingId ? 'Backlog Updated' : 'Backlog Added',
                text2: `₹${parsedAmount.toFixed(2)} ${editingId ? 'updated' : 'added'} successfully.`,
                visibilityTime: 3000,
            });

            // Reset form
            setFormData({
                name: '',
                amount: '',
                description: '',
                dueDate: new Date(),
                category: 'Family',
            });
            setEditingId(null);
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error saving backlog:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to save backlog. Try again.',
                visibilityTime: 3000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (backlog) => {
        setFormData({
            name: backlog.name || '',
            amount: backlog.amount ? backlog.amount.toString() : '',
            description: backlog.description || '',
            dueDate: backlog.dueDate ? new Date(backlog.dueDate) : new Date(),
            category: backlog.category || 'Family',
        });
        setEditingId(backlog.id);
        setIsFormVisible(true);
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Paid Backlog',
            'Congratulations on paying the Due keep it up!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Paid',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(id);
                            const response = await fetch(`http://192.168.0.100:5000/payment-due/${id}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                            });

                            if (!response.ok) {
                                throw new Error('Failed to delete backlog');
                            }

                            await loadBacklogs();
                            Toast.show({
                                type: 'success',
                                text1: 'Payment Backlog Paid',
                                text2: 'The backlog was successfully removed!',
                                position: 'top',
                                visibilityTime: 3000,
                            });
                        } catch (error) {
                            console.error('Error deleting backlog:', error);
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete backlog.',
                                position: 'top',
                                visibilityTime: 3000,
                            });
                        } finally {
                            setActionLoading(null);
                        }
                    },
                },
            ]
        );
    };

    // Helper functions
    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusColor = (daysUntilDue, status) => {
        if (status === 'paid') return '#4CAF50';
        if (daysUntilDue < 0) return '#F44336';
        if (daysUntilDue <= 3) return '#FF9800';
        return '#2196F3';
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

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setFormData(prev => ({ ...prev, dueDate: selectedDate }));
        }
    };

    const BacklogCard = ({ item }) => {
        const daysUntilDue = getDaysUntilDue(item.date);
        const statusColor = getStatusColor(daysUntilDue, item.status);
        const categoryConfig = getCategoryConfig(item.category);
        const isLoading = actionLoading === item.id;

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
                            <Text style={styles.personName}>{item.name}</Text>
                        </View>
                        <Text style={[styles.amount, { color: statusColor }]}>
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
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

                <Text style={styles.description}>{item.description}</Text>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color, marginRight: 7, marginTop: 2}]}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={[styles.dateInfo, {marginLeft:'auto'}]}>Due: {formatDate(item.date)}</Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <BallIndicator color="#E91E63" size={30} />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                ) : (
                    <View style={styles.cardActions}>
                        {item.status !== 'paid' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.paidButton]}
                                onPress={() => handleDelete(item.id)}
                            >
                                <MaterialCommunityIcons name="check" size={16} color="white" />
                                <Text style={styles.actionButtonText}>Paid</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => handleEdit(item)}
                        >
                            <MaterialCommunityIcons name="pencil" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(item.id)}
                        >
                            <MaterialCommunityIcons name="delete" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity> */}
                    </View>
                )}
            </View>
        );
    };

    const totalPending = backlogs
        .filter(item => item.status !== 'paid')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Payment Backlog</Text>
                    <Text style={styles.totalPending}>Loading...</Text>
                </View>
                <View style={styles.loadingScreen}>
                    <BallIndicator color="#E91E63" size={60} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payment Backlog</Text>
                <Text style={styles.totalPending}>Total Pending: {formatCurrency(totalPending)}</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Form Section */}
                <View style={styles.formContainer}>
                    <TouchableOpacity
                        style={styles.formHeader}
                        onPress={() => setIsFormVisible(!isFormVisible)}
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
                            <TextInput
                                style={styles.textInput}
                                value={formData.name}
                                onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
                                placeholder="Person Name"
                                editable={!submitting}
                            />

                            <TextInput
                                style={styles.textInput}
                                value={formData.amount}
                                onChangeText={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                                placeholder="Amount (₹)"
                                keyboardType="numeric"
                                editable={!submitting}
                            />

                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={formData.description}
                                onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                placeholder="Description"
                                multiline
                                editable={!submitting}
                            />

                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.categorySelector}>
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category.name}
                                            style={[
                                                styles.categoryOption,
                                                formData.category === category.name && styles.selectedCategory,
                                            ]}
                                            onPress={() => setFormData(prev => ({ ...prev, category: category.name }))}
                                            disabled={submitting}
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

                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                                disabled={submitting}
                            >
                                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                                <Text style={styles.dateButtonText}>
                                    {formatDate(formData.dueDate)}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.submitButton, submitting && styles.disabledButton]} 
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <BallIndicator color="white" size={20} />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={editingId ? "content-save" : "plus"}
                                        size={20}
                                        color="white"
                                    />
                                )}
                                <Text style={styles.submitButtonText}>
                                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Backlog
                                </Text>
                            </TouchableOpacity>

                            {editingId && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditingId(null);
                                        setFormData({
                                            name: '',
                                            amount: '',
                                            description: '',
                                            dueDate: new Date(),
                                            category: 'Family',
                                        });
                                    }}
                                    disabled={submitting}
                                >
                                    <Text style={[styles.cancelButtonText, submitting && styles.disabledText]}>Cancel</Text>
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
                        </View>
                    )}
                </View>
            </ScrollView>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#E91E63', padding: 20, paddingTop: 40 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    totalPending: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' },
    content: { flex: 1 },
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingScreenText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.7,
    },
    disabledText: {
        opacity: 0.5,
    },
    formContainer: { backgroundColor: 'white', margin: 15, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
    formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    formContent: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    textInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9', marginBottom: 15 },
    textArea: { height: 80, textAlignVertical: 'top' },
    categorySelector: { flexDirection: 'row', paddingVertical: 5, marginBottom: 15 },
    categoryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, borderRadius: 20, borderWidth: 2, backgroundColor: 'white', borderColor: '#e0e0e0' },
    selectedCategory: { backgroundColor: '#E91E63' },
    categoryOptionText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#666' },
    selectedCategoryText: { color: 'white' },
    dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, backgroundColor: '#f9f9f9', marginBottom: 15 },
    dateButtonText: { marginLeft: 10, fontSize: 16, color: '#333' },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E91E63', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
    submitButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: 'white' },
    cancelButton: { alignItems: 'center', paddingVertical: 10, marginTop: 10 },
    cancelButtonText: { fontSize: 16, color: '#666', textDecorationLine: 'underline' },
    backlogsContainer: { margin: 15, marginTop: 0 },
    backlogCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { marginBottom: 10 },
    personInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    nameContainer: { flexDirection: 'row', alignItems: 'center' },
    personName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
    amount: { fontSize: 20, fontWeight: 'bold' },
    statusText: { fontSize: 14, fontWeight: '600' },
    description: { fontSize: 14, color: '#666', marginBottom: 10, lineHeight: 20 },
    dateInfo: { fontSize: 14, color: '#666', marginBottom: 10 },
    categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginBottom: 15 },
    categoryText: { fontSize: 12, color: 'white', fontWeight: '600' },
    cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, flex: 1, marginHorizontal: 2, justifyContent: 'center' },
    paidButton: { backgroundColor: '#4CAF50' },
    editButton: { backgroundColor: '#FF9800' },
    deleteButton: { backgroundColor: '#F44336' },
    actionButtonText: { marginLeft: 5, fontSize: 12, fontWeight: '600', color: 'white' },
    emptyContainer: { alignItems: 'center', paddingVertical: 50 },
    emptyText: { fontSize: 18, color: '#999', marginTop: 15, fontWeight: '600' },
});

export default BacklogPage;