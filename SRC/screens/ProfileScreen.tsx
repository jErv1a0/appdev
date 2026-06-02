import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  Linking, 
  PermissionsAndroid, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import AccountBottomNav from '../components/AccountBottomNav';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import { logoutRequest } from '../store/auth/authReducer';
import client from '../api/client';
import { fetchBookingsApi, Booking } from '../api/bookingsApi';

const PADDING = 24;
const PROFILE_PHOTO_STORAGE_KEY = '@staygrid/profilePhoto';
const PROFILE_DETAILS_STORAGE_KEY = '@staygrid/profileDetails';
const EDIT_ICON = require('../../photos/edit.png');

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [syncingLocation, setSyncingLocation] = useState(false);
  const [clockTime, setClockTime] = useState<string>(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const routeProfile = route.params?.updatedProfile ?? route.params?.profile ?? null;
  const hasSavedLocation = Boolean(routeProfile?.location || routeProfile?.address);

  const getBookingTotalPrice = (booking: Booking): number => {
    const total = Number(booking.totalPrice);
    if (!isNaN(total) && total > 0) { return total; }
    const calc = Number(booking.nights || 0) * Number(booking.nightlyRate || 0);
    if (!isNaN(calc) && calc > 0) { return calc; }
    return 0;
  };

  const totalSpent = bookings.reduce((sum, booking) => sum + getBookingTotalPrice(booking), 0).toLocaleString();
  const bookingCount = bookings.length;
  const totalNights = bookings.reduce((sum, booking) => sum + Number(booking.nights || 0), 0);

  const getBookingStatusStyle = (status: string | undefined) => {
    const state = String(status || 'pending').toLowerCase();
    if (state.includes('confirm')) { return localStyles.statusConfirmed; }
    if (state.includes('pending')) { return localStyles.statusPending; }
    if (state.includes('cancel') || state.includes('reject')) { return localStyles.statusRejected; }
    return localStyles.statusActive;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isEditable = (checkIn: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(checkIn);
    return startDate > today;
  };

  const handleCancelBooking = (id: number | string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this stay?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes, Cancel', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await client.cancelBooking(Number(id));
            setBookings(prev => prev.filter(b => b.id !== id));
            Alert.alert('Success', 'Booking cancelled.');
          } catch (err) {
            Alert.alert('Error', 'Failed to cancel booking.');
          }
        }
      }
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // When the user logs out, reset the root navigator back to the auth flow
      const rootNavigation = navigation.getParent?.();
      if (rootNavigation?.reset) {
        rootNavigation.reset({
          index: 0,
          routes: [{ name: 'AuthStack' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LaunchPage' }],
        });
      }
    }
  }, [isAuthenticated, navigation]);

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Settings Error', 'Unable to open app settings.');
    });
  };

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const cachedProfileText = await AsyncStorage.getItem(PROFILE_DETAILS_STORAGE_KEY).catch(() => null);
        const cachedProfile = cachedProfileText ? JSON.parse(cachedProfileText) : null;
        const [profileRes, bookingRes] = await Promise.all([
          client.getProfile().catch(() => ({})),
          fetchBookingsApi().catch(() => []),
        ]);

        if (!mounted) { return; }

        const resolvedProfile = {
          ...(profileRes?.user ?? profileRes ?? user ?? {}),
          ...(cachedProfile || {}),
          ...(routeProfile || {}),
        };

        if (resolvedProfile) {
          setFullName(resolvedProfile.fullName || resolvedProfile.name || user?.fullName || 'Guest User');
          setEmail(resolvedProfile.email || user?.email || '');
          setPhone(resolvedProfile.phone || resolvedProfile.phoneNumber || '');
          setLocation(resolvedProfile.location || resolvedProfile.address || 'Dumaguete City, Central Visayas');

          const storedPhoto = await AsyncStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
          setPhotoUri(storedPhoto || resolvedProfile.photoUrl || resolvedProfile.avatarUrl || resolvedProfile.profilePhoto || null);

          const firstName = String(resolvedProfile.fullName || resolvedProfile.name || 'Guest').split(' ')[0];
          setBio(resolvedProfile.bio || `Hi, my name is ${firstName}. Welcome to my profile.`);
        }

        setBookings(Array.isArray(bookingRes) ? bookingRes : []);
      } catch (err: any) {
        if (mounted) { setError(err?.message || 'Failed to load profile'); }
      } finally {
        if (mounted) { setLoading(false); }
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, [user, routeProfile]);

  useEffect(() => {
    let mounted = true;
    async function loadDeviceLocation() {
      if (hasSavedLocation && location !== 'Permission required') { return; }
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: 'Location Permission',
            message: 'StayGrid needs location access to auto-fill your profile coordinates.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          });

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            if (mounted) {
              setLocation('Permission required');
              Alert.alert('Permission Required', 'Allow location access in Settings.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: openAppSettings },
              ]);
            }
            return;
          }
        }

        const geolocation = Geolocation || (globalThis as any)?.navigator?.geolocation;
        if (!geolocation) {
          if (mounted) { setLocation('Location unavailable'); }
          return;
        }

        geolocation.getCurrentPosition(
          (position: { coords: { latitude: number; longitude: number } }) => {
            if (!mounted) { return; }
            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          },
          () => { if (mounted) { setLocation('Location unavailable'); } },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch {
        if (mounted) { setLocation('Location unavailable'); }
      }
    }

    loadDeviceLocation();
    return () => { mounted = false; };
  }, [hasSavedLocation]);

  const manualFetchLocation = async () => {
    setSyncingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Please allow location access in settings.');
          setSyncingLocation(false);
          return;
        }
      }

      const geolocation = Geolocation || (globalThis as any)?.navigator?.geolocation;
      if (!geolocation) {
        Alert.alert('Error', 'Geolocation is not supported on this device.');
        setSyncingLocation(false);
        return;
      }

      geolocation.getCurrentPosition(
        (position: { coords: { latitude: number; longitude: number } }) => {
          const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setLocation(coords);
          setSyncingLocation(false);
          Alert.alert('Location Updated', `Coordinates synchronized: ${coords}`);
        },
        () => {
          setSyncingLocation(false);
          Alert.alert('Error', 'Unable to fetch current location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch {
      setSyncingLocation(false);
    }
  };

  const initialLetter = String(fullName || 'U').slice(0, 1).toUpperCase();

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Technical Grid Overlay behind the unified layout wrapper */}
      <View style={localStyles.gridOverlayLineVertical} />

      <View style={localStyles.layoutWrapper}>
        <ScrollView contentContainerStyle={localStyles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* EDITORIAL GREETING SECTION */}
          <View style={localStyles.headerSection}>
            <View style={localStyles.headerTextContainer}>
              <Text style={localStyles.protocolLabel}>IDENTITY</Text>
              <Text style={localStyles.title}>PROFILE</Text>
              <Text style={localStyles.subtitle}>Verification and metric analysis parameters.</Text>
            </View>
            <TouchableOpacity style={localStyles.logoutButton} onPress={() => dispatch(logoutRequest())} activeOpacity={0.8}>
              <Text style={localStyles.logoutButtonText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={localStyles.centerBlock}>
              <ActivityIndicator size="small" color="#1A1A1A" />
              <Text style={localStyles.statusText}>Fetching account parameters...</Text>
            </View>
          ) : error ? (
            <View style={localStyles.errorContainer}>
              <Text style={localStyles.errorTitle}>Synchronization Fault</Text>
              <Text style={localStyles.statusText}>{error}</Text>
            </View>
          ) : (
            <>
              {/* Main Profile Info Card */}
              <View style={localStyles.card}>
                <View style={localStyles.avatarContainer}>
                  <View style={localStyles.avatarWrapper}>
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={localStyles.avatarImage} />
                    ) : (
                      <Text style={localStyles.avatarText}>{initialLetter}</Text>
                    )}
                    <TouchableOpacity
                      style={localStyles.photoEditBadge}
                      onPress={() => navigation.navigate('ProfileEdit', { profile: { fullName, email, phone, bio, location, photoUrl: photoUri } })}
                      activeOpacity={0.9}
                    >
                      <Image source={EDIT_ICON} style={localStyles.photoEditIcon} resizeMode="contain" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={localStyles.formFields}>
                  <View style={localStyles.inputGroup}>
                    <Text style={localStyles.fieldLabel}>Full Name</Text>
                    <TextInput style={localStyles.textInput} value={fullName} editable={false} />
                  </View>

                  <View style={localStyles.inputGroup}>
                    <Text style={localStyles.fieldLabel}>Email Address</Text>
                    <TextInput style={localStyles.textInput} value={email} editable={false} autoCapitalize="none" />
                  </View>

                  <View style={localStyles.inputGroup}>
                    <Text style={localStyles.fieldLabel}>Phone Number</Text>
                    <TextInput style={localStyles.textInput} value={phone || 'Not verified'} editable={false} />
                  </View>

                  <View style={localStyles.inputGroup}>
                    <Text style={localStyles.fieldLabel}>Bio</Text>
                    <TextInput style={[localStyles.textInput, localStyles.multilineInput]} value={bio} editable={false} multiline numberOfLines={2} textAlignVertical="top" />
                  </View>

                  <View style={localStyles.inputGroup}>
                    <View style={localStyles.fieldHeaderRow}>
                      <Text style={localStyles.fieldLabel}>Current Coordinates</Text>
                      <TouchableOpacity onPress={manualFetchLocation} disabled={syncingLocation}>
                        {syncingLocation ? (
                          <ActivityIndicator size="small" color="#FFD700" />
                        ) : (
                          <Text style={localStyles.syncLink}>SYNC GPS</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <TextInput style={[localStyles.textInput, localStyles.disabledInput]} value={location} editable={false} />
                  </View>
                </View>
              </View>

              {/* Consolidated Analytics Grid */}
              <View style={localStyles.card}>
                <View style={localStyles.analyticsHeader}>
                  <Text style={localStyles.cardTitle}>Core Metrics</Text>
                  <Text style={localStyles.clockText}>{clockTime}</Text>
                </View>

                <View style={localStyles.metricsGrid}>
                  <View style={localStyles.metricBox}>
                    <Text style={localStyles.metricLabel}>COUNT</Text>
                    <Text style={localStyles.metricValue}>{bookingCount}</Text>
                  </View>
                  <View style={localStyles.metricBox}>
                    <Text style={localStyles.metricLabel}>NIGHTS</Text>
                    <Text style={localStyles.metricValue}>{totalNights}</Text>
                  </View>
                  <View style={[localStyles.metricBox, localStyles.revenueMetricBox]}>
                    <Text style={localStyles.revenueLabelText}>TOTAL SPENT</Text>
                    <Text style={localStyles.revenueValueText}>₱{totalSpent}</Text>
                  </View>
                </View>
              </View>

              {/* Ledger Records Title Block */}
              <View style={localStyles.sectionHeader}>
                <Text style={localStyles.sectionTitle}>Transaction Ledger</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Booking')} activeOpacity={0.7}>
                  <Text style={localStyles.sectionLink}>Explore All</Text>
                </TouchableOpacity>
              </View>

              {/* Bookings Stack */}
              {bookings.length === 0 ? (
                <View style={localStyles.emptyContainer}>
                  <Text style={localStyles.emptyTitle}>No accommodations live</Text>
                  <Text style={localStyles.emptyText}>Property configuration sets will render here upon background pipelines.</Text>
                </View>
              ) : (
                <View style={localStyles.ledgerCard}>
                  {bookings.map((booking, index) => (
                    <View key={String(booking.id)} style={[localStyles.bookingItemRow, index === bookings.length - 1 && localStyles.lastBookingRow]}>
                      <View style={localStyles.bookingMainInfo}>
                        <Text style={localStyles.bookingTitleText} numberOfLines={1}>{String(booking.title || booking.room?.place || 'Reservation')}</Text>
                        <Text style={localStyles.bookingMeta}>INTERVAL: {booking.checkIn || 'PENDING'} — {booking.checkOut || 'PENDING'}</Text>
                        {booking.nights ? (
                          <Text style={localStyles.bookingMeta}>{booking.nights} nights @ ₱{booking.nightlyRate || 0}</Text>
                        ) : null}
                        
                        {isEditable(booking.checkIn) && (
                          <View style={localStyles.actionLinkRow}>
                            <TouchableOpacity 
                              onPress={() => navigation.navigate('RoomDetail', { booking, listing: booking.room })}
                              activeOpacity={0.7}
                            >
                              <Text style={localStyles.editLink}>EDIT DATES</Text>
                            </TouchableOpacity>
                            <Text style={localStyles.linkSeparator}>|</Text>
                            <TouchableOpacity 
                              onPress={() => handleCancelBooking(booking.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={localStyles.cancelLink}>CANCEL</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <View style={localStyles.bookingPriceColumn}>
                        <Text style={localStyles.bookingPriceValue}>₱{getBookingTotalPrice(booking)}</Text>
                        <View style={[localStyles.statusBadge, getBookingStatusStyle(booking.status)]}>
                          <Text style={localStyles.statusBadgeText}>{(booking.status || 'PENDING').toUpperCase()}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
      <AccountBottomNav currentRoute="Profile" navigate={routeName => navigation.navigate(routeName)} />
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
    paddingBottom: 130,
    gap: 24, // Consistent design component vertical stack separation
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTextContainer: {
    flex: 1,
    gap: 2,
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
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  logoutButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  centerBlock: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Converted to matching container style parameters
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  revenueMetricBox: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  metricLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  revenueLabelText: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  revenueValueText: {
    color: '#FFD700', // Signature active contrast accent
    fontSize: 18,
    fontWeight: '900',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  photoEditIcon: {
    width: 12,
    height: 12,
    tintColor: '#1A1A1A',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  formFields: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  editLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
  },
  cancelLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  linkSeparator: {
    fontSize: 10,
    color: '#EEEEEE',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#666666',
  },
  multilineInput: {
    minHeight: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionLink: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    color: '#8E8E93',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  lastBookingRow: {
    borderBottomWidth: 0,
  },
  bookingMainInfo: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  bookingTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bookingMeta: {
    fontSize: 12,
    color: '#666666',
  },
  bookingPriceColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bookingPriceValue: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusPending: { backgroundColor: '#D97706' },
  statusConfirmed: { backgroundColor: '#059669' },
  statusRejected: { backgroundColor: '#DC2626' },
  statusActive: { backgroundColor: '#1A1A1A' },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE3E3',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  errorTitle: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: '600',
  },
});