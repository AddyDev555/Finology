import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { scale, moderateScale, verticalScale } from '../utils/responsive'; // Adjust the import path as necessary

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [backlogData, setBacklogs] = useState([]);

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
            const response = await fetch(`https://finology.pythonanywhere.com/payment-due/${userId}`, {
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

    // Function to calculate time difference
    const getTimeAgo = (date) => {
        const now = new Date();
        const targetDate = new Date(date);
        const diffTime = Math.abs(now - targetDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        if (diffDays === 0) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return '1d ago';
        } else {
            return `${diffDays}d ago`;
        }
    };

    // Function to get days since due date (for overdue items)
    const getDaysSinceDue = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Function to determine priority based on amount and overdue days
    const determinePriority = (amount, daysSinceDue) => {
        if (daysSinceDue > 7 || amount > 1000) {
            return 'critical';
        } else if (daysSinceDue > 3 || amount > 500) {
            return 'high';
        } else if (daysSinceDue > 1 || amount > 200) {
            return 'medium';
        } else {
            return 'low';
        }
    };

    // Function to generate notifications from backlog data
    const generateNotifications = () => {
        const generatedNotifications = [];
        const now = new Date();

        backlogData.forEach(item => {
            const dueDate = new Date(item.date);
            const daysSinceDue = getDaysSinceDue(item.date);
            const priority = determinePriority(item.amount, daysSinceDue);
            
            // All items in payment_dues are overdue by definition
            if (daysSinceDue >= 0) {
                generatedNotifications.push({
                    id: `overdue-${item.id}`,
                    title: 'Payment Overdue',
                    message: `Payment of ₹${item.amount} to ${item.name} is overdue by ${daysSinceDue} days. ${item.description}`,
                    time: `${daysSinceDue} days overdue`,
                    icon: 'warning-outline',
                    priority: priority,
                    backlogItem: item
                });

                // Add urgent reminder for high amounts
                if (item.amount > 1000) {
                    generatedNotifications.push({
                        id: `urgent-${item.id}`,
                        title: 'High Amount Due',
                        message: `Urgent: Large payment of ₹${item.amount} pending for ${item.name}`,
                        time: getTimeAgo(item.date),
                        icon: 'flash-outline',
                        priority: 'critical',
                        backlogItem: item
                    });
                }

                // Add category-based notifications
                if (item.category === 'Friends') {
                    generatedNotifications.push({
                        id: `friend-${item.id}`,
                        title: 'Friend Payment Due',
                        message: `Don't forget to pay ₹${item.amount} to your friend ${item.name}`,
                        time: getTimeAgo(item.date),
                        icon: 'people-outline',
                        priority: 'medium',
                        backlogItem: item
                    });
                }

                // Weekly reminder for long overdue items
                if (daysSinceDue > 7 && daysSinceDue % 7 === 0) {
                    generatedNotifications.push({
                        id: `weekly-${item.id}`,
                        title: 'Weekly Reminder',
                        message: `Payment to ${item.name} has been pending for ${daysSinceDue} days. Please settle soon.`,
                        time: `${daysSinceDue} days ago`,
                        icon: 'refresh-outline',
                        priority: 'high',
                        backlogItem: item
                    });
                }
            }
        });

        // Sort notifications by priority and days overdue
        generatedNotifications.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // If same priority, sort by amount (higher amounts first)
            return (b.backlogItem?.amount || 0) - (a.backlogItem?.amount || 0);
        });

        return generatedNotifications;
    };

    useEffect(() => {
        if (backlogData.length > 0) {
            const generatedNotifications = generateNotifications();
            setNotifications(generatedNotifications);
        }
    }, [backlogData]);

    // Function to get icon color based on priority
    const getIconColor = (priority) => {
        switch (priority) {
            case 'critical': return '#FF4444';
            case 'high': return '#FF8800';
            case 'medium': return '#7F00FF';
            case 'low': return '#4CAF50';
            default: return '#7F00FF';
        }
    };

    // Function to get card background based on priority
    const getCardBackground = (priority) => {
        switch (priority) {
            case 'critical': return '#FFF5F5';
            case 'high': return '#FFF8F0';
            case 'medium': return '#F8F6FF';
            case 'low': return '#F0FFF4';
            default: return '#F8F6FF';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: getCardBackground(item.priority) }
            ]}
        >
            <Icon
                name={item.icon}
                size={26}
                color={getIconColor(item.priority)}
                style={styles.icon}
            />
            <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.priority === 'critical' && (
                        <View style={styles.criticalBadge}>
                            <Text style={styles.criticalText}>!</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <View style={styles.bottomRow}>
                    <Text style={[styles.time, { color: getIconColor(item.priority) }]}>
                        {item.time}
                    </Text>
                    {item.backlogItem && (
                        <View style={styles.amountContainer}>
                            <Text style={styles.amount}>
                                ₹{item.backlogItem.amount}
                            </Text>
                            <Text style={styles.category}>
                                {item.backlogItem.category}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.notHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Icon name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.notificationHeader}>Payment Notifications</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notifications.length}</Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.emptyState}>
                    <Icon name="hourglass-outline" size={64} color="#7F00FF" />
                    <Text style={styles.emptyText}>Loading notifications...</Text>
                </View>
            ) : notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Icon name="checkmark-circle-outline" size={64} color="#4CAF50" />
                    <Text style={styles.emptyText}>All payments up to date!</Text>
                    <Text style={styles.emptySubtext}>No pending payment notifications</Text>
                </View>
            )}
            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(16),
    },
    notHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: verticalScale(20),
        marginTop: verticalScale(10),
        paddingHorizontal: scale(4),
    },
    backButton: {
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        width: scale(40),
        height: scale(40),
    },
    notificationHeader: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
        marginHorizontal: scale(8),
    },
    badge: {
        backgroundColor: '#7F00FF',
        borderRadius: moderateScale(12),
        minWidth: scale(24),
        height: scale(24),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(8),
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: verticalScale(20),
    },
    card: {
        flexDirection: 'row',
        padding: scale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(14),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
    },
    icon: {
        marginRight: scale(14),
        marginTop: verticalScale(2),
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    criticalBadge: {
        backgroundColor: '#FF4444',
        borderRadius: moderateScale(10),
        width: scale(20),
        height: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(8),
    },
    criticalText: {
        color: '#FFFFFF',
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    },
    message: {
        fontSize: moderateScale(14),
        color: '#444',
        marginTop: verticalScale(4),
        lineHeight: verticalScale(20),
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(8),
    },
    time: {
        fontSize: moderateScale(12),
        fontWeight: '500',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#000',
    },
    category: {
        fontSize: moderateScale(11),
        color: '#666',
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: verticalScale(100),
    },
    emptyText: {
        fontSize: moderateScale(20),
        fontWeight: '600',
        color: '#4CAF50',
        marginTop: verticalScale(16),
    },
    emptySubtext: {
        fontSize: moderateScale(14),
        color: '#666',
        marginTop: verticalScale(4),
    },
});

export default Notification;