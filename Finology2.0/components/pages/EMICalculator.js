import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../ui/BottomBar';
import Calculator from '../ui/Calculator';

const { width } = Dimensions.get('window');

const EMICalculatorPage = () => {
    const [calculatorMode, setCalculatorMode] = useState('emi'); // emi, loan, tenure, rate
    const [loanAmount, setLoanAmount] = useState('500000');
    const [interestRate, setInterestRate] = useState('12');
    const [tenure, setTenure] = useState('24');
    const [tenureType, setTenureType] = useState('months'); // months, years
    const [emiAmount, setEmiAmount] = useState('');
    const [isResultVisible, setIsResultVisible] = useState(false);

    const modes = [
        { key: 'emi', title: 'Calculate EMI', icon: 'calculator', color: '#2196F3' },
        { key: 'loan', title: 'Calculate Loan Amount', icon: 'currency-inr', color: '#4CAF50' },
        { key: 'tenure', title: 'Calculate Tenure', icon: 'clock', color: '#FF9800' },
        { key: 'rate', title: 'Calculate Rate', icon: 'percent', color: '#9C27B0' },
    ];

    // Convert tenure to months for calculations
    const tenureInMonths = useMemo(() => {
        return tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);
    }, [tenure, tenureType]);

    // EMI Calculation Function
    const calculateEMI = useCallback((principal, rate, months) => {
        const monthlyRate = rate / (12 * 100);
        if (monthlyRate === 0) return principal / months;

        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);
        return emi;
    }, []);

    // Calculate Loan Amount from EMI
    const calculateLoanAmount = useCallback((emi, rate, months) => {
        const monthlyRate = rate / (12 * 100);
        if (monthlyRate === 0) return emi * months;

        const principal = emi * (Math.pow(1 + monthlyRate, months) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, months));
        return principal;
    }, []);

    // Calculate Tenure from EMI and Loan Amount
    const calculateTenure = useCallback((principal, emi, rate) => {
        const monthlyRate = rate / (12 * 100);
        if (monthlyRate === 0) return principal / emi;

        const months = Math.log(1 + (principal * monthlyRate) / emi) /
            Math.log(1 + monthlyRate) * -1;
        return Math.abs(months);
    }, []);

    // Calculate Interest Rate (using iterative method)
    const calculateInterestRate = useCallback((principal, emi, months) => {
        let low = 0;
        let high = 50;
        let tolerance = 0.01;

        while (high - low > tolerance) {
            const mid = (low + high) / 2;
            const calculatedEMI = calculateEMI(principal, mid, months);

            if (calculatedEMI > emi) {
                high = mid;
            } else {
                low = mid;
            }
        }

        return (low + high) / 2;
    }, [calculateEMI]);

    // Main calculation logic
    const calculations = useMemo(() => {
        const principal = parseFloat(loanAmount) || 0;
        const rate = parseFloat(interestRate) || 0;
        const months = tenureInMonths || 0;
        const emi = parseFloat(emiAmount) || 0;

        let result = {};

        try {
            switch (calculatorMode) {
                case 'emi':
                    const calculatedEMI = calculateEMI(principal, rate, months);
                    const totalPayment = calculatedEMI * months;
                    const totalInterest = totalPayment - principal;

                    result = {
                        emi: calculatedEMI,
                        totalPayment,
                        totalInterest,
                        principal,
                        interestPercentage: (totalInterest / totalPayment) * 100,
                        principalPercentage: (principal / totalPayment) * 100,
                        valid: principal > 0 && rate > 0 && months > 0
                    };
                    break;

                case 'loan':
                    const calculatedLoan = calculateLoanAmount(emi, rate, months);
                    const totalPaymentLoan = emi * months;
                    const totalInterestLoan = totalPaymentLoan - calculatedLoan;

                    result = {
                        loanAmount: calculatedLoan,
                        totalPayment: totalPaymentLoan,
                        totalInterest: totalInterestLoan,
                        emi,
                        interestPercentage: (totalInterestLoan / totalPaymentLoan) * 100,
                        principalPercentage: (calculatedLoan / totalPaymentLoan) * 100,
                        valid: emi > 0 && rate > 0 && months > 0
                    };
                    break;

                case 'tenure':
                    const calculatedMonths = calculateTenure(principal, emi, rate);
                    const totalPaymentTenure = emi * calculatedMonths;
                    const totalInterestTenure = totalPaymentTenure - principal;

                    result = {
                        tenure: calculatedMonths,
                        tenureYears: calculatedMonths / 12,
                        totalPayment: totalPaymentTenure,
                        totalInterest: totalInterestTenure,
                        emi,
                        principal,
                        interestPercentage: (totalInterestTenure / totalPaymentTenure) * 100,
                        principalPercentage: (principal / totalPaymentTenure) * 100,
                        valid: principal > 0 && emi > 0 && rate > 0
                    };
                    break;

                case 'rate':
                    const calculatedRate = calculateInterestRate(principal, emi, months);
                    const totalPaymentRate = emi * months;
                    const totalInterestRate = totalPaymentRate - principal;

                    result = {
                        interestRate: calculatedRate,
                        totalPayment: totalPaymentRate,
                        totalInterest: totalInterestRate,
                        emi,
                        principal,
                        interestPercentage: (totalInterestRate / totalPaymentRate) * 100,
                        principalPercentage: (principal / totalPaymentRate) * 100,
                        valid: principal > 0 && emi > 0 && months > 0
                    };
                    break;

                default:
                    result = { valid: false };
            }
        } catch (error) {
            result = { valid: false, error: error.message };
        }

        return result;
    }, [calculatorMode, loanAmount, interestRate, tenureInMonths, emiAmount, calculateEMI, calculateLoanAmount, calculateTenure, calculateInterestRate]);

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return '₹0';
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatNumber = (num, decimals = 2) => {
        if (!num || isNaN(num)) return '0';
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const getCurrentModeConfig = () => {
        return modes.find(mode => mode.key === calculatorMode);
    };

    const handleCalculate = () => {
        setIsResultVisible(true);
    };

    const resetCalculator = () => {
        setLoanAmount('500000');
        setInterestRate('12');
        setTenure('24');
        setEmiAmount('');
        setIsResultVisible(false);
    };

    const ResultCard = ({ title, value, subtitle, color = '#333' }) => (
        <View style={[styles.resultCard, { borderLeftColor: color }]}>
            <Text style={styles.resultTitle}>{title}</Text>
            <Text style={[styles.resultValue, { color }]}>{value}</Text>
            {subtitle && <Text style={styles.resultSubtitle}>{subtitle}</Text>}
        </View>
    );

    const ProgressBar = ({ percentage, color }) => (
        <View style={styles.progressBarContainer}>
            <View
                style={[
                    styles.progressBar,
                    { width: `${percentage}%`, backgroundColor: color }
                ]}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>EMI Calculator</Text>
                    <Text style={styles.headerSubtitle}>Calculate your loan details</Text>
                </View>
                <View style={{ marginLeft: 'auto' }}>
                    <Calculator color="#8B5CF6" />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Mode Selector */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Calculation Mode</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.modeSelector}>
                            {modes.map((mode) => (
                                <TouchableOpacity
                                    key={mode.key}
                                    style={[
                                        styles.modeOption,
                                        calculatorMode === mode.key && styles.selectedMode,
                                        // { borderColor: mode.color }
                                    ]}
                                    onPress={() => {
                                        setCalculatorMode(mode.key);
                                        setIsResultVisible(false);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={mode.icon}
                                        size={24}
                                        color={calculatorMode === mode.key ? 'white' : mode.color}
                                    />
                                    <Text style={[
                                        styles.modeText,
                                        calculatorMode === mode.key && styles.selectedModeText
                                    ]}>
                                        {mode.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Input Form */}
                <View style={styles.formContainer}>
                    {/* <Text style={styles.sectionTitle}>Input Details</Text> */}

                    {/* Loan Amount */}
                    {calculatorMode !== 'loan' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Loan Amount</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="currency-inr" size={20} color="#666" />
                                <TextInput
                                    style={styles.textInput}
                                    value={loanAmount}
                                    onChangeText={setLoanAmount}
                                    placeholder="Enter loan amount"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    {/* Interest Rate */}
                    {calculatorMode !== 'rate' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Interest Rate (% per annum)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="percent" size={20} color="#666" />
                                <TextInput
                                    style={styles.textInput}
                                    value={interestRate}
                                    onChangeText={setInterestRate}
                                    placeholder="Enter interest rate"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    {/* Tenure */}
                    {calculatorMode !== 'tenure' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Loan Tenure</Text>
                            <View style={styles.tenureContainer}>
                                <View style={styles.tenureInputWrapper}>
                                    <MaterialCommunityIcons name="clock" size={20} color="#666" />
                                    <TextInput
                                        style={styles.textInput}
                                        value={tenure}
                                        onChangeText={setTenure}
                                        placeholder="Enter tenure"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.tenureTypeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.tenureTypeButton,
                                            tenureType === 'months' && styles.selectedTenureType
                                        ]}
                                        onPress={() => setTenureType('months')}
                                    >
                                        <Text style={[
                                            styles.tenureTypeText,
                                            tenureType === 'months' && styles.selectedTenureTypeText
                                        ]}>
                                            Months
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.tenureTypeButton,
                                            tenureType === 'years' && styles.selectedTenureType
                                        ]}
                                        onPress={() => setTenureType('years')}
                                    >
                                        <Text style={[
                                            styles.tenureTypeText,
                                            tenureType === 'years' && styles.selectedTenureTypeText
                                        ]}>
                                            Years
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* EMI Amount */}
                    {(calculatorMode === 'loan' || calculatorMode === 'tenure' || calculatorMode === 'rate') && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>EMI Amount</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="calculator" size={20} color="#666" />
                                <TextInput
                                    style={styles.textInput}
                                    value={emiAmount}
                                    onChangeText={setEmiAmount}
                                    placeholder="Enter EMI amount"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.calculateButton]}
                            onPress={handleCalculate}
                        >
                            <MaterialCommunityIcons name="calculator" size={20} color="white" />
                            <Text style={styles.buttonText}>Calculate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.resetButton]}
                            onPress={resetCalculator}
                        >
                            <MaterialCommunityIcons name="refresh" size={20} color="#666" />
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Results Section */}
                {isResultVisible && calculations.valid && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.sectionTitle}>Calculation Results</Text>

                        {/* Main Result */}
                        <View style={styles.mainResultContainer}>
                            {calculatorMode === 'emi' && (
                                <ResultCard
                                    title="Monthly EMI"
                                    value={formatCurrency(calculations.emi)}
                                    color={getCurrentModeConfig().color}
                                />
                            )}
                            {calculatorMode === 'loan' && (
                                <ResultCard
                                    title="Maximum Loan Amount"
                                    value={formatCurrency(calculations.loanAmount)}
                                    color={getCurrentModeConfig().color}
                                />
                            )}
                            {calculatorMode === 'tenure' && (
                                <ResultCard
                                    title="Loan Tenure"
                                    value={`${formatNumber(calculations.tenure, 0)} months`}
                                    subtitle={`${formatNumber(calculations.tenureYears, 1)} years`}
                                    color={getCurrentModeConfig().color}
                                />
                            )}
                            {calculatorMode === 'rate' && (
                                <ResultCard
                                    title="Interest Rate"
                                    value={`${formatNumber(calculations.interestRate)}% p.a.`}
                                    color={getCurrentModeConfig().color}
                                />
                            )}
                        </View>

                        {/* Additional Results */}
                        <View style={styles.additionalResults}>
                            <View style={styles.resultRow}>
                                <ResultCard
                                    title="Total Payment"
                                    value={formatCurrency(calculations.totalPayment)}
                                    color="#2196F3"
                                />
                                <ResultCard
                                    title="Total Interest"
                                    value={formatCurrency(calculations.totalInterest)}
                                    color="#FF5722"
                                />
                            </View>
                        </View>

                        {/* Payment Breakdown */}
                        <View style={styles.breakdownContainer}>
                            <Text style={styles.breakdownTitle}>Payment Breakdown</Text>

                            <View style={styles.breakdownItem}>
                                <View style={styles.breakdownHeader}>
                                    <Text style={styles.breakdownLabel}>Principal Amount</Text>
                                    <Text style={styles.breakdownPercentage}>
                                        {formatNumber(calculations.principalPercentage)}%
                                    </Text>
                                </View>
                                <ProgressBar
                                    percentage={calculations.principalPercentage}
                                    color="#4CAF50"
                                />
                            </View>

                            <View style={styles.breakdownItem}>
                                <View style={styles.breakdownHeader}>
                                    <Text style={styles.breakdownLabel}>Interest Amount</Text>
                                    <Text style={styles.breakdownPercentage}>
                                        {formatNumber(calculations.interestPercentage)}%
                                    </Text>
                                </View>
                                <ProgressBar
                                    percentage={calculations.interestPercentage}
                                    color="#FF5722"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Error Message */}
                {isResultVisible && !calculations.valid && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
                        <Text style={styles.errorText}>
                            Please enter valid values for all required fields
                        </Text>
                        {calculations.error && (
                            <Text style={styles.errorDetails}>{calculations.error}</Text>
                        )}
                    </View>
                )}
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#8B5CF6',
        padding: 20,
        paddingTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
    },
    sectionContainer: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    modeSelector: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    modeOption: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginRight: 15,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: 'white',
        minWidth: 120,
        borderColor: '#e0e0e0',
    },
    selectedMode: {
        backgroundColor: '#8B5CF6',
    },
    modeText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    selectedModeText: {
        color: 'white',
    },
    formContainer: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
    },
    tenureInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
        flex: 1,
    },
    textInput: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    tenureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tenureTypeSelector: {
        flexDirection: 'row',
        marginLeft: 10,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tenureTypeButton: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    selectedTenureType: {
        backgroundColor: '#8B5CF6',
    },
    tenureTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedTenureTypeText: {
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    calculateButton: {
        backgroundColor: '#8B5CF6',
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    resetButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    resultsContainer: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        marginBottom: 10,
    },
    resultTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    resultValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    resultSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    additionalResults: {
        marginBottom: 20,
    },
    resultRow: {
        flexDirection: 'column',
    },
    breakdownContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
    },
    breakdownTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    breakdownItem: {
        marginBottom: 15,
    },
    breakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#666',
    },
    breakdownPercentage: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    errorContainer: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
    },
    errorDetails: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});

export default EMICalculatorPage;