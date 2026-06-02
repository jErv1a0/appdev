import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';

export type AccountRoute = 'Home' | 'RoomListing' | 'Booking' | 'Profile';

interface AccountBottomNavProps {
  currentRoute: AccountRoute;
  navigate: (route: AccountRoute) => void;
}

const NAV_ITEMS: Array<{ route: AccountRoute; icon: ImageSourcePropType }> = [
  { route: 'Home', icon: require('../../photos/Home.png') },
  { route: 'RoomListing', icon: require('../../photos/rooms.png') },
  { route: 'Booking', icon: require('../../photos/bookings.png') },
  { route: 'Profile', icon: require('../../photos/profile.png') },
];

export default function AccountBottomNav({ currentRoute, navigate }: AccountBottomNavProps) {
  return (
    <View style={styles.shell}>
      {NAV_ITEMS.map(item => {
        const active = item.route === currentRoute;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => navigate(item.route)}
            activeOpacity={0.8}
            accessibilityLabel={`${item.route} tab`}
          >
            <Image
              source={item.icon}
              style={[styles.icon, active ? styles.iconActive : styles.iconInactive]}
              resizeMode="contain"
            />
            {active && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    zIndex: 20,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  icon: {
    width: 22,
    height: 22,
    opacity: 0.8,
  },
  iconInactive: {
    tintColor: '#9E9E9E',
    opacity: 0.65,
  },
  iconActive: {
    tintColor: '#111111',
    opacity: 1,
    transform: [{ scale: 1.06 }],
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#111111',
    marginTop: 6,
  },
});

