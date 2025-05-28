import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import ExpenseEntryPage from './components/pages/ManualEntry';
import ExpenseDashboard from './components/pages/ExpenseDashboard';
import BacklogPage from './components/pages/BacklogsPage';
import EMICalculatorPage from './components/pages/EMICalculator';
import CurrencyConverter from './components/pages/CurrencyConverter';
// import OnlineExpense from './components/pages/OnlineExpense';
import Toast from 'react-native-toast-message';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('immersive');
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  const Stack = createStackNavigator();

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          <Stack.Screen name="ManualEntry" component={ExpenseEntryPage} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseDashboard" component={ExpenseDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="BacklogPage" component={BacklogPage} options={{ headerShown: false }} />
          <Stack.Screen name="EMICalculatorPage" component={EMICalculatorPage} options={{ headerShown: false }} />
          <Stack.Screen name="CurrencyConverter" component={CurrencyConverter} options={{ headerShown: false }} />
          {/* <Stack.Screen name="OnlineExpense" component={OnlineExpense} options={{ headerShown: false }} /> */}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});