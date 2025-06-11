import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    FlatList,
} from 'react-native';
import BottomBar from '../ui/BottomBar';
import { scale, moderateScale, verticalScale } from '../utils/responsive'; // Adjust the import path as necessary

const CurrencyConverter = () => {
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [amount, setAmount] = useState('1');
    const [convertedAmount, setConvertedAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // Popular currencies
    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    ];

    // Fetch exchange rates
    const fetchExchangeRate = async () => {
        if (!fromCurrency || !toCurrency) return;

        setLoading(true);

        try {
            const response = await fetch(
                `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }

            const data = await response.json();
            const rate = data.rates[toCurrency];

            if (rate) {
                setExchangeRate(rate);
                setLastUpdated(new Date().toLocaleString());

                if (amount && !isNaN(parseFloat(amount))) {
                    const converted = (parseFloat(amount) * rate).toFixed(2);
                    setConvertedAmount(converted);
                }
            } else {
                throw new Error('Currency not found');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch exchange rates. Please try again.');
            console.error('Exchange rate fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Convert amount when amount or exchange rate changes
    useEffect(() => {
        if (exchangeRate && amount && !isNaN(parseFloat(amount))) {
            const converted = (parseFloat(amount) * exchangeRate).toFixed(2);
            setConvertedAmount(converted);
        } else {
            setConvertedAmount('');
        }
    }, [amount, exchangeRate]);

    // Fetch exchange rate when currencies change
    useEffect(() => {
        fetchExchangeRate();
    }, [fromCurrency, toCurrency]);

    // Swap currencies
    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    // Handle amount input
    const handleAmountChange = (value) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    // Get currency data
    const getCurrencyData = (code) => {
        return currencies.find(c => c.code === code) || { code, name: code, symbol: code, flag: '💱' };
    };

    // Currency picker modal
    const CurrencyPicker = ({ visible, onClose, onSelect, selectedCurrency }) => (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Currency</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={currencies}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.currencyItem,
                                    selectedCurrency === item.code && styles.selectedCurrency
                                ]}
                                onPress={() => {
                                    onSelect(item.code);
                                    onClose();
                                }}
                            >
                                <Text style={styles.currencyFlag}>{item.flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={styles.currencyCode}>{item.code}</Text>
                                    <Text style={styles.currencyName}>{item.name}</Text>
                                </View>
                                <Text style={styles.currencySymbol}>{item.symbol}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    const fromCurrencyData = getCurrencyData(fromCurrency);
    const toCurrencyData = getCurrencyData(toCurrency);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>

                    {/* Converter Card */}
                    <View style={styles.converterCard}>
                        {/* From Currency */}
                        <View style={styles.currencySection}>
                            <Text style={styles.sectionLabel}>From</Text>
                            <TouchableOpacity
                                style={styles.currencySelector}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Text style={styles.currencyFlag}>{fromCurrencyData.flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={styles.currencyCode}>{fromCurrency}</Text>
                                    <Text style={styles.currencyName}>{fromCurrencyData.name}</Text>
                                </View>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>

                            <View style={styles.inputContainer}>
                                <Text style={styles.currencySymbol}>{fromCurrencyData.symbol}</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>
                        </View>

                        {/* Swap Button */}
                        <View style={styles.swapContainer}>
                            <TouchableOpacity
                                style={styles.swapButton}
                                onPress={swapCurrencies}
                                disabled={loading}
                            >
                                <Text style={styles.swapIcon}>⇅</Text>
                            </TouchableOpacity>
                        </View>

                        {/* To Currency */}
                        <View style={styles.currencySection}>
                            <Text style={styles.sectionLabel}>To</Text>
                            <TouchableOpacity
                                style={styles.currencySelector}
                                onPress={() => setShowToPicker(true)}
                            >
                                <Text style={styles.currencyFlag}>{toCurrencyData.flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={styles.currencyCode}>{toCurrency}</Text>
                                    <Text style={styles.currencyName}>{toCurrencyData.name}</Text>
                                </View>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>

                            <View style={styles.inputContainer}>
                                <Text style={styles.currencySymbol}>{toCurrencyData.symbol}</Text>
                                <TextInput
                                    style={[styles.amountInput, styles.convertedInput]}
                                    value={convertedAmount}
                                    placeholder="0.00"
                                    editable={false}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>
                        </View>

                        {/* Exchange Rate Info */}
                        {exchangeRate && !loading && (
                            <View style={styles.rateInfo}>
                                <Text style={styles.rateText}>
                                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                                </Text>
                                {lastUpdated && (
                                    <Text style={styles.lastUpdated}>
                                        Last updated: {lastUpdated}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Refresh Button */}
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={fetchExchangeRate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.refreshIcon}>↻</Text>
                            )}
                            <Text style={styles.refreshText}>
                                {loading ? 'Updating...' : 'Refresh Rates'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Disclaimer */}
                    <View style={styles.disclaimer}>
                        <Text style={styles.disclaimerText}>
                            Exchange rates are indicative and may vary from actual market rates.
                            For precise rates, consult your bank or financial institution.
                        </Text>
                    </View>

                    {/* Currency Pickers */}
                    <CurrencyPicker
                        visible={showFromPicker}
                        onClose={() => setShowFromPicker(false)}
                        onSelect={setFromCurrency}
                        selectedCurrency={fromCurrency}
                    />

                    <CurrencyPicker
                        visible={showToPicker}
                        onClose={() => setShowToPicker(false)}
                        onSelect={setToCurrency}
                        selectedCurrency={toCurrency}
                    />
                </View>
            </ScrollView>
            <View style={styles.bottomBar}>
                <BottomBar />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    content: {
        flex: 1,
        padding: scale(20),
        paddingTop: verticalScale(60),
    },
    header: {
        alignItems: 'center',
        marginBottom: verticalScale(40),
    },
    headerTitle: {
        fontSize: moderateScale(32),
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: verticalScale(8),
    },
    headerSubtitle: {
        fontSize: moderateScale(16),
        color: '#4A5568',
    },
    converterCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(20),
        padding: scale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(8),
        elevation: 5,
    },
    currencySection: {
        marginBottom: verticalScale(20),
    },
    sectionLabel: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: verticalScale(12),
    },
    currencySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(16),
        backgroundColor: '#F7FAFC',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: verticalScale(12),
    },
    currencyFlag: {
        fontSize: moderateScale(24),
        marginRight: scale(12),
    },
    currencyInfo: {
        flex: 1,
    },
    currencyCode: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: '#2D3748',
    },
    currencyName: {
        fontSize: moderateScale(14),
        color: '#4A5568',
        marginTop: verticalScale(2),
    },
    dropdownArrow: {
        fontSize: moderateScale(16),
        color: '#4A5568',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: moderateScale(12),
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(16),
    },
    currencySymbol: {
        fontSize: moderateScale(18),
        color: '#4A5568',
        marginRight: scale(8),
        minWidth: scale(40),
        textAlign: 'right',
    },
    amountInput: {
        flex: 1,
        fontSize: moderateScale(20),
        color: '#2D3748',
        paddingVertical: verticalScale(16),
    },
    convertedInput: {
        backgroundColor: '#F7FAFC',
        color: '#4A5568',
    },
    swapContainer: {
        alignItems: 'center',
        marginVertical: verticalScale(20),
    },
    swapButton: {
        width: scale(50),
        height: scale(50),
        borderRadius: moderateScale(25),
        backgroundColor: '#3182CE',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    swapIcon: {
        fontSize: moderateScale(24),
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    rateInfo: {
        backgroundColor: '#EDF2F7',
        padding: scale(16),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(20),
    },
    rateText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#2D3748',
        textAlign: 'center',
    },
    lastUpdated: {
        fontSize: moderateScale(12),
        color: '#4A5568',
        textAlign: 'center',
        marginTop: verticalScale(4),
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3182CE',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(12),
    },
    refreshIcon: {
        fontSize: moderateScale(20),
        color: '#FFFFFF',
        marginRight: scale(8),
    },
    refreshText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    disclaimer: {
        marginTop: verticalScale(30),
        padding: scale(16),
        backgroundColor: '#FFF5F5',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#FEB2B2',
    },
    disclaimerText: {
        fontSize: moderateScale(12),
        color: '#C53030',
        textAlign: 'center',
        lineHeight: verticalScale(18),
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#2D3748',
    },
    closeButton: {
        width: scale(30),
        height: scale(30),
        borderRadius: moderateScale(15),
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: moderateScale(18),
        color: '#4A5568',
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC',
    },
    selectedCurrency: {
        backgroundColor: '#EBF8FF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: scale(10),
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});

export default CurrencyConverter;