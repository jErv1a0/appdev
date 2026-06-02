/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import LaunchPage from './SRC/screens/LaunchPage';
import LoginScreen from './SRC/screens/LoginScreen';
import SignupScreen from './SRC/screens/SignupScreen';
import HomeScreen from './SRC/screens/HomeScreen';
import RoomListingScreen from './SRC/screens/RoomListingScreen';
import RoomDetailScreen from './SRC/screens/RoomDetailScreen';
import BookingScreen from './SRC/screens/BookingScreen';
import FeedbackScreen from './SRC/screens/FeedbackScreen';
import ProfileScreen from './SRC/screens/ProfileScreen';
import ProfileEditScreen from './SRC/screens/ProfileEditScreen';
import ChatScreen from './SRC/screens/ChatScreen';
import AccountHomeScreen from './SRC/screens/AccountHomeScreen';
import { initAuthRequest } from './SRC/store/auth/authReducer';
import { AppDispatch } from './SRC/store/store';
import { RootState } from './SRC/store/rootReducer';
import store from './SRC/store/store';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

const APP_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: APP_FONT_FAMILY }];

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [TextInput.defaultProps.style, { fontFamily: APP_FONT_FAMILY }];

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="AuthScreen"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <AuthStack.Screen name="AuthScreen" component={LaunchPage} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <MainStack.Screen name="RoomListing" component={RoomListingScreen} />
      <MainStack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <MainStack.Screen name="Booking" component={BookingScreen} />
      <MainStack.Screen name="Account" component={AccountHomeScreen} />
      <MainStack.Screen name="Feedback" component={FeedbackScreen} />
      <MainStack.Screen name="Chat" component={ChatScreen} />
    </MainStack.Navigator>
  );
}

function AppNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch<AppDispatch>();
  const { initialized, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(initAuthRequest());
  }, [dispatch]);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        {!initialized ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111111" />
            <Text style={styles.loadingText}>Loading StayGrid...</Text>
          </View>
        ) : (
          <RootStack.Navigator
            key={isAuthenticated ? 'main' : 'auth'}
            initialRouteName={isAuthenticated ? 'MainStack' : 'AuthStack'}
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}
          >
            <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
            <RootStack.Screen name="MainStack" component={MainStackNavigator} />
          </RootStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
