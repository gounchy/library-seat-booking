import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DevPanel } from '@/components/dev-panel';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSeats } from '@/features/seats/use-seats';
import type { Seat } from '@/types';

function SeatRow({ seat }: { seat: Seat }) {
  const outlet = seat.hasOutlet ? 'Has outlet' : 'No outlet';
  return (
    <ThemedView
      type="backgroundElement"
      style={styles.row}
      accessible
      accessibilityLabel={`Seat ${seat.id}, zone ${seat.zone}, ${outlet}`}>
      <ThemedText type="default">Seat {seat.id}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Zone {seat.zone} · {outlet}
      </ThemedText>
    </ThemedView>
  );
}

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
          {(seats) => (
            <FlatList
              data={seats}
              keyExtractor={(seat) => seat.id}
              renderItem={({ item }) => <SeatRow seat={item} />}
              contentContainerStyle={styles.list}
            />
          )}
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
  },
  list: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
});