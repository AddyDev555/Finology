import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Greeting() {
    const userStatus = 7; // Example status value (can be dynamic)
    const [name, setName] = React.useState('');

    const status = {
        "0-2": { text: "Poor 💸", backgroundColor: "#F44336" },
        "3-4": { text: "Below Avg ⚠️", backgroundColor: "#FF9800" },
        "5-6": { text: "Fair 📊", backgroundColor: "#FFEB3B" },
        "7-8": { text: "Good 👍", backgroundColor: "#4CAF50" },
        "9-10": { text: "Excellent 🌟", backgroundColor: "#2196F3" },
    };

    useEffect(()=>{
        handelUsername();
    },[])

    let statusText = "";
    let statusBackgroundColor = "";

    if (userStatus >= 0 && userStatus <= 2) {
        statusText = status["0-2"].text;
        statusBackgroundColor = status["0-2"].backgroundColor;
    } else if (userStatus >= 3 && userStatus <= 4) {
        statusText = status["3-4"].text;
        statusBackgroundColor = status["3-4"].backgroundColor;
    } else if (userStatus >= 5 && userStatus <= 6) {
        statusText = status["5-6"].text;
        statusBackgroundColor = status["5-6"].backgroundColor;
    } else if (userStatus >= 7 && userStatus <= 8) {
        statusText = status["7-8"].text;
        statusBackgroundColor = status["7-8"].backgroundColor;
    } else if (userStatus >= 9 && userStatus <= 10) {
        statusText = status["9-10"].text;
        statusBackgroundColor = status["9-10"].backgroundColor;
    }

    // Get current hour for greeting
    const currentHour = new Date().getHours();
    let greeting = 'Hello';
    if (currentHour < 12) {
        greeting = 'Good Morning';
    } else if (currentHour < 17) {
        greeting = 'Good Afternoon';
    } else {
        greeting = 'Good Evening';
    }

    // Dynamic Date Formatting
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${weekdays[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const handelUsername = async () => {
        const savedData = await AsyncStorage.getItem('user');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setName(parsedData.name);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.greetingWrapper}>
                <View>
                    <Text style={styles.greetingText}>{greeting}, {name} 👋</Text>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
            </View>

            <View style={styles.statusWrapper}>
                <Text style={[styles.statusText, { backgroundColor: statusBackgroundColor }]}>
                    Status: {statusText}
                </Text>
            </View>

            <Image source={require('../../assets/doodle.png')} style={styles.logo} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 145,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginTop: 105,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
        position: 'relative',
    },

    greetingWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    greetingText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 16,
        color: '#666',
    },

    statusWrapper: {
        marginTop: 20,
        alignItems: 'flex-start',
    },

    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
    },

    logo: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});