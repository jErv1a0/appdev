import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../theme';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import {
  clearAuthNotices,
  googleLoginRequest,
  registerRequest,
} from '../store/auth/authReducer';
import ENV from '../config/env';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { loading, error, registrationSuccess } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!error) {
      return;
    }

    Alert.alert('Signup Failed', error);
    dispatch(clearAuthNotices());
  }, [dispatch, error]);

  useEffect(() => {
    if (!registrationSuccess) {
      return;
    }

    Alert.alert('Signup successful', 'You can now log in');
    dispatch(clearAuthNotices());
    navigation.goBack();
  }, [dispatch, navigation, registrationSuccess]);

  const onSignup = () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(registerRequest(email, password, fullName));
  };

  const googleEnabled = Boolean(ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_ID.length > 0);

  const onGooglePress = () => {
    if (!googleEnabled) {
      Alert.alert('Google Sign-In not configured', 'This build does not have a Google client ID configured.');
      return;
    }

    dispatch(googleLoginRequest());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* App Logo Top Bar */}
        <View style={styles.topBar}>
          <Image
            source={require('../../photos/Textmark-yellow.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Protocol Visual Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.protocolTag}>AUTHENTICATION PROTOCOL</Text>
          <Text style={styles.heroTitle}>Sign up with Staygrid</Text>
          <Text style={styles.heroSubtitle}>
            Access your booking dashboard, saved stays, and instant room availability from one secure entry point.
          </Text>
        </View>

        {/* Main Application Interaction Card */}
        <View style={styles.appCard}>
          <Text style={styles.welcomeLabel}>WELCOME TO THE GRID</Text>
          <Text style={styles.appTitle}>Initialize Session</Text>

          {/* Form Fields Section */}
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor="#888888"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#888888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#888888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledState]}
            onPress={onSignup}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'INITIALIZING...' : 'SIGN IN'}
            </Text>
          </TouchableOpacity>

          {/* Protocol Splitter Line */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-In */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              loading && styles.disabledState,
              !googleEnabled && styles.googleDisabledState
            ]}
            onPress={onGooglePress}
            disabled={loading || !googleEnabled}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>CONTINUE WITH GOOGLE</Text>
          </TouchableOpacity>

          {!googleEnabled && (
            <Text style={styles.configurationWarning}>
              Google Client Configuration Missing
            </Text>
          )}

          {/* Tightly Bound Footer Link */}
          <TouchableOpacity
            style={styles.navigationLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationLinkText}>
              Already have an account? <Text style={styles.navigationLinkHighlight}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
  },
  topBar: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  logo: {
    width: 110,
    height: 30,
  },
  heroCard: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  protocolTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 24,
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 1,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  formContainer: {
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  disabledState: {
    opacity: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 11,
    color: '#888888',
    paddingHorizontal: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  googleDisabledState: {
    backgroundColor: '#F4F4F4',
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  configurationWarning: {
    marginTop: 10,
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
  },
  navigationLink: {
    marginTop: 20, // Snaps up neatly right beneath the social button
    alignItems: 'center',
    paddingVertical: 8,
  },
  navigationLinkText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  navigationLinkHighlight: {
    color: COLORS.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
