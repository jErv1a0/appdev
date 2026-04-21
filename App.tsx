/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import './global.css';
import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import LaunchPage from './SRC/screens/LaunchPage';
import LoginScreen from './SRC/screens/LoginScreen';
import SignupScreen from './SRC/screens/SignupScreen';
import HomeScreen from './SRC/screens/HomeScreen';
import BookingScreen from './SRC/screens/BookingScreen';
import ChatScreen from './SRC/screens/ChatScreen';
import { initAuthRequest } from './SRC/store/auth/authReducer';
import { AppDispatch } from './SRC/store/store';
import store from './SRC/store/store';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initAuthRequest());
  }, [dispatch]);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Launch"
          screenOptions={{
            headerShown: true,
            animation: 'none',
          }}
        >
          <Stack.Screen name="Launch" component={LaunchPage} options={{ title: 'Welcome' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Browse' }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Booking' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
