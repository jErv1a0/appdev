import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import styles from '../styles';
import { COLORS } from '../theme';
import ListingCard from '../components/ListingCard';
import AccountBottomNav from '../components/AccountBottomNav';
import client from '../api/client';
import { fetchListingsApi } from '../api/listingsApi';
import { fetchBookingsApi, Booking } from '../api/bookingsApi';
import { useNavigation } from '@react-navigation/native';
import { normalizeListing, Listing } from '../api/listingsApi';
import { RootState } from '../store/rootReducer';

export default function AccountHomeScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rooms, setRooms] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [profileRes, roomsRes, listingsRes, bookingsRes] = await Promise.all([
          client.getProfile().catch(() => ({})),
          fetchListingsApi().catch(() => []),
          client.getRoomListings().catch(() => []),
          fetchBookingsApi().catch(() => []),
        ]);

        if (!mounted) { return; }

        setProfile(profileRes?.user ?? profileRes ?? null);
        setRooms((Array.isArray(roomsRes) ? roomsRes : []).map((r, i) => normalizeListing(r, i)));

        const rawListings = Array.isArray(listingsRes) ? listingsRes : listingsRes?.data ?? [];
        setListings(rawListings.map((l: any, i: number) => normalizeListing(l, i + 100)));

        setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      } catch (err: any) {
        if (!mounted) { return; }
        setError(err?.message || 'Failed to load account data');
      } finally {
        if (mounted) { setLoading(false); }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const displayName = profile?.fullName || profile?.name || profile?.email || 'Guest User';
  const displayEmail = profile?.email || 'alvrcoqviermv05@gmail.com'; // Fallback matching web mockup data node
  const totalSpent = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

  return (
    <View style={[styles.container, localStyles.mainContainer]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top System Status Bar Indicator Row */}
      <View style={localStyles.systemStatusHeader}>
        <View style={localStyles.statusIndicatorRow}>
          <View style={localStyles.greenStatusDot} />
          <Text style={localStyles.statusHeaderText}>System State: Optimal</Text>
        </View>
        <Text style={localStyles.statusHeaderText}>NODE 2.6 // GRID STABLE</Text>
      </View>

      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>

        {/* Premium Banner Box (Replicating Web Client Layout) */}
        <View style={localStyles.premiumHeroBanner}>
          <Text style={localStyles.clientDashboardLabel}>Client Dashboard</Text>
          <Text style={localStyles.welcomeHeading}>WELCOME BACK,</Text>
          <Text style={localStyles.readyToStayHeading}>USER: {displayName.toUpperCase()}</Text>
          <Text style={localStyles.userEmailSubline}>{displayEmail.toLowerCase()}</Text>

          <View style={localStyles.heroActionRow}>
            <TouchableOpacity
              style={localStyles.heroButtonDark}
              onPress={() => navigation.navigate('RoomsGallery')}
            >
            <Text style={localStyles.heroButtonDarkText}>Browse Rooms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.heroButtonOutline}>
              <Text style={localStyles.heroButtonOutlineText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobilized Metric Grid Cards Row */}
        <View style={localStyles.statsContainer}>
          <View style={localStyles.statItemCard}>
            <Text style={localStyles.statCardLabel}>TOTAL BOOKINGS</Text>
            <Text style={localStyles.statCardValue}>{bookings.length}</Text>
          </View>

          <View style={localStyles.statItemCard}>
            <Text style={localStyles.statCardLabel}>TOTAL SPENT</Text>
            <Text style={localStyles.statCardValue}>₱{totalSpent}</Text>
          </View>

          <View style={localStyles.statItemCard}>
            <Text style={localStyles.statCardLabel}>CURRENT CITY</Text>
            <Text style={localStyles.statCardValueText}>NOT SET</Text>
          </View>
        </View>

        {loading ? (
          <View style={localStyles.centerSpacer}>
            <ActivityIndicator size="small" color="#111418" />
            <Text style={localStyles.syncingText}>Syncing room grid parameters...</Text>
          </View>
        ) : error ? (
          <View style={localStyles.errorSheetContainer}>
            <Text style={localStyles.errorSheetTitle}>Terminal Sync Fault</Text>
            <Text style={localStyles.errorSheetText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Rooms Section */}
            <View style={localStyles.sectionContainer}>
              <View style={localStyles.sectionHeaderLayout}>
                <Text style={localStyles.sectionMainTitle}>YOUR ROOMS</Text>
                <View style={localStyles.countBadge}>
                  <Text style={localStyles.countBadgeText}>{rooms.length}</Text>
                </View>
              </View>
              {rooms.length === 0 ? (
                <View style={localStyles.emptyStateContainer}>
                  <Text style={localStyles.emptyTextText}>No registered rooms located within your secure profile grid Node.</Text>
                </View>
              ) : (
                <View style={localStyles.cardListGap}>
                  {rooms.map((r: Listing) => (
                    <ListingCard
                      key={String(r.id)}
                      place={r.place}
                      location={r.location}
                      price={r.price}
                      imageUrl={r.imageUrl}
                      availability={r.availability}
                      bookingDays={r.bookingDays}
                      onBook={() => navigation.navigate('RoomDetail', { listing: r })}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Marketplace Listings Section */}
            <View style={localStyles.sectionContainer}>
              <View style={localStyles.sectionHeaderLayout}>
                <Text style={localStyles.sectionMainTitle}>ACTIVE MARKETPLACE</Text>
                <View style={localStyles.countBadge}>
                  <Text style={localStyles.countBadgeText}>{listings.length}</Text>
                </View>
              </View>
              {listings.length === 0 ? (
                <View style={localStyles.emptyStateContainer}>
                  <Text style={localStyles.emptyTextText}>No available marketplace listings streaming live.</Text>
                </View>
              ) : (
                <View style={localStyles.cardListGap}>
                  {listings.map((l: Listing) => (
                    <ListingCard
                      key={String(l.id)}
                      place={l.place}
                      location={l.location}
                      price={l.price}
                      imageUrl={l.imageUrl}
                      availability={l.availability}
                      bookingDays={l.bookingDays}
                      onBook={() => navigation.navigate('RoomDetail', { listing: l })}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Booking Records History Segment */}
            <View style={localStyles.sectionContainer}>
              <View style={localStyles.sectionHeaderLayout}>
                <Text style={localStyles.sectionMainTitle}>RESERVATION HISTORIC TRACKING</Text>
              </View>
              {bookings.length === 0 ? (
                <View style={localStyles.emptyStateContainer}>
                  <Text style={localStyles.emptyTextText}>No prior architecture booking historical nodes available.</Text>
                </View>
              ) : (
                <View style={localStyles.bookingTimelineCard}>
                  {bookings.map((b: any, i: number) => (
                    <View
                      key={String(b.id ?? i)}
                      style={[
                        localStyles.bookingItemRow,
                        i === bookings.length - 1 && localStyles.bookingItemRowLast,
                      ]}
                    >
                      <View style={localStyles.bookingTextGroup}>
                        <Text style={localStyles.bookingRowTitle}>{b?.title ?? b?.room_name ?? 'Reservation Node'}</Text>
                        <Text style={localStyles.bookingRowMeta}>HASH KEY: ID-{b?.id ?? i}</Text>
                      </View>
                      <View style={localStyles.statusCapsuleBadge}>
                        <Text style={localStyles.statusCapsuleText}>
                          {(b?.status ?? b?.state ?? 'ACTIVE').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <AccountBottomNav currentRoute="Home" navigate={route => navigation.navigate(route)} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FFFFFF',
  },
  systemStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: COLORS.gray,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusHeaderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 120,
    gap: 24,
  },
  /* Premium Glowing Web Design Box Adapted for Mobile Scaling */
  premiumHeroBanner: {
    backgroundColor: COLORS.white,
    borderRadius: 12, // Bounding rule mobilization
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E6E5E0',
    position: 'relative',
    overflow: 'hidden',
  },
  clientDashboardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#718096',
    letterSpacing: 1,
    marginBottom: 16,
  },
  welcomeHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  readyToStayHeading: {
    fontSize: 28,
    fontWeight: '400',
    color: '#718096',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
  },
  userNameText: {
    marginTop: 12,
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  userEmailSubline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroButtonDark: {
    backgroundColor: COLORS.black,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonDarkText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroButtonOutline: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonOutlineText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  /* Unified Desktop Metric Dashboard Matrix Row Adaptation */
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statItemCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12, // Bounding corner customization rule
    padding: 14,
    minHeight: 85,
    justifyContent: 'space-between',
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A0AEC0',
    letterSpacing: 0.5,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
  },
  statCardValueText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -0.2,
  },
  /* Section Subtitle Formats */
  sectionContainer: {
    gap: 14,
  },
  sectionHeaderLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionMainTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111418',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4A5568',
  },
  cardListGap: {
    gap: 14,
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  /* Dynamic Reservation Timeline Card Panel Component */
  bookingTimelineCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12, // Mobilization asset rule
    overflow: 'hidden',
  },
  bookingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
  },
  bookingItemRowLast: {
    borderBottomWidth: 0,
  },
  bookingTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  bookingRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111418',
  },
  bookingRowMeta: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statusCapsuleBadge: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6, // Smooth mobilized status box limits
  },
  statusCapsuleText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  /* Processing State Blocks */
  centerSpacer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  syncingText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  errorSheetContainer: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  errorSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  errorSheetText: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
    lineHeight: 18,
  },
});
