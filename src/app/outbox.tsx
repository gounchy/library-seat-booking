import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { replayOutbox } from '@/features/offline/replay';
import { selectIsOnline, useNetworkStore } from '@/lib/network';
import { describeAction, isPending } from '@/lib/outbox';
import { useOutboxStore } from '@/store/outbox-store';
import type { OutboxItem } from '@/types';

function OutboxRow({ item }: { item: OutboxItem }) {
  const remove = useOutboxStore((s) => s.remove);
  const description = describeAction(item.action);

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="default">{description}</ThemedText>
      {item.error === undefined ? (
        <ThemedText type="small" themeColor="textSecondary">
          Waiting to sync
        </ThemedText>
      ) : (
        <>
          <ThemedText type="small" themeColor="error">
            Rejected: {item.error}
          </ThemedText>
          <AppButton
            variant="secondary"
            label="Discard"
            accessibilityHint={`Removes this change: ${description}`}
            onPress={() => remove(item.id)}
          />
        </>
      )}
    </ThemedView>
  );
}

export default function OutboxScreen() {
  const queryClient = useQueryClient();
  const items = useOutboxStore((s) => s.items);
  const isOnline = useNetworkStore(selectIsOnline);
  const pendingCount = items.filter(isPending).length;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Pending changes' }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="subtitle" style={styles.centerText}>
              Nothing waiting to sync
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Changes you make while offline appear here until they are saved to the server.
            </ThemedText>
          </View>
        ) : (
          <>
            <AppButton
              label={isOnline ? 'Sync now' : 'Offline: cannot sync'}
              disabled={!isOnline || pendingCount === 0}
              onPress={() => void replayOutbox(queryClient)}
            />
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <OutboxRow item={item} />}
              contentContainerStyle={styles.list}
            />
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  list: { gap: Spacing.two, paddingBottom: Spacing.three },
  row: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  centerText: { textAlign: 'center' },
});