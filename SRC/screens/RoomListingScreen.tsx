import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ListingCard from '../components/ListingCard';
import AccountBottomNav from '../components/AccountBottomNav';
import { RootState } from '../store/rootReducer';
import { AppDispatch } from '../store/store';
import { fetchListingsRequest } from '../store/listings/listingsReducer';

const PADDING = 24;

function getImageForRoom(room: any) {
  if (Array.isArray(room.images) && room.images.length > 0 && room.images[0]) {
    return { uri: room.images[0] };
  }
  if (room.imageUrl) {
    return { uri: room.imageUrl };
  }
  return { uri: 'https://via.placeholder.com/400x300.png?text=No+Image' };
}

export default function RoomListingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.listings);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchListingsRequest());
    }
  }, [dispatch, items.length]);

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Technical Grid Overlay aligned perfectly with system padding */}
      <View style={localStyles.gridOverlayLineVertical} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={localStyles.headerSection}>
            {/* EDITORIAL TITLE BLOCK */}
            <View style={localStyles.titleContainer}>
              <Text style={localStyles.protocolLabel}>ACTIVE INVENTORY</Text>
              <Text style={localStyles.title}>AVAILABLE UNITS</Text>
              <Text style={localStyles.subtitle}>
                Verified room configuration sets and real-time availability logs.
              </Text>
            </View>

            {/* INTEGRATED FULL-WIDTH METRIC BANNER */}
            <View style={localStyles.countBadgeFullWidth}>
              <View style={localStyles.badgeLeftSection}>
                <Text style={localStyles.countLabel}>TOTAL ACTIVE UNITS</Text>
                <Text style={localStyles.statusSubtext}>Secure System Data</Text>
              </View>
              <View style={localStyles.badgeRightSection}>
                <Text style={localStyles.countValue}>{items.length}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard
            place={item.place}
            location={item.location}
            price={item.price}
            imageUrl={item.imageUrl}
            availability={item.availability}
            bookingDays={item.bookingDays}
            tag={item.category || 'STANDARD'}
            typeCode={`ROOM ${item.id}`}
            specs={[
              { label: 'GUESTS', value: `${item.guests ?? 2} GUESTS` },
              { label: 'LOCATION', value: item.location },
              { label: 'AVAILABILITY', value: item.availability },
            ]}
            onBook={() => navigation.navigate('RoomDetail', { listing: item })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={localStyles.centerBlock}>
              <ActivityIndicator size="small" color="#1A1A1A" />
              <Text style={localStyles.statusText}>Polling property registry...</Text>
            </View>
          ) : error ? (
            <View style={localStyles.errorContainer}>
              <Text style={localStyles.errorTitle}>Synchronization Fault</Text>
              <Text style={localStyles.statusText}>{error}</Text>
            </View>
          ) : (
            <View style={localStyles.emptyContainer}>
              <Text style={localStyles.emptyTitle}>No accommodations live</Text>
              <Text style={localStyles.emptyText}>
                The database registry is currently clear. Available properties will automatically render here upon background pipelines.
              </Text>
            </View>
          )
        }
      />

      <AccountBottomNav currentRoute="RoomListing" navigate={route => navigation.navigate(route)} />
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
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingTop: 40,
    paddingBottom: 130,
    gap: 20, // Strict design stack separation matching HomeScreen components
  },
  headerSection: {
    gap: 24,
    marginBottom: 4, // Balancing layout gaps
  },
  titleContainer: {
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
  countBadgeFullWidth: {
    backgroundColor: '#1A1A1A', // Clean technical black
    borderRadius: 20, // Matching system border radius parameters
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeLeftSection: {
    justifyContent: 'center',
    gap: 4,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  statusSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgeRightSection: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingLeft: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700', // Signature gold accents
    letterSpacing: -0.5,
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
