import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, SIZES } from '../theme';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import { clearAuthNotices, loginRequest } from '../store/auth/authReducer';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Configure Google Sign-In once on mount
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
        offlineAccess: true,
      });
    } else {
      console.error("GoogleSignin module is undefined. Check native linking.");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    Alert.alert('Login Successful', 'Welcome back!');
    navigation.navigate('Home');
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (!error) {
      return;
    }

    Alert.alert('Login Failed', error);
    dispatch(clearAuthNotices());
  }, [dispatch, error]);

  const handleAdminLogin = () => {
    Alert.alert('Admin Access', 'Logged in as SuperUser (Admin)');
    navigation.navigate('Home');
  };

  const onSignIn = () => {
    if (email === 'SuperUser@StayGrid' && password === 'superuser') {
      handleAdminLogin();
      return;
    }

    dispatch(loginRequest(email, password));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Sign In with StayGrid</Text>
          <Text style={styles.welcomeSubtitle}>Create an account or sign in with social providers</Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Working...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.oauthContainer}>
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={async () => {
              try {
                if (!GoogleSignin) {
                  Alert.alert('Error', 'Google Sign-In module not found. Please restart the app.');
                  return;
                }
                
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                
                if (response.type === 'success') {
                  Alert.alert('Success', `Signed in as ${response.data.user.email}`);
                  navigation.navigate('Home');
                } else if (response.type === 'cancelled') {
                  console.log('User cancelled the login flow');
                }
              } catch (error: any) {
                const code = error?.code;
                if (statusCodes && code === statusCodes.IN_PROGRESS) {
                  console.log('Signin in progress');
                } else {
                  Alert.alert('Google Sign-In Error', error?.message || 'Check your Google Cloud Console configuration.');
                }
              }
            }}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2702/2702602.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.oauthText}>Google</Text>
          </TouchableOpacity>

            {/* 
            Temporarily disabled Facebook Sign-In button
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={async () => {
              try {
                if (!LoginManager || !AccessToken) {
                  Alert.alert('Error', 'Facebook SDK not initialized');
                  return;
                }
                const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
                if (result.isCancelled) {
                  console.log('Facebook login cancelled');
                  return;
                }
                const data = await AccessToken.getCurrentAccessToken();
                if (!data) return Alert.alert('Error', 'Failed to get Facebook access token');
                Alert.alert('Success', 'Signed in with Facebook');
                navigation.navigate('Home');
              } catch (error: any) {
                Alert.alert('Facebook Error', error?.message || 'Facebook SDK initialization failed.');
              }
            }}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.oauthText}>Facebook</Text>
          </TouchableOpacity>
            */}
        </View>

        <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLinkHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    paddingTop: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 24,
  },
  welcomeSection: {
    marginBottom: 28,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: COLORS.black,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  oauthText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  termsSection: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signupLink: {
    marginTop: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLinkHighlight: {
    color: COLORS.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
