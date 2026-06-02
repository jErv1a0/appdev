import React, { useState, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AccountBottomNav from '../components/AccountBottomNav';
import { fetchBookingsApi, Booking } from '../api/bookingsApi';

const PADDING = 24;

// Small in-file calendar component used by ReservationsScreen
function Calendar({ bookedSet }: { bookedSet?: Set<string> }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selected, setSelected] = useState<Date | null>(null);

  const monthLabel = useMemo(() => current.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [current]);

  const daysMatrix = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: number[][] = [];
    let cells: number[] = [];
    for (let i = 0; i < firstDay; i++) { cells.push(0); }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
      if (cells.length === 7) { rows.push(cells); cells = []; }
    }
    while (cells.length > 0 && cells.length < 7) { cells.push(0); }
    if (cells.length === 7) { rows.push(cells); }
    // ensure 6 rows
    while (rows.length < 6) { rows.push([0,0,0,0,0,0,0]); }
    return rows;
  }, [current]);

  function prevMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  }
  function nextMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  }

  function isSelected(day: number) {
    if (!selected || day === 0) { return false; }
    const s = selected;
    return s.getFullYear() === current.getFullYear() && s.getMonth() === current.getMonth() && s.getDate() === day;
  }

  function isBooked(day: number) {
    if (day === 0) { return false; }
    const ymd = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedSet ? bookedSet.has(ymd) : false;
  }

  return (
    <View>
      <View style={localStyles.calendarHeaderRow}>
        <Text style={localStyles.calendarSectionTitle}>PERSONAL CALENDAR</Text>
        <View style={localStyles.calendarDateNav}>
          <TouchableOpacity onPress={prevMonth} style={localStyles.navArrow}><Text style={localStyles.arrowText}>‹</Text></TouchableOpacity>
          <Text style={localStyles.calendarDateText}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth} style={localStyles.navArrow}><Text style={localStyles.arrowText}>›</Text></TouchableOpacity>
        </View>
      </View>

      <View style={localStyles.calendarGridWrapper}>
        <View style={localStyles.weekRow}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => (
            <Text key={w} style={localStyles.weekDayLabel}>{w}</Text>
          ))}
        </View>
        {daysMatrix.map((week, rIdx) => (
          <View key={rIdx} style={localStyles.weekRow}>
            {week.map((day, cIdx) => (
              <TouchableOpacity
                key={cIdx}
                onPress={() => day !== 0 && !isBooked(day) && setSelected(new Date(current.getFullYear(), current.getMonth(), day))}
                style={[
                  localStyles.dayCell,
                  day === 0 && localStyles.dayCellEmpty,
                  isSelected(day) && localStyles.dayCellSelected,
                  isBooked(day) && !isSelected(day) && localStyles.dayCellBooked,
                ]}
                activeOpacity={day === 0 ? 1 : 0.7}
              >
                <Text style={[localStyles.dayNumber, day === 0 && localStyles.dayNumberMuted]}>{day === 0 ? '' : String(day)}</Text>
                {isBooked(day) && !isSelected(day) ? <View style={localStyles.bookedDot} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// (Removed mock metric interface — using live bookings instead)

export default function ReservationsScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());

  // fetch bookings whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const list = await fetchBookingsApi();
          if (!mounted) { return; }
          setBookings(list);
          const s = new Set<string>();
          const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          list.forEach(b => {
            try {
              const start = new Date(String(b.checkIn));
              const end = new Date(String(b.checkOut));
              if (isNaN(start.valueOf()) || isNaN(end.valueOf())) { return; }
              let cur = new Date(start);
              while (cur < end) {
                s.add(toYMD(cur));
                cur.setDate(cur.getDate() + 1);
              }
            } catch (e) {}
          });
          setBookedSet(s);
        } catch (e) {
          // ignore
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Technical Grid Overlay — Matches the layout grid perfectly */}
      <View style={localStyles.gridOverlayLineVertical} />

      {/* Primary Layout Wrapper enforces strict, clean margins structurally */}
      <View style={localStyles.layoutWrapper}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* EDITORIAL TITLE BLOCK */}
          <View style={localStyles.titleContainer}>
            <Text style={localStyles.protocolLabel}>BOOKING LOGS</Text>
            <Text style={localStyles.title}>RESERVATIONS</Text>
            <Text style={localStyles.subtitle}>
              Review your ongoing checkout selections and historical reservation logs.
            </Text>
          </View>

          {/* TOTAL ARCHIVED WORKFLOWS BANNER */}
          <View style={localStyles.countBadgeFullWidth}>
            <View style={localStyles.badgeLeftSection}>
              <Text style={localStyles.countLabel}>TOTAL ARCHIVED WORKFLOWS</Text>
              <Text style={localStyles.statusSubtext}>Monitored System Logs</Text>
            </View>
            <View style={localStyles.badgeRightSection}>
              <Text style={localStyles.countValue}>{bookings.length}</Text>
            </View>
          </View>

          {/* CURRENT SELECTION MONITORING CARD */}
          <View style={localStyles.currentSelectionCard}>
            <Text style={localStyles.cardKicker}>CURRENT SELECTION</Text>
            <Text style={localStyles.cardTitle}>{bookings[0]?.title ?? 'No active selection'}</Text>
            <Text style={localStyles.cardDescription}>{bookings[0] ? `${bookings[0].checkIn || ''} → ${bookings[0].checkOut || ''}` : 'No selection'}</Text>

            <Text style={localStyles.secureFooterText}>
              All reservation workflows are monitored and secured within end-to-end platform gateways.
            </Text>
          </View>

          {/* PERSONAL CALENDAR COMPONENT */}
          <View style={localStyles.calendarPlaceholderCard}>
            <Calendar bookedSet={bookedSet} />
          </View>

        </ScrollView>
      </View>

      <AccountBottomNav currentRoute="Booking" navigate={route => navigation.navigate(route)} />
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
    zIndex: 0,
  },
  layoutWrapper: {
    flex: 1,
    paddingHorizontal: PADDING,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 130,
    gap: 24, // Matches HomeScreen stack separation exactly
  },
  titleContainer: {
    gap: 2,
    marginBottom: 4,
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
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
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
    color: '#FFD700',
    letterSpacing: -0.5,
  },
  currentSelectionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  cardKicker: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardDescription: {
    color: '#8E8E93',
    fontSize: 13,
  },
  secureFooterText: {
    color: '#666666',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  calendarPlaceholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 16,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  calendarDateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrow: {
    backgroundColor: '#F0F0F0',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendarDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarGridWrapper: {
    marginTop: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  dayCellEmpty: {
    opacity: 0.15,
  },
  dayCellSelected: {
    backgroundColor: '#1A1A1A',
  },
  dayCellBooked: {
    backgroundColor: '#FFF8E1',
  },
  bookedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53E3E',
    marginTop: 6,
  },
  dayNumber: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
  },
  dayNumberMuted: {
    color: '#BDBDBD',
  },
});
