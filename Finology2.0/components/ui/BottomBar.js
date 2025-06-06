import React, { useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { router, useSegments } from 'expo-router';

const { width } = Dimensions.get('window');

const BottomBar = ({ activeTab, onTabPress }) => {
    const glowAnimation = useRef(new Animated.Value(0)).current;
    const segments = useSegments();

    // Get current route name if activeTab is not provided
    const currentTab = segments[1] || 'home';

    useEffect(() => {
        const startGlowAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnimation, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnimation, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };

        startGlowAnimation();
    }, [glowAnimation]);

    const glowStyle = {
        shadowOpacity: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
        }),
        shadowRadius: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 20],
        }),
    };

    const tabs = [
        {
            name: 'Home',
            icon: 'view-dashboard-outline',
            screenName: 'home'
        },
        {
            name: 'Backlogs',
            icon: 'history',
            screenName: 'backlog-page'
        },
        {
            name: 'Add',
            icon: 'plus',
            screenName: 'manual-entry'
        },
        {
            name: 'EMI Cal',
            icon: 'calculator-variant-outline',
            screenName: 'emi-calculator'
        },
        {
            name: 'Currency',
            icon: 'currency-usd',
            screenName: 'currency-converter'
        }
    ];


    const handleTabPress = (tab) => {
        // Call custom onTabPress if provided
        if (onTabPress) {
            onTabPress(tab.name);
        }

        // Navigate to the screen
        if (tab.screenName && currentTab !== tab.name) {
            try {
                router.push(`/${tab.screenName}`);
            } catch (error) {
                console.warn(`Navigation to ${tab.screenName} failed:`, error);
            }
        }
    };

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = currentTab === tab.name || currentTab === tab.screenName;
                const isAddButton = tab.name === 'Add';

                if (isAddButton) {
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.addButtonContainer}
                            onPress={() => handleTabPress(tab)}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={[styles.addButton, glowStyle]}>
                                <MaterialCommunityIcons name={tab.icon} size={32} color="white" />
                            </Animated.View>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tabItem}
                        onPress={() => handleTabPress(tab)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon}
                            size={24}
                            color={isActive ? '#8B7BC7' : '#B3A9D5'}
                        />
                        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 75,
        flexDirection: 'row',
        paddingVertical: 0,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0,
        paddingHorizontal: 12,
        minWidth: 40,
        marginBottom: 35,
    },
    tabLabel: {
        fontSize: 12,
        color: 'black',
        fontWeight: '500',
        marginTop: 2,
        textAlign: 'center',
    },
    activeTabLabel: {
        fontSize: 12,
        color: 'black',
        fontWeight: '500',
    },
    addButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        bottom: 30,
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 30,
        backgroundColor: '#7B68EE',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#8B7BC7',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});

export default BottomBar;