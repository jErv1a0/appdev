import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';

export default function BookingScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking</Text>
      <Text>Selected property booking details</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
}