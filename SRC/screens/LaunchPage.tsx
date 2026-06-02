import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme';
import ListingCard from '../components/ListingCard';
import PhotoCarousel from '../components/PhotoCarousel';

export default function LaunchPage() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Translucent System Bar Integration */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Technical Cyber-Grid Hero Block */}
        <View style={styles.heroSection}>
          {/* Dynamic Image Underlayer */}
          <View style={styles.carouselWrapper}>
            <PhotoCarousel />
          </View>

          {/* Web App Protocol Overlay Layout */}
          <View style={styles.heroOverlay}>

            {/* Fine Technical Grid Lines Mock Layer */}
            <View style={styles.gridOverlayLineVertical} />
            <View style={styles.gridOverlayLineHorizontal} />

            {/* Release Info Header Block */}
            <View style={styles.protocolHeaderRow}>
              <View style={styles.diamondIndicator} />
              <View style={styles.releaseTagContainer}>
                <Text style={styles.releaseTagText}>STAYGRID PROTOCOL</Text>
                <View style={styles.tagInlineDivider} />
                <Text style={styles.releaseVersionText}>RELEASE 2.6</Text>
              </View>
            </View>

            {/* Impact Web Typography Block */}
            <View style={styles.brandTypographyContainer}>
              <Text style={styles.hugeBrandTextBold}>SMART</Text>
              <Text style={styles.hugeBrandTextOutline}>STAYS<Text style={styles.textYellowDot}>,</Text></Text>
              <Text style={styles.hugeBrandTextOutline}>STAY GRID<Text style={styles.textYellowDot}>.</Text></Text>
            </View>

            {/* Styled Pagination Indicator Dots matching mobile mockup */}
            <View style={styles.paginationTrack}>
              <View style={styles.inactiveDot} />
              <View style={styles.inactiveDot} />
              <View style={styles.inactiveDot} />
              <View style={styles.inactiveDot} />
              <View style={styles.activeDashIndicator} />
            </View>
          </View>
        </View>

        {/* Main Application Content Sheet */}
        <View style={styles.contentSheet}>
          <View style={styles.dragHandle} />

          {/* Header Introduction Section */}
          <View style={styles.headerSection}>
            <Text style={styles.protocolLabel}>LAUNCH PROTOCOL</Text>
            <Text style={styles.mainHeading}>Find your perfect{'\n'}stay today.</Text>
            <Text style={styles.subHeading}>
              Discover unique accommodations worldwide and connect directly with property owners over a unified room availability architecture.
            </Text>
          </View>

          {/* Curated Listings Grid Block */}
          <View style={styles.listingsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Curated Stays</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>SEE ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsGap}>
              <ListingCard
                place="Beachfront Executive Villa"
                location="Bacong, Dumaguete"
                price="2,500"
                image={require('../../photos/beachfront.png')}
                availability="Available"
                bookingDays={30}
                onBook={() => navigation.navigate('Login')}
                tag="PREMIUM"
                typeCode="TYPE_01"
              />

              <ListingCard
                place="Cozy Family Suite"
                location="San Jose, Negros Oriental"
                price="1,800"
                image={require('../../photos/Cozy.jpg')}
                availability="Booked until March 25"
                bookingDays={14}
                onBook={() => navigation.navigate('Login')}
                tag="LUXURY"
                typeCode="TYPE_02"
              />

              <ListingCard
                place="Seaview Executive Penthouse"
                location="Dauin, Negros Oriental"
                price="3,500"
                image={{ uri: 'https://picsum.photos/400/303' }}
                availability="Booked until April 5"
                bookingDays={45}
                onBook={() => navigation.navigate('Login')}
                tag="PREMIUM"
                typeCode="TYPE_03"
              />

              <ListingCard
                place="Tropical Executive Bungalow"
                location="Sibulan, Negros Oriental"
                price="950"
                image={require('../../photos/Tropical.jpg')}
                availability="Available"
                bookingDays={60}
                onBook={() => navigation.navigate('Login')}
                tag="SPACIOUS"
                typeCode="TYPE_04"
              />
            </View>
          </View>

          {/* Action Navigation Containers */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>INITIALIZE APPLICATION</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 520, // Increased height to elegantly frame the new stacked typography block
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F1214',
  },
  carouselWrapper: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35, // Balanced opacity allowing text overlay to remain readable
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 20, 0.4)',
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: 'flex-start',
  },
  /* Abstract Design Grid Markers matching the Web Architecture layout background */
  gridOverlayLineVertical: {
    position: 'absolute',
    left: '15%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridOverlayLineHorizontal: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  protocolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 5,
  },
  diamondIndicator: {
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
    marginRight: 16,
  },
  releaseTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  releaseTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1.5,
  },
  tagInlineDivider: {
    width: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
  releaseVersionText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  brandTypographyContainer: {
    marginTop: 10,
    zIndex: 5,
  },
  hugeBrandTextBold: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 56,
  },
  hugeBrandTextOutline: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 56,
    // Emulates architectural blueprint outline approach
    textShadowColor: '#111111',
    textShadowRadius: 1,
  },
  textYellowDot: {
    color: '#FFD700',
  },
  paginationTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 48,
    left: 24,
    zIndex: 5,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#222222',
  },
  activeDashIndicator: {
    width: 36,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  contentSheet: {
    flex: 1,
    backgroundColor: '#F4F4F4', // Adjusted to match custom container layout baseline exactly
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D6D6D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerSection: {
    marginBottom: 28,
  },
  protocolLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
    lineHeight: 38,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 21,
  },
  listingsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  cardsGap: {
    gap: 8,
  },
  ctaContainer: {
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#0A1128',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#111111',
  },
  secondaryBtnText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footerPadding: {
    height: 40,
  },
});
