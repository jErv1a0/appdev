import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AccountBottomNav from '../components/AccountBottomNav';
import { COLORS } from '../theme';
import client from '../api/client';
import { fetchBookingsApi, fetchAllBookingsApi, Booking } from '../api/bookingsApi';
import { Listing } from '../api/listingsApi';
import { fetchRoomDetailsApi, normalizeListing } from '../api/listingsApi';


// Helper function to convert date to YYYY-MM-DD format
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a date falls within a booked period
const isDateBooked = (checkDate: Date, bookings: Booking[], roomId: number | string | null): boolean => {
  const dateStr = formatDate(checkDate);
  const currentRoomId = roomId !== null && roomId !== undefined ? String(roomId) : null;

  return bookings.some(booking => {
    const bookingRoomId = booking.roomId !== undefined && booking.roomId !== null ? String(booking.roomId) : null;
    if (currentRoomId && bookingRoomId) {
      return (
        bookingRoomId === currentRoomId &&
        dateStr >= booking.checkIn &&
        dateStr < booking.checkOut
      );
    }
    return dateStr >= booking.checkIn && dateStr < booking.checkOut;
  });
};

export default function RoomDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const passedRoom = route.params?.listing || route.params?.room || route.params?.booking?.room || {};
  const editingBooking = route.params?.booking || null;

  const [roomData, setRoomData] = useState<Listing>(() => normalizeListing(passedRoom, 0));
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Handle initialization for editing mode
  useEffect(() => {
    if (editingBooking) {
      const start = new Date(editingBooking.checkIn);
      const end = new Date(editingBooking.checkOut);
      if (!isNaN(start.getTime())) setCheckInDate(start);
      if (!isNaN(end.getTime())) setCheckOutDate(end);
    }
  }, [editingBooking]);

  // Fetch room details and bookings on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!passedRoom.id) {
          return;
        }

        const [detailedRoom, bookingList] = await Promise.all([
          fetchRoomDetailsApi(passedRoom.id),
          fetchAllBookingsApi(),
        ]);

        // Log raw API response and normalized listing for debugging price/image fields
        console.log('ROOM DETAIL API RAW:', detailedRoom);
        const normalized = detailedRoom;
        console.log('ROOM DETAIL NORMALIZED:', normalized);
        setRoomData(normalized);

        const filteredBookings = bookingList.filter(booking => String(booking.roomId) === String(passedRoom.id));
        setBookings(filteredBookings);
      } catch (error) {
        console.log('Error loading room details or bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [passedRoom.id]);

  // Get calendar days for current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDatePress = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!checkInDate) {
      setCheckInDate(selectedDate);
    } else if (!checkOutDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    } else {
      // Reset if selecting earlier date
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
    }
  };

  const handleBook = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert('Error', 'Please select both check-in and check-out dates');
      return;
    }

    // Check if selected dates are available
    const isAvailable = checkDateRangeAvailable(checkInDate, checkOutDate);
    if (!isAvailable) {
      Alert.alert('Unavailable', 'Some of the selected dates are already booked. Please choose different dates.');
      return;
    }

    try {
      setBookingInProgress(true);
      const formattedCheckIn = formatDate(checkInDate);
      const formattedCheckOut = formatDate(checkOutDate);

      if (editingBooking) {
        await client.updateBooking(
          editingBooking.id, // Parameter 1: bookingId
          Number(roomData.id) || 0, // Parameter 2: roomId
          formattedCheckIn,
          formattedCheckOut,
          roomData.guests || 2
        );
      } else {
        await client.createBooking(
          Number(roomData.id) || 0,
          formattedCheckIn,
          formattedCheckOut,
          roomData.guests || 2
        );
      }

      Alert.alert('Success', editingBooking ? 'Booking updated!' : 'Booking confirmed!', [
        {
          text: 'OK',
          onPress: () => {
            setCheckInDate(null);
            setCheckOutDate(null);
            if (editingBooking) {
              navigation.navigate('Profile');
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Process Failed', error.message || 'Failed to process booking. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  const checkDateRangeAvailable = (startDate: Date, endDate: Date): boolean => {
    let currentDate = new Date(startDate);
    const currentRoomId = roomData.id ?? passedRoom.id ?? null;

    while (currentDate < endDate) {
      if (isDateBooked(currentDate, bookings, currentRoomId)) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };

  const isDayBooked = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const currentRoomId = roomData.id ?? passedRoom.id ?? null;
    return isDateBooked(date, bookings, currentRoomId);
  };

  const isDaySelected = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (checkInDate && formatDate(date) === formatDate(checkInDate)) { return true; }
    if (checkOutDate && formatDate(date) === formatDate(checkOutDate)) { return true; }
    if (checkInDate && checkOutDate) {
      return date > checkInDate && date < checkOutDate;
    }
    return false;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const booked = isDayBooked(day);
      const selected = isDaySelected(day);
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = date < new Date() && !selected;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            booked && !selected && styles.calendarDayBooked,
            selected && styles.calendarDaySelected,
            isPast && styles.calendarDayPast,
          ]}
          onPress={() => !booked && !isPast && handleDatePress(day)}
          disabled={booked || isPast}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.calendarDayText,
              (booked || isPast) && !selected && styles.calendarDayTextDisabled,
              selected && styles.calendarDayTextSelected,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#111111'} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← RETURN TO AVAILABLE STAYS</Text>
        </TouchableOpacity>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: (roomData.imageUrl && String(roomData.imageUrl).trim())
                ? String(roomData.imageUrl).trim()
                : 'https://picsum.photos/seed/1/400/300'
            }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => console.log('IMAGE LOAD ERROR:', e.nativeEvent.error)}
            onLoad={() => console.log('IMAGE LOADED OK:', roomData.imageUrl)}
          />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{'//SELECTED'}</Text>
          </View>
        </View>

        {/* Room Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.roomLabel}>SPECIFICATION SHEET</Text>
              <Text style={styles.roomTitle}>{roomData.roomTitle || roomData.place || 'ROOM'}</Text>
            </View>
          </View>
          <Text style={styles.priceTag}>₱{roomData.price || 0}</Text>
          <Text style={styles.priceLabel}>/ NIGHT</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>LOCATION REGISTRY</Text>
            <Text style={styles.detailValue}>{roomData.location || 'Unknown'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>OCCUPANCY LIMIT</Text>
            <Text style={styles.detailValue}>{roomData.guests || 2} PERSONNEL</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>
            {roomData.fullDescription || roomData.description || 'Spacious deluxe room with ocean view'}
          </Text>
        </View>

        {/* Booking Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Mode</Text>
          <Text style={styles.bookingModeValue}>Daily Booking</Text>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability Calendar</Text>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <Text style={styles.monthNav}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <Text style={styles.monthNav}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            {/* Day headers */}
            <View style={styles.calendarHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarHeaderText}>{day}</Text>
              ))}
            </View>

            {/* Days grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxAvailable]} />
              <Text style={styles.legendText}>AVAILABLE</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxBooked]} />
              <Text style={styles.legendText}>BOOKED</Text>
            </View>
          </View>
        </View>

        {/* Selected Dates */}
        {(checkInDate || checkOutDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECTED DATES</Text>
            <View style={styles.selectedDatesContainer}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Check In</Text>
                <Text style={styles.dateValue}>
                  {checkInDate ? checkInDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'Select'}
                </Text>
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Check Out</Text>
                <Text style={styles.dateValue}>
                  {checkOutDate ? checkOutDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'Select'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.bookButton, bookingInProgress && styles.bookButtonDisabled]}
            onPress={handleBook}
            disabled={bookingInProgress}
            activeOpacity={0.9}
          >
            {bookingInProgress ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.bookButtonText}>{editingBooking ? 'UPDATE RESERVATION →' : 'BOOK THIS STAY →'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AccountBottomNav currentRoute="RoomListing" navigate={routeName => navigation.navigate(routeName)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    gap: 24,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
  },
  imageBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  roomTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceTag: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  backLinkBorder: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
  },
  bookingModeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Calendar styles
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  monthNav: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  calendarHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    backgroundColor: '#D4F4DD',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B8E6C3',
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  calendarDayBooked: {
    backgroundColor: '#FFD4D4',
    borderColor: '#FFA8A8',
  },
  calendarDayTextDisabled: {
    color: '#999',
  },
  calendarDaySelected: {
    backgroundColor: '#7BC67B',
    borderColor: '#5BA05B',
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  calendarDayPast: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateField: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bookButton: {
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  legendBoxAvailable: {
    backgroundColor: '#D4F4DD',
  },
  legendBoxBooked: {
    backgroundColor: '#FFD4D4',
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
});
