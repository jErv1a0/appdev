import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';

interface ListingCardProps {
  place: string;
  location: string;
  price: string | number;
  image: ImageSourcePropType;
  availability: string;
  bookingDays: number;
  onBook?: () => void;
  onChat?: () => void;
}

export default function ListingCard({
  place,
  location,
  price,
  image,
  availability,
  bookingDays,
  onBook,
  onChat,
}: ListingCardProps) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />

      <View style={styles.body}>
        <Text style={styles.place}>{place}</Text>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.price}>₱{price} / night</Text>
        <Text style={styles.availability}>Availability: {availability}</Text>
        <Text style={styles.bookingDays}>Bookable for: {bookingDays} days</Text>

        <TouchableOpacity onPress={onBook} style={styles.button}> 
          <Text>Book Now</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onChat} style={styles.link}> 
          <Text>Chat Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  body: {
    padding: 15,
  },
  place: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  location: {
    marginTop: 2,
  },
  price: {
    color: '#FFD700',
    marginTop: 5,
  },
  availability: {
    marginTop: 5,
    fontSize: 14,
  },
  bookingDays: {
    marginTop: 2,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    marginTop: 8,
    alignItems: 'center',
  },
});