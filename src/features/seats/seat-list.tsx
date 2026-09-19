import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { ZoneFilter } from '@/components/zone-filter';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { filterSeats, getZones } from '@/lib/filter-seats';
import { useFilterStore } from '@/store/filter-store';
import type { Seat } from '@/types';

function SeatRow({ seat }: { seat: Seat }) {
  const theme = useTheme();
  const outlet = seat.hasOutlet ? 'Has outlet' : 'No outlet';

  return (
    <Link href={{ pathname: '/seat/[id]', params: { id: seat.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Seat ${seat.id}, zone ${seat.zone}, ${outlet}`}
        accessibilityHint="Opens seat details"
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
        ]}>
        <ThemedText type="default">Seat {seat.id}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Zone {seat.zone} · {outlet}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

export function SeatList({ seats }: { seats: Seat[] }) {
  const searchText = useFilterStore((s) => s.searchText);
  const selectedZone = useFilterStore((s) => s.selectedZone);
  const setSearchText = useFilterStore((s) => s.setSearchText);
  const setSelectedZone = useFilterStore((s) => s.setSelectedZone);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const zones = getZones(seats);
  const visibleSeats = filterSeats(seats, searchText, selectedZone);

  return (
    <View style={styles.container}>
      <AppTextInput
        accessibilityLabel="Search seats by id"
        accessibilityRole="search"
        placeholder="Search by seat id (e.g. A01)"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="search"
      />
      <ZoneFilter zones={zones} selected={selectedZone} onSelect={setSelectedZone} />
      <ThemedText type="small" themeColor="textSecondary" accessibilityLiveRegion="polite">
        {visibleSeats.length} of {seats.length} seats
      </ThemedText>
      <FlatList
        data={visibleSeats}
        keyExtractor={(seat) => seat.id}
        renderItem={({ item }) => <SeatRow seat={item} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>No seats match your filters.</ThemedText>
            <AppButton variant="secondary" label="Clear filters" onPress={resetFilters} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  emptyText: {
    textAlign: 'center',
  },
});