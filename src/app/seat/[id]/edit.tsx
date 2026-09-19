import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/query-state';
import { SeatForm } from '@/components/seat-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useUpdateSeat } from '@/features/seats/use-seat-mutations';
import { useSeat } from '@/features/seats/use-seats';

export default function EditSeatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const seatQuery = useSeat(id);
  const updateSeat = useUpdateSeat();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: `Edit seat ${id}` }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <QueryState query={seatQuery} isEmpty={() => false} emptyTitle="Seat not found">
          {(seat) => (
            <SeatForm
              mode="edit"
              initialValues={seat}
              submitLabel="Save changes"
              isSubmitting={updateSeat.isPending}
              submitError={updateSeat.error}
              onSubmit={(values) =>
                updateSeat.mutate(
                  { id: seat.id, input: { zone: values.zone, hasOutlet: values.hasOutlet } },
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