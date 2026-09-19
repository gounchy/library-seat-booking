import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/query-state';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BookingForm } from '@/features/bookings/booking-form';
import { useCreateBooking } from '@/features/bookings/use-booking-mutations';
import { useBookings } from '@/features/bookings/use-bookings';
import { useSeat } from '@/features/seats/use-seats';
import { useAuthStore } from '@/store/auth-store';

export default function BookSeatScreen() {
  const { seatId } = useLocalSearchParams<{ seatId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const seatQuery = useSeat(seatId);
  const bookingsQuery = useBookings();
  const createBooking = useCreateBooking();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: `Book seat ${seatId}` }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <QueryState query={seatQuery} isEmpty={() => false} emptyTitle="Seat not found">
          {(seat) => (
            <BookingForm
              seatId={seat.id}
              existingBookings={bookingsQuery.data ?? []}
              isSubmitting={createBooking.isPending}
              submitError={createBooking.error}
              onSubmit={(values) =>
                createBooking.mutate(
                  {
                    seatId: seat.id,
                    date: values.date,
                    timeSlot: values.timeSlot,
                    studentName: user?.studentName ?? '',
                  },
                  { onSuccess: () => router.back() },
                )
              }
            />
          )}
        </QueryState>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
});