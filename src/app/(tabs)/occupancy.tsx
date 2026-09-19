import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBookings } from '@/features/bookings/use-bookings';
import { useSeats } from '@/features/seats/use-seats';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { occupancyByZone, type ZoneOccupancy } from '@/lib/occupancy';
import { formatHourMinute } from '@/lib/time';
import type { Booking, Seat } from '@/types';

function ZoneCard({ item }: { item: ZoneOccupancy }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={styles.card}
      accessible
      accessibilityLabel={`Zone ${item.zone}, ${item.taken} of ${item.total} seats taken, ${item.percent} percent`}>
      <View style={styles.cardHeader}>
        <ThemedText type="default">Zone {item.zone}</ThemedText>
        <ThemedText type="default">{item.percent}%</ThemedText>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
        ]}>
        <View
          style={[styles.fill, { backgroundColor: theme.primary, width: `${item.percent}%` }]}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {item.taken} of {item.total} seats taken
      </ThemedText>
    </ThemedView>
  );
}

function OccupancyContent({ seats, bookings }: { seats: Seat[]; bookings: Booking[] }) {
  const now = useNow();
  const zones = useMemo(() => occupancyByZone(seats, bookings, now), [seats, bookings, now]);

  return (
    <View style={styles.content}>
      <ThemedText type="small" themeColor="textSecondary">
        Right now · {formatHourMinute(now)}
      </ThemedText>
      <FlatList
        data={zones}
        keyExtractor={(zone) => zone.zone}
        renderItem={({ item }) => <ZoneCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

export default function OccupancyScreen() {
  const seatsQuery = useSeats();
  const bookingsQuery = useBookings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" accessibilityRole="header">
          Occupancy
        </ThemedText>
        <QueryState
          query={seatsQuery}
          isEmpty={(seats) => seats.length === 0}
          emptyTitle="No seats yet"
          emptyMessage="Add seats to see how full each zone is.">
          {(seats) => (
            <QueryState query={bookingsQuery} isEmpty={() => false} emptyTitle="No bookings">
              {(bookings) => <OccupancyContent seats={seats} bookings={bookings} />}
            </QueryState>
          )}
        </QueryState>
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
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});