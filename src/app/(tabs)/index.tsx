import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DevPanel } from '@/components/dev-panel';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { SeatList } from '@/features/seats/seat-list';
import { useSeats } from '@/features/seats/use-seats';

export default function SeatsScreen() {
  const seatsQuery = useSeats();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Seats
        </ThemedText>
        <QueryState
          query={seatsQuery}
          isEmpty={(seats) => seats.length === 0}
          emptyTitle="No seats yet"
          emptyMessage="Seats you add will appear here.">
          {(seats) => <SeatList seats={seats} />}
        </QueryState>
        <DevPanel />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
});