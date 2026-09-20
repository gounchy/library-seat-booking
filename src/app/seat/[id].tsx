import { AppButton } from '@/components/app-button';
import type { UseQueryResult } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBookings } from '@/features/bookings/use-bookings';
import { useSeat } from '@/features/seats/use-seats';
import { useNow } from '@/hooks/use-now';
import { compareBookings, isBookingActiveAt } from '@/lib/booking-time';
import type { Booking, Seat } from '@/types';

function BookingRow({ booking }: { booking: Booking }) {
  const { start, end } = booking.timeSlot;
  const waiting = booking.id.startsWith('pending-');
  return (
    <ThemedView
      type="backgroundElement"
      style={styles.bookingRow}
      accessible
      accessibilityLabel={`${booking.date}, ${start} to ${end}, ${booking.studentName}${waiting ? ', waiting to sync' : ''}`}>
      <ThemedText type="default">{booking.date}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {start} – {end} · {booking.studentName}
        {waiting ? ' · waiting to sync' : ''}
      </ThemedText>
    </ThemedView>
  );
}

type SeatDetailProps = {
  seat: Seat;
  bookingsQuery: UseQueryResult<Booking[], Error>;
};

function SeatDetail({ seat, bookingsQuery }: SeatDetailProps) {
  const router = useRouter();
  const now = useNow()
  const allBookings = bookingsQuery.data;
  const seatBookings = (allBookings ?? [])
    .filter((booking) => booking.seatId === seat.id)
    .sort(compareBookings);

  let status = 'Checking availability…';
  if (allBookings !== undefined) {
    status = seatBookings.some((booking) => isBookingActiveAt(booking, now))
      ? 'Booked right now'
      : 'Free right now';
  }

  return (
    <View style={styles.content}>
      <ThemedView type="backgroundElement" style={styles.summary}>
        <ThemedText type="smallBold">Zone {seat.zone}</ThemedText>
        <ThemedText>{seat.hasOutlet ? 'Has power outlet' : 'No power outlet'}</ThemedText>
        <ThemedText>{status}</ThemedText>
      </ThemedView>

      <AppButton
        label="Book this seat"
        onPress={() =>
          router.push({ pathname: '/book/[seatId]', params: { seatId: seat.id } })
        }
      />
      <AppButton
        variant="secondary"
        label="Edit seat"
        onPress={() =>
          router.push({ pathname: '/seat/[id]/edit', params: { id: seat.id } })
        }
      />

      <ThemedText type="subtitle" accessibilityRole="header">
        Bookings
      </ThemedText>
      <QueryState
        query={bookingsQuery}
        isEmpty={(all) => !all.some((booking) => booking.seatId === seat.id)}
        emptyTitle="No bookings yet"
        emptyMessage="This seat has not been booked.">
        {() => (
          <FlatList
            data={seatBookings}
            keyExtractor={(booking) => booking.id}
            renderItem={({ item }) => <BookingRow booking={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </QueryState>
    </View>
  );
}

export default function SeatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seatQuery = useSeat(id);
  const bookingsQuery = useBookings();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: `Seat ${id}` }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <QueryState query={seatQuery} isEmpty={() => false} emptyTitle="Seat not found">
          {(seat) => <SeatDetail seat={seat} bookingsQuery={bookingsQuery} />}
        </QueryState>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
  },
  summary: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  bookingRow: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
});