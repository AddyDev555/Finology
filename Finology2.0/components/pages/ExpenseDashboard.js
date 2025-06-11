
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
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BallIndicator } from 'react-native-indicators';
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import EditExpense from './EditExpense';
import { scale, verticalScale, moderateScale } from '@/components/utils/responsive';
const ExpenseDashboard = ({
    expenses = [],
    isLoading = false,
    onRefresh,
    refreshKey,
    onEditExpense, // This will now be the handleUpdateExpense function from Home
    onDeleteExpense
}) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [groupedExpenses, setGroupedExpenses] = useState({});
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [datePickerSelectedDate, setDatePickerSelectedDate] = useState(new Date());

    // State variables for edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // Group expenses by category
    const categoryTotal = {};

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Category colors and icons for visual distinction
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

    expenses.forEach(item => {
        if (categoryTotal[item.category]) {
            categoryTotal[item.category] += item.amount;
        } else {
            categoryTotal[item.category] = item.amount;
        }
    });

    const getColor = (category) => categoryConfig[category]?.color || '#85C1E9';

    // PieChart & BarChart data - Fixed to avoid key prop issues
    const pieData = Object.keys(categoryTotal).map((category, i) => {
        const dataPoint = {
            value: categoryTotal[category],
            label: category,
            color: getColor(category),
        };
        return dataPoint;
    });

    const barData = Object.keys(categoryTotal).map((category, i) => {
        const dataPoint = {
            value: categoryTotal[category],
            label: category,
            frontColor: getColor(category),
        };
        return dataPoint;
    });

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

    // UPDATED handleEditExpense FUNCTION - Just opens the modal
    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowEditModal(true);
    };

    // UPDATED handleSaveExpense FUNCTION - Calls parent's onEditExpense (which is handleUpdateExpense from Home)
    const handleSaveExpense = async (updatedExpense) => {
        if (onEditExpense) {
            const success = await onEditExpense(updatedExpense.id, updatedExpense);
            if (success) {
                // Hide the modal only if update was successful
                setShowEditModal(false);
                setEditingExpense(null);
            }
            // If success is false, modal stays open so user can try again
        }
    };

    const handleDeleteExpense = (expenseId, expenseBusiness) => {
        Alert.alert(
            'Delete Expense',
            `Are you sure you want to delete the expense for "${expenseBusiness}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (onDeleteExpense) {
                            onDeleteExpense(expenseId);
                        }
                    },
                },
            ]
        );
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

        const handleCardPress = () => {
            Alert.alert(
                "Expense Options",
                `What would you like to do with this ${expense.category} expense?`,
                [
                    {
                        text: "Edit",
                        onPress: () => handleEditExpense(expense),
                        style: "default"
                    },
                    {
                        text: "Delete",
                        onPress: () => {
                            Alert.alert(
                                "Confirm Delete",
                                "Are you sure you want to delete this expense?",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                    {
                                        text: "Delete",
                                        onPress: () => handleDeleteExpense(expense.id, expense.business),
                                        style: "destructive"
                                    }
                                ]
                            );
                        },
                        style: "destructive"
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    }
                ]
            );
        };

        return (
            <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
                <View style={cardStyle}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <Text style={styles.amountText}>
                            {formatCurrency(expense.amount)}
                        </Text>

                        <Text style={styles.dateText}>
                            {formatDate(expense.date) || 'Time not available'}
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <View style={badgeStyle}>
                            <Text style={styles.categoryText}>
                                {expense.category}
                            </Text>
                        </View>

                        <Text style={styles.businessText}>
                            {expense.business}
                        </Text>
                    </View>

                    <Text style={styles.descriptionText}>
                        {expense.description}
                    </Text>
                </View>
            </TouchableOpacity>
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
                {sortedExpenses.map(expense => {
                    const { key, ...expenseProps } = expense;
                    return <ExpenseCard key={expense.id} expense={expenseProps} />;
                })}
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
                <BallIndicator color="#8B5CF6" size={60} />
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

            {/* Analysis and Summary Switch */}
            <View style={dashboardStyles.tabRootContainer}>
                <View style={dashboardStyles.tabSwitchBar}>
                    <TouchableOpacity
                        style={[
                            dashboardStyles.tabButton,
                            activeTab === 'summary' && dashboardStyles.tabActiveButton,
                        ]}
                        onPress={() => setActiveTab('summary')}
                    >
                        <Text
                            style={[
                                dashboardStyles.tabText,
                                activeTab === 'summary' && dashboardStyles.tabActiveText,
                            ]}
                        >
                            All Expenses
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            dashboardStyles.tabButton,
                            activeTab === 'analysis' && dashboardStyles.tabActiveButton,
                        ]}
                        onPress={() => setActiveTab('analysis')}
                    >
                        <Text
                            style={[
                                dashboardStyles.tabText,
                                activeTab === 'analysis' && dashboardStyles.tabActiveText,
                            ]}
                        >
                            Analysis Dashboard
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Expenses List */}
            {activeTab === 'summary' && (
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
                        sortedKeys.map(dateKey => {
                            const { key, ...dayDataProps } = groupedExpenses[dateKey];
                            return (
                                <DaySection
                                    key={dateKey}
                                    dateKey={dateKey}
                                    dayData={dayDataProps}
                                />
                            );
                        })
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
            )}

            {activeTab === 'analysis' && (
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
                    <View style={dashboardStyles.tabContentWrapper}>
                        <View style={dashboardStyles.chart}>
                            <Text style={dashboardStyles.chartTitle}>Category Distribution</Text>
                            {pieData.length > 0 ? (
                                <PieChart
                                    data={pieData}
                                    donut
                                    radius={130}
                                    innerRadius={60}
                                    showValuesAsLabels
                                    textColor="white"
                                    focusOnPress
                                    textSize={12}
                                />
                            ) : (
                                <View style={styles.emptyChartContainer}>
                                    <Text style={styles.emptyChartText}>No data available</Text>
                                </View>
                            )}
                        </View>

                        {/* Bar Chart */}
                        <View style={dashboardStyles.chart}>
                            <Text style={dashboardStyles.chartTitle}>Spending per Category</Text>
                            {barData.length > 0 ? (
                                <BarChart
                                    data={barData}
                                    barWidth={30}
                                    spacing={20}
                                    roundedTop
                                    isAnimated
                                />
                            ) : (
                                <View style={styles.emptyChartContainer}>
                                    <Text style={styles.emptyChartText}>No data available</Text>
                                </View>
                            )}
                        </View>

                        {/* Optional Line Chart: Trend (dummy for now)
                        <Text style={dashboardStyles.chartTitle}>Spending Trend (Example)</Text>
                        <LineChart
                            data={[0, 200, 600, 900, 400, 1200, 500]}
                            thickness={3}
                            color="#2196F3"
                            hideDataPoints
                            isAnimated
                            maxValue={2000}
                        /> */}
                    </View>
                </ScrollView>

            )}

            {/* Month Picker Modal */}
            <MonthPickerModal />

            {/* Edit Expense Modal - Now calls parent's handleUpdateExpense */}
            <EditExpense
                visible={showEditModal}
                expense={editingExpense}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingExpense(null);
                }}
                onSave={handleSaveExpense}
                categories={Object.keys(categoryConfig)}
            />
        </View>
    );
};

const dashboardStyles = StyleSheet.create({
    tabRootContainer: {
        marginTop: verticalScale(15),
        paddingHorizontal: scale(5),
    },
    tabSwitchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#EDE9FE',
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(5),
    },
    tabButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        borderRadius: moderateScale(10),
    },
    tabActiveButton: {
        backgroundColor: '#4B0082', // dark purple
    },
    tabText: {
        fontSize: moderateScale(12),
        color: '#4B0082',
    },
    tabActiveText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tabSectionTitle: {
        fontSize: moderateScale(18),
        marginBottom: verticalScale(10),
    },
    chartTitle: {
        fontSize: moderateScale(18),
        marginBottom: verticalScale(10),
    },
    chart: {
        marginBottom: verticalScale(20),
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: scale(0),
    },
    headerText: {
        fontSize: moderateScale(20),
        paddingHorizontal: scale(10),
        fontWeight: 'bold',
    },
    contentLoaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingTop: verticalScale(50),
        marginTop: verticalScale(180),
        minHeight: verticalScale(200),
    },
    loaderText: {
        marginTop: verticalScale(20),
        fontSize: moderateScale(16),
        color: '#666',
        fontWeight: '500',
    },
    // Date Picker Styles
    datePickerContainer: {
        width: '15%',
        paddingHorizontal: scale(0),
        paddingVertical: verticalScale(10),
    },
    datePickerButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(0),
        paddingVertical: verticalScale(10),
    },
    datePickerIcon: {
        marginRight: scale(8),
    },
    datePickerText: {
        flex: 1,
        fontSize: moderateScale(16),
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
        borderRadius: moderateScale(12),
        width: '80%',
        maxHeight: '70%',
        paddingBottom: verticalScale(16),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: scale(4),
    },
    monthOption: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedMonthOption: {
        backgroundColor: '#e3f2fd',
    },
    monthOptionText: {
        fontSize: moderateScale(16),
        color: '#333',
    },
    selectedMonthOptionText: {
        color: '#2196F3',
        fontWeight: '500',
    },
    // New styles for top summary cards
    topSummaryContainer: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(7),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(15),
    },
    topSummaryCard: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        padding: scale(11),
        borderRadius: moderateScale(15),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    topSummaryContent: {
        flex: 1,
    },
    topSummaryLabel: {
        fontSize: moderateScale(13),
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: verticalScale(5),
    },
    topSummaryAmount: {
        fontSize: moderateScale(18),
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summaryContainer: {
        width: '100%',
        maxHeight: verticalScale(120),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(5),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryCard: {
        width: scale(120),
        height: verticalScale(90),
        padding: scale(15),
        borderRadius: moderateScale(10),
        marginHorizontal: scale(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryIcon: {
        marginBottom: verticalScale(5),
    },
    summaryCategory: {
        fontSize: moderateScale(12),
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: verticalScale(5),
    },
    summaryAmount: {
        fontSize: moderateScale(16),
        color: 'white',
        fontWeight: 'bold',
    },
    expensesContainer: {
        flex: 1,
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(0),
    },
    daySection: {
        marginBottom: verticalScale(20),
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        paddingHorizontal: scale(5),
    },
    dayTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#333',
    },
    dayTotal: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#2196F3',
    },
    expenseCard: {
        backgroundColor: 'white',
        borderRadius: moderateScale(10),
        padding: scale(15),
        marginBottom: verticalScale(10),
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(10),
    },
    amountContainer: {
        flex: 1,
    },
    amountText: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(5),
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(15),
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        marginRight: scale(5),
    },
    categoryText: {
        fontSize: moderateScale(12),
        color: 'white',
        fontWeight: '600',
    },
    dateText: {
        fontSize: moderateScale(12),
        color: '#666',
        textAlign: 'right',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: verticalScale(10),
    },
    businessText: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#333',
        marginLeft: scale(5),
    },
    descriptionText: {
        fontSize: moderateScale(14),
        color: '#666',
        marginLeft: scale(5),
        lineHeight: verticalScale(20),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(50),
        minHeight: verticalScale(200),
    },
    emptyIcon: {
        marginBottom: verticalScale(16),
    },
    emptyText: {
        fontSize: moderateScale(18),
        color: '#666',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: verticalScale(8),
    },
    emptySubText: {
        fontSize: moderateScale(14),
        color: '#999',
        textAlign: 'center',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: verticalScale(10),
        paddingTop: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: scale(10),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(6),
        gap: scale(4),
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
    },
    actionButtonText: {
        color: 'white',
        fontSize: moderateScale(12),
        fontWeight: '600',
    },
});

export default ExpenseDashboard;