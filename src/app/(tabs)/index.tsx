import { AccountBar } from '@/components/account-bar';
import { AppButton } from '@/components/app-button';
import { DevPanel } from '@/components/dev-panel';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { SeatList } from '@/features/seats/seat-list';
import { useSeats } from '@/features/seats/use-seats';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SeatsScreen() {
  const router = useRouter();
  const seatsQuery = useSeats();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AccountBar />
        <View style={styles.header}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Seats
          </ThemedText>
          <AppButton label="Add seat" onPress={() => router.push('/seat/new')} />
        </View>
        <QueryState
          query={seatsQuery}
          isEmpty={(seats) => seats.length === 0}
          emptyTitle="No seats yet"
          emptyMessage="Seats you add will appear here.">
          {(seats) => (
            <View style={styles.seatListContainer}>
              <SeatList seats={seats} />
            </View>
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
    gap: Spacing.two,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
seatListContainer: {
  flex: 1,
},
});