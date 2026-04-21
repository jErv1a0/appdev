import React from 'react';
import { View, ScrollView } from 'react-native';
import styles from '../styles';
import ListingCard from '../components/ListingCard';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView>
        <ListingCard
          place="Beachfront Resort"
          location="Rizal Boulevard, Dumaguete"
          price="2500"
          image={{ uri: 'https://picsum.photos/400/300' }}
          availability="Available"
          bookingDays={30}
          onBook={() => navigation.navigate('Booking')}
          onChat={() => navigation.navigate('Chat')}
        />

        <ListingCard
          place="Garden Villa"
          location="San Jose, Dumaguete"
          price="1800"
          image={{ uri: 'https://picsum.photos/400/301' }}
          availability="Booked until March 25"
          bookingDays={14}
          onBook={() => navigation.navigate('Booking')}
          onChat={() => navigation.navigate('Chat')}
        />

        <ListingCard
          place="Heritage Cottage"
          location="Bajumpandan, Dumaguete"
          price="1200"
          image={{ uri: 'https://picsum.photos/400/302' }}
          availability="Available"
          bookingDays={20}
          onBook={() => navigation.navigate('Booking')}
          onChat={() => navigation.navigate('Chat')}
        />

        <ListingCard
          place="Seaview Penthouse"
          location="Calindagan, Dumaguete"
          price="3500"
          image={{ uri: 'https://picsum.photos/400/303' }}
          availability="Booked until April 5"
          bookingDays={45}
          onBook={() => navigation.navigate('Booking')}
          onChat={() => navigation.navigate('Chat')}
        />

        <ListingCard
          place="Tropical Bungalow"
          location="Sibulan, Negros Oriental"
          price="950"
          image={{ uri: 'https://picsum.photos/400/304' }}
          availability="Available"
          bookingDays={60}
          onBook={() => navigation.navigate('Booking')}
          onChat={() => navigation.navigate('Chat')}
        />
      </ScrollView>
    </View>
  );
}

