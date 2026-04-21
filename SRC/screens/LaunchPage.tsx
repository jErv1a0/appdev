import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../theme';
import ListingCard from '../components/ListingCard';
import PhotoCarousel from '../components/PhotoCarousel';

export default function LaunchPage() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.carouselWrapper}>
            <PhotoCarousel />
          </View>
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Image source={require('../../photos/Textmark yellow.png')} style={styles.heroLogo} />
            </View>
          </View>
        </View>

        <View style={styles.contentSheet}>
          
          <View style={styles.headerSection}>
            <View style={styles.divider} />
            <Text style={styles.mainHeading}>Find your perfect{'\n'}stay today.</Text>
            <Text style={styles.subHeading}>
              Discover unique accommodations worldwide and connect directly with property owners.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Image source={require('../../photos/Direct-Messaging.png')} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureLabel}>Direct Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Image source={require('../../photos/Real-Time Booking.png')} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureLabel}>Instant Book</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Image source={require('../../photos/Verified Properties.png')} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureLabel}>Verified</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Image source={require('../../photos/Smart Matching.png')} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureLabel}>Smart Match</Text>
            </View>
          </View>

          <View style={styles.listingsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Stays</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsGap}>
              <ListingCard
                place="Beachfront Executive Villa"
                location="Bacong, Dumaguete"
                price="2500"
                image={require('../../photos/beachfront.png')}
                availability="Available"
                bookingDays={30}
                onBook={() => navigation.navigate('Login')}
                onChat={() => navigation.navigate('Login')}
              />

              <ListingCard
                place="Cozy Family Suite"
                location="San Jose, Negros Oriental"
                price="1800"
                image={require('../../photos/Cozy.jpg')}
                availability="Booked until March 25"
                bookingDays={14}
                onBook={() => navigation.navigate('Login')}
                onChat={() => navigation.navigate('Login')}
              />

              <ListingCard
                place="Smart Studio Cottage"
                location="Bajumpandan, Dumaguete"
                price="1200"
                image={require('../../photos/Smart Cottage.png')}
                availability="Available"
                bookingDays={20}
                onBook={() => navigation.navigate('Login')}
                onChat={() => navigation.navigate('Login')}
              />

              <ListingCard
                place="Seaview Executive Penthouse"
                location="Dauin, Negros Oriental"
                price="3500"
                image={{ uri: 'https://picsum.photos/400/303' }}
                availability="Booked until April 5"
                bookingDays={45}
                onBook={() => navigation.navigate('Login')}
                onChat={() => navigation.navigate('Login')}
              />

              <ListingCard
                place="Tropical Executive Bungalow"
                location="Sibulan, Negros Oriental"
                price="950"
                image={require('../../photos/Tropical.jpg')}
                availability="Available"
                bookingDays={60}
                onBook={() => navigation.navigate('Login')}
                onChat={() => navigation.navigate('Login')}
              />
            </View>
          </View>

          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.secondaryBtnText}>Create Account</Text>
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
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 480,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.black,
  },
  carouselWrapper: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogo: {
    width: 350,
    height: 150,
    resizeMode: 'contain',
  },
  contentSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerSection: {
    marginBottom: 32,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 38,
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    width: '23%',
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  listingsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardsGap: {
    gap: 20,
  },
  ctaContainer: {
    gap: 16,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.black,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  secondaryBtnText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerPadding: {
    height: 40,
  },
});
