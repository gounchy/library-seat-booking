import { Stack, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeatForm } from '@/components/seat-form';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateSeat } from '@/features/seats/use-seat-mutations';

export default function NewSeatScreen() {
  const router = useRouter();
  const createSeat = useCreateSeat();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'New seat' }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <SeatForm
          mode="create"
          initialValues={{ id: '', zone: '', hasOutlet: false }}
          submitLabel="Create seat"
          isSubmitting={createSeat.isPending}
          submitError={createSeat.error}
          onSubmit={(seat) => createSeat.mutate(seat, { onSuccess: () => router.back() })}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
});