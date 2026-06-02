import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ListingCard from '../components/ListingCard';
import AccountBottomNav from '../components/AccountBottomNav';
import { fetchListingsApi } from '../api/listingsApi';
import { RootState } from '../store/rootReducer';

const { width } = Dimensions.get('window');
// Padding: 24px on each side
const PADDING = 24;
const CAROUSEL_WIDTH = width - (PADDING * 2);

interface CarouselItem {
  id: string;
  image: string;
}

function getImageForRoom(room: any) {
  if (Array.isArray(room.images) && room.images.length > 0 && room.images[0]) {
    return { uri: room.images[0] };
  }
  if (room.imageUrl) {
    return { uri: room.imageUrl };
  }
  return { uri: 'https://via.placeholder.com/400x300.png?text=No+Image' };
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);

  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState<number>(0);

  const carouselData: CarouselItem[] = [
    { id: '1', image: 'https://picsum.photos/600/800?random=1' },
    { id: '2', image: 'https://picsum.photos/600/800?random=2' },
    { id: '3', image: 'https://picsum.photos/600/800?random=3' },
    { id: '4', image: 'https://picsum.photos/600/800?random=4' },
    { id: '5', image: 'https://picsum.photos/600/800?random=5' },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedRooms() {
      setLoading(true);
      setError(null);
      try {
        const rooms = await fetchListingsApi();
        if (!mounted) { return; }
        setFeaturedRooms(rooms);
      } catch (err: any) {
        if (!mounted) { return; }
        setError(err?.message || 'Unable to load featured rooms');
      } finally {
        if (mounted) { setLoading(false); }
      }
    }

    loadFeaturedRooms();
    return () => { mounted = false; };
  }, []);

  // Smooth automatic carousel transition
  useEffect(() => {
    if (carouselData.length === 0) { return; }

    const interval = setInterval(() => {
      const nextIndex = (currentCarouselIndex + 1) % carouselData.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentCarouselIndex, carouselData.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(contentOffsetX / CAROUSEL_WIDTH);
    if (computedIndex !== currentCarouselIndex && computedIndex >= 0 && computedIndex < carouselData.length) {
      setCurrentCarouselIndex(computedIndex);
    }
  };

  const displayName = String(user?.fullName ?? user?.name ?? user?.email ?? 'Guest User');
  const topRooms = featuredRooms.slice(0, 4);

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Technical Grid Overlay */}
      <View style={localStyles.gridOverlayLineVertical} />
      <View style={localStyles.gridOverlayLineHorizontal} />

      <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>

        {/* EDITORIAL GREETING SECTION */}
        <View style={localStyles.welcomeHeader}>
          <View style={localStyles.welcomeTextGroup}>
            <Text style={localStyles.welcomeKicker}>Welcome to Staygrid</Text>
            <Text style={localStyles.welcomeName} numberOfLines={1}>{displayName.toUpperCase()}</Text>
          </View>
          <View style={localStyles.profileAvatarPlaceholder}>
            <Text style={localStyles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* INTEGRATED PHOTO CAROUSEL COMPONENT */}
        <View style={localStyles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            bounces={false}
            renderItem={({ item }) => (
              <View style={localStyles.carouselItem}>
                <Image source={{ uri: item.image }} style={localStyles.carouselImage} />
                <View style={localStyles.vignetteOverlay} />
                <View style={localStyles.carouselContentOverlay}>
                  <Text style={localStyles.carouselTag}>EXCLUSIVE</Text>
                  <Text style={localStyles.carouselTitle}>Smart experiences</Text>
                </View>
              </View>
            )}
          />
          {/* Minimalist dot indicator over carousel */}
          <View style={localStyles.indicatorRow}>
            {carouselData.map((_, i) => (
              <View
                key={i}
                style={[
                  localStyles.indicatorDot,
                  currentCarouselIndex === i && localStyles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ACTION / INTRODUCTION CARD */}
        <View style={localStyles.actionHeroCard}>
          <Text style={localStyles.introTitle}>Client Dashboard</Text>
          <Text style={localStyles.introDescription}>
            Central hub for monitoring system parameters, tracking live inventory metrics, and accessing secure accommodations.
          </Text>
          <TouchableOpacity
            style={localStyles.brandSearchButton}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('RoomListing')}
          >
            <Text style={localStyles.brandSearchButtonText}>Scan Inventory →</Text>
          </TouchableOpacity>
        </View>

        {/* GLOBAL DASHBOARD METRICS */}
        <View style={localStyles.metricsGrid}>
          <View style={localStyles.metricBox}>
            <Text style={localStyles.metricLabel}>TRACKED ROOMS</Text>
            <Text style={localStyles.metricValue}>{featuredRooms.length}</Text>
          </View>
          <View style={localStyles.metricBox}>
            <Text style={localStyles.metricLabel}>CURRENT HUB</Text>
            <Text style={localStyles.metricValue} numberOfLines={1}>Dumaguete City</Text>
          </View>
        </View>

        {/* DYNAMIC SECTION HEADER */}
        <View style={localStyles.sectionHeader}>
          <Text style={localStyles.sectionTitle}>Featured Selections</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoomListing')} activeOpacity={0.7}>
            <Text style={localStyles.sectionLink}>Explore All</Text>
          </TouchableOpacity>
        </View>

        {/* DYNAMIC LIST PROCESSING OUTPUT STATES */}
        {loading ? (
          <View style={localStyles.centerBlock}>
            <ActivityIndicator size="small" color="#1A1A1A" />
            <Text style={localStyles.statusText}>Polling verified listings...</Text>
          </View>
        ) : error ? (
          <View style={localStyles.errorContainer}>
            <Text style={localStyles.errorTitle}>Synchronization Fault</Text>
            <Text style={localStyles.statusText}>{error}</Text>
          </View>
        ) : topRooms.length === 0 ? (
          <View style={localStyles.emptyContainer}>
            <Text style={localStyles.emptyTitle}>No accommodations live</Text>
            <Text style={localStyles.emptyText}>Property configuration sets will render here upon background pipelines.</Text>
          </View>
        ) : (
          <View style={localStyles.cardsStack}>
            {topRooms.map((room: any, index: number) => (
              <ListingCard
                key={String(room.id ?? index)}
                place={room.place}
                location={room.location}
                price={room.price}
                imageUrl={room.imageUrl}
                availability={room.availability}
                bookingDays={room.bookingDays}
                tag={room.category || 'STANDARD'}
                typeCode={`ROOM ${room.id}`}
                specs={[
                  { label: 'GUESTS', value: `${room.guests ?? 2} GUESTS` },
                  { label: 'LOCATION', value: room.location },
                  { label: 'AVAILABILITY', value: room.availability },
                ]}
                onBook={() => navigation.navigate('RoomDetail', { listing: room })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AccountBottomNav currentRoute="Home" navigate={route => navigation.navigate(route)} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 40,
    paddingBottom: 130,
    gap: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTextGroup: {
    flex: 1,
    marginRight: 16,
  },
  welcomeKicker: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  welcomeName: {
    color: '#1A1A1A',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  profileAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlayLineVertical: {
    position: 'absolute',
    left: PADDING,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  gridOverlayLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 148,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  carouselWrapper: {
    width: CAROUSEL_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    position: 'relative',
    // Soft Clean Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  carouselItem: {
    width: CAROUSEL_WIDTH,
    height: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  carouselContentOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    gap: 4,
  },
  carouselTag: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  carouselTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  indicatorRow: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorDotActive: {
    backgroundColor: '#FFD700',
    width: 16,
  },
  actionHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  introDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  brandSearchButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  brandSearchButtonText: {
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 13,
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
  metricLabel: {
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
  cardsStack: {
    gap: 20,
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
    borderRadius: 16,
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
    borderRadius: 16,
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