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
    RefreshControl,
    Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BallIndicator } from 'react-native-indicators';

const ExpenseDashboard = ({ expenses = [], isLoading = false, onRefresh, refreshKey }) => {
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [groupedExpenses, setGroupedExpenses] = useState({});
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [datePickerSelectedDate, setDatePickerSelectedDate] = useState(new Date());

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

    // Generate months for the picker (current year and previous year)
    const generateMonthOptions = () => {
        const monthOptions = [];
        const currentYear = new Date().getFullYear();

        // Add months for current and previous year
        for (let year = currentYear; year >= currentYear - 1; year--) {
            for (let month = 11; month >= 0; month--) {
                monthOptions.push({
                    year,
                    month,
                    display: `${months[month]} ${year}`,
                    value: new Date(year, month, 1)
                });
            }
        }
        return monthOptions;
    };

    const monthOptions = generateMonthOptions();

    // Group expenses whenever expenses data changes
    useEffect(() => {
        if (expenses && expenses.length > 0) {
            groupExpensesByDate(expenses);
            calculateTotals(expenses);
        } else {
            setGroupedExpenses({});
            setTotalExpenses(0);
            setMonthlyExpenses(0);
        }
    }, [expenses, viewMode, selectedMonth, selectedYear, datePickerSelectedDate]);

    const calculateTotals = (expenseList) => {
        let total = 0;
        let monthly = 0;
        const selectedMonthFromPicker = datePickerSelectedDate.getMonth();
        const selectedYearFromPicker = datePickerSelectedDate.getFullYear();

        expenseList.forEach(expense => {
            const dateObj = new Date(expense.date);
            const expenseMonth = dateObj.getMonth();
            const expenseYear = dateObj.getFullYear();

            total += expense.amount;

            // Calculate expenses for selected month from date picker
            if (expenseMonth === selectedMonthFromPicker && expenseYear === selectedYearFromPicker) {
                monthly += expense.amount;
            }
        });

        setTotalExpenses(total);
        setMonthlyExpenses(monthly);
    };

    const groupExpensesByDate = (expenseList) => {
        const grouped = {};

        expenseList.forEach(expense => {
            // Parse the date string from backend format: "Sunday, May 18, 2025, 11:40:11 AM"
            const dateObj = new Date(expense.date);
            const expenseMonth = dateObj.getMonth();
            const expenseYear = dateObj.getFullYear();

            // Filter by selected month/year if in monthly view
            if (viewMode === 'monthly' && (expenseMonth !== selectedMonth || expenseYear !== selectedYear)) {
                return;
            }

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
    };

    const handleRefresh = async () => {
        if (onRefresh) {
            setRefreshing(true);
            await onRefresh();
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    const formatSelectedMonth = () => {
        return `${months[datePickerSelectedDate.getMonth()]} ${datePickerSelectedDate.getFullYear()}`;
    };

    const getCategoryConfig = (category) => {
        return categoryConfig[category] || { color: '#85C1E9', icon: 'package-variant' };
    };

    const MonthPickerModal = () => (
        <Modal
            visible={showMonthPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowMonthPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Month</Text>
                        <TouchableOpacity
                            onPress={() => setShowMonthPicker(false)}
                            style={styles.closeButton}
                        >
                            <MaterialCommunityIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={monthOptions}
                        keyExtractor={(item) => `${item.year}-${item.month}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.monthOption,
                                    datePickerSelectedDate.getFullYear() === item.year &&
                                    datePickerSelectedDate.getMonth() === item.month &&
                                    styles.selectedMonthOption
                                ]}
                                onPress={() => {
                                    setDatePickerSelectedDate(item.value);
                                    setShowMonthPicker(false);
                                }}
                            >
                                <Text style={[
                                    styles.monthOptionText,
                                    datePickerSelectedDate.getFullYear() === item.year &&
                                    datePickerSelectedDate.getMonth() === item.month &&
                                    styles.selectedMonthOptionText
                                ]}>
                                    {item.display}
                                </Text>
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );

    const ExpenseCard = ({ expense }) => {
        const config = getCategoryConfig(expense.category);
        const cardStyle = [styles.expenseCard, { borderLeftColor: config.color }];
        const badgeStyle = [styles.categoryBadge, { backgroundColor: config.color }];

        return (
            <View style={cardStyle}>
                <View style={styles.cardHeader}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>{formatCurrency(expense.amount)}</Text>
                        <View style={badgeStyle}>
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

    // Show loading indicator
    if (isLoading) {
        return (
            <View style={styles.contentLoaderContainer}>
                <BallIndicator color="#2196F3" size={60} />
            </View>
        );
    }

    // Calculate category totals only when expenses exist
    const categoryTotals = expenses && expenses.length > 0
        ? expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {})
        : {};

    return (
        <View style={styles.container}>
            {/* Summary Cards - Total and Monthly Expense */}
            <Text style={styles.headerText}>Overview</Text>
            <View style={styles.topSummaryContainer}>
                <View style={styles.summaryRow}>
                    <View style={[styles.topSummaryCard, { backgroundColor: '#2196F3' }]}>
                        <View style={styles.topSummaryContent}>
                            <Text style={styles.topSummaryLabel}>Total Expenses</Text>
                            <Text style={styles.topSummaryAmount}>{formatCurrency(totalExpenses)}</Text>
                        </View>
                    </View>

                    <View style={[styles.topSummaryCard, { backgroundColor: '#4CAF50' }]}>
                        <View style={styles.topSummaryContent}>
                            <Text style={styles.topSummaryLabel}>{formatSelectedMonth()}</Text>
                            <Text style={styles.topSummaryAmount}>{formatCurrency(monthlyExpenses)}</Text>
                        </View>
                    </View>

                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowMonthPicker(true)}
                        >
                            <MaterialCommunityIcons
                                name="calendar-month"
                                size={30}
                                color="#2196F3"
                                style={styles.datePickerIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>


            {/* Category Summary Cards */}
            <Text style={styles.headerText}>Categories</Text>
            <ScrollView
                style={styles.summaryContainer}
                horizontal
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#2196F3']}
                        tintColor="#2196F3"
                    />
                }
            >
                {Object.entries(categoryTotals).map(([category, total]) => {
                    const config = getCategoryConfig(category);
                    const cardStyle = [styles.summaryCard, { backgroundColor: config.color }];

                    return (
                        <View key={category} style={cardStyle}>
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
            <ScrollView
                style={styles.expensesContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#2196F3']}
                        tintColor="#2196F3"
                    />
                }
            >
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
                        <MaterialCommunityIcons
                            name="receipt"
                            size={64}
                            color="#ccc"
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyText}>No expenses found</Text>
                        <Text style={styles.emptySubText}>Pull down to refresh or add your first expense</Text>
                    </View>
                )}
            </ScrollView>
            <MonthPickerModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerText:{
        fontSize: 20,
        paddingHorizontal: 10,
        fontWeight: 'bold',
    },
    contentLoaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingTop: 50,
        marginTop: 180,
        minHeight: 200,
    },
    loaderText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    // Date Picker Styles
    datePickerContainer: {
        width: '15%',
        // backgroundColor: 'white',
        paddingHorizontal: 0,
        paddingVertical: 10,
    },
    datePickerButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingVertical: 10,
    },
    datePickerIcon: {
        marginRight: 8,
    },
    datePickerText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '80%',
        maxHeight: '70%',
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    monthOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedMonthOption: {
        backgroundColor: '#e3f2fd',
    },
    monthOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedMonthOptionText: {
        color: '#2196F3',
        fontWeight: '500',
    },
    // New styles for top summary cards
    topSummaryContainer: {
        // backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    topSummaryCard: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 11,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topSummaryContent: {
        flex: 1,
    },
    topSummaryLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 5,
    },
    topSummaryAmount: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summaryContainer: {
        width: '100%',
        maxHeight: 120,
        paddingVertical: 10,
        paddingHorizontal: 5,
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
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 0,
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
        minHeight: 200,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default ExpenseDashboard;