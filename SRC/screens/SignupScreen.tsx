import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import {
  clearAuthNotices,
  registerRequest,
} from '../store/auth/authReducer';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { loading, error, registrationSuccess } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
        offlineAccess: true,
      });
    }
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

      <Text style={styles.body}>Create an account or sign in with social providers.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Working...' : 'Create account'}</Text>
      </TouchableOpacity>

      <View style={styles.oauthContainer}>
        <TouchableOpacity
          style={[styles.oauthButton, styles.oauthButtonGoogle]}
          onPress={async () => {
            try {
              if (!GoogleSignin) {
                Alert.alert('Error', 'Google Sign-In is unavailable');
                return;
              }

              await GoogleSignin.hasPlayServices();
              const response = await GoogleSignin.signIn();

              if (response.type === 'success') {
                Alert.alert('Google signed in', JSON.stringify(response.data.user.email));
              } else if (response.type === 'cancelled') {
                console.log('User cancelled');
              }
            } catch (error: any) {
              const code = error?.code;
              if (statusCodes && code === statusCodes.IN_PROGRESS) {
                console.log('In Progress');
              } else {
                Alert.alert('Google Sign-In Error', error?.message || String(error));
              }
            }
          }}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2702/2702602.png' }}
            style={styles.socialIcon}
          />
          <Text style={[styles.oauthText, styles.oauthTextGoogle]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthButton, styles.oauthButtonFacebook]}
          onPress={async () => {
            try {
              if (!LoginManager || !AccessToken) {
                Alert.alert('Error', 'Facebook SDK not available');
                return;
              }
              const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
              if (result.isCancelled) {
                return Alert.alert('Facebook login cancelled');
              }
              const data = await AccessToken.getCurrentAccessToken();
              if (!data) return Alert.alert('Facebook login failed');
              Alert.alert('Facebook signed in', 'Success');
            } catch (error: any) {
              Alert.alert('Facebook Error', error?.message || 'Check Facebook App ID.');
            }
          }}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
            style={styles.socialIcon}
          />
          <Text style={[styles.oauthText, styles.oauthTextFacebook]}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={{fontWeight: '800'}}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffef0a',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  oauthContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  oauthButtonGoogle: {
    backgroundColor: '#ffffff',
    borderColor: '#ffef0a',
    borderWidth: 1,
  },
  oauthButtonFacebook: {
    backgroundColor: '#ffffff',
    borderColor: '#ffef0a',
    borderWidth: 1,
  },
  oauthText: {
    color: '#fff',
    fontWeight: '600',
  },
  oauthTextGoogle: {
    color: '#000000',
  },
  oauthTextFacebook: {
    color: '#000000',
  },
  link: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#000000',
    fontWeight: '600',
  },
});
