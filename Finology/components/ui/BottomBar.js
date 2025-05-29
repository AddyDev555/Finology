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
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BottomBar = ({ activeTab, onTabPress }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const glowAnimation = useRef(new Animated.Value(0)).current;

    // Get current route name if activeTab is not provided
    const currentTab = activeTab || route.name;

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
            icon: 'file-document-outline',
            screenName: 'Home' // Replace with your actual screen name
        },
        { 
            name: 'Chart', 
            icon: 'chart-bar',
            screenName: 'BacklogPage' // Replace with your actual screen name
        },
        { 
            name: 'Add', 
            icon: 'plus',
            screenName: 'ManualEntry' // Replace with your actual screen name
        },
        { 
            name: 'Reports', 
            icon: 'clipboard-text-outline',
            screenName: 'CurrencyConverter' // Replace with your actual screen name
        },
        { 
            name: 'Me', 
            icon: 'account-circle-outline',
            screenName: 'EMICalculatorPage' // Replace with your actual screen name
        },
    ];

    const handleTabPress = (tab) => {
        // Call custom onTabPress if provided
        if (onTabPress) {
            onTabPress(tab.name);
        }
        
        // Navigate to the screen
        if (tab.screenName && currentTab !== tab.name) {
            try {
                navigation.navigate(tab.screenName);
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