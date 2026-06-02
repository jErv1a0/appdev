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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../theme';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import {
  clearAuthNotices,
  googleLoginRequest,
  loginRequest,
} from '../store/auth/authReducer';
import ENV from '../config/env';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSessionActive, setKeepSessionActive] = useState(false);
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Login Failed', error);
    dispatch(clearAuthNotices());
  }, [dispatch, error]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(clearAuthNotices());

    // Reset the root navigator to the main app stack after successful login
    const rootNavigation = navigation.getParent?.();
    if (rootNavigation?.reset) {
      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'MainStack' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [dispatch, isAuthenticated, navigation]);

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    dispatch(loginRequest(email, password));
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
      <StatusBar barStyle="light-content" backgroundColor="#0B0D10" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* TOP PANEL: Cyber-Grid Infrastructure Hero */}
        <View style={styles.cyberHeroCard}>
          {/* Decorative Web App Background Grid Overlay */}
          <View style={styles.gridLineVertical1} />
          <View style={styles.gridLineVertical2} />
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.yellowAmbientGlow} />


          {/* Subtle Branded Textmark */}
          {/* <Image
            source={require('../../photos/Textmark-yellow.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          /> */}

          <View style={styles.heroTextGroup}>
            <Text style={styles.protocolTag}>AUTHENTICATION PROTOCOL</Text>
            <Text style={styles.heroTitle}>Sign In to{'\n'}StayGrid</Text>
            <Text style={styles.heroSubtitle}>
              Access your booking dashboard, saved stays, and instant room availability from one secure entry point.
            </Text>
          </View>

          {/* Architectural Blueprint Status Grid Rows */}
          <View style={styles.metadataGridRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>SECURITY</Text>
              <Text style={styles.metaValue}>Verified</Text>
            </View>
            <View style={styles.metaColumnDivider} />
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>ACCESS</Text>
              <Text style={styles.metaValue}>Instant</Text>
            </View>
            <View style={styles.metaColumnDivider} />
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>SUPPORT</Text>
              <Text style={styles.metaValue}>24/7</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM PANEL: Mobilized Interaction Form Sheet */}
        <View style={styles.interactionCard}>
          <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
          <Text style={styles.appTitle}>Initialize Session</Text>

          {/* Form Processing Fields */}
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="name@domain.com"
                placeholderTextColor="#A0A0A0"
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
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Keep Session Active Custom Row */}
            <TouchableOpacity
              style={styles.sessionToggleRow}
              onPress={() => setKeepSessionActive(!keepSessionActive)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkboxSquare, keepSessionActive && styles.checkboxSquareActive]}>
                {keepSessionActive && <View style={styles.checkboxIndicatorMini} />}
              </View>
              <View style={styles.sessionToggleTextContainer}>
                <Text style={styles.sessionToggleTitle}>Keep Session Active</Text>
                <Text style={styles.sessionToggleSubtitle}>Stay signed in on this device.</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Core Submit Native Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledState]}
            onPress={onLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'INITIALIZING...' : 'SIGN IN'}
            </Text>
          </TouchableOpacity>

          {/* Visual Divider Segment */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Federated Google Identity Action Button */}
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
            <View style={styles.googleBtnContentRow}>
              {/* Clean Vector Vector Minimalist Asset Placeholder simulation */}
              <Text style={styles.googleIconAlpha}>G </Text>
              <Text style={styles.secondaryButtonText}>CONTINUE WITH GOOGLE</Text>
            </View>
          </TouchableOpacity>

          {/* Missing Configuration Notice Fallback */}
          {!googleEnabled && (
            <Text style={styles.configurationWarning}>
              Platform Google Client Config Node Missing
            </Text>
          )}

          {/* Tightly Nested Structural Navigation Link */}
          <TouchableOpacity
            style={styles.navigationLink}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationLinkText}>
              New to the grid? <Text style={styles.navigationLinkHighlight}>Create Account</Text>
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
    backgroundColor: '#0B0D10', // Industrial backing hue tone
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  /* Cyber Grid Hero Block Styling */
  cyberHeroCard: {
    backgroundColor: '#111418',
    borderRadius: 12, // Explicit container Mobilization rounding rule
    borderWidth: 1.5,
    borderColor: '#1F242B',
    padding: 24,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  /* Matrix Line Simulator Overlays */
  gridLineVertical1: {
    position: 'absolute',
    left: '25%', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '75%', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '70%', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  yellowAmbientGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFD700',
    opacity: 0.12,
    blurRadius: 40, // Visual ambient flare reference mapping
  },
  brandLogo: {
    width: 90,
    height: 24,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  heroTextGroup: {
    marginBottom: 36,
  },
  protocolTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 38,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#8A94A0',
    lineHeight: 19,
  },
  metadataGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#1F242B',
    paddingTop: 16,
  },
  metaColumn: {
    flex: 1,
  },
  metaColumnDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1F242B',
    marginHorizontal: 8,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64707D',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  /* Mobilized Form Card Styling */
  interactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12, // Explicit container Mobilization rounding rule
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 24,
  },
  welcomeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 1,
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  formContainer: {
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // Rounded internal parameters
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  sessionToggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
    backgroundColor: '#F8FAFC',
  },
  checkboxSquare: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  checkboxIndicatorMini: {
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  sessionToggleTextContainer: {
    flex: 1,
  },
  sessionToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
  },
  sessionToggleSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 8, // Explicit button Mobilization rounding rule
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  disabledState: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    color: '#94A3B8',
    paddingHorizontal: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8, // Explicit button Mobilization rounding rule
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  googleDisabledState: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  googleBtnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconAlpha: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA4335', // Dynamic identification signature accent color
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  configurationWarning: {
    marginTop: 10,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  navigationLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navigationLinkText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  navigationLinkHighlight: {
    color: '#0F172A',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
