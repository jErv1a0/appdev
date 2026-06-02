import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import client from '../api/client';

const PADDING = 24;
const PROFILE_CACHE_KEY = '@staygrid/profileDetails';
const PROFILE_PHOTO_STORAGE_KEY = '@staygrid/profilePhoto';

function pickFirstValue(profile: any, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = profile?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return fallback;
}

export default function ProfileEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialProfile = useMemo(() => route.params?.profile ?? {}, [route.params?.profile]);

  const initialDraft = useMemo(
    () => ({
      fullName: pickFirstValue(initialProfile, ['fullName', 'name']),
      email: pickFirstValue(initialProfile, ['email']),
      phone: pickFirstValue(initialProfile, ['phone', 'phoneNumber']),
      location: pickFirstValue(initialProfile, ['location', 'address']),
      bio: pickFirstValue(initialProfile, ['bio']),
      photoUrl: pickFirstValue(initialProfile, ['photoUrl', 'avatarUrl', 'profilePhoto']),
    }),
    [initialProfile],
  );

  const [fullName, setFullName] = useState(initialDraft.fullName);
  const [email, setEmail] = useState(initialDraft.email);
  const [phone, setPhone] = useState(initialDraft.phone);
  const [location, setLocation] = useState(initialDraft.location);
  const [bio, setBio] = useState(initialDraft.bio);
  const [photoUrl, setPhotoUrl] = useState(initialDraft.photoUrl);
  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    setFullName(initialDraft.fullName);
    setEmail(initialDraft.email);
    setPhone(initialDraft.phone);
    setLocation(initialDraft.location);
    setBio(initialDraft.bio);
    setPhotoUrl(initialDraft.photoUrl);
  }, [initialDraft]);

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      const selectedUri = result.assets?.[0]?.uri;
      if (selectedUri) {
        setPhotoUrl(selectedUri);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to select a profile photo.');
    }
  };

  const handleFetchLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location access is required to fetch coordinates.');
        return;
      }
    }

    setFetchingLocation(true);
    const geolocation = Geolocation || (globalThis as any)?.navigator?.geolocation;

    if (!geolocation) {
      setFetchingLocation(false);
      Alert.alert('Error', 'Geolocation is not supported on this device.');
      return;
    }

    geolocation.getCurrentPosition(
      (position: any) => {
        const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        setLocation(coords);
        setFetchingLocation(false);
      },
      (error: any) => {
        setFetchingLocation(false);
        console.log('Location error:', error);
        Alert.alert('Error', 'Unable to retrieve location. Please ensure GPS is enabled.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleReset = () => {
    setFullName(initialDraft.fullName);
    setEmail(initialDraft.email);
    setPhone(initialDraft.phone);
    setLocation(initialDraft.location);
    setBio(initialDraft.bio);
    setPhotoUrl(initialDraft.photoUrl);
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
  };

  const handleSave = async () => {
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      bio: bio.trim(),
      photoUrl: photoUrl.trim(),
      avatarUrl: photoUrl.trim(),
      profilePhoto: photoUrl.trim(),
    };

    if (!payload.fullName) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    setSaving(true);
    let remoteSaveFailed = false;
    try {
      const response = await client.updateProfile(payload).catch(() => { throw new Error('Offline'); });

      const resolvedProfile = response?.user ?? response?.profile ?? response ?? payload;
      
      // Critical fix: sync both keys simultaneously to avoid stale state bugs on profile return
      await Promise.all([
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolvedProfile)),
        AsyncStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, payload.photoUrl)
      ]);
    } catch (_error) {
      remoteSaveFailed = true;
      await Promise.all([
        AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(payload)),
        AsyncStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, payload.photoUrl)
      ]);
    } finally {
      setSaving(false);
    }

    if (remoteSaveFailed) {
      Alert.alert('Saved Locally', 'Your changes were stored offline because the server could not be reached.');
    }

    navigation.navigate('Profile', { updatedProfile: payload });
  };

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Technical Grid Overlay Line */}
      <View style={localStyles.gridOverlayLineVertical} />

      <View style={localStyles.layoutWrapper}>
        <ScrollView 
          contentContainerStyle={localStyles.scrollContent} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          {/* Action Header Block */}
          <View style={localStyles.headerSection}>
            <TouchableOpacity style={localStyles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={localStyles.backLinkLabel}>← BACK</Text>
            </TouchableOpacity>

            <View style={localStyles.headerTextContainer}>
              <Text style={localStyles.protocolLabel}>IDENTITY</Text>
              <Text style={localStyles.title}>Edit Profile</Text>
              <Text style={localStyles.subtitle}>Update secure account parameters and bio metadata.</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={localStyles.formCard}>
            
            {/* Photo Section Layout */}
            <View style={localStyles.photoSection}>
              <View style={localStyles.photoPreviewContainer}>
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={localStyles.photoImage} />
                ) : (
                  <Text style={localStyles.photoInitial}>{fullName.trim().charAt(0).toUpperCase() || 'U'}</Text>
                )}
              </View>
              <View style={localStyles.photoActionsContainer}>
                <TouchableOpacity style={localStyles.photoActionButtonPrimary} onPress={handlePickPhoto} activeOpacity={0.8}>
                  <Text style={localStyles.photoActionTextPrimary}>UPLOAD NEW PHOTO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.photoActionButtonSecondary} onPress={handleClearPhoto} activeOpacity={0.8}>
                  <Text style={localStyles.photoActionTextSecondary}>REMOVE PHOTO</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Groups */}
            <View style={localStyles.inputGroup}>
              <Text style={localStyles.label}>Full Name</Text>
              <TextInput
                style={localStyles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.label}>Email Address</Text>
              <TextInput
                style={localStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.label}>Phone Number</Text>
              <TextInput
                style={localStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            </View>

            <View style={localStyles.inputGroup}>
              <View style={localStyles.labelRow}>
                <Text style={localStyles.label}>Location</Text>
                <TouchableOpacity 
                  onPress={handleFetchLocation} 
                  disabled={fetchingLocation}
                  style={localStyles.gpsButton}
                >
                  {fetchingLocation ? <ActivityIndicator size="small" color="#FFD700" /> : <Text style={localStyles.gpsButtonText}>USE GPS</Text>}
                </TouchableOpacity>
              </View>
              <TextInput
                style={localStyles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.label}>Bio</Text>
              <TextInput
                style={localStyles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Write a brief description about yourself..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Form Utilities */}
            <View style={localStyles.actionRow}>
              <TouchableOpacity style={localStyles.secondaryButton} onPress={handleReset} activeOpacity={0.8}>
                <Text style={localStyles.secondaryButtonText}>RESET FORM</Text>
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.secondaryButtonGhost} onPress={handleClearPhoto} activeOpacity={0.8}>
                <Text style={localStyles.secondaryButtonGhostText}>CLEAR PHOTO</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Save Button */}
            <TouchableOpacity
              style={[localStyles.saveButton, saving && localStyles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.9}
              disabled={saving}
            >
              <Text style={localStyles.saveButtonText}>
                {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gridOverlayLineVertical: {
    position: 'absolute',
    left: PADDING,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 0,
  },
  layoutWrapper: {
    flex: 1,
    paddingHorizontal: PADDING,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 60,
    gap: 24,
  },
  headerSection: {
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backLinkLabel: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  headerTextContainer: {
    gap: 2,
    width: '100%',
  },
  protocolLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  photoPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoInitial: {
    color: '#FFD700',
    fontSize: 26,
    fontWeight: '900',
  },
  photoActionsContainer: {
    flex: 1,
    gap: 8,
  },
  photoActionButtonPrimary: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  photoActionTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  photoActionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  photoActionTextSecondary: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gpsButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  secondaryButtonGhost: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  secondaryButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 12,
  },
  secondaryButtonGhostText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});