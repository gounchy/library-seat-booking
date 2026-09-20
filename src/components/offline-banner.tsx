import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { selectIsOnline, useNetworkStore } from '@/lib/network';
import { selectFailedCount, selectPendingCount, useOutboxStore } from '@/store/outbox-store';

const plural = (count: number): string => (count === 1 ? '1 change' : `${count} changes`);

export function OfflineBanner() {
  const isOnline = useNetworkStore(selectIsOnline);
  const pending = useOutboxStore(selectPendingCount);
  const failed = useOutboxStore(selectFailedCount);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (isOnline && pending === 0 && failed === 0) {
    return null;
  }

  let title: string;
  let detail: string;
  if (!isOnline) {
    title = 'Offline: showing saved data';
    if (pending > 0) {
      detail = `${plural(pending)} waiting to sync. Tap to review.`;
    } else if (failed > 0) {
      detail = `${plural(failed)} could not be synced. Tap to review.`;
    } else {
      detail = 'Changes you make are saved on this device and synced later.';
    }
  } else if (pending > 0) {
    title = `Syncing ${plural(pending)}…`;
    detail = 'Tap to review.';
  } else {
    title = `${plural(failed)} could not be synced`;
    detail = 'Tap to review and discard them.';
  }

  const style = [
    styles.banner,
    {
      backgroundColor: theme.backgroundSelected,
      borderBottomColor: theme.border,
      paddingTop: insets.top + Spacing.two,
    },
  ];
  const content = (
    <>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small">{detail}</ThemedText>
    </>
  );

  if (pending + failed > 0) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${detail}`}
        onPress={() => router.push('/outbox')}
        style={style}>
        {content}
      </Pressable>
    );
  }

  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={style}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.half,
  },
});