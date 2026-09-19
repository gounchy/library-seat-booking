import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { ZoneFilter } from '@/components/zone-filter';
import { Spacing } from '@/constants/theme';
import { useBookings } from '@/features/bookings/use-bookings';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { isBookingActiveAt } from '@/lib/booking-time';
import { filterSeats, getZones } from '@/lib/filter-seats';
import { useFilterStore } from '@/store/filter-store';
import type { Seat } from '@/types';

type SeatStatus = 'taken' | 'free' | null;

function SeatRow({
  seat,
  status,
}: {
  seat: Seat;
  status: SeatStatus;
}) {
  const theme = useTheme();
  const outlet = seat.hasOutlet ? 'Has outlet' : 'No outlet';
  const statusText =
    status === 'taken' ? 'Taken now' : status === 'free' ? 'Free now' : null;

  const summary = [`Zone ${seat.zone}`, outlet, statusText]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={{
        pathname: '/seat/[id]',
        params: { id: seat.id },
      }}
      asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Seat ${seat.id}, ${summary}`}
        accessibilityHint="Opens seat details"
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.backgroundElement,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        <ThemedText type="default">
          Seat {seat.id}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {summary}
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

  const bookingsQuery = useBookings();
  const now = useNow();

  const zones = getZones(seats);
  const visibleSeats = filterSeats(seats, searchText, selectedZone);

  const takenSeatIds = new Set(
    (bookingsQuery.data ?? [])
      .filter((booking) => isBookingActiveAt(booking, now))
      .map((booking) => booking.seatId),
  );

  const statusOf = (seatId: string): SeatStatus => {
    if (bookingsQuery.data === undefined) {
      return null;
    }

    return takenSeatIds.has(seatId) ? 'taken' : 'free';
  };

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

      <ZoneFilter
        zones={zones}
        selected={selectedZone}
        onSelect={setSelectedZone}
      />

      <ThemedText
        type="small"
        themeColor="textSecondary"
        accessibilityLiveRegion="polite">
        {visibleSeats.length} of {seats.length} seats
      </ThemedText>

      <FlatList
        style={styles.listView}
        data={visibleSeats}
        keyExtractor={(seat) => seat.id}
        renderItem={({ item }) => (
          <SeatRow
            seat={item}
            status={statusOf(item.id)}
          />
        )}
        extraData={takenSeatIds}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              No seats match your filters.
            </ThemedText>

            <AppButton
              variant="secondary"
              label="Clear filters"
              onPress={resetFilters}
            />
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

  listView: {
    flex: 1,
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