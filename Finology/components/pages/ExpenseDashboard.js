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
import { Picker } from '@react-native-picker/picker';

const ExpenseDashboard = () => {
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expenses, setExpenses] = useState([]);
    const [groupedExpenses, setGroupedExpenses] = useState({});
    const [totalExpenses, setTotalExpenses] = useState(0);

    // Sample expense data (in real app, this would come from AsyncStorage or API)
    const sampleExpenses = [
        {
            id: 1,
            amount: 45.50,
            category: 'Food & Dining',
            business: 'McDonald\'s',
            description: 'Lunch with colleagues',
            dateTime: '2024-01-15T12:30:00Z',
        },
        {
            id: 2,
            amount: 25.00,
            category: 'Transportation',
            business: 'Car Wash Express',
            description: 'Weekly car wash service',
            dateTime: '2024-01-15T14:15:00Z',
        },
        {
            id: 3,
            amount: 89.99,
            category: 'Shopping',
            business: 'Target',
            description: 'Household items and groceries',
            dateTime: '2024-01-14T16:45:00Z',
        },
        {
            id: 4,
            amount: 12.50,
            category: 'Transportation',
            business: 'Metro Station',
            description: 'Public transport fare',
            dateTime: '2024-01-14T08:20:00Z',
        },
        {
            id: 5,
            amount: 150.00,
            category: 'Bills & Utilities',
            business: 'Electric Company',
            description: 'Monthly electricity bill',
            dateTime: '2024-01-13T10:00:00Z',
        },
        {
            id: 6,
            amount: 35.75,
            category: 'Food & Dining',
            business: 'Starbucks',
            description: 'Coffee and morning snack',
            dateTime: '2024-01-12T07:45:00Z',
        },
        {
            id: 7,
            amount: 200.00,
            category: 'Healthcare',
            business: 'City Medical Center',
            description: 'Doctor consultation',
            dateTime: '2024-01-11T15:30:00Z',
        },
        {
            id: 8,
            amount: 75.25,
            category: 'Entertainment',
            business: 'AMC Theaters',
            description: 'Movie tickets and popcorn',
            dateTime: '2024-01-10T19:00:00Z',
        },
        {
            id: 9,
            amount: 120.00,
            category: 'Shopping',
            business: 'Best Buy',
            description: 'Phone accessories',
            dateTime: '2024-12-28T13:20:00Z',
        },
        {
            id: 10,
            amount: 55.80,
            category: 'Food & Dining',
            business: 'Italian Bistro',
            description: 'Dinner with family',
            dateTime: '2024-12-27T18:30:00Z',
        },
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Category colors for visual distinction
    const categoryColors = {
        'Food & Dining': '#FF6B6B',
        'Transportation': '#4ECDC4',
        'Shopping': '#45B7D1',
        'Entertainment': '#4CAF50',
        'Bills & Utilities': '#FF9800',
        'Healthcare': '#4B0082',
        'Travel': '#98D8C8',
        'Personal Care': '#F7DC6F',
        'Education': '#BB8FCE',
        'Other': '#85C1E9',
    };

    useEffect(() => {
        setExpenses(sampleExpenses);
        groupExpensesByDate(sampleExpenses);
    }, [viewMode, selectedMonth, selectedYear]);

    const groupExpensesByDate = (expenseList) => {
        const grouped = {};
        let total = 0;

        expenseList.forEach(expense => {
            const date = new Date(expense.dateTime);
            const expenseMonth = date.getMonth();
            const expenseYear = date.getFullYear();

            // Filter by selected month/year if in monthly view
            if (viewMode === 'monthly' && (expenseMonth !== selectedMonth || expenseYear !== selectedYear)) {
                return;
            }

            total += expense.amount;

            const dateKey = viewMode === 'daily'
                ? date.toDateString()
                : `${months[expenseMonth]} ${expenseYear}`;

            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    expenses: [],
                    total: 0,
                    date: date,
                };
            }

            grouped[dateKey].expenses.push(expense);
            grouped[dateKey].total += expense.amount;
        });

        setGroupedExpenses(grouped);
        setTotalExpenses(total);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    const ExpenseCard = ({ expense }) => (
        <View style={[styles.expenseCard, { borderLeftColor: categoryColors[expense.category] || '#85C1E9' }]}>
            <View style={styles.cardHeader}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>{formatCurrency(expense.amount)}</Text>
                    <Text style={[styles.categoryBadge, { backgroundColor: categoryColors[expense.category] || '#85C1E9' }]}>
                        {expense.category}
                    </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(expense.dateTime)}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.businessText}>{expense.business}</Text>
                <Text style={styles.descriptionText}>{expense.description}</Text>
            </View>
        </View>
    );

    const DaySection = ({ dateKey, dayData }) => (
        <View style={styles.daySection}>
            <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dateKey}</Text>
                <Text style={styles.dayTotal}>{formatCurrency(dayData.total)}</Text>
            </View>
            {dayData.expenses.map(expense => (
                <ExpenseCard key={expense.id} expense={expense} />
            ))}
        </View>
    );

    const sortedKeys = Object.keys(groupedExpenses).sort((a, b) => {
        return new Date(groupedExpenses[b].date) - new Date(groupedExpenses[a].date);
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
                ).map(([category, total]) => (
                    <View key={category} style={[styles.summaryCard, { backgroundColor: categoryColors[category] || '#85C1E9' }]}>
                        <Text style={styles.summaryCategory}>{category}</Text>
                        <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
                    </View>
                ))}
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
        alignItems: 'center',
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
        height: 165,
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryCard: {
        width: 120,
        height: 80,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
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