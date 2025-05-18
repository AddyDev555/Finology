import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ExpenseDashboard = () => {
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expenses, setExpenses] = useState([]);
    const [groupedExpenses, setGroupedExpenses] = useState({});
    const [totalExpenses, setTotalExpenses] = useState(0);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Category colors and icons for visual distinction
    const categoryConfig = {
        'Food & Dining': { color: '#FF6B6B', icon: 'food-fork-drink' },
        'Transportation': { color: '#4ECDC4', icon: 'car' },
        'Shopping': { color: '#45B7D1', icon: 'shopping' },
        'Entertainment': { color: '#4CAF50', icon: 'movie' },
        'Bills & Utilities': { color: '#FF9800', icon: 'flash' },
        'Healthcare': { color: '#4B0082', icon: 'hospital-building' },
        'Travel': { color: '#98D8C8', icon: 'airplane' },
        'Personal Care': { color: '#F7DC6F', icon: 'face-woman-shimmer' },
        'Education': { color: '#BB8FCE', icon: 'school' },
        'Other': { color: '#85C1E9', icon: 'package-variant' },
    };

    useEffect(() => {
        FetchExpenseData();
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

    const FetchExpenseData = async () => {
        const userId = await getUserIdFromStorage();
        try {
            const response = await fetch('https://finology.pythonanywhere.com/get-manual-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userId),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            console.log('Fetched expenses:', data);
            setExpenses(data);
            groupExpensesByDate(data);

        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to show expense. Please try again.',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
    }

    const groupExpensesByDate = (expenseList) => {
        const grouped = {};
        let total = 0;

        expenseList.forEach(expense => {
            // Parse the date string from backend format: "Sunday, May 18, 2025, 11:40:11 AM"
            const dateObj = new Date(expense.date);
            const expenseMonth = dateObj.getMonth();
            const expenseYear = dateObj.getFullYear();

            // Filter by selected month/year if in monthly view
            if (viewMode === 'monthly' && (expenseMonth !== selectedMonth || expenseYear !== selectedYear)) {
                return;
            }

            total += expense.amount;

            // Create date key for grouping (only date part, not time)
            const dateKey = viewMode === 'daily'
                ? dateObj.toDateString() // e.g., "Sun May 18 2025"
                : `${months[expenseMonth]} ${expenseYear}`;

            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    expenses: [],
                    total: 0,
                    date: dateObj,
                };
            }

            // Add parsed date for sorting purposes
            const enhancedExpense = {
                ...expense,
                parsedDate: dateObj
            };

            grouped[dateKey].expenses.push(enhancedExpense);
            grouped[dateKey].total += expense.amount;
        });

        setGroupedExpenses(grouped);
        setTotalExpenses(total);
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    const getCategoryConfig = (category) => {
        return categoryConfig[category] || { color: '#85C1E9', icon: 'package-variant' };
    };

    const ExpenseCard = ({ expense }) => {
        const config = getCategoryConfig(expense.category);

        return (
            <View style={[styles.expenseCard, { borderLeftColor: config.color }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>{formatCurrency(expense.amount)}</Text>
                        <View style={[styles.categoryBadge, { backgroundColor: config.color }]}>
                            <MaterialCommunityIcons
                                name={config.icon}
                                size={14}
                                color="white"
                                style={styles.categoryIcon}
                            />
                            <Text style={styles.categoryText}>{expense.category}</Text>
                        </View>
                    </View>
                    {/* Show full date string from backend */}
                    <Text style={styles.dateText}>{formatDate(expense.date) || 'Time not available'}</Text>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.businessText}>{expense.business}</Text>
                    <Text style={styles.descriptionText}>{expense.description}</Text>
                </View>
            </View>
        );
    };

    const DaySection = ({ dateKey, dayData }) => {
        // Sort expenses within each day by time (newest first)
        const sortedExpenses = dayData.expenses.sort((a, b) => {
            if (a.parsedDate && b.parsedDate) {
                return new Date(b.parsedDate) - new Date(a.parsedDate);
            }
            return 0;
        });

        return (
            <View style={styles.daySection}>
                <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{dateKey}</Text>
                    <Text style={styles.dayTotal}>{formatCurrency(dayData.total)}</Text>
                </View>
                {sortedExpenses.map(expense => (
                    <ExpenseCard key={expense.id} expense={expense} />
                ))}
            </View>
        );
    };

    const sortedKeys = Object.keys(groupedExpenses).sort((a, b) => {
        const dateA = new Date(groupedExpenses[a].date);
        const dateB = new Date(groupedExpenses[b].date);

        return (dateB.getTime() || 0) - (dateA.getTime() || 0);
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Expense Dashboard</Text>
                <Text style={styles.totalAmount}>Total: {formatCurrency(totalExpenses)}</Text>
            </View>

            {/* Expense Summary Cards */}
            <ScrollView style={styles.summaryContainer} horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(
                    expenses.reduce((acc, expense) => {
                        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                        return acc;
                    }, {})
                ).map(([category, total]) => {
                    const config = getCategoryConfig(category);
                    return (
                        <View key={category} style={[styles.summaryCard, { backgroundColor: config.color }]}>
                            <MaterialCommunityIcons
                                name={config.icon}
                                size={24}
                                color="white"
                                style={styles.summaryIcon}
                            />
                            <Text style={styles.summaryCategory}>{category}</Text>
                            <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Expenses List */}
            <ScrollView style={styles.expensesContainer} showsVerticalScrollIndicator={false}>
                {sortedKeys.length > 0 ? (
                    sortedKeys.map(dateKey => (
                        <DaySection
                            key={dateKey}
                            dateKey={dateKey}
                            dayData={groupedExpenses[dateKey]}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No expenses found for the selected period</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    totalAmount: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    controlsContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    viewModeContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        padding: 3,
        marginBottom: 15,
    },
    viewModeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    activeViewMode: {
        backgroundColor: '#2196F3',
    },
    viewModeText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    activeViewModeText: {
        color: 'white',
    },
    monthYearContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    picker: {
        height: 50,
    },
    summaryContainer: {
        width: '100%',
        maxHeight: 120,
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryCard: {
        width: 120,
        height: 90,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryIcon: {
        marginBottom: 5,
    },
    summaryCategory: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 5,
    },
    summaryAmount: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    expensesContainer: {
        // flex: 1,
        padding: 15,
    },
    daySection: {
        marginBottom: 20,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    dayTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    expenseCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    amountContainer: {
        flex: 1,
    },
    amountText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        marginRight: 5,
    },
    categoryText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    businessText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default ExpenseDashboard;